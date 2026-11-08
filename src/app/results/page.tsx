"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { BEGINNER_STEPS } from "@/lib/content";
import { CONFIG, formatEur, paysMonthly } from "@/lib/costs";
import { recommend } from "@/lib/engine";
import { clearAnswers, decodeAnswers, encodeAnswers, loadAnswers, saveAnswers } from "@/lib/share";
import type { Answers, Condition, NiChoice } from "@/lib/types";

export default function ResultsPage() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const fromLink = hash.get("a") ? decodeAnswers(hash.get("a")!) : null;
    const a = fromLink ?? loadAnswers();
    if (fromLink) saveAnswers(fromLink);
    setAnswers(a);
    setReady(true);
  }, []);

  const results = useMemo(() => (answers ? recommend(answers) : null), [answers]);

  const update = (patch: Partial<Answers>) => {
    if (!answers) return;
    const next = { ...answers, ...patch };
    setAnswers(next);
    saveAnswers(next);
    history.replaceState(null, "", `#a=${encodeAnswers(next)}`);
  };

  if (!ready) return <p className="text-slate-500">Working out your matches…</p>;

  if (!answers || !results) {
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold">No results yet</h1>
        <p className="text-slate-600">Take the quiz and we'll find cars that fit your life.</p>
        <Link href="/quiz/" className="btn-primary">
          Start the quiz
        </Link>
      </div>
    );
  }

  const share = async () => {
    const url = `${window.location.origin}/results/#a=${encodeAnswers(answers)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const monthly = paysMonthly(answers);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Your car matches</h1>
          <p className="text-slate-600">
            {results.budget !== undefined
              ? `Cars up to about ${formatEur(results.budget)}${monthly ? ` (about ${formatEur(answers.budget ?? 0)} a month)` : ""}.`
              : "We don't know your budget, so we've shown typical 3-year-old prices."}{" "}
            {results.ranked.length} of {results.considered} cars fit your answers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={share}>
            {copied ? "✓ Link copied" : "🔗 Share these results"}
          </button>
          <Link href="/quiz/" className="btn-secondary">
            ✏️ Change answers
          </Link>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              clearAnswers();
              window.location.href = "/quiz/?fresh=1";
            }}
          >
            Start over
          </button>
        </div>
      </div>

      {!CONFIG.verified && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Early version:</strong> prices, tax rates and ratings are estimates still being checked against
          official sources. Use them as a guide, and always confirm before you buy.
        </p>
      )}

      <Tweaks answers={answers} update={update} />

      {results.picks.length === 0 ? (
        <div className="card space-y-2 p-6">
          <h2 className="text-xl font-bold">No cars match all your answers</h2>
          <p className="text-slate-600">Try raising your budget, choosing "Either" for new or used, or removing a must-have.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.picks.map((p) => (
            <ResultCard key={`${p.role}-${p.car.id}`} pick={p} role={p.role} answers={answers} />
          ))}
        </div>
      )}

      {results.stretch.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Just over your budget</h2>
          <p className="text-slate-600">
            These are up to {Math.round(CONFIG.budgetStretch * 100)}% over what you said. Worth a look if you can stretch.
          </p>
          {results.stretch.map((s) => (
            <ResultCard key={s.car.id} pick={s} answers={answers} />
          ))}
        </section>
      )}

      {results.excludedReasons.length > 0 && (
        <details className="card p-5">
          <summary className="cursor-pointer font-semibold">Why some cars aren't shown</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            {results.excludedReasons.map((r) => (
              <li key={r.reason}>
                {r.count} {r.count === 1 ? "car" : "cars"}: {r.reason}
              </li>
            ))}
          </ul>
        </details>
      )}

      <section className="card space-y-4 p-6">
        <h2 className="text-xl font-bold">Next steps for first-time buyers</h2>
        <ol className="grid gap-4 md:grid-cols-2">
          {BEGINNER_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">
                {i + 1}
              </span>
              <span>
                <strong>{s.title}.</strong> {s.detail}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card flex flex-wrap items-center gap-4 p-5">
        <span className="font-semibold">Do these picks make sense for you?</span>
        {feedback ? (
          <span className="text-slate-600">Thanks for letting us know!</span>
        ) : (
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" aria-label="Yes" onClick={() => setFeedback("up")}>
              👍
            </button>
            <button type="button" className="btn-secondary" aria-label="No" onClick={() => setFeedback("down")}>
              👎
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Tweaks({ answers, update }: { answers: Answers; update: (p: Partial<Answers>) => void }) {
  const monthly = paysMonthly(answers);
  const min = monthly ? 100 : 2000;
  const max = monthly ? 1500 : 80000;
  const step = monthly ? 25 : 500;
  const budget = answers.budget ?? (monthly ? 400 : 15000);

  return (
    <details className="card p-5" open>
      <summary className="cursor-pointer font-semibold">🎛️ Tweak your results</summary>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">
            Budget: {formatEur(budget)}
            {monthly ? " / month" : ""}
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={budget}
            onChange={(e) => update({ budget: Number(e.target.value), budgetUnknown: false })}
            className="mt-2 w-full accent-brand-600"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">New or used</span>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={answers.condition ?? "either"}
            onChange={(e) => update({ condition: e.target.value as Condition })}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="either">Either</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Include Northern Ireland cars</span>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={answers.ni ?? "no"}
            onChange={(e) => update({ ni: e.target.value as NiChoice })}
          >
            <option value="yes">Yes</option>
            <option value="big">Only if it saves a lot</option>
            <option value="no">No, Republic only</option>
          </select>
        </label>
      </div>
    </details>
  );
}
