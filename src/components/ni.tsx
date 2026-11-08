"use client";

import { AlertTriangle, CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Term } from "@/components/Term";
import { CheckedTag } from "@/components/ui/bits";
import { LINKS, NI_STEPS, NI_WARNINGS } from "@/lib/content";
import { CONFIG, formatEur, modelYear, niVerdict, type NiLandedCost } from "@/lib/costs";
import { loadChecklist, saveChecklist } from "@/lib/share";

const VERDICT = {
  worth: { icon: CheckCircle2, cls: "bg-good-soft text-good", text: "Worth a look" },
  small: { icon: MinusCircle, cls: "bg-accent-soft text-accent", text: "Small saving: probably not worth the trip and paperwork" },
  more: { icon: XCircle, cls: "bg-bad-soft text-bad", text: "Costs more than buying in the Republic" },
};

/** Answer first ("You save €X"), then a waterfall showing how the total builds up. */
export function NiAnswer({ ni, threshold, carName }: { ni: NiLandedCost; threshold: number; carName: string }) {
  const verdict = niVerdict(ni.saving, threshold);
  const V = VERDICT[verdict];
  const max = Math.max(ni.total, ni.iePrice);
  const pct = (n: number) => `${(n / max) * 100}%`;
  let running = 0;
  const steps = ni.lines.filter((l) => l.eur > 0);

  return (
    <div className="space-y-5">
      <div>
        <p className={`text-3xl font-bold tracking-tight ${ni.saving >= 0 ? "text-good" : "text-bad"}`}>
          {ni.saving >= 0 ? `You save about ${formatEur(ni.saving)}` : `It costs about ${formatEur(-ni.saving)} more`}
        </p>
        <p className="mt-1 text-muted">
          Buying this {modelYear(ni.age)} {carName} in Northern Ireland and registering it here, compared with buying a
          similar car in the Republic.
        </p>
        <p className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${V.cls}`}>
          <V.icon className="h-4 w-4" aria-hidden="true" /> {V.text}
        </p>
      </div>

      <figure>
        <figcaption className="sr-only">
          Cost build-up: {steps.map((l) => `${l.label} ${formatEur(l.eur)}`).join(", ")}. Total {formatEur(ni.total)}. Similar
          car in the Republic {formatEur(ni.iePrice)}.
        </figcaption>
        <ul className="space-y-1.5" aria-hidden="true">
          {steps.map((l) => {
            const start = running;
            running += l.eur;
            return (
              <li key={l.label} className="grid grid-cols-[8.5rem_1fr_5rem] items-center gap-2 text-sm sm:grid-cols-[11rem_1fr_5.5rem]">
                <span className="truncate text-muted">{l.label.replace(/ \(.*\)$/, "")}</span>
                <span className="relative h-5 rounded bg-surface-2/60">
                  <span
                    className={`absolute inset-y-0 rounded ${l.label.startsWith("VRT") ? "bg-accent" : "bg-brand/70"}`}
                    style={{ left: pct(start), width: `max(${pct(l.eur)}, 2px)` }}
                  />
                </span>
                <span className="text-right tabular-nums">+{formatEur(l.eur)}</span>
              </li>
            );
          })}
          <li className="grid grid-cols-[8.5rem_1fr_5rem] items-center gap-2 pt-1 text-sm font-semibold sm:grid-cols-[11rem_1fr_5.5rem]">
            <span>Total on the road</span>
            <span className="relative h-6 rounded bg-surface-2/60">
              <span className="absolute inset-y-0 left-0 rounded bg-ink/80" style={{ width: pct(ni.total) }} />
            </span>
            <span className="text-right tabular-nums">{formatEur(ni.total)}</span>
          </li>
          <li className="grid grid-cols-[8.5rem_1fr_5rem] items-center gap-2 text-sm font-semibold sm:grid-cols-[11rem_1fr_5.5rem]">
            <span>Republic price</span>
            <span className="relative h-6 rounded bg-surface-2/60">
              <span className="absolute inset-y-0 left-0 rounded bg-info" style={{ width: pct(ni.iePrice) }} />
            </span>
            <span className="text-right tabular-nums">{formatEur(ni.iePrice)}</span>
          </li>
        </ul>
      </figure>

      {ni.vrt.noxIfNoEvidence > 0 && (
        <p className="flex gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <strong>Bring proof of NOx emissions.</strong> UK logbooks issued after April 2019 don&apos;t show NOx. Without a{" "}
            <Term term="Certificate of Conformity" />, Revenue charges a flat {formatEur(ni.vrt.noxIfNoEvidence)} instead of the{" "}
            {formatEur(ni.vrt.noxPart)} NOx levy.
          </span>
        </p>
      )}

      <details className="rounded-xl bg-surface-2/50 p-4">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium">See the detail and how we worked it out</summary>
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">Cost breakdown</caption>
          <tbody>
            {ni.lines.map((l) => (
              <tr key={l.label} className="border-b border-line/60 align-top">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  {l.label}
                  {l.note && <span className="block text-xs text-muted">{l.note}</span>}
                </th>
                <td className="py-2 text-right tabular-nums">{formatEur(l.eur)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="pt-2 text-left">Total on the road in the Republic</th>
              <td className="pt-2 text-right tabular-nums">{formatEur(ni.total)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm text-muted">
          <Term term="VRT" /> ≈ the car&apos;s Irish market value (<Term term="OMSP" />, about {formatEur(ni.vrt.omsp)}) ×{" "}
          {(ni.vrt.rate * 100).toFixed(2).replace(/\.?0+$/, "")}% for its <Term term="CO₂ band" /> = {formatEur(ni.vrt.co2Part)}
          {ni.vrt.evRelief > 0 && <>, minus {formatEur(ni.vrt.evRelief)} electric car relief</>}, plus a <Term term="NOx levy" /> of{" "}
          {formatEur(ni.vrt.noxPart)}. Revenue decides the real value: check it on{" "}
          <a className="link" href={LINKS.vrtCalculator.url} target="_blank" rel="noreferrer">
            Revenue&apos;s VRT calculator
          </a>
          .
        </p>
        <p className="mt-2">
          <CheckedTag>Rates checked with Revenue, {CONFIG.sources.vrt.checked}</CheckedTag>
        </p>
        {ni.isNew && (
          <p className="mt-2 text-sm text-muted">
            New car (6 months old or less, or 6,000 km or less): you pay 23% Irish VAT when you register it, and SEAI grants
            don&apos;t apply.
          </p>
        )}
      </details>
    </div>
  );
}

const DEADLINES: Record<string, string> = { book: "Within 7 days", vrt: "Within 30 days" };

/** Before / when / after you buy, as a timeline with deadline badges and saved ticks. */
export function NiTimeline({ carId }: { carId: string }) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => setDone(loadChecklist(carId)), [carId]);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    saveChecklist(carId, next);
  };
  const stages = Array.from(new Set(NI_STEPS.map((s) => s.stage)));
  let n = 0;
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted" aria-live="polite">
        {done.length === NI_STEPS.length
          ? "All done. Enjoy your new car!"
          : `${done.length} of ${NI_STEPS.length} steps done. Your ticks are saved on this device only.`}
      </p>
      {stages.map((stage) => (
        <div key={stage}>
          <h3 className="mb-3 text-lg">{stage}</h3>
          <ol className="relative space-y-1 border-l-2 border-line pl-6">
            {NI_STEPS.filter((s) => s.stage === stage).map((s) => {
              n += 1;
              const checked = done.includes(s.id);
              return (
                <li key={s.id} className="relative">
                  <span
                    className={`absolute -left-[33px] top-3 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-surface ${
                      checked ? "bg-good" : "bg-line"
                    }`}
                    aria-hidden="true"
                  />
                  <label className="flex cursor-pointer gap-3 rounded-xl p-2 hover:bg-surface-2/60">
                    <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--brand))]" checked={checked} onChange={() => toggle(s.id)} />
                    <span className={checked ? "text-muted line-through" : ""}>
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        {n}. {s.title}
                        {DEADLINES[s.id] && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent no-underline">
                            <Clock className="h-3 w-3" aria-hidden="true" /> {DEADLINES[s.id]}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink/80">{s.detail}</span>
                    </span>
                  </label>
                  {s.link && (
                    <a className="link ml-10 inline-flex min-h-10 items-center text-sm" href={s.link.url} target="_blank" rel="noreferrer">
                      {s.link.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

export function NiWarnings() {
  return (
    <ul className="space-y-2">
      {NI_WARNINGS.map((w, i) => (
        <li key={w} className="flex gap-2 text-sm">
          <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 ? "text-bad" : "text-accent"}`} aria-hidden="true" />
          <span className={i === 0 ? "font-semibold" : ""}>{w}</span>
        </li>
      ))}
    </ul>
  );
}
