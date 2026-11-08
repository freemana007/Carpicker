// Irish cost calculations: prices, VRT, motor tax, running costs and the
// Northern Ireland "landed cost". All rates come from config/ireland-costs.json.

import COSTS from "@/config/ireland-costs.json";
import { kmToNi } from "@/config/counties";
import type { Answers, Car } from "./types";

export const CONFIG = COSTS;
export const CURRENT_YEAR = COSTS.currentYear;

const round = (n: number, to = 1) => Math.round(n / to) * to;

// ---------- Prices ----------

/** Oldest age (in years) we price for this car. */
export function maxAge(car: Car): number {
  return Math.min(COSTS.maxCarAgeYears, CURRENT_YEAR - car.yearFrom);
}

/** Youngest available age: 0 if sold new, else years since it stopped being sold. */
export function minAge(car: Car): number {
  if (car.soldNew) return 0;
  return Math.max(1, CURRENT_YEAR - (car.yearTo ?? CURRENT_YEAR));
}

/** Typical price in the Republic (€) for this car at a given age. */
export function iePrice(car: Car, age: number): number {
  const curve = COSTS.depreciation[car.retention];
  const factor = curve[Math.min(age, curve.length - 1)];
  return round(car.refPriceEur * factor, 50);
}

/** Typical price in Northern Ireland (£) for this car at a given age. */
export function niPriceGbp(car: Car, age: number): number {
  const factor =
    age === 0 ? COSTS.northernIreland.newPriceFactor : COSTS.northernIreland.usedPriceFactor;
  return round((iePrice(car, age) * factor) / COSTS.exchange.eurPerGbp, 50);
}

// ---------- VRT ----------

function vrtBand(co2: number) {
  return COSTS.vrt.bands.find((b) => co2 <= b.maxCo2)!;
}

export function vrtRate(co2: number): number {
  return vrtBand(co2).rate;
}

/** NOx levy in tiers (Revenue). No cap: the flat amounts only apply without NOx evidence. */
export function noxLevy(nox: number): number {
  let levy = 0;
  let prev = 0;
  for (const tier of COSTS.vrt.noxLevy.tiers) {
    const inTier = Math.max(0, Math.min(nox, tier.upToMg) - prev);
    levy += inTier * tier.eurPerMg;
    prev = tier.upToMg;
    if (nox <= tier.upToMg) break;
  }
  return round(levy);
}

/** Flat NOx charge Revenue applies when there's no satisfactory evidence of NOx. */
export function noxNoEvidenceCharge(car: Car): number {
  if (car.powertrain === "ev") return 0;
  return car.powertrain === "diesel"
    ? COSTS.vrt.noxLevy.noEvidenceDieselEur
    : COSTS.vrt.noxLevy.noEvidenceOtherEur;
}

/** VRT relief for electric cars: full up to €40k OMSP, reduced to zero at €50k, ends after 2026. */
export function evRelief(car: Car, omsp: number, co2Part: number): number {
  const r = COSTS.vrt.evRelief;
  if (car.powertrain !== "ev") return 0;
  if (CURRENT_YEAR > Number(r.endsAfter.slice(0, 4))) return 0;
  if (omsp >= r.noReliefFromOmspEur) return 0;
  let max = r.maxReliefEur;
  if (omsp > r.fullReliefMaxOmspEur) {
    max *= (r.noReliefFromOmspEur - omsp) / (r.noReliefFromOmspEur - r.fullReliefMaxOmspEur);
  }
  return Math.min(co2Part, max);
}

export interface VrtEstimate {
  omsp: number;
  rate: number;
  co2Part: number;
  noxPart: number;
  evRelief: number;
  total: number;
  /** Charge instead of the NOx levy if you can't prove the car's NOx figure. */
  noxIfNoEvidence: number;
}

