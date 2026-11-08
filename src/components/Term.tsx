"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { GLOSSARY } from "@/lib/content";

/** A word with a tap-to-explain definition (bottom sheet on phones). */
export function Term({ term, children }: { term: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());
  if (!entry) return <>{children ?? term}</>;
  return (
    <>
      <button
        type="button"
        className="cursor-help text-inherit underline decoration-dotted decoration-muted underline-offset-4 hover:decoration-brand"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {children ?? term}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={entry.term}>
        <p>{entry.meaning}</p>
      </Sheet>
    </>
  );
}
