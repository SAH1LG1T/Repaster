import { NextRequest, NextResponse } from "next/server";
import { prisma, mockRequests, mockAuditLogs, FoodRequestRecord } from "@/lib/db";
import { createFoodRequestSchema } from "@/lib/validators";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const locality = searchParams.get("locality")?.toLowerCase();
  const query = searchParams.get("q")?.toLowerCase();

  const now = new Date();

  let dbItems: FoodRequestRecord[] = [];
  try {
    if (prisma && prisma.foodRequest) {
      const records = await prisma.foodRequest.findMany({
        where: {
          status: "PUBLISHED",
          expiresAt: { gt: now },
        },
        include: { seeker: true },
        orderBy: { createdAt: "desc" },
      });
      if (records && records.length > 0) {
        dbItems = records.map((item: any) => ({
          id: item.id,
          seekerId: item.seekerId,
          title: item.title,
          description: item.description,
          preferredCategory: item.preferredCategory || undefined,
          approximateQuantity: item.approximateQuantity || undefined,
          neededByAt: item.neededByAt ? item.neededByAt.toISOString() : undefined,
          locality: item.locality,
          displayAuthorName: item.displayAuthorName || item.seeker?.organizationName || item.seeker?.contactPersonName || "Community Seeker",
          publishedContactMethod: item.publishedContactMethod,
          publishedContactValue: item.publishedContactValue,
          contactPublicationConsent: item.contactPublicationConsent,
          status: item.status,
          expiresAt: item.expiresAt.toISOString(),
          version: item.version,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("[REPASTERS] Prisma food request query fallback:", err);
  }

  const allRequests = [...dbItems, ...mockRequests.filter((m) => !dbItems.some((d) => d.id === m.id))];

  let filtered = allRequests.filter((r) => {
    if (r.status !== "PUBLISHED") return false;
    const expiry = new Date(r.expiresAt).getTime();
    if (expiry <= now.getTime()) return false;

    if (category && r.preferredCategory !== category) return false;
    if (locality && !r.locality.toLowerCase().includes(locality)) return false;
    if (query) {
      const matchTitle = r.title.toLowerCase().includes(query);
      const matchDesc = r.description.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return NextResponse.json({
    data: filtered,
    meta: { total: filtered.length },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Please sign in to post a request." }, { status: 401 });
  }

  const rate = checkRateLimit(`post_request_${session.user.id}`, 10, 60000);
  if (!rate.success) {
    return NextResponse.json({ error: "Rate limit reached" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validated = createFoodRequestSchema.parse(body);

    const expiresAt = new Date(Date.now() + validated.expiresAtHours * 3600 * 1000).toISOString();

    const newRequest: FoodRequestRecord = {
      id: `req-${Date.now()}`,
      seekerId: session.user.id,
      title: validated.title,
      description: validated.description,
      preferredCategory: validated.preferredCategory || undefined,
      approximateQuantity: validated.approximateQuantity || undefined,
      neededByAt: validated.neededByAt ? new Date(validated.neededByAt).toISOString() : undefined,
      locality: validated.locality,
      displayAuthorName: validated.displayAuthorName,
      publishedContactMethod: validated.publishedContactMethod,
      publishedContactValue: validated.publishedContactValue,
      contactPublicationConsent: validated.contactPublicationConsent,
      status: "PUBLISHED",
      expiresAt,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockRequests.unshift(newRequest);

    // Persist to Neon DB if available
    try {
      if (prisma && prisma.foodRequest) {
        await prisma.foodRequest.create({
          data: {
            id: newRequest.id,
            seekerId: session.user.id,
            title: validated.title,
            description: validated.description,
            preferredCategory: validated.preferredCategory as any || null,
            approximateQuantity: validated.approximateQuantity || null,
            neededByAt: validated.neededByAt ? new Date(validated.neededByAt) : null,
            locality: validated.locality,
            displayAuthorName: validated.displayAuthorName,
            publishedContactMethod: validated.publishedContactMethod as any,
            publishedContactValue: validated.publishedContactValue,
            contactPublicationConsent: validated.contactPublicationConsent,
            status: "PUBLISHED",
            expiresAt: new Date(expiresAt),
          },
        });
      }
    } catch (dbErr) {
      console.warn("[REPASTERS] Prisma food request create warning:", dbErr);
    }

    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "CREATE_REQUEST",
      targetType: "REQUEST",
      targetId: newRequest.id,
      reason: "Community food request published",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
