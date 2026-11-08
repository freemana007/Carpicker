"use client";

import { ArrowLeft, Crown, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { POWERTRAIN_LABEL } from "@/components/car";
import { CarPhoto } from "@/components/ui/CarPhoto";
import { PlateBadge } from "@/components/ui/bits";
import { formatEur, modelYear } from "@/lib/costs";
import { recommend, scoreOne, type Scored } from "@/lib/engine";
import { answersFromLocation, carUrl, compareUrl, resultsUrl, saveCompare } from "@/lib/share";
import type { Answers } from "@/lib/types";

type Better = "low" | "high" | null;
interface Row {
  label: string;
  value: (s: Scored) => number | null;
  show: (s: Scored) => string;
  better: Better;
}
interface Group {
  title: string;
  rows: Row[];
}

const INSURANCE_RANK = { Low: 1, Medium: 2, High: 3, "Very high": 4 } as const;

const GROUPS: Group[] = [
  {
    title: "Cost",
    rows: [
      { label: "Price", value: (s) => s.option.price, show: (s) => `≈ ${formatEur(s.option.price)}${s.option.source === "ni" ? " (from NI)" : ""}`, better: "low" },
      { label: "Monthly, all-in", value: (s) => s.monthlyTotal, show: (s) => `≈ ${formatEur(s.monthlyTotal)}`, better: "low" },
      { label: "Fuel or charging a year", value: (s) => s.annualEnergy, show: (s) => formatEur(s.annualEnergy), better: "low" },
      { label: "Motor tax a year", value: (s) => s.annualTax, show: (s) => formatEur(s.annualTax), better: "low" },
      { label: "5-year cost (est.)", value: (s) => s.fiveYearCost, show: (s) => `≈ ${formatEur(s.fiveYearCost)}`, better: "low" },
      { label: "Insurance", value: (s) => INSURANCE_RANK[s.insuranceLevel], show: (s) => s.insuranceLevel, better: "low" },
    ],
  },
  {
    title: "Space",
    rows: [
      { label: "Seats", value: (s) => s.car.seats, show: (s) => String(s.car.seats), better: "high" },
      { label: "Boot", value: (s) => s.car.bootL, show: (s) => `${s.car.bootL} L`, better: "high" },
      { label: "Length", value: (s) => s.car.lengthMm, show: (s) => `${(s.car.lengthMm / 1000).toFixed(2)} m`, better: null },
    ],
  },
  {
    title: "Driving",
    rows: [
      { label: "Engine", value: () => null, show: (s) => POWERTRAIN_LABEL[s.car.powertrain], better: null },
      { label: "Gearbox", value: () => null, show: (s) => s.car.gearbox.map((g) => (g === "auto" ? "Automatic" : "Manual")).join(" / "), better: null },
      { label: "Power", value: (s) => s.car.powerHp, show: (s) => `${s.car.powerHp} hp`, better: null },
      { label: "Electric range", value: (s) => s.car.rangeKm ?? null, show: (s) => (s.car.rangeKm ? `${s.car.rangeKm} km` : "–"), better: "high" },
      { label: "Four-wheel drive", value: () => null, show: (s) => (s.car.awd === "standard" ? "Yes" : s.car.awd === "optional" ? "Available" : "No"), better: null },
    ],
  },
  {
    title: "Safety & reviews",
    rows: [
      { label: "Euro NCAP", value: (s) => s.car.ncapStars, show: (s) => `${s.car.ncapStars} / 5 (${s.car.ncapYear})`, better: "high" },
      { label: "Reliability", value: (s) => s.car.reliability, show: (s) => `${s.car.reliability} / 5`, better: "high" },
      { label: "Review score", value: (s) => s.car.expertScore, show: (s) => `${s.car.expertScore.toFixed(1)} / 5`, better: "high" },
      { label: "Match for you", value: (s) => s.score, show: (s) => `${s.score}%`, better: "high" },
    ],
  },
];

export default function ComparePage() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [diffOnly, setDiffOnly] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("ids") ?? "";
    setIds(p.split(",").filter(Boolean).slice(0, 3));
    setAnswers(answersFromLocation() ?? {});
  }, []);

  const cars = useMemo(() => {
    if (!answers) return [];
    const picks = recommend(answers).picks;
    return ids
      .map((id) => picks.find((p) => p.car.id === id) ?? scoreOne(id, answers)?.scored ?? null)
      .filter(Boolean) as Scored[];
  }, [ids, answers]);

  if (!answers) return <p className="text-muted">Loading…</p>;

  const remove = (id: string) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    saveCompare(next);
    history.replaceState(null, "", compareUrl(next, answers));
  };

  return (
    <div className="space-y-6">
      <Link href={resultsUrl(answers)} className="btn-ghost -ml-4">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back to my shortlist
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Compare</h1>
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--brand))]" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
          Show only differences
        </label>
      </div>

      {cars.length < 2 ? (
        <div className="card p-8 text-center">
          <p>Pick at least two cars from your shortlist to compare.</p>
          <Link href={resultsUrl(answers)} className="btn-primary mt-4">
            Choose cars
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
            <caption className="sr-only">Side-by-side comparison of {cars.map((c) => `${c.car.make} ${c.car.model}`).join(", ")}</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-40 bg-surface p-4 text-left align-bottom">
                  <span className="sr-only">Feature</span>
                </th>
                {cars.map((s) => (
                  <th key={s.car.id} scope="col" className="p-4 text-left align-bottom font-normal">
                    <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-surface-2/70">
                      <CarPhoto car={s.car} className="h-full rounded-none" />
                    </div>
                    <div className="mt-2">
                      <PlateBadge year={modelYear(s.option.age)} isNew={s.option.age === 0} />
                    </div>
                    <Link href={carUrl(s.car.id, answers)} className="mt-1 block text-base font-semibold hover:text-brand">
                      {s.car.make} {s.car.model}
                    </Link>
                    <span className="text-muted">{s.car.variant}</span>
                    <button type="button" onClick={() => remove(s.car.id)} className="mt-1 flex min-h-10 items-center gap-1 text-xs text-muted hover:text-bad">
                      <X className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            {GROUPS.map((g) => {
              const rows = g.rows.filter((r) => !diffOnly || new Set(cars.map(r.show)).size > 1);
              if (rows.length === 0) return null;
              return (
                <tbody key={g.title}>
                  <tr>
                    <th colSpan={cars.length + 1} scope="colgroup" className="sticky left-0 bg-surface-2/60 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      {g.title}
                    </th>
                  </tr>
                  {rows.map((r) => {
                    const vals = cars.map(r.value);
                    const nums = vals.filter((v): v is number => v !== null);
                    const best = r.better && nums.length > 1 && new Set(nums).size > 1 ? (r.better === "low" ? Math.min(...nums) : Math.max(...nums)) : null;
                    return (
                      <tr key={r.label}>
                        <th scope="row" className="sticky left-0 z-10 border-b border-line/60 bg-surface px-4 py-3 text-left font-normal text-muted">
                          {r.label}
                        </th>
                        {cars.map((s, i) => {
                          const isBest = best !== null && vals[i] === best;
                          return (
                            <td key={s.car.id} className={`border-b border-line/60 px-4 py-3 tabular-nums ${isBest ? "font-semibold text-good" : ""}`}>
                              <span className="inline-flex items-center gap-1">
                                {isBest && <Crown className="h-3.5 w-3.5" aria-label="Best" />}
                                {r.show(s)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
        </div>
      )}
    </div>
  );
}
