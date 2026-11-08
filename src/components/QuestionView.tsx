"use client";

import { useState } from "react";
import { BodyIcon } from "@/components/BodyIcon";
import { COUNTIES } from "@/config/counties";
import { BRANDS } from "@/data/cars";
import { CONFIG, formatEur, monthlyToTotal, paysMonthly, suggestedMonthly } from "@/lib/costs";
import {
  BODY_LABELS,
  DEFAULT_PRIORITIES,
  PRIORITY_LABELS,
  parseValue,
  type Question,
} from "@/lib/questions";
import type { Answers, BodyType, Priority } from "@/lib/types";

interface Props {
  q: Question;
  answers: Answers;
  update: (patch: Partial<Answers>) => void;
  /** Called after a single-choice answer, to move on automatically. */
  onPicked: () => void;
}

export function QuestionView({ q, answers, update, onPicked }: Props) {
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{q.section}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{q.title}</h1>
        {q.hint && <p className="mt-2 text-slate-600">💡 {q.hint}</p>}
        {q.explainer && (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-brand-700 underline"
            aria-expanded={showExplainer}
            onClick={() => setShowExplainer((s) => !s)}
          >
            {showExplainer ? "Hide explanation" : `What do these mean?`}
          </button>
        )}
        {q.explainer && showExplainer && (
          <div className="mt-3 rounded-xl bg-sky-50 p-4 text-slate-700">
            <h2 className="font-semibold">{q.explainer.title}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {q.explainer.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Input q={q} answers={answers} update={update} onPicked={onPicked} />
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
        selected ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ q, answers, update, onPicked }: Props) {
  switch (q.kind) {
    case "single": {
      const current = answers[q.field];
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {q.options!.map((o) => (
            <OptionButton
              key={o.value}
              selected={String(current) === o.value}
              onClick={() => {
                update({ [q.field]: parseValue(q.field, o.value) } as Partial<Answers>);
                onPicked();
              }}
            >
              {o.emoji && <span className="text-2xl">{o.emoji}</span>}
              <span>
                <span className="font-semibold">{o.label}</span>
                {o.description && <span className="block text-sm text-slate-500">{o.description}</span>}
              </span>
            </OptionButton>
          ))}
        </div>
      );
    }

    case "multi": {
      const current = (answers[q.field] as string[] | undefined) ?? [];
      const toggle = (v: string) => {
        let next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
        // "Keep it simple" / "Just make it safe" / "Shopping only" are exclusive with the others.
        const exclusive = ["simple", "any", "shopping"];
        if (exclusive.includes(v) && next.includes(v)) next = [v];
        else next = next.filter((x) => !exclusive.includes(x) || x === v);
        if (q.maxSelect && next.length > q.maxSelect) return;
        update({ [q.field]: next } as Partial<Answers>);
      };
      return (
        <div className="space-y-2">
          {q.maxSelect && (
            <p className="text-sm text-slate-500">
              {current.length} of {q.maxSelect} picked
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options!.map((o) => (
              <OptionButton key={o.value} selected={current.includes(o.value)} onClick={() => toggle(o.value)}>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${
                    current.includes(o.value) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                  }`}
                  aria-hidden="true"
                >
                  {current.includes(o.value) && "✓"}
                </span>
                {o.emoji && <span className="text-2xl">{o.emoji}</span>}
                <span>
                  <span className="font-semibold">{o.label}</span>
                  {o.description && <span className="block text-sm text-slate-500">{o.description}</span>}
                </span>
              </OptionButton>
            ))}
          </div>
        </div>
      );
    }

    case "budget":
      return <BudgetInput answers={answers} update={update} />;

    case "county":
      return (
        <label className="block max-w-sm">
          <span className="sr-only">County</span>
          <select
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg"
            value={answers.county ?? ""}
            onChange={(e) => update({ county: e.target.value || undefined })}
          >
            <option value="">Choose your county…</option>
            {COUNTIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      );

    case "bodies": {
      const current = answers.likedBodies ?? [];
      const bodies = Object.keys(BODY_LABELS) as BodyType[];
      const colors = ["#10b981", "#0ea5e9", "#f59e0b", "#6366f1", "#14b8a6", "#ef4444", "#8b5cf6", "#f97316", "#ec4899"];
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bodies.map((b, i) => {
            const on = current.includes(b);
            return (
              <button
                key={b}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  update({ likedBodies: on ? current.filter((x) => x !== b) : [...current, b] })
                }
                className={`rounded-xl border-2 p-3 transition ${
                  on ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <BodyIcon body={b} className="mx-auto h-14 w-full" color={colors[i]} />
                <span className="mt-1 block text-sm font-medium">
                  {on ? "❤️ " : ""}
                  {BODY_LABELS[b]}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    case "brands": {
      const love = answers.brandsLove ?? [];
      const avoid = answers.brandsAvoid ?? [];
      const cycle = (b: string) => {
        if (love.includes(b)) update({ brandsLove: love.filter((x) => x !== b), brandsAvoid: [...avoid, b] });
        else if (avoid.includes(b)) update({ brandsAvoid: avoid.filter((x) => x !== b) });
        else update({ brandsLove: [...love, b] });
      };
      return (
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => {
            const state = love.includes(b) ? "love" : avoid.includes(b) ? "avoid" : "none";
            return (
              <button
                key={b}
                type="button"
                onClick={() => cycle(b)}
                aria-label={`${b}: ${state === "love" ? "favourite" : state === "avoid" ? "avoid" : "no preference"}`}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition ${
                  state === "love"
                    ? "border-brand-600 bg-brand-50 text-brand-900"
                    : state === "avoid"
                      ? "border-red-400 bg-red-50 text-red-800 line-through"
                      : "border-slate-200 bg-white"
                }`}
              >
                {state === "love" ? "💚 " : state === "avoid" ? "🚫 " : ""}
                {b}
              </button>
            );
          })}
        </div>
      );
    }

    case "ranking":
      return <Ranking answers={answers} update={update} />;
  }
}

function BudgetInput({ answers, update }: { answers: Answers; update: (p: Partial<Answers>) => void }) {
  const monthly = paysMonthly(answers);
  const min = monthly ? 100 : 2000;
  const max = monthly ? 1500 : 80000;
  const step = monthly ? 25 : 500;
  const value = answers.budget ?? (monthly ? 400 : 15000);
  const suggestion = suggestedMonthly(answers);

  return (
    <div className="card max-w-xl space-y-4 p-5">
      <div className={answers.budgetUnknown ? "opacity-40" : ""}>
        <label htmlFor="budget" className="block font-semibold">
          {monthly ? "Most I'd pay per month" : "Most I'd spend in total"}
        </label>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-3xl font-bold text-brand-700">{formatEur(value)}</span>
          {monthly && <span className="text-slate-500">/ month</span>}
        </div>
        <input
          id="budget"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={answers.budgetUnknown}
          onChange={(e) => update({ budget: Number(e.target.value), budgetUnknown: false })}
          className="mt-3 w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{formatEur(min)}</span>
          <span>{formatEur(max)}+</span>
        </div>
        {monthly && (
          <p className="mt-2 text-sm text-slate-600">
            Over {CONFIG.loan.months / 12} years at about {(CONFIG.loan.apr * 100).toFixed(1)}% APR, that buys a car
            costing about <strong>{formatEur(monthlyToTotal(value))}</strong>.
          </p>
        )}
        {answers.budget === undefined && !answers.budgetUnknown && (
          <button type="button" className="mt-2 text-sm text-brand-700 underline" onClick={() => update({ budget: value })}>
            Use {formatEur(value)}
          </button>
        )}
      </div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-brand-600"
          checked={!!answers.budgetUnknown}
          onChange={(e) => update({ budgetUnknown: e.target.checked })}
        />
        <span>I have no idea, help me work it out</span>
      </label>
      {answers.budgetUnknown && suggestion && (
        <p className="text-sm text-slate-600">
          Suggested: about {formatEur(suggestion)} a month, or a car around {formatEur(monthlyToTotal(suggestion))}.
        </p>
      )}
    </div>
  );
}

function Ranking({ answers, update }: { answers: Answers; update: (p: Partial<Answers>) => void }) {
  const list: Priority[] = answers.priorities ?? DEFAULT_PRIORITIES;
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    update({ priorities: next });
  };
  return (
    <ol className="max-w-md space-y-2">
      {list.map((p, i) => (
        <li
          key={p}
          className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-2 ${
            i < 4 ? "border-brand-500" : "border-slate-200"
          }`}
        >
          <span className="w-6 text-center font-bold text-slate-500">{i + 1}</span>
          <span className="flex-1 font-medium">{PRIORITY_LABELS[p]}</span>
          <button
            type="button"
            className="btn-ghost px-2 py-1"
            aria-label={`Move ${PRIORITY_LABELS[p]} up`}
            disabled={i === 0}
            onClick={() => move(i, -1)}
          >
            ▲
          </button>
          <button
            type="button"
            className="btn-ghost px-2 py-1"
            aria-label={`Move ${PRIORITY_LABELS[p]} down`}
            disabled={i === list.length - 1}
            onClick={() => move(i, 1)}
          >
            ▼
          </button>
        </li>
      ))}
    </ol>
  );
}
