import "@fontsource-variable/inter";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { THEME_SCRIPT, ThemeToggle } from "@/components/ThemeToggle";
import COSTS from "@/config/ireland-costs.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarPicker Ireland",
  description:
    "A free quiz that helps beginners in Ireland pick a car, with the full cost of buying from Northern Ireland.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#080f11" },
  ],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IE", { month: "long", year: "numeric" });
}

const NAV = [
  { href: "/quiz/", label: "Quiz" },
  { href: "/results/", label: "My cars" },
  { href: "/finance-offers/", label: "0% finance" },
  { href: "/coming-soon/", label: "Coming soon" },
  { href: "/northern-ireland/", label: "Buying in NI" },
  { href: "/glossary/", label: "Car words" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:shadow-2">
          Skip to content
        </a>
        <Providers>
          <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/85 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4" aria-label="Main">
              <Link href="/" className="mr-2 flex min-h-12 items-center gap-2 text-lg font-bold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-black text-brand-on" aria-hidden="true">
                  CP
                </span>
                <span>
                  CarPicker <span className="font-medium text-muted">Ireland</span>
                </span>
              </Link>
              <div className="ml-auto hidden items-center gap-1 md:flex">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} className="btn-ghost min-h-12 px-4 text-sm">
                    {n.label}
                  </Link>
                ))}
              </div>
              <div className="ml-auto md:ml-0">
                <ThemeToggle />
              </div>
            </nav>
            <div className="flex gap-1 overflow-x-auto px-2 pb-1 md:hidden" aria-label="Main (mobile)">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="btn-ghost min-h-11 shrink-0 px-3 text-sm">
                  {n.label}
                </Link>
              ))}
            </div>
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">
            {children}
          </main>
          <footer className="border-t border-line/60 text-sm text-muted">
            <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-2">
              <p>
                <strong className="text-ink">Free. No account. No AI.</strong> Your answers stay on this device. The same
                answers always give the same cars, from a fixed set of rules.
              </p>
              <p>
                Tax rates checked with Revenue and motortax.ie ({formatDate(COSTS.sources.vrt.checked!)}). Car prices, specs
                and ratings are estimates. Always check VRT with Revenue&apos;s calculator and get your own insurance quote.{" "}
                <Link href="/credits/" className="underline underline-offset-2 hover:text-ink">
                  Photo credits
                </Link>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
