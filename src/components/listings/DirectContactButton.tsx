"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  Lock,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DirectContactButtonProps {
  method: "PHONE" | "EMAIL" | "WHATSAPP" | "EXTERNAL_URL";
  value: string;
  consumeByAt: string;
  hasConsent: boolean;
  status: string;
  listingTitle: string;
  offeringId?: string;
  giverName?: string;
}

export const DirectContactButton: React.FC<DirectContactButtonProps> = ({
  method,
  value,
  consumeByAt,
  hasConsent,
  status,
  listingTitle,
  offeringId,
  giverName,
}) => {
  const { user } = useAuth();
  const [isExpired, setIsExpired] = useState(() => {
    return new Date().getTime() >= new Date(consumeByAt).getTime() || status !== "PUBLISHED";
  });
  const [hasInitiatedContact, setHasInitiatedContact] = useState(false);

  // Layer 2 Expiry Guard: 10-second timer to detect real-time expiration while tab is open
  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      const expiry = new Date(consumeByAt).getTime();
      if (now >= expiry || status !== "PUBLISHED") {
        setIsExpired(true);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 10000);
    return () => clearInterval(interval);
  }, [consumeByAt, status]);

  if (isExpired) {
    return (
      <div
        role="alert"
        className="w-full rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-center text-amber-800 dark:text-amber-200"
      >
        <div className="flex items-center justify-center gap-2 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span>Listing Expired / No Longer Available</span>
        </div>
        <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-300/80">
          This food has passed its mandatory consume-by deadline and contact details have been removed.
        </p>
      </div>
    );
  }

  // MANDATORY AUTHENTICATION GUARD: Recipient must be logged in to receive/contact the food donor
  if (!user) {
    return (
      <div className="w-full rounded-2xl border border-emerald-600/30 bg-emerald-50/60 p-5 text-center dark:border-emerald-700/30 dark:bg-emerald-950/20 space-y-3">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            Account Required to Receive Food
          </h4>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            For community safety, health traceability, and donor trust, you must be signed in to access direct contact details and arrange collection.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
          >
            <span>Sign In</span>
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-1 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 transition"
          >
            <span>Register</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-700 dark:text-gray-300">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Every transaction remains accountable for community protection.</span>
        </div>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <div className="w-full rounded-xl bg-gray-100 p-3 text-center text-xs text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
        Contact details withheld by donor preference.
      </div>
    );
  }

  const getContactLink = () => {
    switch (method) {
      case "PHONE":
        return `tel:${value.replace(/[^\d+]/g, "")}`;
      case "EMAIL":
        return `mailto:${value}?subject=${encodeURIComponent(`Repasters Surplus Inquiry: ${listingTitle}`)}`;
      case "WHATSAPP": {
        const cleanPhone = value.replace(/[^\d]/g, "");
        const text = encodeURIComponent(`Hi, I am contacting you via Repasters regarding: "${listingTitle}". Is it still available for direct pickup?`);
        return `https://wa.me/${cleanPhone}?text=${text}`;
      }
      case "EXTERNAL_URL":
        return value.startsWith("http") ? value : `https://${value}`;
      default:
        return "#";
    }
  };

  const getButtonIcon = () => {
    switch (method) {
      case "PHONE":
        return <Phone className="h-4 w-4" />;
      case "EMAIL":
        return <Mail className="h-4 w-4" />;
      case "WHATSAPP":
        return <MessageSquare className="h-4 w-4" />;
      case "EXTERNAL_URL":
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getButtonLabel = () => {
    switch (method) {
      case "PHONE":
        return `Call Donor (${value})`;
      case "EMAIL":
        return `Email Donor (${value})`;
      case "WHATSAPP":
        return `Message Donor on WhatsApp`;
      case "EXTERNAL_URL":
        return `Open Donor External Portal`;
    }
  };

  const handleContactClick = () => {
    setHasInitiatedContact(true);
    // Log trace event in audit trail for tracking
    console.log(`[Trace Audit] Recipient ${user.email} initiated direct contact with donor for offering ${offeringId}`);
  };

  return (
    <div className="w-full space-y-2">
      <div className="rounded-lg bg-emerald-50 p-2.5 text-[11px] text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Contacting as: <strong>{user.name}</strong></span>
        </span>
        <span className="rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold">
          Verified User
        </span>
      </div>

      <a
        href={getContactLink()}
        target={method === "PHONE" || method === "EMAIL" ? "_self" : "_blank"}
        rel="noopener noreferrer"
        onClick={handleContactClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/35 focus:ring-4 focus:ring-emerald-500/30"
      >
        {getButtonIcon()}
        <span>{getButtonLabel()}</span>
      </a>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-700 dark:text-gray-300">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Direct arrangement only. Record preserved for 3 months for traceability.</span>
      </div>
    </div>
  );
};
