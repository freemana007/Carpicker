// The recommendation engine: fixed rules, no AI.
// Same answers in = same results out. Every rule is covered by tests.

import { CARS } from "@/data/cars";
import {
  CONFIG,
  annualEnergyCost,
  annualServicing,
  budgetTotal,
  formatEur,
  hasHomeCharging,
  iePrice,
  maxAge,
  minAge,
  motorTax,
  niLandedCost,
  niThreshold,
  niVerdict,
  paysMonthly,
  totalToMonthly,
  type NiLandedCost,
  type NiVerdict,
} from "./costs";
import type { Answers, Car, Dream, Priority, Style } from "./types";

export type Factor =
  | "affordability"
  | "running"
  | "insurance"
  | "reliability"
  | "safety"
  | "space"
  | "capability"
  | "style"
  | "comfort"
  | "tech"
  | "expert";

export const FACTORS: Factor[] = [
  "affordability",
  "running",
  "insurance",
  "reliability",
  "safety",
  "space",
  "capability",
  "style",
  "comfort",
  "tech",
  "expert",
];

const PRIORITY_TO_FACTOR: Record<Priority, Factor> = {
  price: "affordability",
  reliability: "reliability",
  safety: "safety",
  running: "running",
  space: "space",
  style: "style",
  comfort: "comfort",
  tech: "tech",
};

export type Source = "ie" | "ni";

export interface BuyOption {
  source: Source;
  age: number;
  /** Total purchase cost in € (for NI: landed cost in the Republic). */
  price: number;
  stretch: boolean;
  ni?: NiLandedCost;
}

export interface NiComparison extends NiLandedCost {
  verdict: NiVerdict;
  threshold: number;
}

export type InsuranceLevel = "Low" | "Medium" | "High" | "Very high";

export interface Scored {
  car: Car;
  option: BuyOption;
  score: number;
  factors: Record<Factor, number>;
  weights: Record<Factor, number>;
  annualEnergy: number;
  annualTax: number;
  annualServicing: number;
  monthlyRepayment?: number;
  monthlyTotal: number;
  fiveYearCost: number;
  insuranceLevel: InsuranceLevel;
  dreamScore: number;
  reasons: string[];
  headsUp: string;
  /** Northern Ireland comparison at the same age (when the user is open to NI). */
  niCompare?: NiComparison;
}

export type Role = "best" | "value" | "dream" | "wildcard" | "ni";

export interface Pick extends Scored {
  role: Role;
}

export interface Results {
  budget?: number;
  picks: Pick[];
  stretch: Scored[];
  considered: number;
  excludedReasons: { reason: string; count: number }[];
  ranked: Scored[];
}

// ---------------------------------------------------------------------------
// Hard filters
// ---------------------------------------------------------------------------

export function needsAuto(a: Answers): boolean {
  return a.autoOnly === "yes" || !!a.mustHaves?.includes("auto");
}

function minSeats(a: Answers): number {
  if (a.mustHaves?.includes("seven")) return 7;
  if (a.passengers === "big" || a.passengers === "family" || (a.childSeats ?? 0) > 0) return 5;
  if (a.passengers === "plus1") return 2;
  return 1;
}

function engineAllowed(car: Car, a: Answers): boolean {
  const engines = a.engines;
  if (!engines || engines.length === 0) return true;
  switch (car.powertrain) {
    case "ev":
      return engines.includes("ev");
    case "hybrid":
    case "phev":
      return engines.includes("hybrid");
    case "petrol":
      return engines.includes("petrol");
    case "diesel":
      return engines.includes("diesel");
  }
}

function dailyKmUpper(a: Answers): number {
  switch (a.dailyKm) {
    case "lt30":
      return 30;
    case "30-80":
      return 80;
    case "80-150":
      return 150;
    case "150+":
      return 250;
    default:
      return 0;
  }
}

