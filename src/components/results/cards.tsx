"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, ExternalLink, MapPin, PiggyBank, Plus, ShoppingCart, Shuffle, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { FinanceBadge } from "@/components/finance";
import { primaryListing } from "@/data/carLinks";
import { CarPhoto } from "@/components/ui/CarPhoto";
export { carColour } from "@/components/ui/CarArt";
import { MatchBar, PlateBadge } from "@/components/ui/bits";
import { formatEur, modelYear } from "@/lib/costs";
import { tagline, type Role, type Scored } from "@/lib/engine";
import { carUrl } from "@/lib/share";
import type { Answers } from "@/lib/types";

export const ROLE_META: Record<Role, { label: string; icon: LucideIcon; tone: string }> = {
  best: { label: "Best match for you", icon: Trophy, tone: "text-brand" },
  value: { label: "Best value", icon: PiggyBank, tone: "text-info" },
  dream: { label: "Closest to your dream", icon: Sparkles, tone: "text-accent" },
  wildcard: { label: "Have you considered…?", icon: Shuffle, tone: "text-muted" },
  ni: { label: "Northern Ireland deal", icon: MapPin, tone: "text-good" },
};

function priceLine(s: Scored) {
  const fromNi = s.option.source === "ni";
  return (
    <span>
      <span className="text-xl font-bold tabular-nums">≈ {formatEur(s.option.price)}</span>{" "}
      <span className="text-sm text-muted">{fromNi ? "total on the road" : "typical price"}</span>
    </span>
  );
}

export function CompareToggle({ on, onToggle, disabled, name }: { on: boolean; onToggle: () => void; disabled?: boolean; name: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={`Compare ${name}`}
      disabled={disabled && !on}
      onClick={onToggle}
      className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
        on ? "bg-brand-soft text-ink ring-2 ring-brand" : "bg-surface-2 text-ink hover:ring-1 hover:ring-line"
      } disabled:opacity-40`}
    >
      {on ? <Check className="h-4 w-4 text-brand" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
      Compare
    </button>
  );
}

/** "Find one for sale": a live search on Carzone (or AutoTrader near Belfast for NI deals), filtered to the budget. */
export function FindForSale({ s, budget, variant = "button" }: { s: Scored; budget?: number; variant?: "button" | "link" }) {
  const l = primaryListing(s.car, s.option.source === "ni", { maxPriceEur: budget });
  const label = (
    <>
      <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Find one for sale
      <span className="sr-only"> on {l.name}{l.filtered ? ", filtered to your budget" : ""} (opens in a new tab)</span>
      <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </>
  );
  return variant === "button" ? (
    <a href={l.url} target="_blank" rel="noreferrer" className="btn-secondary" title={`Search ${l.name}`}>
      {label}
    </a>
  ) : (
    <a href={l.url} target="_blank" rel="noreferrer" className="link inline-flex min-h-11 items-center gap-1.5 text-sm" title={`Search ${l.name}`}>
      {label}
    </a>
  );
}

export function HeroCard({
  s,
  answers,
  compare,
  budget,
}: {
  s: Scored;
  answers: Answers;
  compare: { on: boolean; toggle: () => void; full: boolean };
  budget?: number;
}) {
  const name = `${s.car.make} ${s.car.model}`;
  const Role = ROLE_META.best;
  return (
    <motion.article layout="position" className="card overflow-hidden shadow-3">
      <div>
        <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-brand-soft via-surface-2 to-surface px-6 pb-3 pt-14 md:h-80">
          <CarPhoto car={s.car} credit priority className="h-full max-w-2xl" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-sm font-semibold shadow-1">
            <Role.icon className={`h-4 w-4 ${Role.tone}`} aria-hidden="true" /> {Role.label}
          </span>
        </div>
        <div className="space-y-5 p-6 md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PlateBadge year={modelYear(s.option.age)} isNew={s.option.age === 0} />
              {s.option.source === "ni" && <span className="chip text-xs">Bought in Northern Ireland</span>}
              {s.option.source !== "ni" && <FinanceBadge car={s.car} />}
            </div>
            <h2 className="mt-2 text-3xl">
              {name} <span className="font-normal text-muted">{s.car.variant}</span>
            </h2>
            <p className="mt-2 text-lg text-ink/80">{tagline(s)}</p>
          </div>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            {priceLine(s)}
            <span>
              <span className="font-semibold tabular-nums">≈ {formatEur(s.monthlyTotal)}</span>{" "}
              <span className="text-sm text-muted">a month, all-in</span>
            </span>
          </div>
          <MatchBar value={s.score} />
          <ul className="space-y-2">
            {s.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-good" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="flex gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
              <strong>Worth knowing:</strong> {s.headsUp}
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={carUrl(s.car.id, answers)} className="btn-primary">
              See why it fits <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <FindForSale s={s} budget={budget} />
            <CompareToggle on={compare.on} onToggle={compare.toggle} disabled={compare.full} name={name} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function CompactCard({
  s,
  role,
  answers,
  compare,
  budget,
}: {
  s: Scored;
  role?: Role;
  answers: Answers;
  compare: { on: boolean; toggle: () => void; full: boolean };
  budget?: number;
}) {
  const name = `${s.car.make} ${s.car.model}`;
  const meta = role ? ROLE_META[role] : null;
  const niSaving = s.option.source === "ni" && s.option.ni ? s.option.ni.saving : null;
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card flex h-full flex-col p-5 transition hover:shadow-2"
    >
      {meta && (
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <meta.icon className={`h-4 w-4 ${meta.tone}`} aria-hidden="true" /> {meta.label}
        </p>
      )}
      <div className="my-3 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-surface-2/70">
        <CarPhoto car={s.car} className="h-full rounded-none" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PlateBadge year={modelYear(s.option.age)} isNew={s.option.age === 0} />
        {s.option.source !== "ni" && <FinanceBadge car={s.car} />}
      </div>
      <h3 className="mt-2 text-lg">
        <Link href={carUrl(s.car.id, answers)} className="hover:text-brand">
          {name} <span className="font-normal text-muted">{s.car.variant}</span>
        </Link>
      </h3>
      <div className="mt-1">{priceLine(s)}</div>
      {niSaving !== null && (
        <p className="mt-1 text-sm font-semibold text-good">Saves about {formatEur(niSaving)} after VRT and costs</p>
      )}
      <div className="mt-3">
        <MatchBar value={s.score} />
      </div>
      <p className="mt-3 flex-1 text-sm text-ink/80">
        {/* The NI saving is already shown above, so show the next reason instead. */}
        {niSaving !== null ? (s.reasons[1] ?? s.reasons[0]) : s.reasons[0]}
      </p>
      <FindForSale s={s} budget={budget} variant="link" />
      <div className="mt-1 flex items-center justify-between gap-2">
        <Link href={carUrl(s.car.id, answers)} className="link inline-flex min-h-12 items-center gap-1 text-sm">
          Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <CompareToggle on={compare.on} onToggle={compare.toggle} disabled={compare.full} name={name} />
      </div>
    </motion.article>
  );
}
