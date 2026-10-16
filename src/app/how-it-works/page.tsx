import React from "react";
import Link from "next/link";
import { Utensils, HeartHandshake, ShieldCheck, CheckCircle2, Phone, AlertTriangle, ArrowRight } from "lucide-react";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          The Repasters Discovery Engine
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          How Direct Food Rescue Works
        </h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Repasters connects surplus food givers with community organizations seeking food, while leaving all direct arrangements to the two parties.
        </p>
      </div>

      {/* The Core Operating Boundary Box */}
      <div className="rounded-3xl border border-emerald-600/30 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-600/20 dark:bg-emerald-950/20 space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-bold text-base">
          <ShieldCheck className="h-6 w-6 text-emerald-600 flex-shrink-0" />
          <span>Our Strict Operating Boundary — Non-Negotiable</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-950 dark:text-emerald-200">
          <div className="rounded-xl bg-white p-4 dark:bg-zinc-900 border border-emerald-100 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">What Repasters Does:</span>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Provides an open, verified real-time index of surplus food.</li>
              <li>Enforces strict, mandatory consume-by expiration limits.</li>
              <li>Publishes verified direct contact routes (phone, email, WhatsApp).</li>
              <li>Provides one-click 'Mark as Distributed' to immediately retire posts.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-4 dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-rose-700 dark:text-rose-400">What Repasters NEVER Does:</span>
            <ul className="space-y-1.5 list-disc list-inside text-rose-950 dark:text-rose-200">
              <li>Assign drivers, courier logistics, or route vehicles.</li>
              <li>Charge transactional commissions or handle payments.</li>
              <li>Take custody or guarantee condition of physical food.</li>
              <li>Lock users into proprietary in-app messaging silos.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Two parallel journeys: Giver vs Seeker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Giver Journey */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400 font-bold text-lg">
            <Utensils className="h-5 w-5" />
            <span>The Giver Journey</span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            For bakeries, restaurants, conference venues, hotels, and grocery stores:
          </p>

          <ol className="space-y-4 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex-shrink-0">1</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Prepare Clean Surplus:</strong> Ensure leftovers are packed in food-safe containers and refrigerated or kept warm safely.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex-shrink-0">2</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Publish Offering:</strong> Fill in portions, photo, pickup dock details, and a mandatory consume-by deadline.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex-shrink-0">3</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Receive Direct Contact:</strong> Community seekers reach out via phone, email, or WhatsApp to confirm pickup.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex-shrink-0">4</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Click 'Mark Distributed':</strong> Retire the listing with one click to stop unnecessary inbound inquiries.
              </div>
            </li>
          </ol>

          <Link
            href="/offerings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
          >
            <span>Post Surplus Offering</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Seeker Journey */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
          <div className="flex items-center gap-2.5 text-teal-800 dark:text-teal-400 font-bold text-lg">
            <HeartHandshake className="h-5 w-5" />
            <span>The Seeker Journey</span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            For shelters, community soup kitchens, faith organizations, and individuals:
          </p>

          <ol className="space-y-4 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex-shrink-0">1</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Search Offerings:</strong> Filter by locality, food category, and immediate availability window.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex-shrink-0">2</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Check Consume-By Timer:</strong> Verify the food is within its safe consumption window before contacting.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex-shrink-0">3</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Initiate Direct Contact:</strong> Use the direct phone or WhatsApp button to coordinate pickup logistics.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex-shrink-0">4</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Collect Responsibly:</strong> Bring coolers, boxes, or transport gear as requested in collection notes.
              </div>
            </li>
          </ol>

          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-500 transition"
          >
            <span>Post a Community Request</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <AdPlacement slot="mobile-feed" />
      </div>
    </div>
  );
}
