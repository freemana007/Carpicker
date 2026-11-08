"use client";

import { Briefcase, ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react";
import { Term } from "@/components/Term";
import { StarRating } from "@/components/ui/bits";
import { LINKS, REVIEW_SOURCES, euroNcapSearchUrl, reviewSearchUrl } from "@/lib/content";
import { formatEur } from "@/lib/costs";
import type { Scored } from "@/lib/engine";
import type { Feature, SafetyFeature } from "@/lib/types";

export const FEATURE_LABEL: Record<Feature, string> = {
  carplay: "Apple CarPlay / Android Auto",
  touchscreen: "Touchscreen",
  heatedSeats: "Heated seats",
  sunroof: "Sunroof",
  stereo: "Premium stereo",
};
export const SAFETY_LABEL: Record<SafetyFeature, string> = {
  aeb: "Automatic emergency braking",
  blindSpot: "Blind-spot warning",
  acc: "Adaptive cruise control",
  camera: "Reversing camera",
};
export const POWERTRAIN_LABEL = { petrol: "Petrol", diesel: "Diesel", hybrid: "Hybrid", phev: "Plug-in hybrid", ev: "Electric" };

/** Yearly cost as one stacked bar, replacing a table (Schoger: show, don't list). */
export function CostBar({ s }: { s: Scored }) {
  const energyLabel = s.car.powertrain === "ev" ? "Charging" : s.car.powertrain === "phev" ? "Fuel + charging" : "Fuel";
  const parts = [
    ...(s.monthlyRepayment !== undefined ? [{ label: "Loan repayments", eur: s.monthlyRepayment * 12, cls: "bg-info" }] : []),
    { label: energyLabel, eur: s.annualEnergy, cls: "bg-brand" },
    { label: "Motor tax", eur: s.annualTax, cls: "bg-accent" },
    { label: "Servicing, repairs, NCT", eur: s.annualServicing, cls: "bg-muted" },
  ];
  const total = parts.reduce((t, p) => t + p.eur, 0);
  return (
    <div className="space-y-4">
      <p>
        <span className="text-3xl font-bold tabular-nums">≈ {formatEur(total)}</span> <span className="text-muted">a year</span>{" "}
        <span className="text-muted">(≈ {formatEur(total / 12)} a month), plus insurance</span>
      </p>
      <div className="flex h-5 overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label} ${formatEur(p.eur)}`).join(", ")}>
        {parts.map((p) => (
          <span key={p.label} className={p.cls} style={{ width: `${(p.eur / total) * 100}%` }} />
        ))}
      </div>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm ${p.cls}`} aria-hidden="true" />
            <span className="flex-1">{p.label}</span>
            <span className="tabular-nums">{formatEur(p.eur)}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm ring-1 ring-line" aria-hidden="true" />
          <span className="flex-1">
            <Term term="Insurance group">Insurance</Term> ({s.insuranceLevel})
          </span>
          <span>get a quote</span>
        </li>
      </ul>
      <p className="text-sm text-muted">
        Uses about{" "}
        {s.car.powertrain === "ev"
          ? `${s.car.kwh100} kWh per 100 km, with a range of about ${s.car.rangeKm} km`
          : s.car.powertrain === "phev"
            ? `${s.car.fuelL100} L per 100 km on petrol, plus about ${s.car.rangeKm} km on electricity`
            : `${s.car.fuelL100} L per 100 km`}
        . <Term term="CO₂ band">CO₂</Term> {s.car.co2} g/km. Estimate over 5 years, including what it&apos;s worth when you sell:
        about {formatEur(s.fiveYearCost)} (excluding insurance).
      </p>
    </div>
  );
}

export function ExpertsPanel({ s }: { s: Scored }) {
  const { car } = s;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <StarRating stars={car.expertScore} label={`CarPicker review score ${car.expertScore} out of 5`} />
        <span className="font-semibold">{car.expertScore.toFixed(1)} / 5</span>
        <span className="text-sm text-muted">our summary of trusted reviews</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-good-soft/60 p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <ThumbsUp className="h-4 w-4 text-good" aria-hidden="true" /> What reviewers like
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {car.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-bad-soft/60 p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <ThumbsDown className="h-4 w-4 text-bad" aria-hidden="true" /> What reviewers don&apos;t
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {car.cons.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="label mb-2">Read the full reviews</h3>
        <ul className="flex flex-wrap gap-2">
          {REVIEW_SOURCES.map((src) => (
            <li key={src.name}>
              <a className="chip min-h-10 hover:bg-line" href={reviewSearchUrl(src, car.reviewQuery)} target="_blank" rel="noreferrer">
                {src.name} <ExternalLink className="h-3.5 w-3.5" aria-label="(opens in a new tab)" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted">We write these summaries in our own words and link to the original reviews.</p>
    </div>
  );
}

export function SafetyPanel({ s, fromNi }: { s: Scored; fromNi: boolean }) {
  const { car } = s;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StarRating stars={car.ncapStars} label={`Euro NCAP ${car.ncapStars} out of 5 stars`} />
        <span className="font-semibold">
          <Term term="Euro NCAP" /> {car.ncapStars} / 5
        </span>
        <span className="text-sm text-muted">tested {car.ncapYear}</span>
        <a className="link text-sm" href={euroNcapSearchUrl(car.reviewQuery)} target="_blank" rel="noreferrer">
          See the test
        </a>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(SAFETY_LABEL) as SafetyFeature[]).map((f) => {
          const std = car.safetyStd.includes(f);
          const opt = car.safetyOpt.includes(f);
          return (
            <li key={f} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/60 px-3 py-2 text-sm">
              <span>{SAFETY_LABEL[f]}</span>
              <span className={`text-xs font-semibold ${std ? "text-good" : opt ? "text-accent" : "text-muted"}`}>
                {std ? "Standard" : opt ? "Some versions" : "Not available"}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-muted">
        Check for open recalls on the exact car:{" "}
        <a className="link" href={LINKS.nsai.url} target="_blank" rel="noreferrer">
          {LINKS.nsai.label}
        </a>
        {fromNi && (
          <>
            {" "}and{" "}
            <a className="link" href={LINKS.ukRecall.url} target="_blank" rel="noreferrer">
              {LINKS.ukRecall.label}
            </a>
          </>
        )}
        .
      </p>
    </div>
  );
}

export function InsidePanel({ s }: { s: Scored }) {
  const { car } = s;
  // Rough guide: a large suitcase is about 90–100 litres.
  const suitcases = Math.max(0, Math.floor(car.bootL / 95));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface-2/60 p-4">
          <p className="text-2xl font-bold">{car.seats}</p>
          <p className="text-sm text-muted">seats</p>
        </div>
        <div className="rounded-2xl bg-surface-2/60 p-4">
          <p className="text-2xl font-bold">{car.bootL} L</p>
          <p className="text-sm text-muted">boot{car.seats >= 7 ? " with all seats up" : ""}</p>
          <p className="mt-2 flex flex-wrap gap-0.5" role="img" aria-label={`About ${suitcases} large suitcases`}>
            {Array.from({ length: Math.min(suitcases, 8) }, (_, i) => (
              <Briefcase key={i} className="h-4 w-4 text-brand" aria-hidden="true" />
            ))}
            <span className="ml-1 text-xs text-muted">≈ {suitcases} large suitcases</span>
          </p>
        </div>
        <div className="rounded-2xl bg-surface-2/60 p-4">
          <p className="text-2xl font-bold">{(car.lengthMm / 1000).toFixed(2)} m</p>
          <p className="text-sm text-muted">long</p>
        </div>
      </div>
      <p className="text-sm">
        <strong>Standard:</strong> {car.featuresStd.map((f) => FEATURE_LABEL[f]).join(", ") || "basic equipment"}.
        {car.featuresOpt.length > 0 && (
          <>
            {" "}
            <strong>On some versions:</strong> {car.featuresOpt.map((f) => FEATURE_LABEL[f]).join(", ")}.
          </>
        )}
      </p>
      <p className="text-sm text-muted">
        {POWERTRAIN_LABEL[car.powertrain]}, {car.powerHp} hp, {car.gearbox.map((g) => (g === "auto" ? "automatic" : "manual")).join(" or ")}
        {car.awd !== "no" && `, ${car.awd === "standard" ? "four-wheel drive" : "four-wheel drive available"}`}
        {car.towKg > 0 && `, tows up to ${car.towKg.toLocaleString("en-IE")} kg`}.
      </p>
    </div>
  );
}
