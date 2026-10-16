import { NextRequest, NextResponse } from "next/server";
import { prisma, mockOfferings, mockAuditLogs, OfferingRecord } from "@/lib/db";
import { createOfferingSchema } from "@/lib/validators";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Layer 1 (Zero-Latency Read Filter): Public GET enforces status: 'PUBLISHED' AND consumeByAt > NOW()
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rate = checkRateLimit(`get_offerings_${ip}`, 60, 60000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const locality = searchParams.get("locality")?.toLowerCase();
  const query = searchParams.get("q")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  const now = new Date();

  let dbItems: OfferingRecord[] = [];
  try {
    if (prisma && prisma.offering) {
      const records = await prisma.offering.findMany({
        where: {
          status: "PUBLISHED",
          consumeByAt: { gt: now },
        },
        include: { giver: true },
        orderBy: { consumeByAt: "asc" },
      });
      if (records && records.length > 0) {
        dbItems = records.map((item: any) => ({
          id: item.id,
          giverId: item.giverId,
          giverName: item.giver?.organizationName || item.giver?.contactPersonName || "Community Giver",
          title: item.title,
          description: item.description,
          category: item.category,
          approximateServings: item.approximateServings,
          preparedAt: item.preparedAt ? item.preparedAt.toISOString() : undefined,
          consumeByAt: item.consumeByAt.toISOString(),
          collectionWindow: item.collectionWindow || undefined,
          locality: item.locality,
          collectionNotes: item.collectionNotes || undefined,
          dietaryAllergenInfo: item.dietaryAllergenInfo || undefined,
          photoUrl: item.photoUrl || undefined,
          photoStorageKey: item.photoStorageKey || undefined,
          publishedContactMethod: item.publishedContactMethod,
          publishedContactValue: item.publishedContactValue,
          contactPublicationConsent: item.contactPublicationConsent,
          authorityAndAccuracyConfirmed: item.authorityAndAccuracyConfirmed,
          status: item.status,
          expiresAt: item.expiresAt.toISOString(),
          distributedAt: item.distributedAt ? item.distributedAt.toISOString() : null,
          version: item.version,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("[REPASTERS] Prisma offering query fallback:", err);
  }

  // Deduplicate and combine db items with in-memory store
  const allListings = [...dbItems, ...mockOfferings.filter((m) => !dbItems.some((d) => d.id === m.id))];

  // Enforce zero-latency expiration filter: food vanishes the exact millisecond consumeByAt passes
  let filtered = allListings.filter((offering) => {
    if (offering.status !== "PUBLISHED") return false;
    const expiry = new Date(offering.consumeByAt).getTime();
    if (expiry <= now.getTime()) return false;

    if (category && offering.category !== category) return false;
    if (locality && !offering.locality.toLowerCase().includes(locality)) return false;
    if (query) {
      const matchTitle = offering.title.toLowerCase().includes(query);
      const matchDesc = offering.description.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Sort by nearest consume-by deadline first (urgency-driven rescue)
  filtered.sort((a, b) => new Date(a.consumeByAt).getTime() - new Date(b.consumeByAt).getTime());

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Privacy protection: Never expose private phone or internal account emails
  const sanitized = paginated.map((item) => ({
    id: item.id,
    giverName: item.giverName,
    title: item.title,
    description: item.description,
    category: item.category,
    approximateServings: item.approximateServings,
    preparedAt: item.preparedAt,
    consumeByAt: item.consumeByAt,
    collectionWindow: item.collectionWindow,
    locality: item.locality,
    collectionNotes: item.collectionNotes,
    dietaryAllergenInfo: item.dietaryAllergenInfo,
    photoUrl: item.photoUrl,
    publishedContactMethod: item.publishedContactMethod,
    publishedContactValue: item.contactPublicationConsent ? item.publishedContactValue : null,
    status: item.status,
    createdAt: item.createdAt,
  }));

  return NextResponse.json({
    data: sanitized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST: Givers create offering with mandatory consumeByAt validation
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "GIVER") {
    return NextResponse.json(
      { error: "Forbidden: Only registered Giver accounts may publish surplus food offerings." },
      { status: 403 }
    );
  }

  const rate = checkRateLimit(`post_offering_${session.user.id}`, 10, 60000);
  if (!rate.success) {
    return NextResponse.json({ error: "Posting rate limit reached. Please wait." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validated = createOfferingSchema.parse(body);

    const newOffering: OfferingRecord = {
      id: `off-${Date.now()}`,
      giverId: session.user.id,
      giverName: session.user.organizationName || session.user.name,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      approximateServings: validated.approximateServings,
      preparedAt: validated.preparedAt ? new Date(validated.preparedAt).toISOString() : undefined,
      consumeByAt: new Date(validated.consumeByAt).toISOString(),
      collectionWindow: validated.collectionWindow || undefined,
      locality: validated.locality,
      collectionNotes: validated.collectionNotes || undefined,
      dietaryAllergenInfo: validated.dietaryAllergenInfo || undefined,
      photoUrl: validated.photoUrl || undefined,
      photoStorageKey: validated.photoStorageKey || undefined,
      publishedContactMethod: validated.publishedContactMethod,
      publishedContactValue: validated.publishedContactValue,
      contactPublicationConsent: validated.contactPublicationConsent,
      authorityAndAccuracyConfirmed: validated.authorityAndAccuracyConfirmed,
      status: "PUBLISHED",
      expiresAt: new Date(validated.consumeByAt).toISOString(),
      distributedAt: null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOfferings.unshift(newOffering);

    // Persist to Neon DB if available
    try {
      if (prisma && prisma.offering) {
        await prisma.offering.create({
          data: {
            id: newOffering.id,
            giverId: session.user.id,
            title: validated.title,
            description: validated.description,
            category: validated.category as any,
            approximateServings: validated.approximateServings,
            preparedAt: validated.preparedAt ? new Date(validated.preparedAt) : null,
            consumeByAt: new Date(validated.consumeByAt),
            collectionWindow: validated.collectionWindow || null,
            locality: validated.locality,
            collectionNotes: validated.collectionNotes || null,
            dietaryAllergenInfo: validated.dietaryAllergenInfo || null,
            photoUrl: validated.photoUrl || null,
            photoStorageKey: validated.photoStorageKey || null,
            publishedContactMethod: validated.publishedContactMethod as any,
            publishedContactValue: validated.publishedContactValue,
            contactPublicationConsent: validated.contactPublicationConsent,
            authorityAndAccuracyConfirmed: validated.authorityAndAccuracyConfirmed,
            status: "PUBLISHED",
            expiresAt: new Date(validated.consumeByAt),
          },
        });
      }
    } catch (dbErr) {
      console.warn("[REPASTERS] Prisma offering create warning:", dbErr);
    }

    // Transactional Audit Log
    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "CREATE_OFFERING",
      targetType: "OFFERING",
      targetId: newOffering.id,
      reason: "Surplus offering created by giver",
      metadata: { title: newOffering.title, category: newOffering.category },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, offering: newOffering }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
