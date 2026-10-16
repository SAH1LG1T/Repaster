"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, MapPin, HeartHandshake } from "lucide-react";
import { FoodRequestRecord } from "@/lib/data";
import { RequestCard } from "@/components/listings/RequestCard";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function RequestsPage() {
  const [requests, setRequests] = useState<FoodRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locality, setLocality] = useState("");

  useEffect(() => {
    let isCancelled = false;
    async function loadRequests() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (locality) queryParams.set("locality", locality);
        if (search) queryParams.set("q", search);

        const res = await fetch(`/api/v1/requests?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setRequests(json.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load requests from backend:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(loadRequests, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search, locality]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Community Requests
            </span>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
              Food Requests & Needs
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
            Shelters, community kitchens, food pantries, and organizations looking for food support.
          </p>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-500"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post a Request (Seekers)</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search community food requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        <div className="relative sm:w-64">
          <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by locality..."
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Grid of Requests */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl border border-gray-200/80 bg-white/60 p-6 animate-pulse dark:border-zinc-800 dark:bg-zinc-900" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-zinc-800 mt-6 bg-white dark:bg-zinc-900">
          <HeartHandshake className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
            No active food requests found
          </h3>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
            {locality || search
              ? "Try adjusting your search criteria."
              : "Be the first community organisation to submit an urgent need."}
          </p>
          <Link
            href="/requests/new"
            className="mt-4 inline-block rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-600/20 hover:bg-teal-500"
          >
            Post a Request
          </Link>
        </div>
      )}

      {/* In-feed Ad unit */}
      <div className="mt-12">
        <AdPlacement slot="mobile-feed" />
      </div>
    </div>
  );
}
