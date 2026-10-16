"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface MarkDistributedButtonProps {
  offeringId: string;
  isDistributed?: boolean;
  onSuccess?: () => void;
  className?: string;
}

export const MarkDistributedButton: React.FC<MarkDistributedButtonProps> = ({
  offeringId,
  isDistributed = false,
  onSuccess,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [distributed, setDistributed] = useState(isDistributed);
  const [error, setError] = useState<string | null>(null);

  const handleMarkDistributed = async () => {
    if (distributed || loading) return;

    if (!confirm("Confirm this food has been collected or distributed? This will immediately remove it from public search and protect contact details.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/offerings/${offeringId}/distribute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as distributed");
      }

      setDistributed(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (distributed) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ${className}`}>
        <CheckCircle2 className="h-4 w-4" />
        <span>Marked as Distributed</span>
      </div>
    );
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={handleMarkDistributed}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 ${className}`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        <span>Mark as Distributed</span>
      </button>
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
};
