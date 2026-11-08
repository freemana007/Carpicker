"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary no-print">
      <Printer className="h-5 w-5" aria-hidden="true" /> {label}
    </button>
  );
}
