"use client";

import { AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import { Link2, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CompactCard, HeroCard } from "@/components/results/cards";
import { AboutYouPanel, CompareTray, FiltersPanel, FinishLine, ShortlistReveal, WhyNotSearch } from "@/components/results/panels";
import { CONFIG, formatEur, paysMonthly } from "@/lib/costs";
import { TOTAL_MODELS, recommend } from "@/lib/engine";
import {
  REVEAL_KEY,
  answersFromLocation,
  clearAnswers,
  encodeAnswers,
  loadCompare,
  saveAnswers,
  saveCompare,
} from "@/lib/share";
import type { Answers } from "@/lib/types";

export default function ResultsPage() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [reveal, setReveal] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setAnswers(answersFromLocation());
    setCompareIds(loadCompare());
    try {
      if (sessionStorage.getItem(REVEAL_KEY)) {
        sessionStorage.removeItem(REVEAL_KEY);
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReveal(true);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const results = useMemo(() => (answers ? recommend(answers) : null), [answers]);
  const endReveal = useCallback(() => setReveal(false), []);

  const update = (patch: Partial<Answers>) => {
    if (!answers) return;
    const next = { ...answers, ...patch };
    setAnswers(next);
    saveAnswers(next);
    history.replaceState(null, "", `#a=${encodeAnswers(next)}`);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id];
      saveCompare(next);
      return next;
    });
  };

  const share = async () => {
    if (!answers) return;
    const url = `${window.location.origin}/results/#a=${encodeAnswers(answers)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My CarPicker shortlist", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* user cancelled */
    }
  };

  if (!ready) return <p className="text-muted">Working out your matches…</p>;

  if (!answers || !results) {
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-3xl">No shortlist yet</h1>
        <p className="text-muted">Answer a few everyday questions and we&apos;ll find cars that fit your life.</p>
        <Link href="/quiz/" className="btn-primary">
          Start the quiz
        </Link>
      </div>
    );
  }

  const [hero, ...rest] = results.picks;
  const compareProps = (id: string) => ({
    on: compareIds.includes(id),
    toggle: () => toggleCompare(id),
    full: compareIds.length >= 3,
  });

  return (
    <div className={compareIds.length ? "pb-28" : ""}>
      {reveal && !reduceMotion && (
        <ShortlistReveal total={TOTAL_MODELS} fit={results.ranked.length} top={results.picks.length} onDone={endReveal} />
      )}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl">Your shortlist</h1>
          <p className="mt-2 text-muted">
            {results.budget !== undefined
              ? `Cars up to about ${formatEur(results.budget)}${paysMonthly(answers) ? ` (about ${formatEur(answers.budget ?? 0)} a month)` : ""}. `
              : "We don't know your budget yet, so these are typical 3-year-old prices. "}
            {results.ranked.length} of {TOTAL_MODELS} cars fit your answers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={share}>
            <Link2 className="h-5 w-5" aria-hidden="true" /> {copied ? "Link copied" : "Share"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              clearAnswers();
              saveCompare([]);
              window.location.href = "/quiz/?fresh=1";
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
          </button>
        </div>
      </div>

      {!CONFIG.verified && (
        <p className="mb-6 rounded-2xl bg-info-soft px-4 py-3 text-sm">
          <strong>Early version:</strong> tax rates are checked with Revenue and motortax.ie, but car prices, specs and
          ratings are still estimates. Use them as a guide.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-8">
          {!hero ? (
            <div className="card space-y-3 p-8 text-center">
              <h2 className="text-2xl">No cars fit all your answers… yet</h2>
              <p className="text-muted">Try a bigger budget, choose &quot;Either&quot; for new or used, or change a must-have.</p>
            </div>
          ) : (
            <LayoutGroup>
              <HeroCard s={hero} answers={answers} compare={compareProps(hero.car.id)} />
              {rest.length > 0 && (
                <section aria-labelledby="also">
                  <h2 id="also" className="mb-4 text-2xl">
                    Also worth a look
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AnimatePresence initial={false}>
                      {rest.map((p) => (
                        <CompactCard key={p.car.id} s={p} role={p.role} answers={answers} compare={compareProps(p.car.id)} />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </LayoutGroup>
          )}

          {results.stretch.length > 0 && (
            <section aria-labelledby="stretch">
              <h2 id="stretch" className="text-2xl">
                Just over your budget
              </h2>
              <p className="mb-4 mt-1 text-muted">
                Up to {Math.round(CONFIG.budgetStretch * 100)}% over what you said. Only if you can stretch.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.stretch.map((s) => (
                  <CompactCard key={s.car.id} s={s} answers={answers} compare={compareProps(s.car.id)} />
                ))}
              </div>
            </section>
          )}

          <FinishLine onShare={share} shared={copied} />

          {results.excludedReasons.length > 0 && (
            <details className="card p-5">
              <summary className="flex min-h-11 cursor-pointer items-center font-semibold">
                Why some cars aren&apos;t shown
              </summary>
              <ul className="mt-3 space-y-1 text-sm text-ink/80">
                {results.excludedReasons.map((r) => (
                  <li key={r.reason}>
                    {r.count} {r.count === 1 ? "car" : "cars"}: {r.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <section className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Do these picks make sense for you?</span>
            {feedback ? (
              <span className="text-muted" role="status">
                Thanks for letting us know.
              </span>
            ) : (
              <>
                <button type="button" className="btn-secondary min-h-12 px-4" aria-label="Yes, they make sense" onClick={() => setFeedback("up")}>
                  <ThumbsUp className="h-5 w-5" aria-hidden="true" />
                </button>
                <button type="button" className="btn-secondary min-h-12 px-4" aria-label="No, they don't" onClick={() => setFeedback("down")}>
                  <ThumbsDown className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Your answers and filters">
          <FiltersPanel answers={answers} update={update} />
          <AboutYouPanel answers={answers} />
          <WhyNotSearch answers={answers} />
        </aside>
      </div>

      <CompareTray ids={compareIds} ranked={[...results.ranked, ...results.picks]} answers={answers} remove={toggleCompare} />
    </div>
  );
}
