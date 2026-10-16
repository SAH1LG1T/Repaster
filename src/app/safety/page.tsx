import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Heart, HelpCircle } from "lucide-react";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function SafetyGuidelinesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Food Safety & Trust Framework
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          Community Health & Safety Guidelines
        </h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          The safety of surplus food recipients is paramount. Review food storage, hygiene, and liability principles before offering or collecting surplus.
        </p>
      </div>

      {/* Strict 2-column acceptable vs prohibited foods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Acceptable */}
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Eligible for Surplus Donation</span>
          </div>
          <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Commercially Prepared Food:</strong> Untouched surplus from catered events, hotel buffets (back-of-house), and restaurant prep kitchens.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Bakery & Bread Surplus:</strong> Day-old loaves, bagels, muffins, pastries in clean packaging.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Fresh Produce:</strong> Whole fruits, vegetables, and greens with intact skins or pre-washed in commercial tubs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Unopened Packaged Staples:</strong> Canned goods, dry pasta, rice, flour within expiration dates.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Properly Chilled Dairy:</strong> Maintained under 40°F (4°C) with clear expiration timestamps.</span>
            </li>
          </ul>
        </div>

        {/* Prohibited */}
        <div className="rounded-3xl border border-rose-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-base">
            <XCircle className="h-5 w-5 text-rose-600" />
            <span>Strictly Prohibited on Repasters</span>
          </div>
          <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Plate Scraps / Table Leftovers:</strong> Any food that has been served to customer tables or touched by diners.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Temperature Danger Zone Food:</strong> Perishable cooked food left at room temperature (40°F - 140°F) for over 2 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Unpasteurized Dairy or Juices:</strong> Raw milk products or unpasteurized juices due to bacterial risks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Alcohol or Tobacco:</strong> Prohibited under all circumstances.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Dented / Swollen Cans:</strong> Damaged canned goods posing botulism danger.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Good Samaritan Protection Section */}
      <div id="donor-protection" className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>Legal Protections for Food Donors (Good Samaritan Laws)</span>
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          In most jurisdictions (such as the Bill Emerson Good Samaritan Food Donation Act in the US and equivalent surplus recovery statutes worldwide), food businesses and caterers are protected from civil and criminal liability when donating apparently wholesome food in good faith to nonprofit organizations.
        </p>
        <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">Notice: </span>
          Repasters does not provide legal counsel. Donors should consult local public health authorities and legal advisors regarding specific state or national food recovery requirements.
        </div>
      </div>

      {/* Report misuse call to action */}
      <div id="reporting" className="rounded-3xl bg-amber-50/60 p-6 sm:p-8 border border-amber-500/20 dark:bg-amber-950/20 space-y-3 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Encountered an Unsafe Listing or Misuse?</h3>
        <p className="text-xs text-gray-700 dark:text-gray-300 max-w-lg mx-auto">
          Every listing features a Report flag. If you encounter spoiled food, inaccurate listings, unreachable numbers, or commercial charging, flag it immediately.
        </p>
        <div className="pt-2">
          <Link
            href="/offerings"
            className="inline-block rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-500"
          >
            Browse Listings to Verify
          </Link>
        </div>
      </div>

      <AdPlacement slot="mobile-feed" />
    </div>
  );
}
