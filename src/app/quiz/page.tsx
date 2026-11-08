"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bookmark, Car, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionView } from "@/components/QuestionView";
import { Icon } from "@/components/ui/icons";
import { TOTAL_MODELS, countFits, suggestFix } from "@/lib/engine";
import { CHAPTERS, activeQuestions, isAnswered, smartPriorities } from "@/lib/questions";
import { REVEAL_KEY, loadAnswers, resultsUrl, saveAnswers } from "@/lib/share";
import type { Answers } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [quick, setQuick] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Editing one answer always uses the full question list.
    setQuick(params.get("mode") === "quick" && !params.get("q"));
    if (params.get("fresh") !== "1") {
      const stored = loadAnswers();
      if (stored) setAnswers(stored);
    }
    const q = params.get("q");
    if (q) {
      setCurrentId(q);
      setEditId(q);
    }
    setReady(true);
  }, []);

  const questions = useMemo(() => activeQuestions(answers, quick), [answers, quick]);
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const found = questions.findIndex((q) => q.id === currentId);
  const index = Math.max(0, found);
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const chapterIndex = q ? CHAPTERS.findIndex((c) => c.title === q.section) : 0;
  const firstOfChapter = q && (index === 0 || questions[index - 1].section !== q.section);

  const fits = useMemo(() => countFits(answers), [answers]);
  const fix = useMemo(() => (fits === 0 ? suggestFix(answers) : null), [fits, answers]);

  const update = (patch: Partial<Answers>) => {
    setAnswers((prev) => {
      const next = { ...prev, ...patch };
      saveAnswers(next);
      return next;
    });
  };

  const goTo = (i: number) => {
    const list = questionsRef.current;
    const target = list[Math.min(Math.max(i, 0), list.length - 1)];
    setCurrentId(target.id);
    window.scrollTo({ top: 0 });
  };

  const finish = (final: Answers) => {
    saveAnswers(final);
    try {
      sessionStorage.setItem(REVEAL_KEY, "1");
    } catch {
      /* ignore */
    }
    router.push(resultsUrl(final));
  };

  const withDefaults = (): Answers => {
    let final = answers;
    if (q?.kind === "ranking" && !answers.priorities) final = { ...final, priorities: smartPriorities(answers) };
    if (q?.kind === "budget" && answers.budget === undefined && !answers.budgetUnknown) {
      final = { ...final, budget: answers.payMethod === "loan" || answers.payMethod === "finance" ? 400 : 15000 };
    }
    if (final !== answers) {
      setAnswers(final);
      saveAnswers(final);
    }
    return final;
  };

  const next = () => {
    const final = withDefaults();
    if (editId) {
      router.push(resultsUrl(final));
      return;
    }
    if (isLast) finish({ ...final, priorities: final.priorities ?? smartPriorities(final) });
    else goTo(index + 1);
  };

  // Keyboard: number keys pick options, Enter moves on.
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (/^[1-9]$/.test(e.key)) {
        const btn = document.querySelector<HTMLButtonElement>(`[data-option-index="${Number(e.key) - 1}"]`);
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      } else if (e.key === "Enter" && t.tagName !== "BUTTON" && t.tagName !== "A") {
        e.preventDefault();
        nextRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!ready || !q) return <p className="text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl pb-32">
      {/* Progress by chapter, so the total never jumps */}
      <div className="mb-6 space-y-4">
        {editId ? (
          <p className="text-sm font-medium text-muted">Changing one answer</p>
        ) : (
          <ol className="flex gap-2" aria-label="Quiz chapters">
            {CHAPTERS.map((c, i) => (
              <li key={c.title} className="flex-1" aria-current={i === chapterIndex ? "step" : undefined}>
                <div className={`h-1.5 rounded-full ${i < chapterIndex ? "bg-brand" : i === chapterIndex ? "bg-brand/60" : "bg-line"}`} />
                <span className={`mt-1.5 hidden text-xs sm:block ${i === chapterIndex ? "font-semibold text-ink" : "text-muted"}`}>
                  {i < chapterIndex && <Check className="mr-0.5 inline h-3 w-3" aria-hidden="true" />}
                  {c.title}
                </span>
                <span className="sr-only">{i < chapterIndex ? " (done)" : i === chapterIndex ? " (current)" : ""}</span>
              </li>
            ))}
          </ol>
        )}

        {/* Live feedback: answers visibly matter (Norman) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-live="polite">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${fits === 0 ? "bg-bad-soft text-bad" : "bg-brand-soft text-ink"}`}>
            <Car className="h-4 w-4" aria-hidden="true" />
            {fits === 0 ? "No cars fit right now" : `${fits} of ${TOTAL_MODELS} cars still fit`}
          </span>
          {fix && (
            <button type="button" className="link text-sm" onClick={() => update(fix.patch)}>
              {fix.label} → {fix.count} {fix.count === 1 ? "car" : "cars"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {firstOfChapter && !editId && (
            <div className="flex items-center gap-4 rounded-card bg-brand-soft/70 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-on">
                <Icon name={CHAPTERS[chapterIndex].icon} className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-strong">
                  Part {chapterIndex + 1} of {CHAPTERS.length}: {CHAPTERS[chapterIndex].title}
                </p>
                <p className="text-sm text-ink/80">{CHAPTERS[chapterIndex].intro}</p>
              </div>
            </div>
          )}
          <div className="card p-6 md:p-8">
            <QuestionView
              q={q}
              answers={answers}
              update={update}
              onPicked={() => {
                if (editId) return;
                const fromId = q.id;
                setTimeout(() => {
                  const list = questionsRef.current;
                  const i = list.findIndex((x) => x.id === fromId);
                  if (i >= 0 && i < list.length - 1) {
                    setCurrentId(list[i + 1].id);
                    window.scrollTo({ top: 0 });
                  }
                }, 300);
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
        {!editId && (
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-1.5 hover:text-ink"
            onClick={() => {
              saveAnswers(answers);
              setSaved(true);
            }}
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" /> Save and finish later
          </button>
        )}
        {!editId && index > 2 && (
          <button type="button" className="inline-flex min-h-11 items-center hover:text-ink" onClick={() => finish(withDefaults())}>
            Skip the rest, show my cars
          </button>
        )}
        {!editId && (
          <button
            type="button"
            className="inline-flex min-h-11 items-center hover:text-ink"
            onClick={() => {
              setQuick((v) => !v);
              setCurrentId(null);
            }}
          >
            {quick ? "Switch to the full quiz" : "Switch to quick mode"}
          </button>
        )}
      </div>
      {saved && (
        <p className="mt-3 text-center text-sm" role="status">
          Saved on this device. Come back any time, no rush. <Link href="/" className="link">Go to home</Link>
        </p>
      )}

      {/* Sticky action bar in the thumb zone (Wroblewski) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line/60 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          {editId ? (
            <Link href={resultsUrl(answers)} className="btn-ghost">
              Cancel
            </Link>
          ) : (
            <button type="button" className="btn-ghost" disabled={index === 0} onClick={() => goTo(index - 1)}>
              <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back
            </button>
          )}
          <div className="flex items-center gap-2">
            {!editId && !isLast && !isAnswered(q, answers) && q.kind !== "budget" && (
              <button type="button" className="btn-ghost hidden sm:inline-flex" onClick={() => goTo(index + 1)}>
                Skip
              </button>
            )}
            <button type="button" className="btn-primary min-w-36" onClick={next}>
              {editId ? (
                "Save and see my cars"
              ) : isLast ? (
                <>
                  <Sparkles className="h-5 w-5" aria-hidden="true" /> See my cars
                </>
              ) : (
                <>
                  {isAnswered(q, answers) || q.kind === "budget" ? "Next" : "Skip"} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
