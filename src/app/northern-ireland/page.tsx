import { NiCalculator } from "@/components/NiCalculator";
import { LINKS, NI_STEPS, NI_WARNINGS } from "@/lib/content";

export const metadata = { title: "Buying a car in Northern Ireland · CarPicker Ireland" };

export default function NorthernIrelandPage() {
  const stages = Array.from(new Set(NI_STEPS.map((s) => s.stage)));
  let n = 0;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold">Buying a car in Northern Ireland</h1>
        <p className="text-lg text-slate-700">
          Used cars in Northern Ireland are often cheaper, because their prices don't include{" "}
          <strong>VRT (Vehicle Registration Tax)</strong>. If you live in the Republic, you must register the car here
          and pay VRT, and that can wipe out the saving. Here's how to work out the real cost and what to do.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Work out the total cost</h2>
        <NiCalculator />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">The steps, in order</h2>
        {stages.map((stage) => (
          <div key={stage} className="card p-5">
            <h3 className="font-semibold text-brand-800">{stage}</h3>
            <ol className="mt-3 space-y-3">
              {NI_STEPS.filter((s) => s.stage === stage).map((s) => {
                n += 1;
                return (
                  <li key={s.id} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">
                      {n}
                    </span>
                    <span>
                      <strong>{s.title}.</strong> {s.detail}
                      {s.link && (
                        <>
                          {" "}
                          <a className="text-brand-700 underline" href={s.link.url} target="_blank" rel="noreferrer">
                            {s.link.label}
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-amber-50 p-5 text-amber-900">
        <h2 className="text-lg font-bold">Watch out for</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {NI_WARNINGS.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">Official sources</h2>
        <ul className="list-disc space-y-1 pl-5">
          {[LINKS.revenue, LINKS.ncts, LINKS.motorTax, LINKS.dvla, LINKS.seai].map((l) => (
            <li key={l.url}>
              <a className="underline" href={l.url} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Rules and rates change, usually after the Budget each October. This guide is an early version still being
          checked. Always confirm with Revenue before you buy.
        </p>
      </section>
    </div>
  );
}
