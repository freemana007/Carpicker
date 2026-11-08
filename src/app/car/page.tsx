"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CostBar, ExpertsPanel, InsidePanel, SafetyPanel } from "@/components/car";
import { NiAnswer, NiTimeline } from "@/components/ni";
import { CompareToggle } from "@/components/results/cards";
import { CarPhoto } from "@/components/ui/CarPhoto";
import { WhereToBuy } from "@/components/car";
import { MatchBar, PlateBadge } from "@/components/ui/bits";
import { CAR_BY_ID } from "@/data/cars";
import { formatEur, modelYear } from "@/lib/costs";
import { recommend, scoreOne, tagline } from "@/lib/engine";
import { answersFromLocation, encodeAnswers, loadCompare, resultsUrl, saveCompare } from "@/lib/share";
import type { Answers } from "@/lib/types";

export default function CarPage() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [carId, setCarId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCarId(new URLSearchParams(window.location.search).get("id"));
    setAnswers(answersFromLocation() ?? {});
    setCompareIds(loadCompare());
  }, []);

  const data = useMemo(() => {
    if (!carId || !answers || !CAR_BY_ID[carId]) return null;
    // Prefer the same option the shortlist showed (e.g. the Northern Ireland deal).
    const fromShortlist = recommend(answers).picks.find((p) => p.car.id === carId);
    if (fromShortlist) return { scored: fromShortlist, excluded: null as string | null };
    return scoreOne(carId, answers);
  }, [carId, answers]);

  if (!answers || carId === null) return <p className="text-muted">Loading…</p>;
  if (!data) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl">We couldn&apos;t find that car</h1>
        <Link href="/results/" className="btn-primary mt-4">
          Back to my shortlist
        </Link>
      </div>
    );
  }

  const s = data.scored;
  const name = `${s.car.make} ${s.car.model}`;
  const fromNi = s.option.source === "ni";
  const ni = s.option.ni ?? s.niCompare;
  const showSteps = fromNi || s.niCompare?.verdict === "worth";
  const sections = [
    { id: "costs", label: "Costs" },
    ...(ni ? [{ id: "ni", label: "Northern Ireland" }] : []),
    ...(showSteps ? [{ id: "steps", label: "Steps" }] : []),
    { id: "reviews", label: "Reviews" },
    { id: "safety", label: "Safety" },
    { id: "inside", label: "Inside" },
    { id: "buy", label: "Where to buy" },
  ];
  const inCompare = compareIds.includes(s.car.id);

  const share = async () => {
    const url = `${window.location.origin}/car/?id=${s.car.id}#a=${encodeAnswers(answers)}`;
    try {
      if (navigator.share) await navigator.share({ title: `${name} on CarPicker`, url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="space-y-8">
      <Link href={resultsUrl(answers)} className="btn-ghost -ml-4">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back to my shortlist
      </Link>

      {/* 1. Summary */}
      <section className="card overflow-hidden shadow-2">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="flex items-center justify-center bg-gradient-to-br from-brand-soft via-surface-2 to-surface p-8">
            <motion.div
              initial={{ rotateY: -12, x: -20, opacity: 0 }}
              animate={{ rotateY: 0, x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 800 }}
              className="w-full max-w-md"
            >
              <CarPhoto car={s.car} credit priority className="aspect-[4/3] w-full" />
            </motion.div>
          </div>
          <div className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <PlateBadge year={modelYear(s.option.age)} isNew={s.option.age === 0} />
              {fromNi && <span className="chip text-xs">Bought in Northern Ireland</span>}
            </div>
            <h1 className="text-3xl md:text-4xl">
              {name} <span className="font-normal text-muted">{s.car.variant}</span>
            </h1>
            <p className="text-lg text-ink/80">{tagline(s)}</p>
            {data.excluded && (
              <p className="flex gap-2 rounded-xl bg-bad-soft px-4 py-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden="true" />
                Not in your shortlist: {data.excluded}.
              </p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <span>
                <span className="text-2xl font-bold tabular-nums">≈ {formatEur(s.option.price)}</span>{" "}
                <span className="text-sm text-muted">{fromNi ? "total on the road" : "typical price"}</span>
              </span>
              <span>
                <span className="text-lg font-semibold tabular-nums">≈ {formatEur(s.monthlyTotal)}</span>{" "}
                <span className="text-sm text-muted">a month, all-in</span>
              </span>
            </div>
            <MatchBar value={s.score} />
            <ul className="space-y-2">
              {s.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-good" aria-hidden="true" /> {r}
                </li>
              ))}
            </ul>
            <p className="flex gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                <strong>Worth knowing:</strong> {s.headsUp}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              <CompareToggle
                on={inCompare}
                disabled={compareIds.length >= 3}
                name={name}
                onToggle={() => {
                  const next = inCompare ? compareIds.filter((x) => x !== s.car.id) : [...compareIds, s.car.id].slice(0, 3);
                  setCompareIds(next);
                  saveCompare(next);
                }}
              />
              <button type="button" onClick={share} className="btn-secondary">
                <Link2 className="h-5 w-5" aria-hidden="true" /> {copied ? "Link copied" : "Share this car"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky section menu */}
      <nav aria-label="On this page" className="sticky top-[57px] z-20 -mx-4 overflow-x-auto bg-bg/90 px-4 py-2 backdrop-blur md:top-[65px]">
        <ul className="flex gap-2">
          {sections.map((sec) => (
            <li key={sec.id}>
              <a href={`#${sec.id}`} className="chip min-h-11 whitespace-nowrap px-4 hover:bg-line">
                {sec.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="costs" title="What it costs to run">
        <CostBar s={s} />
      </Section>
      {ni && (
        <Section id="ni" title="Buying it in Northern Ireland">
          <NiAnswer ni={ni} threshold={s.niCompare?.threshold ?? 1000} carName={name} />
        </Section>
      )}
      {showSteps && (
        <Section id="steps" title="Steps to buy in Northern Ireland">
          <NiTimeline carId={s.car.id} />
        </Section>
      )}
      <Section id="reviews" title="What the experts say">
        <ExpertsPanel s={s} />
      </Section>
      <Section id="safety" title="Safety">
        <SafetyPanel s={s} fromNi={fromNi} />
      </Section>
      <Section id="inside" title="Inside the car">
        <InsidePanel s={s} />
      </Section>
      <Section id="buy" title="See one or find one for sale">
        <WhereToBuy s={s} includeNi={answers.ni === "yes" || answers.ni === "big" || fromNi} />
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-36 p-6 md:p-8" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="mb-5 text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
