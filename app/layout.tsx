import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InsightLedger — invoices with a brain",
  description:
    "Next.js MVP demo: invoice dashboard with JST-aware revenue charts and an AI digest (OpenAI-compatible, keyless fallback).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-slate-50 text-slate-900`}
      >
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-block size-2.5 rounded-sm bg-indigo-600" />
              InsightLedger
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">Dashboard</Link>
              <Link href="/invoices" className="hover:text-slate-900">Invoices</Link>
            </nav>
            <span className="ml-auto text-xs text-slate-400">
              demo data · JST reporting
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-slate-400">
          Demo app by a senior Next.js engineer — real client names removed, money stored as integer cents.
        </footer>
      </body>
    </html>
  );
}
