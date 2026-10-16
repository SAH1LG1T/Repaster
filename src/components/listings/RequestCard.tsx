"use client";

import React from "react";
import Link from "next/link";
import { Clock, MapPin, Package, HeartHandshake } from "lucide-react";
import { FoodRequestRecord } from "@/lib/data";

export const RequestCard: React.FC<{ request: FoodRequestRecord }> = ({ request }) => {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-900/5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-teal-800 dark:text-teal-400">
            <HeartHandshake className="h-4 w-4" />
            <span>{request.displayAuthorName}</span>
          </div>
          {request.neededByAt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Clock className="h-3 w-3" />
              <span>Needed by: {new Date(request.neededByAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          )}
        </div>

        <h3 className="mt-2.5 text-base font-bold text-gray-900 line-clamp-2 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          <Link href={`/requests/${request.id}`}>
            <span className="absolute inset-0" aria-hidden="true" />
            {request.title}
          </Link>
        </h3>

        <p className="mt-2 text-xs text-gray-600 line-clamp-3 dark:text-gray-400 leading-relaxed">
          {request.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-700 dark:text-gray-300">
          {request.approximateQuantity && (
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-teal-600" />
              <span>{request.approximateQuantity}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-teal-600" />
            <span>{request.locality}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-3 dark:border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-gray-700 dark:text-gray-300">
          Via {request.publishedContactMethod}
        </span>
        <span className="font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
          Connect Directly &rarr;
        </span>
      </div>
    </article>
  );
};
