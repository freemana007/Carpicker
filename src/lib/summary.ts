// "About you": what the app understood, in plain sentences (Norman: show the model).
// Each line links to the question that set it, so it can be changed in place.

import { formatEur, monthlyToTotal, paysMonthly } from "./costs";
import { BODY_LABELS, PRIORITY_LABELS } from "./questions";
import type { Answers } from "./types";

export interface SummaryLine {
  label: string;
  text: string;
  /** Quiz question id to edit this. */
  qid: string;
}

const PAY = { cash: "cash", loan: "a credit union or bank loan", finance: "dealer finance", unsure: "not sure yet" } as const;
const PASSENGERS = { solo: "Just you", plus1: "You + 1", family: "Small family (3–4)", big: "Big family or lifts (5–7)" } as const;
const DRIVING = { town: "Mostly short town trips", mixed: "A mix of driving", motorway: "Lots of motorway", rural: "Rural roads and long distances" } as const;
const DAILY = { lt30: "under 30 km a day", "30-80": "30–80 km a day", "80-150": "80–150 km a day", "150+": "over 150 km a day" } as const;
const ENGINE = { ev: "electric", hybrid: "hybrid", petrol: "petrol", diesel: "diesel" } as const;
const STYLE = {
  sporty: "sporty", rugged: "rugged", luxurious: "luxurious", practical: "practical", eco: "eco-friendly",
  cute: "cute", classic: "classic", techy: "techy", sleek: "sleek",
} as const;
const MUST = { auto: "automatic", seven: "7 seats", tall: "room for a tall driver", easyEntry: "easy to get in and out", towing: "towing", manual: "manual" } as const;
const NO = { big: "too big to park", tax: "high motor tax", thirsty: "thirsty", insurance: "expensive insurance", boring: "boring looks", visibility: "poor visibility" } as const;
const PARKING = { driveway: "your own driveway", street: "on the street", apartment: "an apartment car park", tight: "tight city spaces" } as const;

export function aboutYou(a: Answers): SummaryLine[] {
  const lines: SummaryLine[] = [];
  if (a.budgetUnknown) {
    lines.push({ label: "Budget", text: "Not sure: we suggested one from your pay", qid: "A2" });
  } else if (a.budget) {
    lines.push({
      label: "Budget",
      text: paysMonthly(a)
        ? `Up to ${formatEur(a.budget)} a month (a car around ${formatEur(monthlyToTotal(a.budget))})`
        : `Up to ${formatEur(a.budget)}${a.payMethod ? ` by ${PAY[a.payMethod]}` : ""}`,
      qid: "A2",
    });
  }
  if (a.condition) lines.push({ label: "New or used", text: a.condition === "either" ? "Either, best value" : a.condition === "new" ? "New" : "Used", qid: "A4" });
  if (a.ni) lines.push({ label: "Northern Ireland", text: a.ni === "no" ? "Republic only" : a.ni === "big" ? "Only if it saves a lot" : "Open to it", qid: "A5" });
  if (a.licence) {
    const lic = a.licence === "learner" ? "Learner permit" : a.licence === "new" ? "Newly qualified" : "Full licence";
    lines.push({ label: "Licence", text: a.autoOnly === "yes" ? `${lic}, automatic only` : lic, qid: "B1" });
  }
  if (a.driving || a.dailyKm) {
    lines.push({
      label: "Driving",
      text: [a.driving && DRIVING[a.driving], a.dailyKm && DAILY[a.dailyKm]].filter(Boolean).join(", "),
      qid: a.driving ? "C4" : "C5",
    });
  }
  if (a.county) lines.push({ label: "County", text: a.county, qid: "C8" });
  if (a.passengers) {
    const seats = a.childSeats ? `, ${a.childSeats} child seat${a.childSeats > 1 ? "s" : ""}` : "";
    lines.push({ label: "Who's coming", text: `${PASSENGERS[a.passengers]}${seats}`, qid: "C1" });
  }
  if (a.parking) lines.push({ label: "Parking", text: `At night: ${PARKING[a.parking]}`, qid: "C6" });
  if (a.engines?.length) lines.push({ label: "Engines", text: a.engines.map((e) => ENGINE[e]).join(", "), qid: "D2" });
  if (a.styles?.length) lines.push({ label: "You love", text: a.styles.map((s) => STYLE[s]).join(", "), qid: "E1" });
  if (a.likedBodies?.length) lines.push({ label: "Shapes", text: a.likedBodies.map((b) => BODY_LABELS[b].toLowerCase()).join(", "), qid: "E2" });
  if (a.mustHaves?.length || a.dealBreakers?.length) {
    const parts = [
      a.mustHaves?.length ? `Must have: ${a.mustHaves.map((m) => MUST[m]).join(", ")}` : "",
      a.dealBreakers?.length ? `No: ${a.dealBreakers.map((d) => NO[d]).join(", ")}` : "",
    ].filter(Boolean);
    lines.push({ label: "Needs", text: parts.join(". "), qid: "F1" });
  }
  if (a.priorities?.length) {
    lines.push({ label: "Matters most", text: a.priorities.slice(0, 3).map((p) => PRIORITY_LABELS[p]).join(", then "), qid: "G1" });
  }
  return lines;
}
