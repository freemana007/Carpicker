import type { Metadata, Viewport } from "next";
import Link from "next/link";
import COSTS from "@/config/ireland-costs.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarPicker Ireland",
  description:
    "A free quiz that helps beginners in Ireland pick a car, with the full cost of buying from Northern Ireland.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#059669" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand-700">
              🚗 CarPicker <span className="text-slate-500">Ireland</span>
            </Link>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
              <Link href="/quiz/" className="hover:text-brand-700">Take the quiz</Link>
              <Link href="/results/" className="hover:text-brand-700">My results</Link>
              <Link href="/northern-ireland/" className="hover:text-brand-700">Buying from NI</Link>
              <Link href="/glossary/" className="hover:text-brand-700">Car words explained</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white text-sm text-slate-500">
          <div className="mx-auto max-w-5xl space-y-2 px-4 py-6">
            <p>
              <strong>Free, no account, no AI.</strong> Your answers stay on your device. Results come from a fixed set of
              rules, so the same answers always give the same cars.
            </p>
            <p>
              Prices, taxes and ratings are estimates. Tax rates last checked: {formatDate(COSTS.checkedAt)}
              {!COSTS.verified && " (draft: not yet verified against official sources)"}. Always check VRT with Revenue
              and get your own insurance quote before you buy.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
