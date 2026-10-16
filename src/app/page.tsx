"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Utensils, HeartHandshake, ShieldCheck, ArrowRight, Clock, MapPin, Sparkles, AlertCircle, PlusCircle } from "lucide-react";
import { OfferingRecord, FoodRequestRecord } from "@/lib/data";
import { OfferingCard } from "@/components/listings/OfferingCard";
import { RequestCard } from "@/components/listings/RequestCard";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function HomePage() {
  const [offerings, setOfferings] = useState<OfferingRecord[]>([]);
  const [requests, setRequests] = useState<FoodRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [offRes, reqRes] = await Promise.all([
          fetch("/api/v1/offerings?limit=3"),
          fetch("/api/v1/requests?limit=2"),
        ]);
        if (offRes.ok) {
          const offJson = await offRes.json();
          setOfferings(offJson.data || []);
        }
        if (reqRes.ok) {
          const reqJson = await reqRes.json();
          setRequests(reqJson.data || []);
        }
      } catch (err) {
        console.error("Failed to load home page listings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200/60 bg-gradient-to-b from-emerald-900/10 via-transparent to-transparent py-16 sm:py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Local Surplus Food Discovery & Rescue</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.15]">
                Turn Surplus Food into <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Direct Community Care</span>.
              </h1>

              <p className="max-w-2xl text-base text-gray-700 sm:text-lg dark:text-gray-300 leading-relaxed">
                Connect hotels, caterers, bakeries, and food businesses directly with local charities, shelters, and food seekers. Direct contact, instant discovery, zero food waste.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/offerings"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-emerald-600/35"
                >
                  <Utensils className="h-4 w-4" />
                  <span>Browse Available Food</span>
                </Link>

                <Link
                  href="/offerings/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  <span>Post an Offering (Givers)</span>
                </Link>

                <Link
                  href="/requests/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-600/40 bg-teal-50/50 px-5 py-3.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-300"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Post a Request (Seekers)</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80 dark:border-zinc-800/80 text-xs">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Strict Time Limits</div>
                  <div className="text-gray-600 dark:text-gray-400">Automatic food expiry guard</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Direct Arrangement</div>
                  <div className="text-gray-600 dark:text-gray-400">Zero middleman logistics</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Privacy First</div>
                  <div className="text-gray-600 dark:text-gray-400">Consent-based contact info</div>
                </div>
              </div>
            </div>

            {/* Hero Side Highlight Banner */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-6 sm:p-8 shadow-sm dark:border-emerald-500/10 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">Food Safety First</h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400">Safe, direct, and zero waste</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Repasters is a public interest coordination platform. Givers and Seekers connect directly, inspecting and transporting surplus food under mutual community responsibility and local food safety guidelines.
                </p>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/80 p-3 text-xs text-gray-700 shadow-sm dark:bg-zinc-800/80 dark:text-gray-300">
                  <AlertCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Every offering has a strict Consume-By deadline. Stale or expired listings are automatically withdrawn to protect community health.
                  </span>
                </div>
              </div>

              {/* Desktop Rail Ad Placement */}
              <AdPlacement slot="desktop-rail" className="mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Active Offerings Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Recently Published Surplus Food
            </h2>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
              Fresh surplus from local restaurants, caterers, and bakeries available for collection.
            </p>
          </div>
          <Link
            href="/offerings"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            <span>View All Offerings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-3xl border border-gray-200/80 bg-gray-50/50 p-6 animate-pulse dark:border-zinc-800 dark:bg-zinc-900" />
            ))}
          </div>
        ) : offerings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/60 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
            <Utensils className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">No active surplus listings right now</h3>
            <p className="mt-1 text-xs text-gray-500">Be the first food business to share surplus food with the community today.</p>
            <Link
              href="/offerings/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post an Offering</span>
            </Link>
          </div>
        )}

        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/offerings"
            className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:bg-zinc-800 dark:text-white"
          >
            <span>View All Surplus Offerings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Community Requests Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-teal-900/10 bg-teal-50/40 p-6 sm:p-10 dark:border-teal-900/20 dark:bg-teal-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Community Food Requests
              </h2>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Shelters, soup kitchens, and families actively looking for food support.
              </p>
            </div>
            <Link
              href="/requests"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400"
            >
              <span>View All Requests</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl border border-gray-200/80 bg-white/60 p-6 animate-pulse dark:border-zinc-800 dark:bg-zinc-900" />
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-teal-200 bg-white/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
              <HeartHandshake className="mx-auto h-7 w-7 text-teal-600/70" />
              <h3 className="mt-2 text-xs font-bold text-gray-900 dark:text-white">No active requests</h3>
              <p className="mt-1 text-[11px] text-gray-500">Are you a shelter or food pantry? Post what your community needs.</p>
              <Link
                href="/requests/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-500"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Post a Food Request</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
