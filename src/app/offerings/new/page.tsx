"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Utensils,
  Clock,
  MapPin,
  Package,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NewOfferingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("PREPARED_MEALS");
  const [approximateServings, setApproximateServings] = useState("");
  const [consumeByHours, setConsumeByHours] = useState("12"); // default 12h from now
  const [collectionWindow, setCollectionWindow] = useState("");
  const [locality, setLocality] = useState("");
  const [collectionNotes, setCollectionNotes] = useState("");
  const [dietaryAllergenInfo, setDietaryAllergenInfo] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80");
  const [publishedContactMethod, setPublishedContactMethod] = useState("PHONE");
  const [publishedContactValue, setPublishedContactValue] = useState("");
  const [contactPublicationConsent, setContactPublicationConsent] = useState(false);
  const [authorityAndAccuracyConfirmed, setAuthorityAndAccuracyConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contactPublicationConsent) {
      setError("You must explicitly consent to publish your chosen contact method.");
      return;
    }
    if (!authorityAndAccuracyConfirmed) {
      setError("You must confirm you have authority to offer this food and details are accurate.");
      return;
    }

    // Calculate mandatory consumeByAt timestamp
    const hours = parseFloat(consumeByHours);
    if (isNaN(hours) || hours <= 0 || hours > 72) {
      setError("Consume-by duration must be between 1 and 72 hours.");
      return;
    }

    const consumeByAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    setLoading(true);

    try {
      const res = await fetch("/api/v1/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          approximateServings,
          consumeByAt,
          collectionWindow: collectionWindow || null,
          locality,
          collectionNotes: collectionNotes || null,
          dietaryAllergenInfo: dietaryAllergenInfo || null,
          photoUrl: photoUrl || null,
          photoStorageKey: null,
          publishedContactMethod,
          publishedContactValue,
          contactPublicationConsent,
          authorityAndAccuracyConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish offering.");
      }

      router.push(`/offerings/${data.offering.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit offering.");
      setLoading(false);
    }
  };

  if (!user || (user.role !== "GIVER" && user.role !== "ADMIN")) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Utensils className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Giver Account Required</h2>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          To maintain food quality, trust, and community safety, only verified food donors (hotels, caterers, bakeries, food businesses) may publish surplus listings.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
          >
            Sign In as Giver
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-xs font-bold text-gray-700 dark:border-zinc-700 dark:text-gray-300 hover:bg-gray-50"
          >
            Register Donor Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/offerings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel & Back to Offerings</span>
        </Link>
        <h1 className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
          Publish Surplus Food Offering
        </h1>
        <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
          Only registered food businesses, caterers, hotels, and givers may list surplus. All food must be edible and hygienic.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core details */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            1. Surplus Food Identification
          </h2>

          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={120}
              placeholder="e.g. 40 Artisan Sourdough Loaves & Croissants"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Food Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="PREPARED_MEALS">Prepared Meals</option>
                <option value="BAKERY_PASTRY">Bakery & Pastry</option>
                <option value="PRODUCE_FRESH">Fresh Produce</option>
                <option value="DAIRY_CHILLED">Dairy & Chilled</option>
                <option value="PACKAGED_PANTRY">Packaged Pantry</option>
                <option value="BEVERAGES">Beverages</option>
                <option value="MIXED_OTHER">Mixed / Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Approximate Servings / Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. 50 individual boxes or 30 lbs"
                value={approximateServings}
                onChange={(e) => setApproximateServings(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Description & Packaging Details <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder="State preparation time, temperature control, whether containers are included, and any handling instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Photo URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Mandatory Expiry & Collection */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>2. Mandatory Consume-By Deadline & Location</span>
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Strict Max 72 Hours
            </span>
          </div>

          <div className="rounded-xl bg-amber-500/10 p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Food safety policy: every listing must specify when the food must be consumed or collected. The listing will vanish automatically the exact millisecond this window expires.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Consume Within (Hours from now) <span className="text-red-500">*</span>
              </label>
              <select
                value={consumeByHours}
                onChange={(e) => setConsumeByHours(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="4">Within 4 Hours (Immediate hot food)</option>
                <option value="8">Within 8 Hours (Same-day luncheon)</option>
                <option value="12">Within 12 Hours (Tonight)</option>
                <option value="24">Within 24 Hours (Next morning)</option>
                <option value="48">Within 48 Hours (2 days)</option>
                <option value="72">Within 72 Hours (3 days max limit)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Locality / Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Downtown Financial District, Gate 3"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Collection Window (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Today between 3:00 PM and 7:00 PM"
                value={collectionWindow}
                onChange={(e) => setCollectionWindow(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Pickup Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Loading dock 2, ring kitchen buzzer"
                value={collectionNotes}
                onChange={(e) => setCollectionNotes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Dietary & Allergen Declarations (Optional, warning: do not guess)
            </label>
            <input
              type="text"
              placeholder="e.g. Contains gluten, dairy, tree nuts. No peanuts."
              value={dietaryAllergenInfo}
              onChange={(e) => setDietaryAllergenInfo(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Contact Method & Explicit Consent */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            3. Direct Contact Method & Permissions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Preferred Direct Contact Method <span className="text-red-500">*</span>
              </label>
              <select
                value={publishedContactMethod}
                onChange={(e) => setPublishedContactMethod(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="PHONE">Telephone Call (tel:)</option>
                <option value="WHATSAPP">WhatsApp Messenger (wa.me)</option>
                <option value="EMAIL">Email Composer (mailto:)</option>
                <option value="EXTERNAL_URL">External Website / Portal</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Contact Phone / Email / Handle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+1 (555) 234-5678 or donor@kitchen.org"
                value={publishedContactValue}
                onChange={(e) => setPublishedContactValue(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={contactPublicationConsent}
                onChange={(e) => setContactPublicationConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                <strong>Explicit Publication Consent:</strong> I agree to display this contact detail on the public listing so eligible food seekers can contact me directly.
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={authorityAndAccuracyConfirmed}
                onChange={(e) => setAuthorityAndAccuracyConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                <strong>Authority & Food Safety Confirmation:</strong> I confirm I am authorized by the donor organization to distribute this food and that it has been handled in accordance with local sanitary standards.
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/offerings"
            className="rounded-xl border border-gray-300 px-5 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            <span>Publish Food Offering</span>
          </button>
        </div>
      </form>
    </div>
  );
}
