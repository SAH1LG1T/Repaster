"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Utensils,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  LogOut,
} from "lucide-react";
import { OfferingRecord, FoodRequestRecord } from "@/lib/data";
import { MarkDistributedButton } from "@/components/listings/MarkDistributedButton";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"OFFERINGS" | "REQUESTS">("OFFERINGS");
  const [myOfferings, setMyOfferings] = useState<OfferingRecord[]>([]);
  const [myRequests, setMyRequests] = useState<FoodRequestRecord[]>([]);

  // Automatically exit to home page if user is logged out
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/";
    }
  }, [user, isLoading]);

  useEffect(() => {
    let isCancelled = false;
    async function loadUserListings() {
      if (!user) return;
      try {
        const [offRes, reqRes] = await Promise.all([
          fetch("/api/v1/offerings?limit=50"),
          fetch("/api/v1/requests"),
        ]);
        if (offRes.ok) {
          const offJson = await offRes.json();
          if (!isCancelled) {
            const all: OfferingRecord[] = offJson.data || [];
            setMyOfferings(
              all.filter(
                (o) =>
                  o.giverId === user.id ||
                  (user.name && o.giverName === user.name) ||
                  (user.organizationName && o.giverName === user.organizationName)
              )
            );
          }
        }
        if (reqRes.ok) {
          const reqJson = await reqRes.json();
          if (!isCancelled) {
            const allReq: FoodRequestRecord[] = reqJson.data || [];
            setMyRequests(
              allReq.filter(
                (r) =>
                  r.seekerId === user.id ||
                  (user.name && r.displayAuthorName === user.name) ||
                  (user.organizationName && r.displayAuthorName === user.organizationName)
              )
            );
          }
        }
      } catch (err) {
        console.error("Failed to load user dashboard listings:", err);
      }
    }
    loadUserListings();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Checking authorization & exiting to home...
        </p>
      </div>
    );
  }

  const handleCloseOffering = async (id: string) => {
    if (!confirm("Are you sure you want to close this offering?")) return;
    try {
      const res = await fetch(`/api/v1/offerings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMyOfferings((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: "CLOSED" } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseRequest = async (id: string) => {
    if (!confirm("Close this food request?")) return;
    try {
      const res = await fetch(`/api/v1/requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMyRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "CLOSED" } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const roleLabel =
    user.role === "GIVER"
      ? "Giver & Donor Dashboard"
      : user.role === "SEEKER"
      ? "Community Seeker Dashboard"
      : `${user.role} Dashboard`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {roleLabel}
            </span>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
              Manage Surplus Listings
            </h1>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {user.organizationName
                ? `${user.organizationName} (${user.name})`
                : `${user.name} (${user.email})`}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/offerings/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post New Offering</span>
          </Link>

          <button
            type="button"
            onClick={() => logout("/")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            title="Exit Dashboard & Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Total Listings
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {myOfferings.length}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider dark:text-emerald-300">
            Active in Search
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {myOfferings.filter((o) => o.status === "PUBLISHED").length}
          </div>
        </div>

        <div className="rounded-2xl border border-teal-500/30 bg-teal-50/50 p-5 dark:border-teal-500/20 dark:bg-teal-950/20">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider dark:text-teal-300">
            Marked Distributed
          </div>
          <div className="mt-2 text-2xl font-black text-teal-700 dark:text-teal-400">
            {myOfferings.filter((o) => o.status === "DISTRIBUTED").length}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Closed / Expired
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {myOfferings.filter((o) => o.status === "CLOSED" || o.status === "EXPIRED").length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("OFFERINGS")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "OFFERINGS"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My Surplus Offerings ({myOfferings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("REQUESTS")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "REQUESTS"
              ? "border-teal-600 text-teal-700 dark:text-teal-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My Community Requests ({myRequests.length})
        </button>
      </div>

      {/* Offerings Table / List */}
      {activeTab === "OFFERINGS" && (
        <div className="space-y-4">
          {myOfferings.map((offering) => {
            const isExpired = new Date(offering.consumeByAt).getTime() <= Date.now();
            return (
              <div
                key={offering.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        offering.status === "PUBLISHED" && !isExpired
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : offering.status === "DISTRIBUTED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                      }`}
                    >
                      {offering.status}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Category: {offering.category.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    <Link href={`/offerings/${offering.id}`} className="hover:text-emerald-600">
                      {offering.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300 pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Consume by: {new Date(offering.consumeByAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{offering.locality}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* One-Click Mark as Distributed Button (Section 5.2) */}
                  <MarkDistributedButton
                    offeringId={offering.id}
                    isDistributed={offering.status === "DISTRIBUTED"}
                    onSuccess={() => {
                      setMyOfferings((prev) =>
                        prev.map((o) =>
                          o.id === offering.id ? { ...o, status: "DISTRIBUTED" } : o
                        )
                      );
                    }}
                  />

                  <Link
                    href={`/offerings/${offering.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300"
                  >
                    View Listing
                  </Link>

                  {offering.status !== "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => handleCloseOffering(offering.id)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-rose-600 dark:border-zinc-700"
                      title="Close Listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requests Table */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4">
          {myRequests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-1">
                <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {req.status}
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  <Link href={`/requests/${req.id}`} className="hover:text-teal-600">
                    {req.title}
                  </Link>
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Locality: {req.locality} • Contact: {req.publishedContactMethod}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/requests/${req.id}`}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300"
                >
                  View Request
                </Link>
                {req.status !== "CLOSED" && (
                  <button
                    type="button"
                    onClick={() => handleCloseRequest(req.id)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-rose-600 dark:border-zinc-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
