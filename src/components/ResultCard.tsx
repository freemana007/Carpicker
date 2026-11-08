"use client";

import { BodyIcon } from "@/components/BodyIcon";
import { NiBreakdown, NiChecklist } from "@/components/NiPanels";
import { Term } from "@/components/Term";
import { LINKS, REVIEW_SOURCES, euroNcapSearchUrl, reviewSearchUrl } from "@/lib/content";
import { formatEur, modelYear } from "@/lib/costs";
import type { Pick, Role, Scored } from "@/lib/engine";
import type { Answers, Feature, SafetyFeature } from "@/lib/types";

const ROLE: Record<Role, { label: string; cls: string }> = {
  best: { label: "🏆 Best overall match", cls: "bg-brand-600 text-white" },
  value: { label: "💰 Best value", cls: "bg-sky-600 text-white" },
  dream: { label: "✨ Closest to your dream", cls: "bg-fuchsia-600 text-white" },
  wildcard: { label: "🔁 Have you considered…?", cls: "bg-amber-500 text-white" },
  ni: { label: "🚗 Northern Ireland deal", cls: "bg-indigo-600 text-white" },
};

const ROLE_COLOR: Record<Role, string> = {
  best: "#059669",
  value: "#0284c7",
  dream: "#c026d3",
  wildcard: "#f59e0b",
  ni: "#4f46e5",
};

const FEATURE_LABEL: Record<Feature, string> = {
  carplay: "Apple CarPlay / Android Auto",
  touchscreen: "Touchscreen",
  heatedSeats: "Heated seats",
  sunroof: "Sunroof",
  stereo: "Premium stereo",
};
const SAFETY_LABEL: Record<SafetyFeature, string> = {
  aeb: "Automatic emergency braking",
  blindSpot: "Blind-spot warning",
  acc: "Adaptive cruise control",
  camera: "Reversing camera",
};

const POWERTRAIN_LABEL = { petrol: "Petrol", diesel: "Diesel", hybrid: "Hybrid", phev: "Plug-in hybrid", ev: "Electric" };

function ageText(age: number) {
  if (age === 0) return "New";
  if (age === 1) return "About 1 year old";
  return `About ${age} years old`;
}

