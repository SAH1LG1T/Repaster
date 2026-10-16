"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, MapPin, Sparkles, Filter, Utensils } from "lucide-react";
import { OfferingRecord } from "@/lib/data";
import { OfferingCard } from "@/components/listings/OfferingCard";
import { MobileFilterDrawer } from "@/components/layout/MobileFilterDrawer";
import { AdPlacement } from "@/components/ads/AdPlacement";

const CATEGORIES = [
  { id: "PREPARED_MEALS", label: "Prepared Meals" },
  { id: "BAKERY_PASTRY", label: "Bakery & Pastry" },
  { id: "PRODUCE_FRESH", label: "Fresh Produce" },
  { id: "DAIRY_CHILLED", label: "Dairy & Chilled" },
  { id: "PACKAGED_PANTRY", label: "Packaged Pantry" },
  { id: "BEVERAGES", label: "Beverages" },
  { id: "MIXED_OTHER", label: "Mixed / Other" },
];

export default function OfferingsPage() {
  const [offerings, setOfferings] = useState<OfferingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locality, setLocality] = useState("");

  useEffect(() => {
    let isCancelled = false;
    async function fetchOfferings() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.set("category", selectedCategory);
        if (locality) queryParams.set("locality", locality);
        if (search) queryParams.set("q", search);

        const res = await fetch(`/api/v1/offerings?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setOfferings(json.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch offerings from backend:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchOfferings, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search, selectedCategory, locality]);

  const handleReset = () => {
    setSearch("");
    setSelectedCategory("");
    setLocality("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live Index
            </span>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
              Surplus Food Offerings
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
            Real-time surplus food posted by local givers, verified and time-filtered.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <MobileFilterDrawer
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={search}
            onSearchChange={setSearch}
            localityQuery={locality}
            onLocalityChange={setLocality}
            onReset={handleReset}
          />

          <Link
            href="/offerings/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 hover:shadow-emerald-600/30"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post an Offering (Givers)</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                <Filter className="h-3.5 w-3.5 text-emerald-600" />
                <span>Filters</span>
              </div>
              {(selectedCategory || locality || search) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Search Listings
              </label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. sandwiches, produce"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-8 pr-3 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* Locality Search */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Locality / Area
              </label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Downtown, West End"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-8 pr-3 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Food Categories
              </label>
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    !selectedCategory
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  All Food Categories
                </button>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Right Rail Ad Placement */}
          <AdPlacement slot="desktop-rail" />
        </aside>

        {/* Listings Grid */}
        <section className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
            <span>
              Showing <strong className="text-gray-900 dark:text-white">{offerings.length}</strong> active food offerings
            </span>
            <span>Sorted by urgent Consume-By deadline</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-3xl border border-gray-200/80 bg-gray-50/50 p-6 animate-pulse dark:border-zinc-800 dark:bg-zinc-900" />
              ))}
            </div>
          ) : offerings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Utensils className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                No active food offerings found
              </h3>
              <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 max-w-sm mx-auto">
                {selectedCategory || locality || search
                  ? "Try adjusting your search filters to find available food items."
                  : "There are currently no active surplus food offerings in your area. Be the first to post!"}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {(selectedCategory || locality || search) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/offerings/new"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Post New Offering
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerings.map((offering) => (
                <OfferingCard key={offering.id} offering={offering} />
              ))}
            </div>
          )}

          {/* Safety & Expiry Guarantee Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-xs text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Zero-Tolerance Expiry Policy:</strong> Listings vanish automatically the minute the designated Consume-By deadline passes. All arrangements are direct between giver and collector under local community food safety guidelines.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