/** Estimate VRT. OMSP (Revenue's "open market selling price") is estimated from the Republic price. */
export function estimateVrt(car: Car, omsp: number): VrtEstimate {
  const band = vrtBand(car.co2);
  const co2Part = Math.max(omsp * band.rate, band.minEur);
  const noxPart = car.powertrain === "ev" ? 0 : noxLevy(car.nox);
  const relief = evRelief(car, omsp, co2Part);
  const total = Math.max(0, co2Part - relief + noxPart);
  return {
    omsp,
    rate: band.rate,
    co2Part: round(co2Part),
    noxPart,
    evRelief: round(relief),
    total: round(total, 10),
    noxIfNoEvidence: noxNoEvidenceCharge(car),
  };
}

// ---------- Motor tax ----------

/** Revenue's NEDC -> WLTP formula, reversed, to estimate an older car's NEDC figure. */
export function wltpToNedc(car: Car): number {
  const f = car.powertrain === "diesel" ? COSTS.vrt.nedcToWltp.diesel : COSTS.vrt.nedcToWltp.other;
  return Math.max(0, (car.co2 - f.add) / f.multiply);
}

export function motorTax(car: Car, age: number): number {
  const firstRegYear = CURRENT_YEAR - age;
  if (firstRegYear >= COSTS.motorTax.wltpFromYear) {
    return COSTS.motorTax.wltp.find((b) => car.co2 <= b.maxCo2)!.eur;
  }
  const nedc = car.powertrain === "ev" ? 0 : Math.round(wltpToNedc(car));
  return COSTS.motorTax.nedc.find((b) => nedc <= b.maxCo2)!.eur;
}

// ---------- Running costs ----------

export function annualKm(a: Answers): number {
  return a.dailyKm ? COSTS.annualKm[a.dailyKm] : COSTS.annualKm.default;
}

export function hasHomeCharging(a: Answers): boolean {
  return a.parking === "driveway";
}

export function annualEnergyCost(car: Car, a: Answers): number {
  const km = annualKm(a);
  const e = COSTS.energy;
  const home = hasHomeCharging(a);
  const fuelPrice = car.powertrain === "diesel" ? e.dieselEurPerL : e.petrolEurPerL;
  const kwhPrice = (publicShare: number) =>
    publicShare * e.publicChargingEurPerKwh + (1 - publicShare) * e.homeElectricityEurPerKwh;

  if (car.powertrain === "ev") {
    const price = kwhPrice(home ? e.evPublicShareHome : 1);
    return round((km / 100) * (car.kwh100 ?? 17) * price, 10);
  }
  if (car.powertrain === "phev") {
    const elecShare = home ? e.phevElectricShareHome : e.phevElectricShareNoHome;
    const elec = (km * elecShare / 100) * (car.kwh100 ?? 20) * kwhPrice(home ? 0 : 1);
    const fuel = (km * (1 - elecShare) / 100) * (car.fuelL100 ?? 6.5) * fuelPrice;
    return round(elec + fuel, 10);
  }
  return round((km / 100) * (car.fuelL100 ?? 6) * fuelPrice, 10);
}

export function annualServicing(car: Car, age: number): number {
  const base = COSTS.servicingEurPerYear[car.serviceClass];
  // Older cars cost more to keep going.
  const ageFactor = 1 + Math.max(0, age - 3) * 0.06;
  const nct = age >= COSTS.importFees.nctAgeYears ? COSTS.importFees.nctFeeEur / (age >= 10 ? 1 : 2) : 0;
  return round(base * ageFactor + nct, 10);
}

// ---------- Loans & budget ----------

