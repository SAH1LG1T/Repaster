import { NextRequest, NextResponse } from "next/server";
import { mockReports, mockAuditLogs, mockOfferings, mockRequests } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden: Moderator or Admin access required." }, { status: 403 });
  }

  return NextResponse.json({
    reports: mockReports,
    auditLogs: mockAuditLogs,
    stats: {
      totalOfferings: mockOfferings.length,
      publishedOfferings: mockOfferings.filter((o) => o.status === "PUBLISHED").length,
      distributedOfferings: mockOfferings.filter((o) => o.status === "DISTRIBUTED").length,
      totalRequests: mockRequests.length,
      pendingReports: mockReports.filter((r) => r.status === "PENDING").length,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden: Moderator or Admin access required." }, { status: 403 });
  }

  try {
    const { reportId, status, moderatorNotes, removeTarget } = await req.json();

    const report = mockReports.find((r) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    report.status = status; // REVIEWED_ACTION_TAKEN or REVIEWED_DISMISSED
    report.moderatorNotes = moderatorNotes || report.moderatorNotes;
    report.resolvedById = session.user.id;
    report.resolvedAt = new Date().toISOString();

    // If moderator chose to remove/hide the listing
    if (removeTarget) {
      if (report.targetType === "OFFERING") {
        const target = mockOfferings.find((o) => o.id === report.targetId);
        if (target) target.status = "REMOVED";
      } else if (report.targetType === "REQUEST") {
        const target = mockRequests.find((r) => r.id === report.targetId);
        if (target) target.status = "REMOVED";
      }
    }

    // Immutable Audit Log
    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "MODERATE_REPORT",
      targetType: report.targetType,
      targetId: report.targetId,
      reason: `Moderation action taken: ${status}. Notes: ${moderatorNotes || "None"}`,
      metadata: { removeTarget: Boolean(removeTarget) },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid payload" }, { status: 400 });
  }
}
