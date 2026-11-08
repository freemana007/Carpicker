# CarPicker Ireland

A free quiz that helps people in Ireland who know nothing about cars find one that fits their life, budget and dreams. It covers cars bought in the Republic **and** in Northern Ireland. For Northern Ireland cars it shows the total cost of getting the car on the road in the Republic (VRT, travel, checks, plates, NCT) and the steps to take.

- **Free**, no ads, no affiliate links.
- **No account.** Answers are kept in the browser and in the share link. Nothing is sent to a server.
- **Fixed quiz, no AI.** Same answers always give the same cars. All text is written by the team.

See [`PLAN.md`](PLAN.md) for the product plan, [`UX-REVAMP-PLAN.md`](UX-REVAMP-PLAN.md) for the design plan, and [`DATA.md`](DATA.md) for how to check and update the data.

> ⚠️ **Early version.** Tax rates and the Northern Ireland rules were checked against revenue.ie and motortax.ie (November 2026). The car data is still a draft estimate and must be checked before launch (see `DATA.md`). The app shows a warning while `verified` is `false` in `src/config/ireland-costs.json`.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests: costs, VRT, engine, personas, quiz logic
npm run lint       # type check
npm run build      # static site in ./out
npm run smoke      # browser test of the full flow + axe accessibility checks (after build; needs Playwright + Chromium)
```

The build is a fully static site (`out/`). Host it anywhere that serves static files (Vercel, Netlify, GitHub Pages).

## How it's organised

| Path | What it is |
|---|---|
| `src/lib/questions.ts` | Every quiz question, answer option, hint and skip rule |
| `src/lib/engine.ts` | The recommendation rules: hard filters, scoring, shortlist, explanation templates |
| `src/lib/costs.ts` | Prices, VRT, NOx levy, motor tax, running costs, loans, Northern Ireland landed cost |
| `src/config/ireland-costs.json` | **All rates and fees** (VRT bands, motor tax, NCT fee, exchange rate, fuel prices…) with sources and the date checked |
| `src/config/counties.ts` | Distance from each county to Northern Ireland, for travel costs |
| `src/data/cars.ts` | The car data (draft) |
| `src/lib/content.ts` | Glossary, Northern Ireland steps and warnings, review sources, beginner checklist |
| `src/lib/personas.ts` | Test personas from the plan |
| `src/app/` | Pages: home, quiz, results, car page (`/car/?id=`), compare (`/compare/?ids=`), Northern Ireland guide + calculator, glossary |
| `src/app/globals.css`, `tailwind.config.ts` | Design tokens: light and dark themes as CSS variables, type scale, shadows |
| `src/components/ui/` | Design-system pieces: car illustrations, icons, plate badge, match bar, star rating, bottom sheet |
| `src/components/results/`, `car.tsx`, `ni.tsx` | Results cards and panels, car page sections, Northern Ireland answer, waterfall and timeline |
| `src/lib/summary.ts` | "What we know about you" summary |

## How recommendations work

1. **Hard filters** remove cars that can't work: wrong gearbox for an automatic-only licence, not enough seats, engine type not chosen, can't tow, EV range too short, deal-breakers, avoided brands.
2. **Choose how to buy**: for each car, the newest age that fits the budget in the Republic. If the user is open to Northern Ireland, an NI car is only used when its **total landed cost** fits the budget **and** saves at least €1,000 (€1,500 for "only if it saves a lot").
3. **Score** each car 0–100 on 11 factors (affordability, running costs, insurance, reliability, safety, space, capability, style, comfort, tech, reviews). Weights come from the user's priority ranking and answers.
4. **Shortlist** 3–5 different models: best overall, best value (lowest 5-year cost), closest to your dream, a wildcard, and a Northern Ireland deal when there is one.
5. **Explain** with pre-written sentence templates, plus one honest heads-up per car.
