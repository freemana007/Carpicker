import type { BodyType } from "@/lib/types";

// Simple side-on silhouettes drawn for CarPicker (no brand shapes or photos).
const SHAPES: Record<BodyType, { d: string; wheels: [number, number]; r: number }> = {
  city: { d: "M20 38 L20 26 Q22 20 32 18 L44 9 Q47 7 54 7 L82 7 Q88 7 92 14 L98 26 L98 38 Z", wheels: [36, 84], r: 7 },
  supermini: { d: "M12 38 L12 28 Q14 24 24 23 L38 20 L50 11 Q53 9 60 9 L88 9 Q94 9 98 14 L104 24 L106 38 Z", wheels: [30, 90], r: 7.5 },
  hatchback: { d: "M6 38 L6 28 Q8 24 20 23 L36 21 L50 11 Q53 9 60 9 L94 9 Q100 9 104 14 L110 24 L112 38 Z", wheels: [26, 94], r: 8 },
  saloon: { d: "M4 38 L4 30 Q6 26 18 25 L36 23 L48 12 Q52 10 60 10 L80 10 Q86 10 92 17 L98 23 L110 25 Q116 27 116 33 L116 38 Z", wheels: [26, 96], r: 8 },
  estate: { d: "M4 38 L4 28 Q6 24 18 23 L34 21 L46 11 Q49 9 56 9 L106 9 Q110 9 112 13 L114 24 L114 38 Z", wheels: [24, 96], r: 8 },
  crossover: { d: "M6 38 L6 25 Q8 20 20 19 L36 17 L48 7 Q51 5 58 5 L96 5 Q102 5 106 11 L112 21 L112 38 Z", wheels: [26, 94], r: 9 },
  suv: { d: "M4 38 L4 21 Q6 17 16 16 L30 15 L40 4 Q42 2 48 2 L108 2 Q112 2 113 6 L116 18 L116 38 Z", wheels: [26, 96], r: 9.5 },
  mpv: { d: "M6 38 L6 20 Q8 16 18 14 L28 4 Q31 2 38 2 L106 2 Q111 2 112 7 L114 20 L114 38 Z", wheels: [26, 96], r: 8 },
  sports: { d: "M2 38 L2 32 Q4 28 18 27 L44 24 L60 16 Q64 14 72 14 L84 15 Q92 17 100 24 L112 28 Q118 30 118 36 L118 38 Z", wheels: [24, 98], r: 8 },
};

export function BodyIcon({ body, className = "", color = "currentColor" }: { body: BodyType; className?: string; color?: string }) {
  const s = SHAPES[body];
  return (
    <svg viewBox="0 0 120 50" className={className} aria-hidden="true">
      <path d={s.d} fill={color} />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={39} r={s.r} fill="#1e293b" />
          <circle cx={x} cy={39} r={s.r * 0.45} fill="#cbd5e1" />
        </g>
      ))}
    </svg>
  );
}