function loanFactor(): number {
  const r = COSTS.loan.apr / 12;
  const n = COSTS.loan.months;
  return (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function monthlyToTotal(monthly: number): number {
  return round(monthly / loanFactor(), 100);
}

export function totalToMonthly(total: number): number {
  return round(total * loanFactor());
}

export function paysMonthly(a: Answers): boolean {
  return a.payMethod === "loan" || a.payMethod === "finance";
}

/** Budget as a total purchase price in €, or undefined if we don't know it. */
export function budgetTotal(a: Answers): number | undefined {
  if (a.budget && !a.budgetUnknown) {
    return paysMonthly(a) ? monthlyToTotal(a.budget) : a.budget;
  }
  if (a.takeHome) {
    const monthly = COSTS.takeHomeMidpoints[a.takeHome] * COSTS.budgetRule.shareOfTakeHome;
    return monthlyToTotal(monthly);
  }
  return undefined;
}

/** Suggested monthly car budget from take-home pay. */
export function suggestedMonthly(a: Answers): number | undefined {
  if (!a.takeHome) return undefined;
  return round(COSTS.takeHomeMidpoints[a.takeHome] * COSTS.budgetRule.shareOfTakeHome, 10);
}

// ---------- Northern Ireland landed cost ----------

export interface CostLine {
  label: string;
  eur: number;
  note?: string;
}

export interface NiLandedCost {
  age: number;
  isNew: boolean;
  priceGbp: number;
  priceEur: number;
  lines: CostLine[];
  vrt: VrtEstimate;
  total: number;
  /** Price of a similar car bought in the Republic. */
  iePrice: number;
  saving: number;
  needsNct: boolean;
  nearestNiTown?: string;
  kmToNi: number;
}

export function niLandedCost(car: Car, age: number, county?: string): NiLandedCost {
  const isNew = age === 0;
  const priceGbp = niPriceGbp(car, age);
  const lines: CostLine[] = [];

  // New cars: the NI dealer should zero-rate UK VAT, and Irish VAT is paid instead.
  let priceEur = round(priceGbp * COSTS.exchange.eurPerGbp);
  if (isNew) priceEur = round(priceEur / (1 + COSTS.vat.ukRate));
  lines.push({
    label: isNew ? `Car price (£${priceGbp.toLocaleString("en-IE")} less UK VAT)` : `Car price (£${priceGbp.toLocaleString("en-IE")})`,
    eur: priceEur,
    note: `At about €${COSTS.exchange.eurPerGbp.toFixed(2)} per £1`,
  });

  const fees = round(priceEur * COSTS.exchange.defaultFeePct);
  lines.push({ label: "Currency fees", eur: fees, note: "About 1% by bank transfer. Card payments cost more." });

  const km = kmToNi(county);
  const travel = round(km * 2 * COSTS.travel.costPerKm + COSTS.travel.fixedEur, 10);
  lines.push({ label: "Travel to collect it", eur: travel, note: `About ${km} km each way` });

  lines.push({ label: "History checks (UK + Irish)", eur: COSTS.importFees.historyChecksEur });

  const ie = iePrice(car, age);
  const vrt = estimateVrt(car, ie);
  lines.push({ label: "VRT (estimate)", eur: vrt.total, note: "Check the exact figure on Revenue's VRT calculator" });

  if (isNew) {
    const vat = round(priceEur * COSTS.vat.irishRate);
    lines.push({ label: "Irish VAT (new car, 23%)", eur: vat, note: "Paid when you register the car" });
  }

  lines.push({ label: "Irish number plates", eur: COSTS.importFees.platesEur });

  const needsNct = age >= COSTS.importFees.nctAgeYears;
  lines.push({
    label: "NCT",
    eur: needsNct ? COSTS.importFees.nctFeeEur : 0,
    note: needsNct ? "Needed because the car is 4+ years old" : "Not needed yet (under 4 years old)",
  });

  const total = lines.reduce((s, l) => s + l.eur, 0);
  return {
    age,
    isNew,
    priceGbp,
    priceEur,
    lines,
    vrt,
    total,
    iePrice: ie,
    saving: ie - total,
    needsNct,
    kmToNi: km,
  };
}

export function niThreshold(a: Answers): number {
  return a.ni === "big"
    ? COSTS.northernIreland.bigSavingThresholdEur
    : COSTS.northernIreland.savingThresholdEur;
}

export type NiVerdict = "worth" | "small" | "more";

export function niVerdict(saving: number, threshold: number): NiVerdict {
  if (saving >= threshold) return "worth";
  if (saving > 0) return "small";
  return "more";
}

export function formatEur(n: number): string {
  return "€" + Math.round(n).toLocaleString("en-IE");
}

export function modelYear(age: number): number {
  return CURRENT_YEAR - age;
}