export function ResultCard({ pick, answers, role }: { pick: Scored | Pick; answers: Answers; role?: Role }) {
  const { car, option } = pick;
  const name = `${car.make} ${car.model}`;
  const fromNi = option.source === "ni";
  const color = role ? ROLE_COLOR[role] : "#64748b";

  return (
    <article className="card overflow-hidden">
      {role && <div className={`px-5 py-2 text-sm font-bold ${ROLE[role].cls}`}>{ROLE[role].label}</div>}
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <BodyIcon body={car.body} className="h-14 w-28 shrink-0" color={color} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-tight">
              {name} <span className="font-normal text-slate-500">{car.variant}</span>
            </h2>
            <p className="text-sm text-slate-600">
              {option.age === 0 ? "New" : modelYear(option.age)} · {ageText(option.age)} ·{" "}
              {POWERTRAIN_LABEL[car.powertrain]} · {car.seats} seats
            </p>
            <p className="mt-1 text-sm font-medium">
              {fromNi ? "📍 Bought in Northern Ireland" : "📍 Bought in the Republic"}
            </p>
          </div>
          <div className="shrink-0 text-center" aria-label={`${pick.score}% match`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-brand-500 text-lg font-bold">
              {pick.score}%
            </div>
            <span className="text-xs text-slate-500">match</span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label={fromNi ? "Total on the road" : "Typical price"} value={`≈ ${formatEur(option.price)}`} />
          <Stat
            label="Monthly, all-in"
            value={`≈ ${formatEur(pick.monthlyTotal)}`}
            hint={pick.monthlyRepayment ? "Repayments + fuel + tax + servicing" : "Fuel + tax + servicing"}
          />
          <Stat label={<Term term="Motor tax" />} value={`${formatEur(pick.annualTax)} / yr`} />
          <Stat label={<Term term="Insurance group">Insurance</Term>} value={pick.insuranceLevel} hint="Get a quote" />
        </dl>

        <div>
          <h3 className="font-semibold">Why this car</h3>
          <ul className="mt-1 space-y-1">
            {pick.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-brand-600">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
            <span>⚠️</span>
            <span>
              <strong>Heads-up:</strong> {pick.headsUp}
            </span>
          </p>
        </div>

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {pick.niCompare && (
            <Section title={fromNi ? "🚗 Total cost from Northern Ireland" : "🚗 Northern Ireland option"} open={fromNi}>
              <NiBreakdown ni={pick.niCompare} threshold={pick.niCompare.threshold} carName={name} />
            </Section>
          )}
          {(fromNi || pick.niCompare?.verdict === "worth") && (
            <Section title="📋 Steps to buy in Northern Ireland">
              <NiChecklist carId={car.id} />
            </Section>
          )}
          <Section title="🗞️ What the experts say">
            <ExpertPanel pick={pick} />
          </Section>
          <Section title="💶 Running costs">
            <RunningCosts pick={pick} answers={answers} />
          </Section>
          <Section title="🛡️ Safety & recalls">
            <p>
              <Term term="Euro NCAP" />: <strong>{"★".repeat(car.ncapStars) || "0 stars"}</strong>
              {car.ncapStars > 0 && ` (${car.ncapStars} of 5)`}, tested {car.ncapYear}.{" "}
              <a className="text-brand-700 underline" href={euroNcapSearchUrl(`${car.reviewQuery}`)} target="_blank" rel="noreferrer">
                See the test
              </a>
            </p>
            <p className="mt-2">
              Standard: {car.safetyStd.map((f) => SAFETY_LABEL[f]).join(", ") || "basic safety equipment only"}.
              {car.safetyOpt.length > 0 && <> On some versions: {car.safetyOpt.map((f) => SAFETY_LABEL[f]).join(", ")}.</>}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Check for open recalls on the exact car before you buy:{" "}
              <a className="underline" href={LINKS.nsai.url} target="_blank" rel="noreferrer">
                {LINKS.nsai.label}
              </a>
              {fromNi && (
                <>
                  {" "}
                  and{" "}
                  <a className="underline" href={LINKS.ukRecall.url} target="_blank" rel="noreferrer">
                    {LINKS.ukRecall.label}
                  </a>
                </>
              )}
              .
            </p>
          </Section>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, hint }: { label: React.ReactNode; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-bold">{value}</dd>
      {hint && <dd className="text-xs text-slate-500">{hint}</dd>}
    </div>
  );
}

function Section({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group px-4 py-3" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
        {title}
        <span className="text-slate-400 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function ExpertPanel({ pick }: { pick: Scored }) {
  const { car } = pick;
  return (
    <div className="space-y-3">
      <p>
        <strong>CarPicker review score: {car.expertScore.toFixed(1)} / 5</strong>{" "}
        <span className="text-sm text-slate-500">(our summary of trusted reviews)</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-emerald-800">What reviewers like</h4>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {car.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-red-800">What reviewers don't</h4>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {car.cons.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Read the full reviews</h4>
        <ul className="mt-1 flex flex-wrap gap-2">
          {REVIEW_SOURCES.map((s) => (
            <li key={s.name}>
              <a
                className="chip hover:bg-slate-200"
                href={reviewSearchUrl(s, car.reviewQuery)}
                target="_blank"
                rel="noreferrer"
                title={s.type}
              >
                {s.name} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-slate-500">
        Summaries are written by the CarPicker team in our own words. We link to the original reviews and never copy
        them.
      </p>
    </div>
  );
}

function RunningCosts({ pick, answers }: { pick: Scored; answers: Answers }) {
  const { car } = pick;
  const energyLabel = car.powertrain === "ev" ? "Charging" : car.powertrain === "phev" ? "Fuel + charging" : "Fuel";
  const use =
    car.powertrain === "ev"
      ? `${car.kwh100} kWh/100 km, range about ${car.rangeKm} km`
      : car.powertrain === "phev"
        ? `${car.fuelL100} L/100 km with an empty battery; about ${car.rangeKm} km on electricity`
        : `${car.fuelL100} L/100 km`;
  const features = [
    ...car.featuresStd.map((f) => FEATURE_LABEL[f]),
    ...car.featuresOpt.map((f) => `${FEATURE_LABEL[f]} (some versions)`),
  ];
  return (
    <div className="space-y-2 text-sm">
      <table className="w-full">
        <tbody>
          {pick.monthlyRepayment !== undefined && (
            <Row label={`Loan repayments (${answers.payMethod === "finance" ? "estimate; PCP differs" : "estimate"})`} value={`${formatEur(pick.monthlyRepayment * 12)} / yr`} />
          )}
          <Row label={energyLabel} value={`${formatEur(pick.annualEnergy)} / yr`} />
          <Row label="Motor tax" value={`${formatEur(pick.annualTax)} / yr`} />
          <Row label="Servicing, repairs and NCT (estimate)" value={`${formatEur(pick.annualServicing)} / yr`} />
          <Row label="Insurance" value={`${pick.insuranceLevel}: get a quote`} />
        </tbody>
      </table>
      <p className="text-slate-600">Uses about {use}. CO₂ {car.co2} g/km.</p>
      <p className="text-slate-600">Inside: {features.join(", ")}.</p>
      <p className="text-xs text-slate-500">
        5-year cost estimate (price minus resale value, plus running costs, excluding insurance): about{" "}
        {formatEur(pick.fiveYearCost)}.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5 pr-3">{label}</td>
      <td className="py-1.5 text-right tabular-nums">{value}</td>
    </tr>
  );
}
