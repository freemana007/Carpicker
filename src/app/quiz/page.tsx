"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionView } from "@/components/QuestionView";
import { DEFAULT_PRIORITIES, SECTIONS, activeQuestions, isAnswered } from "@/lib/questions";
import { loadAnswers, resultsUrl, saveAnswers } from "@/lib/share";
import type { Answers } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [quick, setQuick] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuick(params.get("mode") === "quick");
    if (params.get("fresh") !== "1") {
      const saved = loadAnswers();
      if (saved) setAnswers(saved);
    }
    setReady(true);
  }, []);

  const questions = useMemo(() => activeQuestions(answers, quick), [answers, quick]);
  // Latest question list, for the auto-advance timer (answers can add or remove questions).
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const index = Math.max(0, questions.findIndex((q) => q.id === currentId));
  const q = questions[index];
  const isLast = index === questions.length - 1;

  const update = (patch: Partial<Answers>) => {
    setAnswers((prev) => {
      const next = { ...prev, ...patch };
      saveAnswers(next);
      return next;
    });
  };

  const goTo = (i: number) => {
    const target = questions[Math.min(Math.max(i, 0), questions.length - 1)];
    setCurrentId(target.id);
    window.scrollTo({ top: 0 });
  };

  const finish = (final: Answers) => {
    saveAnswers(final);
    router.push(resultsUrl(final));
  };

  const next = () => {
    // The priority ranking counts as answered with its default order.
    let final = answers;
    if (q.kind === "ranking" && !answers.priorities) {
      final = { ...answers, priorities: DEFAULT_PRIORITIES };
      update({ priorities: DEFAULT_PRIORITIES });
    }
    if (q.kind === "budget" && answers.budget === undefined && !answers.budgetUnknown) {
      // Slider shows a default value; save it if the user moved on without touching it.
      update({ budget: answers.payMethod === "loan" || answers.payMethod === "finance" ? 400 : 15000 });
    }
    if (isLast) finish(final);
    else goTo(index + 1);
  };

  if (!ready || !q) return <p className="text-slate-500">Loading…</p>;

  const sectionNo = SECTIONS.indexOf(q.section) + 1;
  const progress = Math.round((index / questions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Question {index + 1} of {questions.length}
            {!quick && ` · Part ${sectionNo} of ${SECTIONS.length}`}
          </span>
          <button
            type="button"
            className="underline"
            onClick={() => {
              setQuick((v) => !v);
              setCurrentId(null);
            }}
          >
            {quick ? "Switch to full quiz" : "Switch to quick mode"}
          </button>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card p-5 md:p-8">
        <QuestionView
          key={q.id}
          q={q}
          answers={answers}
          update={update}
          onPicked={() => {
            // Auto-advance after a single choice, after a short pause so the user sees it selected.
            const fromId = q.id;
            setTimeout(() => {
              const list = questionsRef.current;
              const i = list.findIndex((x) => x.id === fromId);
              if (i >= 0 && i < list.length - 1) {
                setCurrentId(list[i + 1].id);
                window.scrollTo({ top: 0 });
              }
            }, 250);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn-secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>
          ← Back
        </button>
        <div className="flex gap-3">
          {!isLast && !isAnswered(q, answers) && q.kind !== "ranking" && q.kind !== "budget" && (
            <button type="button" className="btn-ghost" onClick={() => goTo(index + 1)}>
              Skip / I don't know
            </button>
          )}
          <button type="button" className="btn-primary" onClick={next}>
            {isLast ? "See my cars 🎉" : "Next →"}
          </button>
        </div>
      </div>

      {index > 2 && (
        <p className="text-center text-sm">
          <button type="button" className="text-slate-500 underline" onClick={() => finish(answers)}>
            Skip the rest and see my results now
          </button>
        </p>
      )}
    </div>
  );
}
