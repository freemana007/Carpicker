import { Check, Star } from "lucide-react";

/** Irish number-plate style year badge, e.g. "221". */
export function PlateBadge({ year, isNew }: { year: number; isNew?: boolean }) {
  const code = `${String(year).slice(2)}1`;
  return (
    <span
      className="inline-flex h-6 items-stretch overflow-hidden rounded-[4px] border border-neutral-400 bg-white text-xs font-bold leading-6 text-neutral-900 shadow-1"
      role="img"
      aria-label={isNew ? `New ${year} car` : `${year} registration`}
    >
      <span className="flex w-4 flex-col items-center justify-center bg-[#1d4ed8] text-[6px] leading-[7px] text-[#fde047]" aria-hidden="true">
        ★<span className="text-white">IRL</span>
      </span>
      <span className="px-1.5 tracking-wider" aria-hidden="true">
        {isNew ? `${code}-NEW` : code}
      </span>
    </span>
  );
}

export function MatchBar({ value, label = "match" }: { value: number; label?: string }) {
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${value}% ${label}`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
      </div>
      <span className="w-20 text-right text-sm font-semibold tabular-nums">
        {value}% <span className="font-normal text-muted">{label}</span>
      </span>
    </div>
  );
}

export function StarRating({ stars, max = 5, label }: { stars: number; max?: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label ?? `${stars} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-5 w-5 ${i < Math.round(stars) ? "fill-accent text-accent" : "text-line"}`}
        />
      ))}
    </span>
  );
}

/** Quiet label under a bold value (Refactoring UI: emphasise by de-emphasising). */
export function Stat({ value, label, hint }: { value: React.ReactNode; label: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted">{label}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function CheckedTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-2 py-0.5 text-xs font-medium text-good">
      <Check className="h-3 w-3" aria-hidden="true" /> {children}
    </span>
  );
}
