"use client";

import React, { useState, useEffect } from "react";
import { env } from "@/config/env";

interface AdPlacementProps {
  slot: "desktop-rail" | "mobile-feed" | "banner";
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ slot, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Lazy-load simulation & CLS prevention
    if (env.NEXT_PUBLIC_ENABLE_ADS) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!env.NEXT_PUBLIC_ENABLE_ADS || hasError) {
    return null;
  }

  // Pre-allocated fixed dimensions to guarantee 0 cumulative layout shift (CLS)
  const slotStyles = {
    "desktop-rail": "w-[300px] h-[250px] min-h-[250px] hidden lg:flex",
    "mobile-feed": "w-full min-h-[100px] lg:hidden",
    banner: "w-full max-w-4xl h-[90px] min-h-[90px]",
  };

  return (
    <aside
      aria-label="Sponsor Advertisement"
      className={`relative rounded-xl border border-dashed border-emerald-900/20 bg-emerald-50/40 p-4 transition-all duration-300 dark:border-emerald-700/20 dark:bg-emerald-950/20 flex flex-col justify-between items-center text-center overflow-hidden ${slotStyles[slot]} ${className}`}
    >
      <div className="w-full flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-emerald-800/70 dark:text-emerald-400/70">
        <span>Sponsored</span>
        <span className="bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-[9px]">
          Ad
        </span>
      </div>

      <div className="my-auto py-2">
        <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
          EcoPack Commercial Composting
        </p>
        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-1 line-clamp-2">
          Zero-waste packaging & certified commercial kitchen food waste management.
        </p>
      </div>

      <div className="w-full flex items-center justify-between text-[11px]">
        <span className="text-[10px] text-gray-700 dark:text-gray-300">Supports Repasters Hosting</span>
        <a
          href="https://example.com/sponsor"
          target="_blank"
          rel="noopener noreferrer external"
          className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 underline underline-offset-2"
        >
          Learn More &rarr;
        </a>
      </div>
    </aside>
  );
};
