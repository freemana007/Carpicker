import { GLOSSARY } from "@/lib/content";

export const metadata = { title: "Car words explained · CarPicker Ireland" };

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Car words explained</h1>
        <p className="mt-2 text-slate-600">Plain-English meanings for the jargon you'll meet when buying a car in Ireland.</p>
      </div>
      <dl className="card divide-y divide-slate-100">
        {sorted.map((g) => (
          <div key={g.term} id={g.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="p-4">
            <dt className="font-bold">{g.term}</dt>
            <dd className="mt-1 text-slate-700">{g.meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