/** Returns a plain-English reason if the car must be left out, or null. */
export function excludeReason(car: Car, a: Answers): string | null {
  if (needsAuto(a) && !car.gearbox.includes("auto")) return "no automatic version";
  if (a.mustHaves?.includes("manual") && !car.gearbox.includes("manual")) return "no manual version";
  if (car.seats < minSeats(a)) return "not enough seats";
  if (!engineAllowed(car, a)) return "engine type you didn't pick";
  const towing = a.mustHaves?.includes("towing") || a.carry?.includes("towing");
  if (towing && car.towKg < 1300) return "can't tow enough";
  if (a.mustHaves?.includes("easyEntry") && !car.easyEntry) return "not easy enough to get in and out";
  if (a.mustHaves?.includes("tall") && !car.tallFriendly) return "too tight for a tall driver";
  if (a.brandsAvoid?.includes(car.make)) return "a brand you want to avoid";
  if (car.powertrain === "ev" && car.rangeKm && dailyKmUpper(a) > car.rangeKm * 0.6)
    return "electric range too short for your daily driving";
  if (a.condition === "new" && !car.soldNew) return "not sold new any more";
  const db = a.dealBreakers ?? [];
  if (db.includes("tax") && motorTax(car, 0) > 400) return "high motor tax";
  if (db.includes("thirsty") && (car.fuelL100 ?? 0) > 6.5 && car.powertrain !== "phev")
    return "uses a lot of fuel";
  if (db.includes("insurance") && car.insuranceGroup > 25) return "expensive to insure";
  if (a.roads === "farm" && car.awd === "no" && car.groundClearance !== "high")
    return "not built for farm lanes and fields";
  return null;
}

// ---------------------------------------------------------------------------
// Choosing the age / source to buy
// ---------------------------------------------------------------------------

export function candidateAges(car: Car, a: Answers): number[] {
  const lo = minAge(car);
  const hi = maxAge(car);
  const ages: number[] = [];
  for (let age = lo; age <= hi; age++) {
    if (a.condition === "new" && age !== 0) continue;
    if (a.condition === "used" && age === 0) continue;
    ages.push(age);
  }
  return ages;
}

function defaultAge(ages: number[], a: Answers): number {
  if (a.condition === "new") return ages[0];
  // A 3-year-old car is a sensible default when we don't know the budget.
  return ages.find((x) => x >= 3) ?? ages[ages.length - 1];
}

export function niEnabled(a: Answers): boolean {
  return a.ni === "yes" || a.ni === "big";
}

