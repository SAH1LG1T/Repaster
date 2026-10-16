"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartHandshake, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("PREPARED_MEALS");
  const [approximateQuantity, setApproximateQuantity] = useState("");
  const [neededByDays, setNeededByDays] = useState("2");
  const [locality, setLocality] = useState("");
  const [displayAuthorName, setDisplayAuthorName] = useState("");
  const [publishedContactMethod, setPublishedContactMethod] = useState("PHONE");
  const [publishedContactValue, setPublishedContactValue] = useState("");
  const [contactPublicationConsent, setContactPublicationConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contactPublicationConsent) {
      setError("You must consent to publishing your contact details on your request.");
      return;
    }

    setLoading(true);

    try {
      const neededByAt = new Date(Date.now() + parseFloat(neededByDays) * 24 * 3600 * 1000).toISOString();

      const res = await fetch("/api/v1/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          preferredCategory,
          approximateQuantity,
          neededByAt,
          locality,
          displayAuthorName,
          publishedContactMethod,
          publishedContactValue,
          contactPublicationConsent,
          expiresAtHours: parseFloat(neededByDays) * 24,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create request");

      router.push(`/requests/${data.request.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
          <HeartHandshake className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Account Required to Request Food</h2>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          For accountability, safety, and community transparency, organizations and seekers must be registered and signed in to submit food requests.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-500"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-xs font-bold text-gray-700 dark:border-zinc-700 dark:text-gray-300 hover:bg-gray-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Cancel & Back to Requests</span>
      </Link>

      <h1 className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
        Post a Community Food Request
      </h1>
      <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
        Let donors and businesses know what meals, produce, or bakery surplus your community or organization requires.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Request Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={120}
              placeholder="e.g. Hot meals or boxed lunches needed for 40 shelter residents"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Preferred Category
              </label>
              <select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="PREPARED_MEALS">Prepared Meals</option>
                <option value="BAKERY_PASTRY">Bakery & Pastry</option>
                <option value="PRODUCE_FRESH">Fresh Produce</option>
                <option value="DAIRY_CHILLED">Dairy & Chilled</option>
                <option value="PACKAGED_PANTRY">Packaged Pantry</option>
                <option value="BEVERAGES">Beverages</option>
                <option value="MIXED_OTHER">Any / Mixed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Needed Within
              </label>
              <select
                value={neededByDays}
                onChange={(e) => setNeededByDays(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="1">Within 24 Hours</option>
                <option value="2">Within 2 Days</option>
                <option value="5">Within 5 Days</option>
                <option value="7">Within 1 Week</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Quantity Needed (Approximate)
              </label>
              <input
                type="text"
                placeholder="e.g. approx 40 servings or 50 lbs"
                value={approximateQuantity}
                onChange={(e) => setApproximateQuantity(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Locality / Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Eastside or Community Hall"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Description of Need <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what meals or ingredients you need and any dietary requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            Contact & Author Identity
          </h2>

          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Display Author / Organisation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hope Community Kitchen or Sarah M."
              value={displayAuthorName}
              onChange={(e) => setDisplayAuthorName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Contact Method <span className="text-red-500">*</span>
              </label>
              <select
                value={publishedContactMethod}
                onChange={(e) => setPublishedContactMethod(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="PHONE">Phone (tel:)</option>
                <option value="EMAIL">Email (mailto:)</option>
                <option value="WHATSAPP">WhatsApp (wa.me)</option>
                <option value="EXTERNAL_URL">Website URL</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Contact Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+1 555-0199 or kitchen@shelter.org"
                value={publishedContactValue}
                onChange={(e) => setPublishedContactValue(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 pt-2 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={contactPublicationConsent}
              onChange={(e) => setContactPublicationConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              I consent to displaying this contact method so donors can reach me directly.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/requests"
            className="rounded-xl border border-gray-300 px-5 py-3 text-xs font-semibold text-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            <span>Publish Food Request</span>
          </button>
        </div>
      </form>
    </div>
  );
}
