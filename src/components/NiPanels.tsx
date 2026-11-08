"use client";

import { useEffect, useState } from "react";
import { Term } from "@/components/Term";
import { LINKS, NI_STEPS, NI_WARNINGS } from "@/lib/content";
import { CONFIG, formatEur, modelYear, niVerdict, type NiLandedCost } from "@/lib/costs";
import { loadChecklist, saveChecklist } from "@/lib/share";

const VERDICT = {
  worth: { label: "✅ Worth a look", cls: "bg-emerald-100 text-emerald-900" },
  small: { label: "🟡 Small saving: probably not worth the trip and paperwork", cls: "bg-amber-100 text-amber-900" },
  more: { label: "❌ Costs more than buying in the Republic", cls: "bg-red-100 text-red-900" },
};

export function NiBreakdown({ ni, threshold, carName }: { ni: NiLandedCost; threshold: number; carName: string }) {
  const verdict = niVerdict(ni.saving, threshold);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Total cost to get this {modelYear(ni.age)} {carName} on the road in the Republic if you buy it in Northern
        Ireland, compared with buying a similar car here.
      </p>
      <table className="w-full text-sm">
        <tbody>
          {ni.lines.map((l) => (
            <tr key={l.label} className="border-b border-slate-100 align-top">
              <td className="py-1.5 pr-3">
                {l.label.startsWith("VRT") ? (
                  <>
                    <Term term="VRT" /> (estimate)
                  </>
                ) : l.label === "NCT" ? (
                  <Term term="NCT" />
                ) : (
                  l.label
                )}
                {l.note && <span className="block text-xs text-slate-500">{l.note}</span>}
              </td>
              <td className="py-1.5 text-right tabular-nums">{formatEur(l.eur)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="pt-2">Total on the road in the Republic</td>
            <td className="pt-2 text-right tabular-nums">{formatEur(ni.total)}</td>
          </tr>
          <tr>
            <td className="py-1">Similar car bought in the Republic</td>
            <td className="py-1 text-right tabular-nums">{formatEur(ni.iePrice)}</td>
          </tr>
          <tr className="font-bold">
            <td className="py-1">{ni.saving >= 0 ? "You could save about" : "It would cost you about"}</td>
            <td className={`py-1 text-right tabular-nums ${ni.saving >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {formatEur(Math.abs(ni.saving))} {ni.saving >= 0 ? "less" : "more"}
            </td>
          </tr>
        </tbody>
      </table>
      <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${VERDICT[verdict].cls}`}>{VERDICT[verdict].label}</p>
      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer">How we worked out the VRT</summary>
        <p className="mt-1">
          VRT ≈ the car's Irish market value (<Term term="OMSP" />, about {formatEur(ni.vrt.omsp)}) ×{" "}
          {(ni.vrt.rate * 100).toFixed(2).replace(/\.?0+$/, "")}% for its <Term term="CO₂ band" /> ={" "}
          {formatEur(ni.vrt.co2Part)}
          {ni.vrt.evRelief > 0 && <>, minus {formatEur(ni.vrt.evRelief)} electric car relief</>}, plus a{" "}
          <Term term="NOx levy" /> of {formatEur(ni.vrt.noxPart)}. Rates from Revenue, checked{" "}
          {CONFIG.sources.vrt.checked}. Revenue decides the real value. Check it on their{" "}
          <a className="underline" href={LINKS.vrtCalculator.url} target="_blank" rel="noreferrer">
            VRT calculator
          </a>{" "}
          before you buy.
        </p>
      </details>
      {ni.vrt.noxIfNoEvidence > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <strong>Bring proof of NOx emissions.</strong> UK logbooks (V5C) issued after April 2019 don't show NOx. Without
          a <Term term="Certificate of Conformity" /> or other proof, Revenue charges a flat{" "}
          {formatEur(ni.vrt.noxIfNoEvidence)} instead of the {formatEur(ni.vrt.noxPart)} NOx levy.
        </p>
      )}
      {ni.isNew && (
        <p className="text-xs text-slate-500">
          New car (under 6 months or under 6,000 km): the NI dealer should not charge UK VAT, and you pay 23% Irish VAT
          when you register it. SEAI grants don't apply.
        </p>
      )}
    </div>
  );
}

export function NiChecklist({ carId }: { carId: string }) {
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
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {done.length} of {NI_STEPS.length} steps done. Your ticks are saved on this device only.
      </p>
      {stages.map((stage) => (
        <div key={stage}>
          <h4 className="font-semibold text-slate-800">{stage}</h4>
          <ul className="mt-2 space-y-2">
            {NI_STEPS.filter((s) => s.stage === stage).map((s) => {
              n += 1;
              const checked = done.includes(s.id);
              return (
                <li key={s.id}>
                  <label className="flex cursor-pointer gap-3 rounded-lg p-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-brand-600"
                      checked={checked}
                      onChange={() => toggle(s.id)}
                    />
                    <span className={checked ? "text-slate-400 line-through" : ""}>
                      <strong>
                        {n}. {s.title}.
                      </strong>{" "}
                      {s.detail}
                      {s.link && (
                        <>
                          {" "}
                          <a className="text-brand-700 underline" href={s.link.url} target="_blank" rel="noreferrer">
                            {s.link.label}
                          </a>
                        </>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        <strong>Also worth knowing:</strong>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {NI_WARNINGS.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const NI_SAVING_THRESHOLD = CONFIG.northernIreland.savingThresholdEur;
