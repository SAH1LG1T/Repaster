"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Package,
  AlertCircle,
  Building,
  ShieldCheck,
  Flag,
  ArrowLeft,
  Calendar,
  Utensils,
  Share2,
} from "lucide-react";
import { OfferingRecord } from "@/lib/data";
import { DirectContactButton } from "@/components/listings/DirectContactButton";
import { MarkDistributedButton } from "@/components/listings/MarkDistributedButton";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function OfferingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [offering, setOffering] = useState<OfferingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Inaccurate listing or expired food");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function loadItem() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/offerings/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setOffering(json.offering);
          }
        }
      } catch (err) {
        console.error("Failed to load offering from backend:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    if (id) loadItem();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" />
        <p className="text-xs text-gray-500">Loading offering details from server...</p>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Offering Not Found</h2>
        <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
          This listing may have expired, been marked as distributed, or removed.
        </p>
        <Link
          href="/offerings"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Offerings</span>
        </Link>
      </div>
    );
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "OFFERING",
          targetId: offering.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportSubmitting(false);
    }
  };

  const isExpired = new Date(offering.consumeByAt).getTime() <= Date.now();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/offerings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Surplus Offerings</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Giver Mark as Distributed action */}
          <MarkDistributedButton
            offeringId={offering.id}
            isDistributed={offering.status === "DISTRIBUTED"}
            onSuccess={() => setOffering({ ...offering, status: "DISTRIBUTED" })}
          />

          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-800 dark:text-gray-400"
          >
            <Flag className="h-3.5 w-3.5 text-rose-500" />
            <span>Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Photo Banner */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900">
            {offering.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offering.photoUrl}
                alt={offering.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-emerald-600">
                <Utensils className="h-16 w-16 opacity-30" />
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="rounded-full bg-emerald-950/80 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                {offering.category.replace("_", " ")}
              </span>
            </div>

            <div className="absolute top-4 right-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md ${
                  offering.status === "DISTRIBUTED"
                    ? "bg-blue-900/90 text-blue-200"
                    : isExpired
                    ? "bg-rose-900/90 text-rose-200"
                    : "bg-black/70 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                Status: {offering.status}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              <Building className="h-4 w-4" />
              <span>{offering.giverName}</span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl dark:text-white leading-tight">
              {offering.title}
            </h1>
          </div>

          {/* Core Spec Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                <Package className="h-3.5 w-3.5 text-emerald-600" />
                <span>Quantity / Servings</span>
              </div>
              <div className="mt-1 text-xs font-bold text-gray-900 dark:text-white">
                {offering.approximateServings}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Locality / Area</span>
              </div>
              <div className="mt-1 text-xs font-bold text-gray-900 dark:text-white truncate">
                {offering.locality}
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 dark:border-amber-500/20 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>Consume-By Deadline</span>
              </div>
              <div className="mt-1 text-xs font-black text-amber-950 dark:text-amber-200">
                {new Date(offering.consumeByAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Food Details & Provenance
            </h3>
            <p className="mt-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {offering.description}
            </p>

            {offering.collectionWindow && (
              <div className="mt-4 border-t border-gray-100 pt-3 dark:border-zinc-800">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Collection Window: </span>
                <span className="text-xs text-gray-700 dark:text-gray-300">{offering.collectionWindow}</span>
              </div>
            )}

            {offering.collectionNotes && (
              <div className="mt-2">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Pickup Instructions: </span>
                <span className="text-xs text-gray-700 dark:text-gray-300">{offering.collectionNotes}</span>
              </div>
            )}
          </div>

          {/* Dietary & Allergens Alert */}
          {offering.dietaryAllergenInfo && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 p-5 dark:border-amber-500/20 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>Dietary & Allergen Declarations (Giver Provided)</span>
              </div>
              <p className="mt-2 text-xs text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
                {offering.dietaryAllergenInfo}
              </p>
              <p className="mt-2 text-[10px] text-amber-800/80 dark:text-amber-400/80">
                Disclaimer: Details are supplied by donor without independent laboratory verification. Anyone with severe anaphylactic allergies should exercise standard precautions.
              </p>
            </div>
          )}

          {/* Platform boundary disclaimer */}
          <div className="rounded-xl bg-gray-100 p-4 text-[11px] text-gray-700 leading-relaxed dark:bg-zinc-800 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Direct Contact Boundary: </span>
            Repasters facilitates discovery only. All arrangements for food custody, safe transport, and handover are made directly between the donor and recipient outside the platform.
          </div>
        </div>

        {/* Sidebar: Direct Contact Widget & Ad */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-lg shadow-gray-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Direct Contact & Collection
            </h3>
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
              Connect directly with {offering.giverName} using their preferred communication channel.
            </p>

            <div className="mt-5">
              {/* Layer 2 Real-Time Guard Button */}
              <DirectContactButton
                method={offering.publishedContactMethod}
                value={offering.publishedContactValue}
                consumeByAt={offering.consumeByAt}
                hasConsent={offering.contactPublicationConsent}
                status={offering.status}
                listingTitle={offering.title}
              />
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-700 dark:border-zinc-800 dark:text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium text-gray-900 dark:text-white">{offering.publishedContactMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Published:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(offering.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Ad unit */}
          <AdPlacement slot="desktop-rail" />
        </aside>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 dark:text-white">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Report Listing</h3>
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
              Help us maintain community trust. Our moderation team reviews all flagged listings.
            </p>

            {reportSuccess ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Thank you. Your report has been submitted for immediate moderator review.
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="mt-3 block w-full rounded-lg bg-emerald-600 py-2 text-center font-semibold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="Inaccurate listing or expired food">Inaccurate listing or expired food</option>
                    <option value="Incorrect or unreachable contact details">Incorrect or unreachable contact details</option>
                    <option value="Food safety or hygiene violation">Food safety or hygiene violation</option>
                    <option value="Spam or commercial selling/charges">Spam or commercial selling / fee charged</option>
                    <option value="Other abuse">Other policy violation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Details (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what occurred..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 dark:border-zinc-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
