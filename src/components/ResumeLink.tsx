"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAnswers } from "@/lib/share";

/** Shown only if there are saved answers on this device. */
export function ResumeLink() {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const a = loadAnswers();
    setHas(!!a && Object.keys(a).length > 0);
  }, []);
  if (!has) return null;
  return (
    <Link href="/quiz/" className="inline-flex min-h-12 items-center gap-2 font-medium text-brand">
      <History className="h-5 w-5" aria-hidden="true" /> Pick up where you left off
    </Link>
  );
}
