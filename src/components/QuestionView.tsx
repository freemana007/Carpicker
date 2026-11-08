"use client";

import { ArrowDown, ArrowUp, Check, Info, X } from "lucide-react";
import { useState } from "react";
import { CAR_COLOURS, CarArt } from "@/components/ui/CarArt";
import { Icon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/Sheet";
import { COUNTIES } from "@/config/counties";
import { CONFIG, formatEur, monthlyToTotal, paysMonthly, suggestedMonthly } from "@/lib/costs";
import {
  BODY_LABELS,
  PRIORITY_LABELS,
  disabledReason,
  parseValue,
  smartPriorities,
  type Option,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl">{q.title}</h1>
        {q.hint && <p className="mt-2 text-muted">{q.hint}</p>}
        {q.explainer && (
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-medium text-brand"
            onClick={() => setShowExplainer(true)}
            aria-haspopup="dialog"
          >
            <Info className="h-4 w-4" aria-hidden="true" /> What do these mean?
          </button>
        )}
      </div>
      {q.explainer && (
        <Sheet open={showExplainer} onClose={() => setShowExplainer(false)} title={q.explainer.title}>
          <ul className="space-y-3">
            {q.explainer.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Sheet>
      )}
      <Input q={q} answers={answers} update={update} onPicked={onPicked} />
    </div>
  );
}

function OptionCard({
  option,
  selected,
  onClick,
  multi,
  disabledBecause,
  index,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
  disabledBecause?: string | null;
  index: number;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-disabled={!!disabledBecause}
      data-option-index={index}
      onClick={() => !disabledBecause && onClick()}
      className={`group flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition duration-150 ease-out ${
        disabledBecause
          ? "cursor-not-allowed bg-surface-2/60 text-muted"
          : selected
            ? "bg-brand-soft shadow-2 ring-2 ring-brand"
            : "bg-surface shadow-1 ring-1 ring-line hover:shadow-2 hover:ring-brand/40"
      }`}
    >
      {option.icon && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            selected ? "bg-brand text-brand-on" : "bg-surface-2 text-brand"
          }`}
        >
          <Icon name={option.icon} />
        </span>
      )}
      <span className="flex-1">
        <span className="font-semibold">{option.label}</span>
        {option.description && <span className="block text-sm text-muted">{option.description}</span>}
        {disabledBecause && <span className="block text-sm">{disabledBecause}</span>}
      </span>
      {multi ? (
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-2 ${
            selected ? "bg-brand text-brand-on ring-brand" : "ring-line"
          }`}
          aria-hidden="true"
        >
          {selected && <Check className="h-4 w-4" />}
        </span>
      ) : (
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${
            selected ? "bg-brand text-brand-on ring-brand" : "ring-line"
          }`}
          aria-hidden="true"
        >
          {selected && <Check className="h-4 w-4" />}
        </span>
      )}
    </button>
  );
}

function toggleIn(list: string[], v: string, exclusive: string[] = [], max?: number): string[] | null {
  let next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  if (exclusive.includes(v) && next.includes(v)) next = [v];
  else next = next.filter((x) => !exclusive.includes(x) || x === v);
  if (max && next.length > max) return null;
  return next;
}

function Input({ q, answers, update, onPicked }: Props) {
  switch (q.kind) {
    case "single": {
      const current = answers[q.field];
      return (
        <div role="radiogroup" aria-label={q.title} className="grid gap-3 sm:grid-cols-2">
          {q.options!.map((o, i) => (
            <OptionCard
              key={o.value}
              index={i}
              option={o}
              selected={String(current) === o.value}
              onClick={() => {
                update({ [q.field]: parseValue(q.field, o.value) } as Partial<Answers>);
                onPicked();
              }}
            />
          ))}
        </div>
      );
    }

    case "multi": {
      const current = (answers[q.field] as string[] | undefined) ?? [];
      return (
        <div className="space-y-2">
          {q.maxSelect && (
            <p className="text-sm text-muted" aria-live="polite">
              {current.length} of {q.maxSelect} picked
            </p>
          )}
          <div role="group" aria-label={q.title} className="grid gap-3 sm:grid-cols-2">
            {q.options!.map((o, i) => (
              <OptionCard
                key={o.value}
                index={i}
                multi
                option={o}
                selected={current.includes(o.value)}
                disabledBecause={disabledReason(q, o.value, answers)}
                onClick={() => {
                  const next = toggleIn(current, o.value, ["simple", "any", "shopping"], q.maxSelect);
                  if (next) update({ [q.field]: next } as Partial<Answers>);
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    case "needs": {
      const must: string[] = answers.mustHaves ?? [];
      const no: string[] = answers.dealBreakers ?? [];
      return (
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-3 flex items-center gap-2 font-semibold">
              <Check className="h-5 w-5 text-good" aria-hidden="true" /> Yes please, I need…
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.options!.map((o) => {
                const on = must.includes(o.value);
                const reason = disabledReason(q, o.value, answers);
                return (
                  <ChipToggle
                    key={o.value}
                    on={on}
                    disabledBecause={reason}
                    onClick={() => update({ mustHaves: toggleIn(must, o.value)! as Answers["mustHaves"] })}
                  >
                    {o.label}
                  </ChipToggle>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 flex items-center gap-2 font-semibold">
              <X className="h-5 w-5 text-bad" aria-hidden="true" /> No thanks, I don&apos;t want…
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.noOptions!.map((o) => (
                <ChipToggle
                  key={o.value}
                  on={no.includes(o.value)}
                  tone="bad"
                  onClick={() => update({ dealBreakers: toggleIn(no, o.value)! as Answers["dealBreakers"] })}
                >
                  {o.label}
                </ChipToggle>
              ))}
            </div>
          </fieldset>
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
            className="min-h-14 w-full rounded-2xl bg-surface px-4 text-lg shadow-1 ring-1 ring-line"
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
      return (
        <div role="group" aria-label={q.title} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bodies.map((b, i) => {
            const on = current.includes(b);
            return (
              <button
                key={b}
                type="button"
                role="checkbox"
                aria-checked={on}
                data-option-index={i}
                onClick={() => update({ likedBodies: on ? current.filter((x) => x !== b) : [...current, b] })}
                className={`rounded-2xl p-3 transition duration-150 ease-out ${
                  on ? "bg-brand-soft shadow-2 ring-2 ring-brand" : "bg-surface shadow-1 ring-1 ring-line hover:shadow-2"
                }`}
              >
                <CarArt body={b} className="mx-auto h-16 w-full text-ink" color={CAR_COLOURS[i % CAR_COLOURS.length]} />
                <span className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                  {on && <Check className="h-4 w-4 text-brand" aria-hidden="true" />}
                  {BODY_LABELS[b]}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    case "ranking":
      return <Ranking answers={answers} update={update} />;

    default:
      return null;
  }
}

function ChipToggle({
  on,
  onClick,
  children,
  tone = "good",
  disabledBecause,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "good" | "bad";
  disabledBecause?: string | null;
}) {
  const onCls = tone === "good" ? "bg-good-soft text-good ring-2 ring-good" : "bg-bad-soft text-bad ring-2 ring-bad";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-disabled={!!disabledBecause}
      title={disabledBecause ?? undefined}
      onClick={() => !disabledBecause && onClick()}
      className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-medium transition ${
        disabledBecause ? "cursor-not-allowed bg-surface-2/60 text-muted line-through" : on ? onCls : "bg-surface shadow-1 ring-1 ring-line hover:shadow-2"
      }`}
    >
      {on && (tone === "good" ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />)}
      {children}
      {disabledBecause && <span className="sr-only">: not available. {disabledBecause}.</span>}
    </button>
  );
}

