import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ShieldCheck, Heart, AlertOctagon } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50/80 text-gray-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-300">
      {/* Non-Negotiable Core Operating Boundary Banner */}
      <div className="border-b border-gray-200/80 bg-emerald-950 text-emerald-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-white">Direct Discovery & Contact Boundary:</span>
            <span>Repasters is strictly a discovery index connecting food donors and seekers directly.</span>
          </div>
          <div className="text-[11px] text-emerald-200">
            No in-app payments • No food custody • No delivery logistics
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="text-base font-black text-gray-900 dark:text-white">
                Repasters<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              Empowering local food businesses, caterers, and bakeries to redirect edible surplus food directly to community shelters, food pantries, and neighbors in need.
            </p>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Food Discovery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/offerings" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Browse Surplus Offerings
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Community Food Requests
                </Link>
              </li>
              <li>
                <Link href="/offerings/new" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Publish Surplus (Givers Only)
                </Link>
              </li>
              <li>
                <Link href="/requests/new" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Publish Need (Seekers Only)
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  How Direct Connections Work
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Food Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/safety#donor-protection" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Donor Good Samaritan Protection
                </Link>
              </li>
              <li>
                <Link href="/safety#reporting" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Report a Listing or Misuse
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & System */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Account & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Admin & Moderation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Our Purpose & Impact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4 text-[11px] text-gray-700 leading-relaxed dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 flex items-start gap-2.5">
          <AlertOctagon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Food Safety Notice: </span>
            Repasters does not inspect, test, prepare, refrigerate, transport, or certify any food listed on this service. Food donors and recipients are solely responsible for ensuring safe food storage, allergen awareness, packaging integrity, and adherence to public health codes during collection and distribution.
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} Repasters Foundation. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for local community resilience.
          </p>
        </div>
      </div>
    </footer>
  );
};
