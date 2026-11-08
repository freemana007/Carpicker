import { FileCheck2, Scale, Timer } from "lucide-react";
import { NiCalculator } from "@/components/NiCalculator";
import { NiTimeline, NiWarnings } from "@/components/ni";
import { PrintButton } from "@/components/PrintButton";
import { CheckedTag } from "@/components/ui/bits";
import { LINKS } from "@/lib/content";

export const metadata = { title: "Buying a car in Northern Ireland · CarPicker Ireland" };

const DOCUMENTS = [
  { title: "Proof the car was legally imported into NI", text: "The NI Import Declaration. If there isn't one: the original V5C showing the last keeper lived in NI, plus NI service history and NI MOT history." },
  { title: "The V5C logbook", text: "Registration is refused without it. Send only the 'permanent export' section to the DVLA." },
  { title: "Proof of NOx emissions", text: "A Certificate of Conformity (CoC). Without it: a flat €4,850 (diesel) or €600 (other cars)." },
  { title: "A dated invoice", text: "Price, VIN, and the seller's and your names and addresses." },
  { title: "Proof of the date the car came in", text: "For example, a dated receipt from the day you drove it home." },
  { title: "Your PPS number and proof of address", text: "Official PPSN proof; a utility bill or bank statement (or two online statements, one from a bank)." },
];

function Step({ n, icon: I, title, children }: { n: number; icon: typeof Scale; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 md:p-8" aria-labelledby={`step-${n}`}>
      <div className="mb-5 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-on">
          <I className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand">Step {n} of 3</p>
          <h2 id={`step-${n}`} className="text-2xl">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function NorthernIrelandPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl">Buying a car in Northern Ireland</h1>
        <p className="text-lg text-ink/80">
          Used cars in Northern Ireland are often cheaper because their prices don&apos;t include VRT. If you live in the
          Republic, you register the car here and pay VRT, which can wipe out the saving. Here&apos;s how to know if
          it&apos;s worth it, and exactly what to do.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <CheckedTag>Checked with Revenue, November 2026</CheckedTag>
          <PrintButton label="Print the checklist" />
        </div>
      </div>

      <Step n={1} icon={Scale} title="Is it worth it?">
        <div className="no-print">
          <NiCalculator />
        </div>
      </Step>

      <Step n={2} icon={FileCheck2} title="What you'll need">
        <ul className="grid gap-3 sm:grid-cols-2">
          {DOCUMENTS.map((d, i) => (
            <li key={d.title} className={`rounded-2xl p-4 ${i === 0 ? "bg-bad-soft/60" : "bg-surface-2/60"}`}>
              <p className="font-semibold">{d.title}</p>
              <p className="mt-1 text-sm text-ink/80">{d.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <NiWarnings />
        </div>
      </Step>

      <Step n={3} icon={Timer} title="What to do, and when">
        <NiTimeline carId="guide" />
      </Step>

      <section className="space-y-2 text-sm text-muted">
        <h2 className="text-base text-ink">Official sources</h2>
        <ul className="space-y-1">
          {[LINKS.revenueNi, LINKS.revenueRegistration, LINKS.revenueNctsVisit, LINKS.vrtCalculator, LINKS.revenueNox, LINKS.revenueVatNew, LINKS.motorTax, LINKS.ncts, LINKS.seai].map((l) => (
            <li key={l.url}>
              <a className="link" href={l.url} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p>Rules and rates change, usually after the Budget each October. Always confirm with Revenue before you buy.</p>
      </section>
    </div>
  );
}