function BudgetInput({ answers, update }: { answers: Answers; update: (p: Partial<Answers>) => void }) {
  const monthly = paysMonthly(answers);
  const min = monthly ? 100 : 2000;
  const max = monthly ? 1500 : 80000;
  const step = monthly ? 25 : 500;
  const value = answers.budget ?? (monthly ? 400 : 15000);
  const suggestion = suggestedMonthly(answers);

  return (
    <div className="card max-w-xl space-y-5 p-6">
      <div className={answers.budgetUnknown ? "opacity-40" : ""}>
        <label htmlFor="budget" className="label">
          {monthly ? "Most I'd pay per month" : "Most I'd spend in total"}
        </label>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight tabular-nums">{formatEur(value)}</span>
          {monthly && <span className="text-muted">a month</span>}
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
          className="mt-4 h-3 w-full cursor-pointer accent-[rgb(var(--brand))]"
          aria-valuetext={`${formatEur(value)}${monthly ? " a month" : ""}`}
        />
        <div className="flex justify-between text-xs text-muted">
          <span>{formatEur(min)}</span>
          <span>{formatEur(max)}+</span>
        </div>
        {monthly && (
          <p className="mt-3 text-sm text-muted">
            Over {CONFIG.loan.months / 12} years at about {(CONFIG.loan.apr * 100).toFixed(1)}% APR, that buys a car
            costing about <strong className="text-ink">{formatEur(monthlyToTotal(value))}</strong>.
          </p>
        )}
      </div>
      <label className="flex min-h-12 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-[rgb(var(--brand))]"
          checked={!!answers.budgetUnknown}
          onChange={(e) => update({ budgetUnknown: e.target.checked })}
        />
        <span>I have no idea, help me work it out</span>
      </label>
      {answers.budgetUnknown && suggestion && (
        <p className="text-sm text-muted">
          Suggested: about {formatEur(suggestion)} a month, or a car around {formatEur(monthlyToTotal(suggestion))}.
        </p>
      )}
    </div>
  );
}

function Ranking({ answers, update }: { answers: Answers; update: (p: Partial<Answers>) => void }) {
  const list: Priority[] = answers.priorities ?? smartPriorities(answers);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    update({ priorities: next });
  };
  return (
    <div className="space-y-3">
      {!answers.priorities && (
        <p className="rounded-xl bg-info-soft px-4 py-3 text-sm text-ink">
          We&apos;ve ordered these from your answers so far. Happy with it? Just tap <strong>See my cars</strong>.
        </p>
      )}
      <ol className="max-w-md space-y-2">
        {list.map((p, i) => (
          <li
            key={p}
            className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 ${
              i < 4 ? "bg-surface shadow-2 ring-1 ring-brand/40" : "bg-surface-2/70"
            }`}
          >
            <span className={`w-6 text-center font-bold ${i < 4 ? "text-brand" : "text-muted"}`}>{i + 1}</span>
            <span className="flex-1 font-medium">{PRIORITY_LABELS[p]}</span>
            <button
              type="button"
              className="btn-ghost min-h-12 px-3"
              aria-label={`Move ${PRIORITY_LABELS[p]} up`}
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn-ghost min-h-12 px-3"
              aria-label={`Move ${PRIORITY_LABELS[p]} down`}
              disabled={i === list.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown className="h-5 w-5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
