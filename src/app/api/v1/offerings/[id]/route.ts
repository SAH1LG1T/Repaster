import { NextRequest, NextResponse } from "next/server";
import { prisma, mockOfferings, mockAuditLogs, OfferingRecord } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let offering: OfferingRecord | null = null;

  // 1. Check Prisma Neon DB
  try {
    if (prisma && prisma.offering) {
      const dbItem = await prisma.offering.findUnique({
        where: { id },
        include: { giver: true },
      });
      if (dbItem) {
        offering = {
          id: dbItem.id,
          giverId: dbItem.giverId,
          giverName: dbItem.giver?.organizationName || dbItem.giver?.contactPersonName || "Community Giver",
          title: dbItem.title,
          description: dbItem.description,
          category: dbItem.category,
          approximateServings: dbItem.approximateServings,
          preparedAt: dbItem.preparedAt ? dbItem.preparedAt.toISOString() : undefined,
          consumeByAt: dbItem.consumeByAt.toISOString(),
          collectionWindow: dbItem.collectionWindow || undefined,
          locality: dbItem.locality,
          collectionNotes: dbItem.collectionNotes || undefined,
          dietaryAllergenInfo: dbItem.dietaryAllergenInfo || undefined,
          photoUrl: dbItem.photoUrl || undefined,
          photoStorageKey: dbItem.photoStorageKey || undefined,
          publishedContactMethod: dbItem.publishedContactMethod,
          publishedContactValue: dbItem.publishedContactValue,
          contactPublicationConsent: dbItem.contactPublicationConsent,
          authorityAndAccuracyConfirmed: dbItem.authorityAndAccuracyConfirmed,
          status: dbItem.status,
          expiresAt: dbItem.expiresAt.toISOString(),
          distributedAt: dbItem.distributedAt ? dbItem.distributedAt.toISOString() : null,
          version: dbItem.version,
          createdAt: dbItem.createdAt.toISOString(),
          updatedAt: dbItem.updatedAt.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("[REPASTERS] Prisma single offering lookup fallback:", err);
  }

  // 2. Fallback to memory
  if (!offering) {
    offering = mockOfferings.find((o) => o.id === id) || null;
  }

  if (!offering) {
    return NextResponse.json({ error: "Offering not found" }, { status: 404 });
  }

  const now = new Date().getTime();
  const isExpired = new Date(offering.consumeByAt).getTime() <= now;

  const shouldRevealContact =
    offering.status === "PUBLISHED" &&
    !isExpired &&
    offering.contactPublicationConsent === true;

  const responseData = {
    ...offering,
    isExpired,
    publishedContactValue: shouldRevealContact ? offering.publishedContactValue : null,
  };

  return NextResponse.json({ offering: responseData });
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
    if (prisma && prisma.offering) {
      await prisma.offering.update({
        where: { id },
        data: { status: "CLOSED" },
      });
      found = true;
    }
  } catch (err) {
    console.warn("[REPASTERS] Prisma close offering fallback:", err);
  }

  const index = mockOfferings.findIndex((o) => o.id === id);
  if (index !== -1) {
    mockOfferings[index].status = "CLOSED";
    mockOfferings[index].updatedAt = new Date().toISOString();
    found = true;
  }

  if (!found) {
    return NextResponse.json({ error: "Offering not found" }, { status: 404 });
  }

  mockAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "CLOSE_OFFERING",
    targetType: "OFFERING",
    targetId: id,
    reason: "Offering closed by giver",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, message: "Offering successfully closed" });
}
