// Cars coming to Ireland that aren't on sale here yet.
//
// "irish-site": the brand's own Irish website shows it as coming soon /
//   register your interest (checked 9 November 2026).
// "europe": in production in Europe in 2026 (per Wikipedia, checked
//   9 November 2026) but not yet confirmed for Ireland.
// These are not scored or recommended until they're on sale with Irish prices.

import type { BodyType, Powertrain } from "@/lib/types";

export interface UpcomingCar {
  id: string;
  make: string;
  model: string;
  body: BodyType;
  powertrain: Powertrain;
  /** Plain description. */
  summary: string;
  status: "irish-site" | "europe";
  /** What we know about timing for Ireland. */
  timing: string;
  source: { label: string; url: string };
  checked: string;
}

export const UPCOMING_CHECKED = "2026-11-09";

export const UPCOMING: UpcomingCar[] = [
  {
    id: "vw-id-cross",
    make: "Volkswagen",
    model: "ID. Cross",
    body: "crossover",
    powertrain: "ev",
    summary: "A small electric SUV: the electric version of the T-Cross.",
    status: "irish-site",
    timing: "Volkswagen Ireland is taking registrations of interest. Irish price and date to be confirmed.",
    source: { label: "Volkswagen Ireland", url: "https://www.volkswagen.ie/en.html" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "vw-id-tiguan",
    make: "Volkswagen",
    model: "ID. Tiguan",
    body: "suv",
    powertrain: "ev",
    summary: "An all-electric version of the Tiguan family SUV.",
    status: "irish-site",
    timing: "Listed as coming soon on Volkswagen Ireland, with registrations of interest open.",
    source: { label: "Volkswagen Ireland", url: "https://www.volkswagen.ie/en.html" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "mercedes-gla-new",
    make: "Mercedes-Benz",
    model: "GLA (all-new)",
    body: "crossover",
    powertrain: "ev",
    summary: "The next-generation GLA small SUV, offered as an electric car or a petrol hybrid.",
    status: "irish-site",
    timing: "Mercedes-Benz Ireland is taking registrations of interest.",
    source: { label: "Mercedes-Benz Ireland", url: "https://www.mercedes-benz.ie" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "mercedes-amg-gt-suv",
    make: "Mercedes-Benz",
    model: "AMG GT SUV",
    body: "suv",
    powertrain: "ev",
    summary: "A high-performance luxury SUV from Mercedes-AMG.",
    status: "irish-site",
    timing: "Shown as coming soon on Mercedes-Benz Ireland.",
    source: { label: "Mercedes-Benz Ireland", url: "https://www.mercedes-benz.ie" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "renault-twingo",
    make: "Renault",
    model: "Twingo E-Tech",
    body: "city",
    powertrain: "ev",
    summary: "An affordable electric city car with retro styling inspired by the original Twingo.",
    status: "europe",
    timing: "In production since 2026, but not yet listed on Renault Ireland's website.",
    source: { label: "Wikipedia: Renault Twingo E-Tech", url: "https://en.wikipedia.org/wiki/Renault_Twingo_E-Tech" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "cupra-raval",
    make: "Cupra",
    model: "Raval",
    body: "supermini",
    powertrain: "ev",
    summary: "A sporty small electric hatchback, related to the VW ID. Polo.",
    status: "europe",
    timing: "In production since 2026. Irish availability not yet confirmed.",
    source: { label: "Wikipedia: Cupra Raval", url: "https://en.wikipedia.org/wiki/Cupra_Raval" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "hyundai-ioniq-3",
    make: "Hyundai",
    model: "Ioniq 3",
    body: "supermini",
    powertrain: "ev",
    summary: "A small electric hatchback from Hyundai's Ioniq range.",
    status: "europe",
    timing: "In production since 2026. Irish availability not yet confirmed.",
    source: { label: "Wikipedia: Hyundai Ioniq 3", url: "https://en.wikipedia.org/wiki/Hyundai_Ioniq_3" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "bmw-ix3-new",
    make: "BMW",
    model: "iX3 (new generation)",
    body: "suv",
    powertrain: "ev",
    summary: "BMW's first 'Neue Klasse' electric SUV, with a new design and long range.",
    status: "europe",
    timing: "Launched in Europe. Check BMW Ireland for Irish prices and delivery dates.",
    source: { label: "Wikipedia: BMW iX3", url: "https://en.wikipedia.org/wiki/BMW_iX3" },
    checked: UPCOMING_CHECKED,
  },
  {
    id: "volvo-ex60",
    make: "Volvo",
    model: "EX60",
    body: "suv",
    powertrain: "ev",
    summary: "A mid-size electric SUV from Volvo.",
    status: "europe",
    timing: "Announced. Irish availability not yet confirmed.",
    source: { label: "Wikipedia: Volvo EX60", url: "https://en.wikipedia.org/wiki/Volvo_EX60" },
    checked: UPCOMING_CHECKED,
  },
];

/** Coming-soon cars that fit the user's engine and shape preferences. */
export function upcomingFor(a: { engines?: string[]; likedBodies?: BodyType[]; brandsAvoid?: string[] }, max = 3): UpcomingCar[] {
  const engineOk = (u: UpcomingCar) =>
    !a.engines?.length || a.engines.includes(u.powertrain === "phev" ? "hybrid" : u.powertrain);
  const bodyOk = (u: UpcomingCar) => !a.likedBodies?.length || a.likedBodies.includes(u.body);
  return UPCOMING.filter((u) => engineOk(u) && bodyOk(u) && !a.brandsAvoid?.includes(u.make)).slice(0, max);
}
