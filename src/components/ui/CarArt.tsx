import { useId } from "react";
import type { BodyType } from "@/lib/types";

// CarPicker's own car illustrations: one consistent side view per body style,
// with a soft gradient for depth. No brand shapes or photos.
const SHAPES: Record<BodyType, { body: string; glass: string; pillar: number; wheels: [number, number]; r: number }> = {
  city: { body: "M20 38 L20 26 Q22 20 32 18 L44 9 Q47 7 54 7 L82 7 Q88 7 92 14 L98 26 L98 38 Z", glass: "M37 20 L47 11 L80 11 Q85 11 88 16 L91 21 Z", pillar: 64, wheels: [36, 84], r: 7 },
  supermini: { body: "M12 38 L12 28 Q14 24 24 23 L38 20 L50 11 Q53 9 60 9 L88 9 Q94 9 98 14 L104 24 L106 38 Z", glass: "M41 21 L53 12 L86 12 Q91 12 94 16 L98 22 Z", pillar: 70, wheels: [30, 90], r: 7.5 },
  hatchback: { body: "M6 38 L6 28 Q8 24 20 23 L36 21 L50 11 Q53 9 60 9 L94 9 Q100 9 104 14 L110 24 L112 38 Z", glass: "M39 21 L53 12 L92 12 Q97 12 100 16 L104 22 Z", pillar: 72, wheels: [26, 94], r: 8 },
  saloon: { body: "M4 38 L4 30 Q6 26 18 25 L36 23 L48 12 Q52 10 60 10 L80 10 Q86 10 92 17 L98 23 L110 25 Q116 27 116 33 L116 38 Z", glass: "M39 23 L50 13 L79 13 Q84 13 89 18 L93 23 Z", pillar: 66, wheels: [26, 96], r: 8 },
  estate: { body: "M4 38 L4 28 Q6 24 18 23 L34 21 L46 11 Q49 9 56 9 L106 9 Q110 9 112 13 L114 24 L114 38 Z", glass: "M37 21 L49 12 L104 12 Q107 12 108 15 L109 22 Z", pillar: 70, wheels: [24, 96], r: 8 },
  crossover: { body: "M6 38 L6 25 Q8 20 20 19 L36 17 L48 7 Q51 5 58 5 L96 5 Q102 5 106 11 L112 21 L112 38 Z", glass: "M39 18 L51 8 L95 8 Q99 8 102 12 L106 19 Z", pillar: 72, wheels: [26, 94], r: 9 },
  suv: { body: "M4 38 L4 21 Q6 17 16 16 L30 15 L40 4 Q42 2 48 2 L108 2 Q112 2 113 6 L116 18 L116 38 Z", glass: "M33 15 L42 5 L106 5 Q109 5 110 8 L111 15 Z", pillar: 72, wheels: [26, 96], r: 9.5 },
  mpv: { body: "M6 38 L6 20 Q8 16 18 14 L28 4 Q31 2 38 2 L106 2 Q111 2 112 7 L114 20 L114 38 Z", glass: "M29 14 L39 5 L104 5 Q108 5 109 9 L110 15 Z", pillar: 68, wheels: [26, 96], r: 8 },
  sports: { body: "M2 38 L2 32 Q4 28 18 27 L44 24 L60 16 Q64 14 72 14 L84 15 Q92 17 100 24 L112 28 Q118 30 118 36 L118 38 Z", glass: "M50 24 L62 18 L82 18 Q88 19 94 24 Z", pillar: 74, wheels: [24, 98], r: 8 },
};

/** Colours that work in light and dark themes. */
export const CAR_COLOURS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#db2777", "#475569", "#059669", "#dc2626", "#0891b2"];

/** A stable colour per car, so the same car always looks the same. */
export function carColour(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CAR_COLOURS[h % CAR_COLOURS.length];
}

export function CarArt({
  body,
  color = "#0f766e",
  className = "",
  title,
}: {
  body: BodyType;
  color?: string;
  className?: string;
  title?: string;
}) {
  const s = SHAPES[body];
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 52" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.85" />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.95" />
          <stop offset="1" stopColor="#94a3b8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="47" rx="54" ry="3.2" fill="currentColor" opacity="0.12" />
      <path d={s.body} fill={`url(#b${id})`} />
      <path d={s.glass} fill={`url(#g${id})`} />
      <line x1={s.pillar} y1="2" x2={s.pillar} y2="26" stroke={`url(#b${id})`} strokeWidth="2.5" />
      <rect x={body === "sports" ? 3 : 7} y="29" width="5" height="2.4" rx="1.2" fill="#fef3c7" />
      <rect x={body === "sports" ? 113 : body === "city" ? 94 : 109} y="29" width="4" height="2.4" rx="1.2" fill="#fca5a5" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={39} r={s.r} fill="#1f2937" />
          <circle cx={x} cy={39} r={s.r * 0.55} fill="#d1d5db" />
          <circle cx={x} cy={39} r={s.r * 0.18} fill="#6b7280" />
        </g>
      ))}
    </svg>
  );
}
