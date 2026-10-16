import { NextRequest, NextResponse } from "next/server";
import { prisma, mockRequests, mockAuditLogs, FoodRequestRecord } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let requestItem: FoodRequestRecord | null = null;

  try {
    if (prisma && prisma.foodRequest) {
      const dbItem = await prisma.foodRequest.findUnique({
        where: { id },
        include: { seeker: true },
      });
      if (dbItem) {
        requestItem = {
          id: dbItem.id,
          seekerId: dbItem.seekerId,
          title: dbItem.title,
          description: dbItem.description,
          preferredCategory: dbItem.preferredCategory || undefined,
          approximateQuantity: dbItem.approximateQuantity || undefined,
          neededByAt: dbItem.neededByAt ? dbItem.neededByAt.toISOString() : undefined,
          locality: dbItem.locality,
          displayAuthorName: dbItem.displayAuthorName || dbItem.seeker?.organizationName || dbItem.seeker?.contactPersonName || "Community Seeker",
          publishedContactMethod: dbItem.publishedContactMethod,
          publishedContactValue: dbItem.publishedContactValue,
          contactPublicationConsent: dbItem.contactPublicationConsent,
          status: dbItem.status,
          expiresAt: dbItem.expiresAt.toISOString(),
          version: dbItem.version,
          createdAt: dbItem.createdAt.toISOString(),
          updatedAt: dbItem.updatedAt.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("[REPASTERS] Prisma single food request fallback:", err);
  }

  if (!requestItem) {
    requestItem = mockRequests.find((r) => r.id === id) || null;
  }

  if (!requestItem) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const now = new Date().getTime();
  const isExpired = new Date(requestItem.expiresAt).getTime() <= now;

  const shouldRevealContact =
    requestItem.status === "PUBLISHED" &&
    !isExpired &&
    requestItem.contactPublicationConsent === true;

  return NextResponse.json({
    request: {
      ...requestItem,
      isExpired,
      publishedContactValue: shouldRevealContact ? requestItem.publishedContactValue : null,
    },
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let found = false;

  try {
    if (prisma && prisma.foodRequest) {
      await prisma.foodRequest.update({
        where: { id },
        data: { status: "CLOSED" },
      });
      found = true;
    }
  } catch (err) {
    console.warn("[REPASTERS] Prisma close food request fallback:", err);
  }

  const index = mockRequests.findIndex((r) => r.id === id);
  if (index !== -1) {
    mockRequests[index].status = "CLOSED";
    mockRequests[index].updatedAt = new Date().toISOString();
    found = true;
  }

  if (!found) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  mockAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "CLOSE_REQUEST",
    targetType: "REQUEST",
    targetId: id,
    reason: "Community food request closed",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, message: "Request successfully closed" });
}
