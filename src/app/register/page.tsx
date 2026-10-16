"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Utensils,
  HeartHandshake,
  AlertTriangle,
  Loader2,
  Mail,
  ArrowLeft,
  Clock,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const COUNTRY_DIAL_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+64", country: "NZ", flag: "🇳🇿" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+880", country: "BD", flag: "🇧🇩" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Step 1: Form details, Step 2: 30-min OTP Verification
  const [step, setStep] = useState<"form" | "otp">("form");

  const [role, setRole] = useState<"GIVER" | "SEEKER">("GIVER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [contactPersonName, setContactPersonName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [privatePhone, setPrivatePhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [remainingMinutes, setRemainingMinutes] = useState(30);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Submit form and send 30-min OTP
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

    if (!termsAccepted || !privacyAccepted) {
      setError("Please accept the terms of service and privacy policy to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          contactPersonName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate registration");

      if (data.remainingMinutes) {
        setRemainingMinutes(data.remainingMinutes);
      }

      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initiate registration");
    } finally {
      setLoading(false);
    }
  };

  // Clicking "Resend": displays the 30-minute validity notice instead of re-sending an email
  const handleResendClick = () => {
    setError(null);
    setInfoNotice(
      `Your verification code remains valid for ${remainingMinutes} minutes. Please check your inbox and spam folder for the email already sent.`
    );
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

    if (otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          contactPersonName,
          organizationName: organizationName || null,
          countryCode,
          privatePhone: privatePhone || null,
          otp: otp.trim(),
          termsAccepted,
          privacyAccepted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Log user into client context
      login(
        data.user.email,
        data.user.role,
        data.user.name,
        data.user.organizationName || undefined
      );

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
          Join Repasters
        </h1>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          {step === "form"
            ? "Select your role to publish surplus food or post community requests."
            : "Verify your email to activate your account."}
        </p>
      </div>

      {/* Role Selector Tabs (Only on Step 1) */}
      {step === "form" && (
        <div className="mt-8 grid grid-cols-2 gap-3 p-1 rounded-2xl bg-gray-200/60 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setRole("GIVER")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
              role === "GIVER"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>I am a Surplus Giver</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("SEEKER")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
              role === "SEEKER"
                ? "bg-white text-teal-700 shadow-sm dark:bg-zinc-900 dark:text-teal-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>I am a Food Seeker</span>
          </button>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoNotice && (
          <div className="mb-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span>{infoNotice}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" ? (
          <form onSubmit={handleInitiateRegistration} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Full Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Elena Rostova"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {role === "GIVER" ? "Business / Organization Name *" : "Organization Name (Optional for Individuals)"}
              </label>
              <input
                type="text"
                required={role === "GIVER"}
                placeholder={role === "GIVER" ? "e.g. Grand Plaza Catering & Bakery" : "e.g. Hope Shelter or leave blank"}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Account Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Account Password (Min 8 chars) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 pr-10 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Country Selector & Private Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Private Phone (Optional, strictly for account security, never published)
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-28 rounded-xl border border-gray-200 bg-gray-50/70 px-2 py-3 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  title="Select Country Dial Code"
                >
                  {COUNTRY_DIAL_CODES.map((item) => (
                    <option key={`${item.country}-${item.code}`} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={privatePhone}
                  onChange={(e) => setPrivatePhone(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I accept the Repasters Terms of Service, Community Safety Guidelines, and direct-arrangement boundary.
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I agree to the Privacy Policy and understand private contact details will never be exposed without my explicit consent per listing.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <span>Continue to Email Verification</span>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification */
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Check Your Inbox
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                <Clock className="h-3.5 w-3.5" />
                <span>Code valid for {remainingMinutes} minutes</span>
              </div>
            </div>

            <div>
              <label className="block text-center text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[0.5em] text-2xl font-black rounded-xl border border-gray-200 bg-gray-50/70 py-3 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & Complete Registration</span>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Edit details</span>
              </button>

              <button
                type="button"
                onClick={handleResendClick}
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-500 transition"
              >
                <Info className="h-3.5 w-3.5" />
                <span>Resend Code</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-700 dark:text-gray-300">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-500">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
