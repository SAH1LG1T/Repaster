"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Offerings", href: "/offerings" },
    { label: "Requests", href: "/requests" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Safety & Guidelines", href: "/safety" },
    { label: "Our Purpose", href: "/about" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isAdminOrModerator = user?.role === "ADMIN" || user?.role === "MODERATOR";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Repasters<span className="text-emerald-500">.</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
              Surplus Food Connect
            </span>
          </div>
        </Link>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Auth Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Post offering button */}
          <Link
            href="/offerings/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post Offering</span>
          </Link>

          {/* Conditional based on whether user is logged in */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                <UserCheck className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              {/* User badge with role indicator */}
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[130px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {user.role}
                </span>
              </div>

              {/* Admin Button: STRICTLY available ONLY to verified Admin/Moderator accounts */}
              {isAdminOrModerator && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
                  title="Staff Admin & Moderation"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-600" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => logout("/")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition dark:border-zinc-800 dark:text-gray-400 dark:hover:border-rose-950 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                title="Exit & Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Exit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-600" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdminOrModerator && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
              >
                Staff Admin Vault
              </Link>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
            <Link
              href="/offerings/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1 rounded-lg border border-emerald-600/30 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Offering</span>
            </Link>
            <Link
              href="/requests/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1 rounded-lg border border-teal-600/30 bg-teal-50 py-2.5 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Request</span>
            </Link>
          </div>

          {user && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-500">
              <span>Signed in as <strong>{user.name}</strong> ({user.role})</span>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout("/");
                }}
                className="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
