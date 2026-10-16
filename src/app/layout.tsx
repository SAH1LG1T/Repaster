import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
//just for deployment
export const metadata: Metadata = {
  title: "Repasters | Local Food Connect & Surplus Rescue Discovery",
  description:
    "A responsive discovery platform directly connecting hotels, restaurants, bakeries, and food businesses with community food seekers and shelters. Zero waste, direct community connection.",
  keywords: ["surplus food", "food rescue", "community food pantry", "food donation", "local food connect", "food waste reduction"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
