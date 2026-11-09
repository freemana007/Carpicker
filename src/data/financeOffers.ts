// 0% finance offers from car brands in Ireland.
//
// ⚠️ These change every month. Each offer was read from the brand's own Irish
// website on the date in `checked`, and is hidden automatically after `validUntil`.
// Update this file at least monthly (see DATA.md).
//
// Offers are for NEW cars only, through the brand's own finance company,
// subject to approval, with a minimum deposit.

import type { Car } from "@/lib/types";

export interface FinanceOffer {
  brand: string;
  /** Models as the brand names them. */
  models: string[];
  /** Our car records the offer applies to (matched by model). */
  appliesTo: string[];
  type: "HP" | "PCP" | "HP and PCP";
  /** Extra detail, e.g. which models get 0% on PCP as well. */
  detail: string;
  termMonths?: number;
  minDepositPct?: number;
  /** Plain-English dates from the brand's terms. */
  dates: string;
  /** Last day the offer can be used (ISO date); hidden after this. null = no end date given. */
  validUntil: string | null;
  source: string;
  checked: string;
}

export const OFFERS_CHECKED = "2026-11-09";

export const FINANCE_OFFERS: FinanceOffer[] = [
  {
    brand: "Volkswagen",
    models: ["Golf", "ID.4", "ID.7", "ID.7 Tourer", "Passat", "T-Cross", "T-Roc", "Tiguan", "Tayron"],
    appliesTo: ["vw-golf-tsi", "vw-golf-tdi", "vw-tiguan-tdi", "vw-id4"],
    type: "HP and PCP",
    detail:
      "0% HP on all of these. 0% PCP too on the Golf, ID.4, ID.7, ID.7 Tourer, T-Roc, Tiguan and Tayron (the Passat and T-Cross PCP rates are higher).",
    dates: "New orders from 15 October to 20 November 2026, registered by 28 February 2027.",
    validUntil: "2026-11-20",
    source: "https://www.volkswagen.ie/en/offers-and-products.html",
    checked: "2026-11-09",
  },
  {
    brand: "Skoda",
    models: ["Kamiq", "Kodiaq", "Octavia", "Scala"],
    appliesTo: ["skoda-octavia-tsi", "skoda-octavia-combi-tdi", "skoda-kodiaq-tdi"],
    type: "PCP",
    detail: "0% APR PCP over 36 months. Other Skoda models have low-rate offers instead (Elroq and Enyaq Coupé 1.9%, Epiq 2.9%, Peaq 4.9%).",
    termMonths: 36,
    minDepositPct: 31,
    dates: "Orders from 10 September 2026, registered between 1 January and 28 February 2027.",
    validUntil: "2027-02-28",
    source: "https://www.skoda.ie/finance-offers",
    checked: "2026-11-09",
  },
  {
    brand: "Nissan",
    models: ["Micra (new electric)"],
    appliesTo: [],
    type: "HP",
    detail: "0% HP over 60 months on the all-new electric Micra. Other Nissans are on 4.9% finance offers.",
    termMonths: 60,
    minDepositPct: 30,
    dates: "For 271 registrations (January–June 2027). No end date shown.",
    validUntil: "2027-06-30",
    source: "https://www.nissan.ie/vehicles/offers/micra-zero-finance.html",
    checked: "2026-11-09",
  },
];

/** Brands we looked at but couldn't confirm, and why. */
export const OFFERS_NOT_CONFIRMED: { brand: string; reason: string }[] = [
  { brand: "MG", reason: "Its site still shows 0% APR PCP, but the terms say the offer ended on 18 September 2026." },
  { brand: "Toyota, Hyundai, Mazda, Mercedes-Benz, Renault, Dacia, Land Rover", reason: "No 0% offer found on their offers pages (some load offers in a way we couldn't read)." },
  { brand: "Kia, Ford, BMW, MINI, Citroën, Peugeot, Fiat, Honda, Tesla, Volvo, Suzuki", reason: "Their sites blocked or timed out our check. Look at their offers pages directly." },
];

function isLive(o: FinanceOffer, today: string): boolean {
  return o.validUntil === null || today <= o.validUntil;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Live 0% offers. Pass `today` (YYYY-MM-DD) for testing. */
export function liveOffers(today: string = todayIso()): FinanceOffer[] {
  return FINANCE_OFFERS.filter((o) => isLive(o, today));
}

/** The live 0% offer for this car, if any. Offers are for new cars only. */
export function offerFor(car: Car, today: string = todayIso()): FinanceOffer | undefined {
  return liveOffers(today).find((o) => o.appliesTo.includes(car.id));
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
}
