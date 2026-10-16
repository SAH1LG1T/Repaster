import { NextRequest, NextResponse } from "next/server";
import { mockReports, mockAuditLogs, AbuseReportRecord } from "@/lib/db";
import { createAbuseReportSchema } from "@/lib/validators";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const reporterId = session?.user.id || "anonymous";

  const rate = checkRateLimit(`report_abuse_${reporterId}`, 5, 60000);
  if (!rate.success) {
    return NextResponse.json({ error: "Reporting rate limit exceeded. Please wait." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validated = createAbuseReportSchema.parse(body);

    const newReport: AbuseReportRecord = {
      id: `rep-${Date.now()}`,
      reporterId: session?.user.id || null,
      targetType: validated.targetType,
      targetId: validated.targetId,
      reason: validated.reason,
      details: validated.details || null,
      status: "PENDING",
      moderatorNotes: null,
      resolvedById: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
    };

    mockReports.unshift(newReport);

    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: session?.user.id || "anonymous",
      actorEmail: session?.user.email || "anonymous@public",
      action: "SUBMIT_REPORT",
      targetType: validated.targetType,
      targetId: validated.targetId,
      reason: validated.reason,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted to community moderation team. Thank you for keeping Repasters safe.",
      reportId: newReport.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid report payload" }, { status: 400 });
  }
}
