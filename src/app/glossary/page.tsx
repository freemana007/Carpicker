import { GLOSSARY } from "@/lib/content";

export const metadata = { title: "Car words explained · CarPicker Ireland" };

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const letters = Array.from(new Set(sorted.map((g) => g.term[0].toUpperCase())));
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl">Car words explained</h1>
        <p className="mt-3 text-lg text-ink/80">Plain-English meanings for the jargon you&apos;ll meet buying a car in Ireland.</p>
      </div>
      <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
        {letters.map((l) => (
          <a key={l} href={`#letter-${l}`} className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface font-semibold shadow-1 hover:bg-brand-soft">
            {l}
          </a>
        ))}
      </nav>
      {letters.map((l) => (
        <section key={l} id={`letter-${l}`} className="scroll-mt-28" aria-labelledby={`h-${l}`}>
          <h2 id={`h-${l}`} className="mb-3 text-2xl text-brand">
            {l}
          </h2>
          <dl className="card divide-y divide-line/60">
            {sorted
              .filter((g) => g.term[0].toUpperCase() === l)
              .map((g) => (
                <div key={g.term} className="p-5">
                  <dt className="font-semibold">{g.term}</dt>
                  <dd className="mt-1 text-ink/80">{g.meaning}</dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
