"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Car, ClipboardCheck, HeartHandshake, Pencil, Search, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CARS } from "@/data/cars";
import { formatEur, paysMonthly } from "@/lib/costs";
import { explainMissing, type Scored } from "@/lib/engine";
import { compareUrl, editUrl } from "@/lib/share";
import { aboutYou } from "@/lib/summary";
import type { Answers, Condition, NiChoice } from "@/lib/types";

export function AboutYouPanel({ answers }: { answers: Answers }) {
  const lines = aboutYou(answers);
  return (
    <section className="card p-5" aria-labelledby="about-you">
      <h2 id="about-you" className="text-lg">
        What we know about you
      </h2>
      <p className="mt-1 text-sm text-muted">Tap any line to change it.</p>
      <ul className="mt-4 divide-y divide-line/70">
        {lines.map((l) => (
          <li key={l.label}>
            <Link href={editUrl(l.qid)} className="group flex min-h-12 items-start gap-3 py-2.5">
              <span className="w-24 shrink-0 text-sm text-muted">{l.label}</span>
              <span className="flex-1 text-sm font-medium">{l.text}</span>
              <Pencil className="mt-0.5 h-4 w-4 shrink-0 text-muted group-hover:text-brand" aria-label={`Change ${l.label}`} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="label mb-2">{label}</legend>
      <div className="flex rounded-full bg-surface-2 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition ${
              value === o.value ? "bg-surface text-ink shadow-1" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FiltersPanel({ answers, update }: { answers: Answers; update: (p: Partial<Answers>) => void }) {
  const monthly = paysMonthly(answers);
  const min = monthly ? 100 : 2000;
  const max = monthly ? 1500 : 80000;
  const step = monthly ? 25 : 500;
  const budget = answers.budget ?? (monthly ? 400 : 15000);
  const brands = Array.from(new Set(CARS.map((c) => c.make))).sort();
  const love = answers.brandsLove ?? [];
  const avoid = answers.brandsAvoid ?? [];

  return (
    <section className="card space-y-5 p-5" aria-labelledby="filters">
      <h2 id="filters" className="text-lg">
        Adjust
      </h2>
      <label className="block">
        <span className="label">
          Budget: <strong className="text-ink">{formatEur(budget)}</strong>
          {monthly ? " a month" : ""}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={budget}
          onChange={(e) => update({ budget: Number(e.target.value), budgetUnknown: false })}
          className="mt-2 h-3 w-full cursor-pointer accent-[rgb(var(--brand))]"
          aria-valuetext={`${formatEur(budget)}${monthly ? " a month" : ""}`}
        />
      </label>
      <Segmented<Condition>
        label="New or used"
        value={answers.condition ?? "either"}
        onChange={(v) => update({ condition: v })}
        options={[
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "either", label: "Either" },
        ]}
      />
      <Segmented<NiChoice>
        label="Northern Ireland cars"
        value={answers.ni ?? "no"}
        onChange={(v) => update({ ni: v })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "big", label: "Big saving" },
          { value: "no", label: "No" },
        ]}
      />
      <details>
        <summary className="label flex min-h-11 cursor-pointer items-center">
          Brands you love or avoid {love.length + avoid.length > 0 && `(${love.length + avoid.length})`}
        </summary>
        <p className="mb-2 text-xs text-muted">Tap once to favour, twice to avoid, again to clear.</p>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => {
            const state = love.includes(b) ? "love" : avoid.includes(b) ? "avoid" : "none";
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  if (state === "love") update({ brandsLove: love.filter((x) => x !== b), brandsAvoid: [...avoid, b] });
                  else if (state === "avoid") update({ brandsAvoid: avoid.filter((x) => x !== b) });
                  else update({ brandsLove: [...love, b] });
                }}
                aria-label={`${b}: ${state === "love" ? "favourite" : state === "avoid" ? "avoid" : "no preference"}`}
                className={`min-h-10 rounded-full px-3 text-sm transition ${
                  state === "love"
                    ? "bg-good-soft font-semibold text-good ring-1 ring-good"
                    : state === "avoid"
                      ? "bg-bad-soft text-bad line-through ring-1 ring-bad"
                      : "bg-surface-2"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
}

export function WhyNotSearch({ answers }: { answers: Answers }) {
  const [query, setQuery] = useState("");
  const models = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of CARS) seen.set(`${c.make} ${c.model}`, c.id);
    return Array.from(seen.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);
  const match = models.find(([n]) => n.toLowerCase() === query.trim().toLowerCase());
  const result = match ? explainMissing(match[1], answers) : null;
  return (
    <section className="card p-5" aria-labelledby="why-not">
      <h2 id="why-not" className="flex items-center gap-2 text-lg">
        <Search className="h-5 w-5 text-brand" aria-hidden="true" /> Why isn&apos;t my car here?
      </h2>
      <label className="mt-3 block">
        <span className="sr-only">Car model</span>
        <input
          list="car-models"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a car, e.g. Toyota Corolla"
          className="min-h-12 w-full rounded-xl bg-surface-2 px-4 placeholder:text-muted"
        />
        <datalist id="car-models">
          {models.map(([n]) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </label>
      <p className="mt-3 text-sm" aria-live="polite">
        {result ? result.message : query.trim().length > 2 && !match ? "Pick a car from the list. We cover about 50 popular models." : ""}
      </p>
    </section>
  );
}

export function CompareTray({
  ids,
  ranked,
  answers,
  remove,
}: {
  ids: string[];
  ranked: Scored[];
  answers: Answers;
  remove: (id: string) => void;
}) {
  const items = ids.map((id) => ranked.find((s) => s.car.id === id) ?? null).filter(Boolean) as Scored[];
  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-surface/95 shadow-3 backdrop-blur"
          role="region"
          aria-label="Compare tray"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
            <span className="text-sm font-semibold">Compare ({ids.length}/3)</span>
            <ul className="flex flex-1 flex-wrap gap-2">
              {ids.map((id) => {
                const s = items.find((x) => x.car.id === id);
                const name = s ? `${s.car.make} ${s.car.model}` : id;
                return (
                  <li key={id} className="chip">
                    {name}
                    <button type="button" onClick={() => remove(id)} aria-label={`Remove ${name} from compare`} className="-mr-1 rounded-full p-1 hover:bg-line">
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            {ids.length >= 2 ? (
              <Link href={compareUrl(ids, answers)} className="btn-primary">
                Compare side by side <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <span className="text-sm text-muted">Pick one more to compare</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A clear end point (Alli: mindful design): you're done, here's what to do next. */
export function FinishLine({ onShare, shared }: { onShare: () => void; shared: boolean }) {
  const steps = [
    { icon: CalendarCheck, title: "Test drive your top two", text: "Drive each for 20 minutes on town roads and a faster road. Try every button." },
    { icon: ShieldCheck, title: "Get 2–3 insurance quotes", text: "Before you commit. For new drivers, insurance can cost more than fuel." },
    { icon: ClipboardCheck, title: "Check the exact car", text: "Run a history check (Cartell or Motorcheck) and get an independent inspection. Got a car to trade in? Ask each dealer for a price." },
  ];
  return (
    <section className="card p-6 md:p-8" aria-labelledby="done">
      <h2 id="done" className="text-2xl">
        That&apos;s it. You&apos;ve got your shortlist.
      </h2>
      <p className="mt-2 text-muted">No rush. Your answers are saved on this device, so come back whenever you like.</p>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl bg-surface-2/70 p-4">
            <s.icon className="h-6 w-6 text-brand" aria-hidden="true" />
            <p className="mt-2 font-semibold">
              {i + 1}. {s.title}
            </p>
            <p className="mt-1 text-sm text-ink/80">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onShare} className="btn-secondary">
          <HeartHandshake className="h-5 w-5 text-brand" aria-hidden="true" />
          {shared ? "Link copied" : "Share with someone you trust"}
        </button>
        <span className="text-sm text-muted">A second opinion helps with a big decision.</span>
      </div>
    </section>
  );
}

/** The shortlist reveal: shows the rules at work (Norman) with a small moment of delight (Kuznetsov). */
export function ShortlistReveal({ total, fit, top, onDone }: { total: number; fit: number; top: number; onDone: () => void }) {
  const steps = [`${total} cars`, `${fit} fit your needs`, `Your top ${top}`];
  const [i, setI] = useState(0);
  useEffect(() => {
    const timers = [setTimeout(() => setI(1), 550), setTimeout(() => setI(2), 1100), setTimeout(onDone, 1800)];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-bg" role="status" aria-live="polite">
      <div className="text-center">
        <Car className="mx-auto h-12 w-12 text-brand" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-4xl font-bold tracking-tight"
          >
            {steps[i]}
          </motion.p>
        </AnimatePresence>
        <button type="button" onClick={onDone} className="btn-ghost mt-6 text-sm">
          Skip
        </button>
      </div>
    </div>
  );
}
