"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, Package, AlertCircle, Utensils } from "lucide-react";
import { OfferingRecord } from "@/lib/data";

const CATEGORY_LABELS: Record<string, string> = {
  PREPARED_MEALS: "Prepared Meals",
  BAKERY_PASTRY: "Bakery & Pastry",
  PRODUCE_FRESH: "Fresh Produce",
  DAIRY_CHILLED: "Dairy & Chilled",
  PACKAGED_PANTRY: "Packaged Pantry",
  BEVERAGES: "Beverages",
  MIXED_OTHER: "Mixed / Other",
};

export const OfferingCard: React.FC<{ offering: OfferingRecord }> = ({ offering }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(offering.consumeByAt).getTime();
      const diff = target - now;

      if (diff <= 0 || offering.status !== "PUBLISHED") {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else {
        setTimeLeft(`${hours}h ${mins}m left`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [offering.consumeByAt, offering.status]);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        {/* Photo header or styled fallback banner */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-tr from-emerald-950/20 to-teal-900/10 dark:from-zinc-800">
          {offering.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offering.photoUrl}
              alt={offering.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-emerald-900/10 text-emerald-600">
              <Utensils className="h-10 w-10 opacity-40" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-900/85 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md">
              {CATEGORY_LABELS[offering.category] || offering.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${
                isExpired
                  ? "bg-rose-900/90 text-rose-200"
                  : "bg-black/60 text-emerald-300 border border-emerald-400/30"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{timeLeft}</span>
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5">
          <div className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
            {offering.giverName}
          </div>

          <h3 className="mt-1.5 text-base font-bold text-gray-900 line-clamp-2 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <Link href={`/offerings/${offering.id}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {offering.title}
            </Link>
          </h3>

          <p className="mt-2 text-xs text-gray-600 line-clamp-2 dark:text-gray-400 leading-relaxed">
            {offering.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1.5 truncate">
              <Package className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{offering.approximateServings}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{offering.locality}</span>
            </div>
          </div>

          {offering.dietaryAllergenInfo && (
            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 mt-0.5" />
              <span className="line-clamp-1">{offering.dietaryAllergenInfo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/60 flex items-center justify-between text-xs">
        <span className="text-gray-700 dark:text-gray-300">
          Collect by: {new Date(offering.consumeByAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          View Details &rarr;
        </span>
      </div>
    </article>
  );
};
