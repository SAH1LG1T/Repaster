"use client";

import React, { useState } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";

interface FilterDrawerProps {
  categories: { id: string; label: string }[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  localityQuery: string;
  onLocalityChange: (loc: string) => void;
  onReset: () => void;
}

export const MobileFilterDrawer: React.FC<FilterDrawerProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  localityQuery,
  onLocalityChange,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex lg:hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-200"
      >
        <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
        <span>Filter Listings</span>
        {(selectedCategory || searchQuery || localityQuery) && (
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        )}
      </button>

      {/* Modal / Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-2xl dark:bg-zinc-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Filter Listings</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Keyword Search */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Search Keywords
                </label>
                <input
                  type="text"
                  placeholder="e.g. sandwiches, fruit, bread"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              {/* Locality Search */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Locality / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Downtown, West End"
                  value={localityQuery}
                  onChange={(e) => onLocalityChange(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              {/* Category selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Food Category
                </label>
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectCategory("")}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                      !selectedCategory
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span>All Categories</span>
                    {!selectedCategory && <Check className="h-4 w-4" />}
                  </button>

                  {categories.map((cat) => {
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onSelectCategory(cat.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                          active
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {active && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
