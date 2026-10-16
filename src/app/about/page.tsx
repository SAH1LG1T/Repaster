import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Heart, Globe, Users, ArrowRight } from "lucide-react";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Our Purpose & Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          Why We Built Repasters
        </h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Millions of tons of delicious, perfectly prepared food are discarded every day simply because food businesses lack a zero-friction, direct way to notify nearby shelters and community kitchens before closing time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Eliminate Food Waste</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Reducing surplus food sent to landfills cuts methane emissions and respects the energy and labor required to produce meals.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Dignified Community Support</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Direct coordination respects recipient dignity, allowing neighborhood charities to source fresh produce and chef-crafted meals directly.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Zero Extraction</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            We don't skim commissions, charge delivery fees, or insert opaque algorithms. We are a free, non-extractive community discovery bridge.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-emerald-950 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Ready to participate in surplus food rescue?</h3>
          <p className="text-xs text-emerald-200">Join as a Food Business Donor or Community Recipient today.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/offerings/new"
            className="rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-400 transition"
          >
            Post Surplus
          </Link>
          <Link
            href="/requests/new"
            className="rounded-xl bg-zinc-800 px-5 py-3 text-xs font-bold text-white hover:bg-zinc-700 transition"
          >
            Post Need
          </Link>
        </div>
      </div>

      <AdPlacement slot="mobile-feed" />
    </div>
  );
}
