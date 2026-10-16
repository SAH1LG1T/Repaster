import { NextRequest, NextResponse } from "next/server";
import { mockOfferings, mockRequests, mockReports, mockAuditLogs } from "@/lib/db";
import { deleteS3Object } from "@/lib/storage";
import { env } from "@/config/env";

export async function POST(req: NextRequest) {
  // Authorization check via Bearer CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const expectedAuth = `Bearer ${env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized: Invalid CRON_SECRET" }, { status: 401 });
  }

  const now = Date.now();
  let markedExpiredCount = 0;
  let hardDeletedOfferingsCount = 0;
  let hardDeletedImagesCount = 0;
  let hardDeletedRequestsCount = 0;

  // 1. Mark PUBLISHED / RESERVED offerings with consumeByAt <= NOW() as EXPIRED
  for (const offering of mockOfferings) {
    if ((offering.status === "PUBLISHED" || offering.status === "RESERVED")) {
      const consumeTime = new Date(offering.consumeByAt).getTime();
      if (consumeTime <= now) {
        offering.status = "EXPIRED";
        offering.updatedAt = new Date().toISOString();
        markedExpiredCount++;
      }
    }
  }

  // Retention thresholds (ms)
  const expiredRetentionMs = env.EXPIRED_RETENTION_HOURS * 3600 * 1000;
  const distributedRetentionMs = env.DISTRIBUTED_RETENTION_HOURS * 3600 * 1000;

  // Set of targetIds that have pending abuse reports (must NOT be deleted until investigated)
  const pendingReportTargets = new Set(
    mockReports.filter((r) => r.status === "PENDING").map((r) => r.targetId)
  );

  // 2. Identify records older than retention window that do NOT have pending abuse reports
  for (let i = mockOfferings.length - 1; i >= 0; i--) {
    const off = mockOfferings[i];
    if (pendingReportTargets.has(off.id)) continue;

    let shouldDelete = false;
    const updatedAtTime = new Date(off.updatedAt).getTime();

    if (off.status === "EXPIRED" && now - updatedAtTime > expiredRetentionMs) {
      shouldDelete = true;
    } else if (
      (off.status === "DISTRIBUTED" || off.status === "CLOSED") &&
      now - updatedAtTime > distributedRetentionMs
    ) {
      shouldDelete = true;
    }

    if (shouldDelete) {
      // Delete associated S3/R2 image if key exists
      if (off.photoStorageKey) {
        await deleteS3Object(off.photoStorageKey);
        hardDeletedImagesCount++;
      }
      mockOfferings.splice(i, 1);
      hardDeletedOfferingsCount++;
    }
  }

  // Also clean up expired Food Requests past retention
  for (let j = mockRequests.length - 1; j >= 0; j--) {
    const reqItem = mockRequests[j];
    if (pendingReportTargets.has(reqItem.id)) continue;

    const expiryTime = new Date(reqItem.expiresAt).getTime();
    if (now - expiryTime > expiredRetentionMs) {
      mockRequests.splice(j, 1);
      hardDeletedRequestsCount++;
    }
  }

  // Record Cron Execution in Audit Log
  mockAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: "system-cron",
    actorEmail: "cron@repasters.internal",
    action: "CRON_CLEANUP_EXPIRED",
    targetType: "SYSTEM",
    targetId: "global",
    reason: "3-layer automated scheduled hard purge executed",
    metadata: {
      markedExpiredCount,
      hardDeletedOfferingsCount,
      hardDeletedImagesCount,
      hardDeletedRequestsCount,
    },
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results: {
      markedExpiredCount,
      hardDeletedOfferingsCount,
      hardDeletedImagesCount,
      hardDeletedRequestsCount,
    },
  });
}
