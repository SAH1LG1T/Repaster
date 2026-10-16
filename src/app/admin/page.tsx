"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";
import { mockReports, mockAuditLogs, AbuseReportRecord, AuditLogRecord } from "@/lib/data";
import { env } from "@/config/env";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminModerationPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AbuseReportRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"REPORTS" | "AUDIT" | "CRON">("REPORTS");
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResults, setCronResults] = useState<any | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadAdminData() {
      try {
        const res = await fetch("/api/v1/admin/moderation");
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setReports(json.reports || []);
            setAuditLogs(json.auditLogs || []);
          }
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    }
    loadAdminData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleResolveReport = async (
    reportId: string,
    status: "REVIEWED_ACTION_TAKEN" | "REVIEWED_DISMISSED",
    removeTarget: boolean
  ) => {
    const notes = actionNotes[reportId] || "Moderated via admin panel";
    try {
      const res = await fetch("/api/v1/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          moderatorNotes: notes,
          removeTarget,
        }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status, moderatorNotes: notes } : r
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunManualCron = async () => {
    setCronRunning(true);
    setCronResults(null);
    try {
      const res = await fetch("/api/v1/cron/cleanup-expired", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
        },
      });
      const data = await res.json();
      setCronResults(data);
    } catch (err) {
      setCronResults({ error: "Failed to trigger cron" });
    } finally {
      setCronRunning(false);
    }
  };

  const pendingReports = reports.filter((r) => r.status === "PENDING");

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          The Moderation and Immutable Audit Vault is strictly restricted to platform administrators and trust & safety officers.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-black dark:bg-zinc-800"
          >
            Sign In with Staff Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Staff Only
            </span>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
              Moderation & Audit Vault
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
            Review community abuse reports, monitor immutable audit logs, and trigger automated purges.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunManualCron}
          disabled={cronRunning}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${cronRunning ? "animate-spin" : ""}`} />
          <span>Execute Scheduled Purge</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("REPORTS")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "REPORTS"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Reports ({pendingReports.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "AUDIT"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CRON")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "CRON"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Automated Purge Engine
        </button>
      </div>

      {/* Reports Section */}
      {activeTab === "REPORTS" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No abuse reports currently on file.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        report.status === "PENDING"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Target: {report.targetType} #{report.targetId}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Reported on {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-rose-600 dark:text-rose-400">
                    Reason: {report.reason}
                  </div>
                  {report.details && (
                    <p className="mt-1 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-lg">
                      "{report.details}"
                    </p>
                  )}
                </div>

                {report.status === "PENDING" && (
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                    <input
                      type="text"
                      placeholder="Add moderator action rationale..."
                      value={actionNotes[report.id] || ""}
                      onChange={(e) =>
                        setActionNotes({ ...actionNotes, [report.id]: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleResolveReport(report.id, "REVIEWED_DISMISSED", false)
                        }
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300"
                      >
                        Dismiss Report
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleResolveReport(report.id, "REVIEWED_ACTION_TAKEN", true)
                        }
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 shadow-sm"
                      >
                        Take Action & Remove Listing
                      </button>
                    </div>
                  </div>
                )}

                {report.moderatorNotes && (
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-2 dark:border-zinc-800">
                    <strong>Resolution note:</strong> {report.moderatorNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === "AUDIT" && (
        <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-gray-300">
            Immutable Event Log
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>Actor: {log.actorEmail}</span>
                  <span>•</span>
                  <span>Target: {log.targetType} #{log.targetId}</span>
                </div>
                {log.reason && (
                  <div className="text-gray-500 text-[11px]">Note: {log.reason}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automated Purge Engine Status */}
      {activeTab === "CRON" && (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            <span>3-Layer Automated Expiry & Hard-Deletion Engine</span>
          </div>

          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Per the technical specification, unusable food is filtered immediately at Layer 1 read time, client buttons unmount via Layer 2 10-second timers, and Layer 3 permanently hard-purges expired records and associated S3 food images after their retention periods.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
              <span className="text-gray-500">Max Offering Duration</span>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {env.MAX_OFFERING_DURATION_HOURS} Hours
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
              <span className="text-gray-500">Expired Retention Purge</span>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {env.EXPIRED_RETENTION_HOURS} Hours
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
              <span className="text-gray-500">Distributed Retention Purge</span>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {env.DISTRIBUTED_RETENTION_HOURS} Hours
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunManualCron}
              disabled={cronRunning}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
            >
              {cronRunning ? "Executing Purge..." : "Trigger Cleanup Run Now"}
            </button>
          </div>

          {cronResults && (
            <div className="rounded-xl bg-zinc-950 p-4 text-xs font-mono text-emerald-400">
              <pre>{JSON.stringify(cronResults, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