/** Finds the best way to buy this car within budget, or null if it doesn't fit. */
export function chooseOption(car: Car, a: Answers, budget?: number): BuyOption | null {
  const ages = candidateAges(car, a);
  if (ages.length === 0) return null;

  if (budget === undefined) {
    const age = defaultAge(ages, a);
    return { source: "ie", age, price: iePrice(car, age), stretch: false };
  }

  const stretchBudget = budget * (1 + CONFIG.budgetStretch);
  const ie = (limit: number) => ages.find((age) => iePrice(car, age) <= limit);

  const ieAge = ie(budget);
  if (ieAge !== undefined) return { source: "ie", age: ieAge, price: iePrice(car, ieAge), stretch: false };

  // Not affordable in the Republic: try Northern Ireland, but only if it's a real saving.
  if (niEnabled(a)) {
    const threshold = niThreshold(a);
    for (const age of ages) {
      if (age > CONFIG.northernIreland.maxAgeYears) break;
      const ni = niLandedCost(car, age, a.county);
      if (ni.total <= budget && ni.saving >= threshold) {
        return { source: "ni", age, price: ni.total, stretch: false, ni };
      }
    }
  }

  const stretchAge = ie(stretchBudget);
  if (stretchAge !== undefined)
    return { source: "ie", age: stretchAge, price: iePrice(car, stretchAge), stretch: true };
  return null;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function insuranceLevel(car: Car, a: Answers): InsuranceLevel {
  const levels: InsuranceLevel[] = ["Low", "Medium", "High", "Very high"];
  let i = car.insuranceGroup <= 12 ? 0 : car.insuranceGroup <= 24 ? 1 : 2;
  const newDriver = a.licence === "learner" || a.licence === "new" || a.ageGroup === "u25";
  if (newDriver) i += 1;
  return levels[Math.min(i, 3)];
}

const DREAM_STYLE: Record<Dream, Style[]> = {
  sports: ["sporty"],
  "4x4": ["rugged"],
  luxury: ["luxurious"],
  ev: ["techy", "eco"],
  classic: ["classic"],
  camper: ["practical"],
  quirky: ["cute"],
};

export function dreamScore(car: Car, dream?: Dream): number {
  if (!dream) return 0;
  let s = 0;
  if (DREAM_STYLE[dream].some((st) => car.styles.includes(st))) s += 50;
  switch (dream) {
    case "sports":
      s += car.fun * 6;
      if (car.body === "sports") s += 20;
      break;
    case "4x4":
      if (car.awd !== "no") s += 30;
      if (car.groundClearance === "high") s += 20;
      break;
    case "luxury":
      s += car.comfort * 6 + (car.serviceClass === "premium" ? 20 : 0);
      break;
    case "ev":
      if (car.powertrain === "ev") s += 40;
      s += car.tech * 2;
      break;
    case "classic":
      s += car.fun * 6;
      break;
    case "camper":
      if (car.body === "mpv" || car.body === "estate") s += 30;
      s += Math.min(20, car.bootL / 40);
      break;
    case "quirky":
      if (car.body === "city" || car.body === "mpv") s += 20;
      s += car.fun * 4;
      break;
  }
  return clamp(s);
}

function weightsFor(a: Answers): Record<Factor, number> {
  const w: Record<Factor, number> = {
    affordability: 1,
    running: 1,
    insurance: 0.5,
    reliability: 1,
    safety: 1,
    space: 1,
    capability: 0.3,
    style: 1,
    comfort: 1,
    tech: 0.7,
    expert: 1,
  };
  const bonus = [2, 1.5, 1, 0.5];
  (a.priorities ?? []).forEach((p, i) => {
    if (i < bonus.length) w[PRIORITY_TO_FACTOR[p]] += bonus[i];
  });
  if (a.fuelImportance === "very") w.running += 1.5;
  if (a.fuelImportance === "somewhat") w.running += 0.5;
  if (a.fuelImportance === "not") w.running *= 0.5;
  if (a.maintenance === "justwork") {
    w.reliability += 1;
    w.expert += 0.5;
  }
  if (a.maintenance === "diy") w.reliability *= 0.7;
  if (a.keep === "long") w.reliability += 0.5;
  if (a.licence === "learner" || a.licence === "new" || a.ageGroup === "u25") w.insurance += 1.5;
  if (a.dealBreakers?.includes("insurance")) w.insurance += 1;
  if ((a.childSeats ?? 0) > 0) w.safety += 0.5;
  if (a.safety && a.safety.length > 0) w.safety += 0.5;
  if (a.passengers === "family" || a.passengers === "big" || (a.carry && a.carry.length > 0)) w.space += 0.5;
  if (a.roads === "farm" || a.roads === "hills" || a.carry?.includes("towing")) w.capability += 1.5;
  if (a.styles && a.styles.length > 0) w.style += 0.5;
  if (a.feel) w.comfort += 0.3;
  if (a.features && a.features.length > 0) w.tech += 0.3;
  return w;
}

function bootNeed(a: Answers): number {
  let need = 280;
  if (a.passengers === "family") need = 400;
  const carry = a.carry ?? [];
  if (carry.includes("buggy")) need = Math.max(need, 420);
  if (carry.includes("dogs")) need = Math.max(need, 520);
  if (carry.includes("diy")) need = Math.max(need, 550);
  return need;
}

function spaceScore(car: Car, a: Answers): number {
  let s: number;
  // 7-seaters have small boots with all seats up; count the 5-seat boot as roughly 2.5x.
  const effectiveBoot = car.seats >= 7 ? car.bootL * 2.5 : car.bootL;
  s = clamp((effectiveBoot / bootNeed(a)) * 100);
  if (a.passengers === "big") s = car.seats >= 7 ? Math.max(s, 90) : s * 0.5;
  if ((a.childSeats ?? 0) >= 3) s = car.seats >= 7 || car.body === "mpv" ? s : s * 0.6;
  // Compact cars suit town driving and tight parking.
  if (a.parking === "tight" || a.driving === "town") {
    const tooLong = Math.max(0, car.lengthMm - 4200) / 10; // -1 point per cm over 4.2 m
    s = s - tooLong * 0.6;
  }
  return clamp(s);
}

function capabilityScore(car: Car, a: Answers): number {
  let s = 70;
  const awd = car.awd === "standard" ? 100 : car.awd === "optional" ? 85 : 30;
  const clearance = car.groundClearance === "high" ? 100 : car.groundClearance === "normal" ? 60 : 20;
  if (a.roads === "farm") s = awd * 0.6 + clearance * 0.4;
  else if (a.roads === "hills" || a.roads === "country") s = 50 + (awd - 30) * 0.3 + (clearance - 60) * 0.3;
  if (a.carry?.includes("towing") || a.mustHaves?.includes("towing")) {
    s = s * 0.5 + clamp((car.towKg / 2000) * 100) * 0.5;
  }
  return clamp(s);
}

function styleScore(car: Car, a: Answers): number {
  let s = 40;
  const styles = a.styles ?? [];
  if (styles.length > 0) {
    const matches = styles.filter((st) => car.styles.includes(st)).length;
    s = 20 + (matches / styles.length) * 70;
  }
  if (a.likedBodies && a.likedBodies.length > 0) {
    s += a.likedBodies.includes(car.body) ? 20 : -10;
  }
  if (a.dream) s += dreamScore(car, a.dream) * 0.15;
  if (a.dealBreakers?.includes("boring")) {
    const exciting = car.styles.some((st) => ["sporty", "sleek", "cute", "techy", "luxurious"].includes(st));
    if (!exciting) s -= 25;
  }
  return clamp(s);
}

function comfortScore(car: Car, a: Answers): number {
  // Small cars are tiring on long motorway and rural drives.
  const longTrips = a.driving === "motorway" || a.driving === "rural" || a.dailyKm === "80-150" || a.dailyKm === "150+";
  const smallPenalty = longTrips && (car.body === "city" || car.body === "supermini") ? 25 : 0;
  return clamp(baseComfort(car, a) - smallPenalty);
}

function baseComfort(car: Car, a: Answers): number {
  switch (a.feel) {
    case "zippy":
      return car.fun * 20;
    case "powerful":
      return clamp((car.powerHp / 250) * 100);
    case "easy":
      return clamp(
        (car.gearbox.includes("auto") ? 50 : 20) + car.comfort * 6 + (car.goodVisibility ? 20 : 0),
      );
    case "comfy":
    default:
      return car.comfort * 20;
  }
}

function techScore(car: Car, a: Answers): number {
  const wanted = (a.features ?? []).filter((f) => f !== "simple");
  if (a.features?.includes("simple") && wanted.length === 0) return clamp(100 - (car.tech - 1) * 15);
  if (wanted.length === 0) return car.tech * 20;
  const got = wanted.reduce((sum, f) => {
    if (car.featuresStd.includes(f)) return sum + 1;
    if (car.featuresOpt.includes(f)) return sum + 0.6;
    return sum;
  }, 0);
  return clamp((got / wanted.length) * 80 + car.tech * 4);
}

function safetyScore(car: Car, a: Answers): number {
  const wanted = (a.safety ?? []).filter((s) => s !== "any");
  let s = car.ncapStars * 18;
  if (wanted.length > 0) {
    const got = wanted.reduce((sum, f) => {
      if (car.safetyStd.includes(f)) return sum + 1;
      if (car.safetyOpt.includes(f)) return sum + 0.5;
      return sum;
    }, 0);
    s = car.ncapStars * 14 + (got / wanted.length) * 30;
  }
  return clamp(s);
}

function affordabilityScore(option: BuyOption, budget?: number): number {
  const fresh = -3 * option.age;
  if (budget === undefined) return clamp(100 - option.price / 800 + fresh);
  // Staying under budget is good, but spending the budget on a better/newer car is fine too.
  const headroom = 1 - option.price / budget;
  return clamp(72 + headroom * 50 + fresh);
}

export function scoreCar(car: Car, option: BuyOption, a: Answers, budget?: number): Scored {
  const annualEnergy = annualEnergyCost(car, a);
  const annualTax = motorTax(car, option.age);
  const service = annualServicing(car, option.age);
  const running = annualEnergy + annualTax;

  const factors: Record<Factor, number> = {
    affordability: affordabilityScore(option, budget),
    running: clamp(100 - (running - 600) / 35),
    insurance: clamp(100 - (car.insuranceGroup - 1) * 2),
    reliability: clamp(car.reliability * 20 - Math.max(0, option.age - 5) * 2),
    safety: safetyScore(car, a),
    space: spaceScore(car, a),
    capability: capabilityScore(car, a),
    style: styleScore(car, a),
    comfort: comfortScore(car, a),
    tech: techScore(car, a),
    expert: car.expertScore * 20,
  };
  const weights = weightsFor(a);

  let total = 0;
  let wsum = 0;
  for (const f of FACTORS) {
    total += factors[f] * weights[f];
    wsum += weights[f];
  }
  let score = total / wsum;

  // Soft penalties and bonuses.
  const db = a.dealBreakers ?? [];
  if (db.includes("big") && car.lengthMm > 4500) score *= 0.8;
  if (db.includes("visibility") && !car.goodVisibility) score *= 0.8;
  if (car.powertrain === "ev" && !hasHomeCharging(a)) score *= 0.88;
  if (a.brandsLove?.includes(car.make)) score = Math.min(100, score * 1.08);
  if (option.stretch) score *= 0.95;

  const resaleAfter5 = iePrice(car, option.age + 5);
  const fiveYearCost = Math.round(option.price - resaleAfter5 + 5 * (running + service));
  const monthlyRepayment = paysMonthly(a) ? totalToMonthly(option.price) : undefined;
  const monthlyTotal = Math.round((monthlyRepayment ?? 0) + (running + service) / 12);

  const scored: Scored = {
    car,
    option,
    score: Math.round(score),
    factors,
    weights,
    annualEnergy,
    annualTax,
    annualServicing: service,
    monthlyRepayment,
    monthlyTotal,
    fiveYearCost,
    insuranceLevel: insuranceLevel(car, a),
    dreamScore: dreamScore(car, a.dream),
    reasons: [],
    headsUp: "",
  };

  if (niEnabled(a)) {
    const ni = option.ni ?? niLandedCost(car, option.age, a.county);
    const threshold = niThreshold(a);
    if (option.age <= CONFIG.northernIreland.maxAgeYears) {
      scored.niCompare = { ...ni, verdict: niVerdict(ni.saving, threshold), threshold };
    }
  }

  scored.reasons = explainReasons(scored, a, budget);
  scored.headsUp = explainHeadsUp(scored, a, budget);
  return scored;
}

// ---------------------------------------------------------------------------
// Explanations: pre-written templates, no AI
// ---------------------------------------------------------------------------

const STYLE_WORDS: Record<Style, string> = {
  sporty: "Sporty",
  rugged: "Rugged",
  luxurious: "Luxurious",
  practical: "Practical",
  eco: "Eco-friendly",
  cute: "Cute",
  classic: "Classic",
  techy: "Techy",
  sleek: "Sleek",
};

function reasonFor(f: Factor, s: Scored, a: Answers, budget?: number): string | null {
  const { car, option } = s;
  switch (f) {
    case "affordability":
      if (budget !== undefined && budget - option.price >= 500)
        return `About ${formatEur(budget - option.price)} under your budget.`;
      return option.age <= 2 ? "Nearly new for the money." : "Good value for what you get.";
    case "running":
      return `Cheap to run: about ${formatEur(s.annualEnergy + s.annualTax)} a year for ${
        car.powertrain === "ev" ? "charging" : "fuel"
      } and motor tax.`;
    case "insurance":
      return `Usually cheap to insure (insurance group ${car.insuranceGroup} of 50).`;
    case "reliability":
      return car.reliability >= 4.5 ? "Excellent reliability record." : "Good reliability record.";
    case "safety":
      return car.ncapStars >= 5
        ? `Top 5-star Euro NCAP safety rating (${car.ncapYear}).`
        : `${car.ncapStars}-star Euro NCAP safety rating.`;
    case "space":
      if (car.seats >= 7) return `Has ${car.seats} seats for the whole crew.`;
      if (car.bootL >= 450) return `Plenty of room: seats ${car.seats} with a big ${car.bootL}-litre boot.`;
      if (s.factors.space >= 85 && (a.passengers === "solo" || a.passengers === "plus1"))
        return car.lengthMm <= 4100 ? "Small and easy to park, with enough room for you." : null;
      return null;
    case "capability":
      if (a.carry?.includes("towing") || a.mustHaves?.includes("towing"))
        return `Can tow up to ${car.towKg.toLocaleString("en-IE")} kg.`;
      if (car.awd !== "no")
        return car.awd === "standard"
          ? "Four-wheel drive and extra ground clearance for rough roads."
          : "Available with four-wheel drive for rough roads.";
      return null;
    case "style": {
      const matches = (a.styles ?? []).filter((st) => car.styles.includes(st));
      if (matches.length > 0)
        return `Matches the ${matches.map((m) => `"${STYLE_WORDS[m]}"`).join(" and ")} look you picked.`;
      if (a.likedBodies?.includes(car.body)) return "The kind of shape you said you liked.";
      return null;
    }
    case "comfort":
      if (a.feel === "zippy") return "Fun and zippy to drive.";
      if (a.feel === "powerful") return `Strong performance (${car.powerHp} hp).`;
      if (a.feel === "easy") return car.gearbox.includes("auto") ? "Easy to drive, with an automatic option." : "Easy and relaxed to drive.";
      return "Comfortable, relaxed ride.";
    case "tech":
      if (a.features?.includes("simple")) return "Simple, easy-to-use controls.";
      return car.featuresStd.includes("carplay")
        ? "Has Apple CarPlay / Android Auto and the tech you wanted."
        : "Has the tech you asked for.";
    case "expert":
      return "Reviewers rate it highly.";
  }
}

function explainReasons(s: Scored, a: Answers, budget?: number): string[] {
  const ranked = FACTORS.map((f) => ({ f, v: s.factors[f] * s.weights[f], raw: s.factors[f] }))
    .filter((x) => x.raw >= 60)
    .sort((x, y) => y.v - x.v);
  const out: string[] = [];
  if (s.option.source === "ni" && s.option.ni) {
    out.push(`Cheaper from Northern Ireland: saves about ${formatEur(s.option.ni.saving)} after VRT and costs.`);
  }
  for (const { f } of ranked) {
    if (out.length >= 3) break;
    const r = reasonFor(f, s, a, budget);
    if (r && !out.includes(r)) out.push(r);
  }
  return out;
}

function explainHeadsUp(s: Scored, a: Answers, budget?: number): string {
  const { car, option } = s;
  if (option.stretch && budget !== undefined)
    return `This is about ${formatEur(option.price - budget)} over your budget.`;
  if (option.source === "ni")
    return "Buying in Northern Ireland means extra paperwork and VRT. Follow the steps below.";
  if (car.powertrain === "ev" && !hasHomeCharging(a))
    return "You'd rely on public chargers, which cost more and take planning.";
  if ((s.insuranceLevel === "High" || s.insuranceLevel === "Very high") &&
      (a.licence === "learner" || a.licence === "new" || a.ageGroup === "u25"))
    return "Insurance could be expensive for a new or young driver. Get quotes first.";
  if ((a.roads === "farm" || a.roads === "hills") && car.awd === "optional")
    return "Look for the four-wheel-drive version: not every one has it.";
  if (car.powertrain === "diesel" && (a.driving === "town" || a.dailyKm === "lt30"))
    return "Diesels suit long drives; lots of short trips can cause costly filter problems.";
  if (needsAuto(a) && car.gearbox.includes("manual"))
    return "Make sure the one you buy has the automatic gearbox.";
  return car.cons[0];
}

// ---------------------------------------------------------------------------
// Shortlist
// ---------------------------------------------------------------------------

const modelKey = (c: Car) => `${c.make} ${c.model}`;

export function recommend(a: Answers, cars: Car[] = CARS): Results {
  const budget = budgetTotal(a);
  const excluded = new Map<string, number>();
  const all: Scored[] = [];

  for (const car of cars) {
    const reason = excludeReason(car, a);
    if (reason) {
      excluded.set(reason, (excluded.get(reason) ?? 0) + 1);
      continue;
    }
    const option = chooseOption(car, a, budget);
    if (!option) {
      excluded.set("over your budget", (excluded.get("over your budget") ?? 0) + 1);
      continue;
    }
    all.push(scoreCar(car, option, a, budget));
  }

  // Best variant per model only.
  const byModel = new Map<string, Scored>();
  for (const s of all) {
    const k = modelKey(s.car);
    const prev = byModel.get(k);
    if (!prev || s.score > prev.score) byModel.set(k, s);
  }
  const ranked = Array.from(byModel.values()).sort((x, y) => y.score - x.score || x.car.id.localeCompare(y.car.id));
  const inBudget = ranked.filter((s) => !s.option.stretch);
  const stretch = ranked.filter((s) => s.option.stretch);

  const picks: Pick[] = [];
  const used = new Set<string>();
  const add = (s: Scored | undefined, role: Role) => {
    if (!s) return;
    used.add(modelKey(s.car));
    picks.push({ ...s, role });
  };
  const free = (s: Scored) => !used.has(modelKey(s.car));

  const best = inBudget[0];
  add(best, "best");

  // When space matters, every pick must actually fit the family and their stuff.
  const spaceMatters =
    a.passengers === "family" || a.passengers === "big" || (a.childSeats ?? 0) > 0 ||
    (a.carry ?? []).some((c) => c !== "shopping");
  const fits = (s: Scored) => !spaceMatters || s.factors.space >= 75;

  if (best) {
    const strong = inBudget.filter((s) => free(s) && fits(s) && s.score >= best.score - 10);
    const value = [...strong].sort((x, y) => x.fiveYearCost - y.fiveYearCost)[0];
    add(value, "value");

    const dreamPool = ranked.filter((s) => free(s) && fits(s) && s.score >= best.score - 25);
    const dreamKey = (s: Scored) =>
      a.dream ? s.dreamScore * 0.75 + s.score * 0.25 : (s.factors.style + s.car.fun * 5) * 0.6 + s.score * 0.4;
    const dream = [...dreamPool].sort((x, y) => dreamKey(y) - dreamKey(x))[0];
    add(dream, "dream");

    const pickedBodies = new Set(picks.map((p) => p.car.body));
    const liked = a.likedBodies ?? [];
    const wildcard = inBudget.find(
      (s) =>
        free(s) &&
        fits(s) &&
        s.score >= best.score - 15 &&
        !pickedBodies.has(s.car.body) &&
        (liked.length === 0 || !liked.includes(s.car.body)),
    );
    add(wildcard, "wildcard");

    if (niEnabled(a)) {
      const niDeal = inBudget.find(
        (s) => free(s) && fits(s) && (s.option.source === "ni" || s.niCompare?.verdict === "worth"),
      );
      if (niDeal) {
        // Show the Northern Ireland purchase as the option on this card.
        const ni = niDeal.option.ni ?? niLandedCost(niDeal.car, niDeal.option.age, a.county);
        const option: BuyOption = { source: "ni", age: niDeal.option.age, price: ni.total, stretch: false, ni };
        add(scoreCar(niDeal.car, option, a, budget), "ni");
      }
    }
  }

  return {
    budget,
    picks,
    stretch: stretch.filter(free).slice(0, 2),
    considered: cars.length,
    excludedReasons: Array.from(excluded.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((x, y) => y.count - x.count),
    ranked,
  };
}

// ---------------------------------------------------------------------------
// Live feedback for the quiz and "Why isn't my car here?"
// ---------------------------------------------------------------------------

/** How many different models still fit the answers so far (within budget, not stretch). */
export function countFits(a: Answers, cars: Car[] = CARS): number {
  const budget = budgetTotal(a);
  const models = new Set<string>();
  for (const car of cars) {
    if (excludeReason(car, a)) continue;
    const option = chooseOption(car, a, budget);
    if (option && !option.stretch) models.add(modelKey(car));
  }
  return models.size;
}

export const TOTAL_MODELS = new Set(CARS.map(modelKey)).size;

export interface FixSuggestion {
  label: string;
  patch: Partial<Answers>;
  count: number;
}

/** When nothing fits, find the smallest single change that brings cars back. */
export function suggestFix(a: Answers, cars: Car[] = CARS): FixSuggestion | null {
  const tries: { label: string; patch: Partial<Answers> }[] = [];
  if (a.budget && !a.budgetUnknown) {
    const monthly = paysMonthly(a);
    const step = monthly ? 25 : 500;
    const label = (nb: number) => `Raise your budget to ${formatEur(nb)}${monthly ? " a month" : ""}`;
    for (const f of [1.2, 1.5, 2]) {
      const nb = Math.ceil((a.budget * f) / step) * step;
      tries.push({ label: label(nb), patch: { budget: nb } });
    }
    // Otherwise: the smallest budget that brings back at least one car.
    const prices = cars
      .filter((c) => !excludeReason(c, a))
      .flatMap((c) => candidateAges(c, a).map((age) => iePrice(c, age)));
    if (prices.length) {
      const need = Math.min(...prices);
      const nb = Math.ceil((monthly ? totalToMonthly(need) + 1 : need) / step) * step;
      tries.push({ label: label(nb), patch: { budget: nb } });
    }
  }
  if (a.condition === "new") tries.push({ label: "Include used cars", patch: { condition: "either" } });
  if (a.ni === "no" || !a.ni) tries.push({ label: "Include cars from Northern Ireland", patch: { ni: "yes" } });
  if (a.engines && a.engines.length > 0) tries.push({ label: "Be open to any engine type", patch: { engines: [] } });
  for (const m of a.mustHaves ?? []) {
    tries.push({ label: `Drop the must-have "${MUST_HAVE_WORDS[m]}"`, patch: { mustHaves: (a.mustHaves ?? []).filter((x) => x !== m) } });
  }
  for (const d of a.dealBreakers ?? []) {
    tries.push({ label: `Allow "${DEAL_BREAKER_WORDS[d]}"`, patch: { dealBreakers: (a.dealBreakers ?? []).filter((x) => x !== d) } });
  }
  for (const t of tries) {
    const count = countFits({ ...a, ...t.patch }, cars);
    if (count > 0) return { ...t, count };
  }
  return null;
}

const MUST_HAVE_WORDS: Record<string, string> = {
  auto: "automatic gearbox", seven: "7 seats", tall: "room for a tall driver",
  easyEntry: "easy to get in and out", towing: "towing", manual: "manual gearbox",
};
const DEAL_BREAKER_WORDS: Record<string, string> = {
  big: "too big to park", tax: "high motor tax", thirsty: "uses a lot of fuel",
  insurance: "expensive insurance", boring: "looks boring", visibility: "hard to see out of",
};

export interface MissingExplanation {
  car: Car;
  status: "excluded" | "budget" | "stretch" | "ranked";
  message: string;
  rank?: number;
}

/** Plain answer to "Why isn't this car in my shortlist?" */
export function explainMissing(carId: string, a: Answers, cars: Car[] = CARS): MissingExplanation | null {
  const variants = cars.filter((c) => c.id === carId || modelKey(c) === carId);
  const car = variants[0];
  if (!car) return null;
  const name = modelKey(car);
  const reasons = variants.map((v) => excludeReason(v, a));
  if (reasons.every(Boolean)) {
    return { car, status: "excluded", message: `The ${name} is left out: ${reasons[0]}.` };
  }
  const budget = budgetTotal(a);
  const usable = variants.filter((v, i) => !reasons[i]);
  const options = usable.map((v) => chooseOption(v, a, budget));
  if (options.every((o) => o === null)) {
    const cheapest = Math.min(...usable.map((v) => iePrice(v, Math.max(...candidateAges(v, a), 0))));
    return {
      car,
      status: "budget",
      message: `The ${name} is over your budget: even an older one costs about ${formatEur(cheapest)}${
        budget !== undefined ? `, about ${formatEur(cheapest - budget)} more than you said` : ""
      }.`,
    };
  }
  if (options.every((o) => o === null || o.stretch)) {
    const o = options.find(Boolean)!;
    return {
      car,
      status: "stretch",
      message: `The ${name} is just over your budget (about ${formatEur(o.price)}). It's in "Just over your budget".`,
    };
  }
  const r = recommend(a, cars);
  const rank = r.ranked.findIndex((s) => modelKey(s.car) === name) + 1;
  const scored = r.ranked[rank - 1];
  return {
    car,
    status: "ranked",
    rank,
    message: `The ${name} fits your answers: it's number ${rank} of ${r.ranked.length} with a ${scored.score}% match. Other cars scored a little higher on what you said matters most.`,
  };
}

// ---------------------------------------------------------------------------
// Short descriptions and single-car scoring (car page, compare)
// ---------------------------------------------------------------------------

const FACTOR_ADJ: Record<Factor, string> = {
  affordability: "good-value",
  running: "cheap-to-run",
  insurance: "cheap-to-insure",
  reliability: "reliable",
  safety: "very safe",
  space: "roomy",
  capability: "go-anywhere",
  style: "stylish",
  comfort: "comfortable",
  tech: "well-equipped",
  expert: "highly rated",
};

const BODY_WORDS: Record<Car["body"], string> = {
  city: "city car",
  supermini: "small hatchback",
  hatchback: "family hatchback",
  saloon: "saloon",
  estate: "estate",
  crossover: "small SUV",
  suv: "SUV",
  mpv: "people carrier",
  sports: "sports car",
};

const POWER_WORDS: Record<Car["powertrain"], string> = {
  petrol: "petrol",
  diesel: "diesel",
  hybrid: "hybrid",
  phev: "plug-in hybrid",
  ev: "electric",
};

/** One plain sentence, e.g. "A reliable, cheap-to-run hybrid family hatchback." */
export function tagline(s: Scored): string {
  const top = FACTORS.filter((f) => s.factors[f] >= 70)
    .sort((x, y) => s.factors[y] * s.weights[y] - s.factors[x] * s.weights[x])
    .slice(0, 2)
    .map((f) => FACTOR_ADJ[f]);
  const adj = top.length ? `${top.join(", ")} ` : "";
  const article = /^[aeiou]/i.test(adj || POWER_WORDS[s.car.powertrain]) ? "An" : "A";
  return `${article} ${adj}${POWER_WORDS[s.car.powertrain]} ${BODY_WORDS[s.car.body]}.`;
}

/**
 * Scores one car against the answers, even if it isn't in the shortlist
 * (uses the closest option: in budget, a stretch, or a typical age).
 */
export function scoreOne(carId: string, a: Answers, cars: Car[] = CARS): { scored: Scored; excluded: string | null } | null {
  const car = cars.find((c) => c.id === carId);
  if (!car) return null;
  const budget = budgetTotal(a);
  const excluded = excludeReason(car, a);
  let option = chooseOption(car, a, budget);
  if (!option) {
    const ages = candidateAges(car, a).length ? candidateAges(car, a) : [Math.max(minAge(car), 3)];
    const age = ages[ages.length - 1];
    option = { source: "ie", age, price: iePrice(car, age), stretch: true };
  }
  return { scored: scoreCar(car, option, a, budget), excluded };
}
