"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Package, HeartHandshake, Phone, Mail, MessageSquare, ExternalLink, ShieldCheck, Flag } from "lucide-react";
import { FoodRequestRecord } from "@/lib/data";
import { AdPlacement } from "@/components/ads/AdPlacement";

export default function RequestDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<FoodRequestRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    async function loadRequest() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/requests/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setRequest(json.request);
          }
        }
      } catch (err) {
        console.error("Failed to load request from backend:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    if (id) loadRequest();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent mx-auto" />
        <p className="text-xs text-gray-500">Loading request details from server...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Request Not Found</h2>
        <Link href="/requests" className="mt-4 inline-block text-xs font-semibold text-teal-600">
          &larr; Back to Requests
        </Link>
      </div>
    );
  }

  const getContactLink = () => {
    switch (request.publishedContactMethod) {
      case "PHONE":
        return `tel:${request.publishedContactValue.replace(/[^\d+]/g, "")}`;
      case "EMAIL":
        return `mailto:${request.publishedContactValue}?subject=${encodeURIComponent(`Repasters Food Support: ${request.title}`)}`;
      case "WHATSAPP":
        return `https://wa.me/${request.publishedContactValue.replace(/[^\d]/g, "")}`;
      case "EXTERNAL_URL":
        return request.publishedContactValue.startsWith("http")
          ? request.publishedContactValue
          : `https://${request.publishedContactValue}`;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Community Requests</span>
      </Link>

      <div className="mt-6 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-400">
          <HeartHandshake className="h-4 w-4" />
          <span>{request.displayAuthorName}</span>
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          {request.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300 border-y border-gray-100 py-3 dark:border-zinc-800">
          {request.approximateQuantity && (
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-teal-600" />
              <span>Quantity: <strong>{request.approximateQuantity}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span>Locality: <strong>{request.locality}</strong></span>
          </div>
          {request.neededByAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Needed by: <strong>{new Date(request.neededByAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Need Description
          </h3>
          <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-teal-50/60 p-6 dark:bg-teal-950/20 border border-teal-600/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
            Direct Contact Details
          </h3>
          <p className="mt-1 text-xs text-teal-800/80 dark:text-teal-400">
            If you have surplus food matching this need, contact the seeker directly:
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <a
              href={getContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-teal-500 transition"
            >
              <span>Contact {request.displayAuthorName} ({request.publishedContactValue})</span>
            </a>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-teal-800 dark:text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Direct coordination only. Arrange collection and verify hygiene together.</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AdPlacement slot="mobile-feed" />
      </div>
    </div>
  );
}
