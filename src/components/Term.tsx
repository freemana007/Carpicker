"use client";

import { useId, useState } from "react";
import { GLOSSARY } from "@/lib/content";

/** A word with a tap-to-explain definition from the glossary. */
export function Term({ term, children }: { term: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const entry = GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());
  if (!entry) return <>{children ?? term}</>;
  return (
    <span className="relative inline">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-slate-500 text-inherit"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        {children ?? term}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 block w-64 rounded-lg bg-slate-900 p-3 text-left text-sm font-normal leading-snug text-white shadow-lg"
        >
          <strong>{entry.term}:</strong> {entry.meaning}
        </span>
      )}
    </span>
  );
}
