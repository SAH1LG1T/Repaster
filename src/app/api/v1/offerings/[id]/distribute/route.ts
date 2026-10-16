import { NextRequest, NextResponse } from "next/server";
import { mockOfferings, mockAuditLogs } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offering = mockOfferings.find((o) => o.id === id);
  if (!offering) {
    return NextResponse.json({ error: "Offering not found" }, { status: 404 });
  }

  // RBAC ownership guard: Only the offering's giver (or an admin) can mark as distributed
  if (offering.giverId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: You may only mark your own surplus offerings as distributed." },
      { status: 403 }
    );
  }

  if (offering.status === "DISTRIBUTED") {
    return NextResponse.json({ success: true, message: "Already marked as distributed." });
  }

  // Update status, record timestamp, increment optimistic lock version
  offering.status = "DISTRIBUTED";
  offering.distributedAt = new Date().toISOString();
  offering.version += 1;
  offering.updatedAt = new Date().toISOString();

  // Audit Log
  mockAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "MARK_DISTRIBUTED",
    targetType: "OFFERING",
    targetId: offering.id,
    reason: "Giver marked food as collected / distributed",
    metadata: { distributedAt: offering.distributedAt, version: offering.version },
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: "Offering marked as distributed successfully. Listing removed from discovery.",
    offering: {
      id: offering.id,
      status: offering.status,
      distributedAt: offering.distributedAt,
      version: offering.version,
    },
  });
}
