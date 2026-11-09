// The fixed quiz: every question, answer option and skip rule.

import type { Answers, BodyType, Priority } from "./types";

export type QuestionKind = "single" | "multi" | "budget" | "ranking" | "county" | "brands" | "bodies" | "needs";

export interface Option {
  value: string;
  label: string;
  description?: string;
  /** Name of a lucide icon (see components/ui/icons.tsx). */
  icon?: string;
}

export interface Question {
  id: string;
  /** Answer field this question fills. */
  field: keyof Answers;
  /** Chapter title (see CHAPTERS). */
  section: string;
  kind: QuestionKind;
  title: string;
  /** "Why we ask" hint shown under the question. */
  hint?: string;
  options?: Option[];
  maxSelect?: number;
  /** For "needs": the deal-breaker options. */
  noOptions?: Option[];
  /** Optional explainer, opened from a "What do these mean?" link. */
  explainer?: { title: string; body: string[] };
  /** Included in quick mode. */
  quick?: boolean;
  optional?: boolean;
  showIf?: (a: Answers) => boolean;
}

export interface Chapter {
  title: string;
  /** One-line reason shown on the chapter's intro card. */
  intro: string;
  /** lucide icon name. */
  icon: string;
}

export const CHAPTERS: Chapter[] = [
  { title: "Money", intro: "Let's start with what you'd like to spend. No judgement, any budget works.", icon: "Wallet" },
  { title: "You & your driving", intro: "A bit about you and the roads you drive, so the car suits your days.", icon: "Route" },
  { title: "Your everyday life", intro: "Who and what comes along for the ride.", icon: "UsersRound" },
  { title: "What you love", intro: "The fun part. Go with your gut.", icon: "Heart" },
  { title: "What matters most", intro: "Nearly done. Tell us what's essential and what matters most.", icon: "ListOrdered" },
];

/** Kept for older code: chapter titles in order. */
export const SECTIONS = CHAPTERS.map((c) => c.title);

export const PRIORITY_LABELS: Record<Priority, string> = {
  price: "Price",
  reliability: "Reliability",
  safety: "Safety",
  running: "Fuel & tax costs",
  space: "Space",
  style: "Fun & style",
  comfort: "Comfort",
  tech: "Tech",
};

export const DEFAULT_PRIORITIES: Priority[] = [
  "price",
  "reliability",
  "safety",
  "running",
  "space",
  "comfort",
  "style",
  "tech",
];

export const BODY_LABELS: Record<BodyType, string> = {
  city: "Tiny city car",
  supermini: "Small hatchback",
  hatchback: "Family hatchback",
  saloon: "Saloon",
  estate: "Estate",
  crossover: "Small SUV",
  suv: "Big SUV",
  mpv: "People carrier",
  sports: "Sports car",
};

export const QUESTIONS: Question[] = [
  {
    id: "A1",
    field: "payMethod",
    section: "Money",
    kind: "single",
    quick: true,
    title: "How would you like to pay?",
    hint: "This decides whether we ask for a total price or a monthly amount.",
    options: [
      { value: "cash", label: "Cash / savings", icon: "Banknote" },
      { value: "loan", label: "Credit union or bank loan", icon: "Landmark" },
      { value: "finance", label: "Dealer finance (PCP or hire purchase)", icon: "FileSignature" },
      { value: "unsure", label: "Not sure yet", icon: "HelpCircle" },
    ],
    explainer: {
      title: "Ways to pay for a car",
      body: [
        "Cash: you pay the full price up front. Simplest, and you can often haggle a little.",
        "Credit union or bank loan: you borrow the money and own the car straight away. You pay it back monthly, usually over 3–5 years.",
        "Hire purchase (HP): dealer finance where you pay monthly and own the car after the last payment.",
        "PCP: lower monthly payments, but at the end there's a big 'balloon payment' if you want to keep the car. Otherwise you hand it back or trade it in. You don't own the car until you pay that.",
        "Some brands offer 0% finance on new cars at the moment: see the 0% finance page from the menu.",
        "Northern Ireland dealers usually can't offer finance to people living in the Republic, so cash or a loan works best there.",
      ],
    },
  },
  {
    id: "A2",
    field: "budget",
    section: "Money",
    kind: "budget",
    quick: true,
    title: "What's the most you'd be comfortable spending?",
    hint: "We'll only show cars that fit. Cars just over budget are shown separately.",
  },
  {
    id: "A3",
    field: "takeHome",
    section: "Money",
    kind: "single",
    optional: true,
    title: "Roughly what's your take-home pay per month?",
    hint: "We'll suggest a budget of about 12% of your take-home pay. This stays on your device.",
    showIf: (a) => !!a.budgetUnknown,
    options: [
      { value: "lt2000", label: "Under €2,000" },
      { value: "2000-3000", label: "€2,000 – €3,000" },
      { value: "3000-4000", label: "€3,000 – €4,000" },
      { value: "4000-5500", label: "€4,000 – €5,500" },
      { value: "5500+", label: "Over €5,500" },
    ],
  },
  {
    id: "A4",
    field: "condition",
    section: "Money",
    kind: "single",
    title: "New, used, or either?",
    hint: "A 2–4-year-old car is often the best value: someone else has paid for the biggest drop in value.",
    options: [
      { value: "new", label: "New", icon: "Sparkles" },
      { value: "used", label: "Used", icon: "Repeat" },
      { value: "either", label: "Either, show me the best value", icon: "Scale" },
    ],
    explainer: {
      title: "Reading Irish number plates",
      body: [
        "The first numbers on an Irish plate show the year and half-year the car was first registered.",
        "For example, 231 means registered January–June 2023, and 232 means July–December 2023.",
        "Imported cars get a plate for the year they were first registered anywhere, not the year they came to Ireland.",
      ],
    },
  },
  {
    id: "A5",
    field: "ni",
    section: "Money",
    kind: "single",
    quick: true,
    title: "Would you consider buying a car in Northern Ireland?",
    hint: "Cars there are often cheaper, but you pay VRT and need some paperwork. We'll do the maths for you.",
    options: [
      { value: "yes", label: "Yes, show me", icon: "ThumbsUp" },
      { value: "big", label: "Only if it saves a lot", icon: "PiggyBank" },
      { value: "no", label: "No, Republic only", icon: "MapPin" },
    ],
    explainer: {
      title: "What buying in Northern Ireland involves",
      body: [
        "Used cars in Northern Ireland are often cheaper because their prices don't include VRT (Vehicle Registration Tax).",
        "When you bring the car home you must book a VRT appointment with NCTS within 7 days, and pay VRT within 30 days.",
        "VRT can be thousands of euro, and it can wipe out the saving. We add it up for you and only suggest a Northern Ireland car if it's still cheaper.",
        "You'll also need to travel to collect the car, run history checks, and get Irish number plates.",
      ],
    },
  },
  {
    id: "B1",
    field: "licence",
    section: "You & your driving",
    kind: "single",
    title: "What licence do you have?",
    hint: "Insurance in Ireland costs much more for learner and new drivers (and anyone under 25), so we'll favour cars that are cheaper to insure.",
    options: [
      { value: "learner", label: "Learner permit", icon: "GraduationCap" },
      { value: "new", label: "Full licence, under 2 years", icon: "BadgePlus" },
      { value: "full", label: "Full licence, 2+ years", icon: "IdCard" },
    ],
  },
  {
    id: "B2",
    field: "autoOnly",
    section: "You & your driving",
    kind: "single",
    quick: true,
    title: "Is your licence for automatic cars only?",
    hint: "If you passed your test in an automatic, your licence has code 78 and you can only drive automatics.",
    showIf: (a) => a.licence !== "learner",
    options: [
      { value: "yes", label: "Yes (code 78)" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "C4",
    field: "driving",
    section: "You & your driving",
    kind: "single",
    quick: true,
    title: "What does a normal week of driving look like?",
    options: [
      { value: "town", label: "Short town trips", icon: "Building2" },
      { value: "mixed", label: "A mix", icon: "Shuffle" },
      { value: "motorway", label: "Lots of motorway / long commute", icon: "Route" },
      { value: "rural", label: "Rural roads and long distances", icon: "Wheat" },
    ],
  },
  {
    id: "C5",
    field: "dailyKm",
    section: "You & your driving",
    kind: "single",
    title: "Roughly how far do you drive in a day?",
    hint: "This tells us your fuel costs and whether an electric car's range is enough.",
    options: [
      { value: "lt30", label: "Under 30 km" },
      { value: "30-80", label: "30 – 80 km" },
      { value: "80-150", label: "80 – 150 km" },
      { value: "150+", label: "Over 150 km" },
    ],
  },
  {
    id: "C7",
    field: "roads",
    section: "You & your driving",
    kind: "single",
    title: "What are the roads like where you live?",
    options: [
      { value: "town", label: "Town or city", icon: "Building2" },
      { value: "country", label: "Country roads", icon: "Trees" },
      { value: "hills", label: "Hills and mountain roads", icon: "Mountain" },
      { value: "farm", label: "Farm lanes, gravel, fields", icon: "Tractor" },
    ],
  },
  {
    id: "C8",
    field: "county",
    section: "You & your driving",
    kind: "county",
    title: "Which county do you live in?",
    hint: "Used to estimate the cost of travelling to Northern Ireland to collect a car.",
    optional: true,
    showIf: (a) => a.ni === "yes" || a.ni === "big",
  },
  {
    id: "C1",
    field: "passengers",
    section: "Your everyday life",
    kind: "single",
    quick: true,
    title: "Who usually travels with you?",
    options: [
      { value: "solo", label: "Just me", icon: "User" },
      { value: "plus1", label: "Me + 1", icon: "Users" },
      { value: "family", label: "Small family (3–4)", icon: "Baby" },
      { value: "big", label: "Big family or lifts for others (5–7)", icon: "Bus" },
    ],
  },
  {
    id: "C2",
    field: "childSeats",
    section: "Your everyday life",
    kind: "single",
    title: "Any little ones in car seats?",
    hint: "Child seats need wide rear doors and ISOFIX fixing points.",
    showIf: (a) => a.passengers !== "solo",
    options: [
      { value: "0", label: "None" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3 or more" },
    ],
  },
  {
    id: "C3",
    field: "carry",
    section: "Your everyday life",
    kind: "multi",
    title: "What do you carry most often?",
    hint: "Pick all that apply.",
    options: [
      { value: "shopping", label: "Shopping only", icon: "ShoppingCart" },
      { value: "buggy", label: "Buggy or sports gear", icon: "Dumbbell" },
      { value: "dogs", label: "Dogs", icon: "Dog" },
      { value: "diy", label: "DIY, furniture, tools", icon: "Wrench" },
      { value: "towing", label: "Towing a trailer, horsebox or caravan", icon: "Truck" },
    ],
  },
  {
    id: "C6",
    field: "parking",
    section: "Your everyday life",
    kind: "single",
    title: "Where do you park at night?",
    hint: "Electric cars are much cheaper to run if you can charge at home.",
    options: [
      { value: "driveway", label: "My own driveway", icon: "House" },
      { value: "street", label: "On the street", icon: "MapPin" },
      { value: "apartment", label: "Apartment car park", icon: "Building" },
      { value: "tight", label: "Tight city spaces", icon: "Ruler" },
    ],
  },
  {
    id: "E1",
    field: "styles",
    section: "What you love",
    kind: "multi",
    quick: true,
    maxSelect: 3,
    title: "Pick up to 3 words that describe your dream car.",
    options: [
      { value: "sporty", label: "Sporty", icon: "Gauge" },
      { value: "rugged", label: "Rugged / outdoorsy", icon: "Tent" },
      { value: "luxurious", label: "Luxurious", icon: "Sofa" },
      { value: "practical", label: "Practical", icon: "Package" },
      { value: "eco", label: "Eco-friendly", icon: "Sprout" },
      { value: "cute", label: "Cute / quirky", icon: "Heart" },
      { value: "classic", label: "Classic", icon: "Crown" },
      { value: "techy", label: "Techy / futuristic", icon: "Rocket" },
      { value: "sleek", label: "Sleek / stylish", icon: "Glasses" },
    ],
  },
  {
    id: "E2",
    field: "likedBodies",
    section: "What you love",
    kind: "bodies",
    title: "Tap the shapes that catch your eye.",
    hint: "Go with your gut. Pick as many as you like.",
  },
  {
    id: "E3",
    field: "feel",
    section: "What you love",
    kind: "single",
    title: "How should driving feel?",
    options: [
      { value: "comfy", label: "Calm & comfy", icon: "Cloud" },
      { value: "zippy", label: "Zippy & fun", icon: "Zap" },
      { value: "powerful", label: "Powerful", icon: "Flame" },
      { value: "easy", label: "Easy, I just want to get there", icon: "Smile" },
    ],
  },
  {
    id: "E4",
    field: "features",
    section: "What you love",
    kind: "multi",
    title: "What do you want inside?",
    options: [
      { value: "carplay", label: "Apple CarPlay / Android Auto", icon: "Smartphone" },
      { value: "touchscreen", label: "Big touchscreen", icon: "Monitor" },
      { value: "heatedSeats", label: "Heated seats", icon: "Flame" },
      { value: "sunroof", label: "Sunroof", icon: "Sun" },
      { value: "stereo", label: "Good stereo", icon: "Music" },
      { value: "simple", label: "Keep it simple", icon: "Circle" },
    ],
  },
  {
    id: "E6",
    field: "dream",
    section: "What you love",
    kind: "single",
    title: "If money were no object, which would you pick?",
    hint: "We'll find the closest thing in your budget.",
    options: [
      { value: "sports", label: "Sports car", icon: "Flag" },
      { value: "4x4", label: "Big 4x4", icon: "Truck" },
      { value: "luxury", label: "Luxury saloon", icon: "Wine" },
      { value: "ev", label: "Futuristic electric car", icon: "Zap" },
      { value: "classic", label: "Classic car", icon: "Radio" },
      { value: "camper", label: "Camper van", icon: "Tent" },
      { value: "quirky", label: "Something quirky", icon: "PartyPopper" },
    ],
  },
  {
    id: "D2",
    field: "engines",
    section: "What matters most",
    kind: "multi",
    quick: true,
    title: "What kind of engine are you open to?",
    hint: "Pick all you're happy with. Skip this if you have no idea: we'll consider them all.",
    options: [
      { value: "ev", label: "Electric", icon: "PlugZap" },
      { value: "hybrid", label: "Hybrid", icon: "Leaf" },
      { value: "petrol", label: "Petrol", icon: "Fuel" },
      { value: "diesel", label: "Diesel", icon: "Droplet" },
    ],
    explainer: {
      title: "Engine types in plain English",
      body: [
        "Petrol: simple, cheap to buy, good for short and mixed trips.",
        "Diesel: uses less fuel on long motorway or rural drives. Not good for lots of short trips, which can clog the diesel particulate filter (an expensive repair).",
        "Hybrid: a petrol engine plus a small battery that charges itself. Great in town traffic, no plugging in.",
        "Plug-in hybrid: a bigger battery you charge from a socket. You can do short trips on electricity alone, but it only saves money if you charge it often.",
        "Electric: no petrol at all. Very cheap to run if you can charge at home overnight, and quiet. You need to plan longer trips around charging stops.",
      ],
    },
  },
  {
    id: "D3",
    field: "maintenance",
    section: "What matters most",
    kind: "single",
    title: "How do you feel about repairs and maintenance?",
    options: [
      { value: "justwork", label: "I want it to just work", icon: "Smile" },
      { value: "ok", label: "I'm OK with some upkeep", icon: "Wrench" },
      { value: "diy", label: "I can fix things myself", icon: "Hammer" },
    ],
  },
  {
    id: "F1",
    field: "mustHaves",
    section: "What matters most",
    kind: "needs",
    title: "Anything you need, or anything that's a no?",
    hint: "Tap what applies. Leave the rest. We'll never show a car that breaks a must-have.",
    options: [
      { value: "auto", label: "Automatic gearbox" },
      { value: "seven", label: "7 seats" },
      { value: "tall", label: "Room for a tall driver" },
      { value: "easyEntry", label: "Easy to get in and out" },
      { value: "towing", label: "Towing" },
      { value: "manual", label: "Manual gearbox" },
    ],
    /** Deal-breakers ("No thanks") shown on the same screen. */
    noOptions: [
      { value: "big", label: "Too big to park" },
      { value: "tax", label: "High motor tax" },
      { value: "thirsty", label: "Uses a lot of fuel" },
      { value: "insurance", label: "Expensive insurance" },
      { value: "boring", label: "Looks boring" },
      { value: "visibility", label: "Hard to see out of" },
    ],
  },
  {
    id: "G1",
    field: "priorities",
    section: "What matters most",
    kind: "ranking",
    quick: true,
    title: "Put these in order: what matters most to you?",
    hint: "Use the arrows to move things up or down. The top 4 count the most.",
  },
];

/** Questions that apply right now, given the answers so far. */
export function activeQuestions(a: Answers, quick: boolean): Question[] {
  return QUESTIONS.filter(
    // In quick mode, follow-up questions (A3 take-home pay, C8 county) still appear when needed.
    (q) => (!quick || q.quick || q.id === "A3" || q.id === "C8") && (!q.showIf || q.showIf(a)),
  );
}

/** Converts a stored option value (always a string in the UI) to the right type for its field. */
export function parseValue(field: keyof Answers, value: string): unknown {
  if (field === "childSeats") return Number(value);
  if (field === "tradeIn") return value === "true";
  return value;
}

export function isAnswered(q: Question, a: Answers): boolean {
  if (q.kind === "budget") return !!a.budgetUnknown || (a.budget ?? 0) > 0;
  if (q.kind === "brands") return (a.brandsLove?.length ?? 0) + (a.brandsAvoid?.length ?? 0) > 0;
  if (q.kind === "needs") return (a.mustHaves?.length ?? 0) + (a.dealBreakers?.length ?? 0) > 0;
  const v = a[q.field];
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && v !== "";
}

/**
 * Constraints, not errors (Norman): returns a reason if an option conflicts with
 * an earlier answer, so the UI can disable it and say why.
 */
export function disabledReason(q: Question, value: string, a: Answers): string | null {
  if (q.field === "mustHaves") {
    if (value === "manual" && a.autoOnly === "yes") return "Your licence is automatic only";
    if (value === "manual" && a.mustHaves?.includes("auto")) return "You picked automatic";
    if (value === "auto" && a.mustHaves?.includes("manual")) return "You picked manual";
  }
  return null;
}

/**
 * Smart default for the priority ranking, worked out from earlier answers,
 * so most people only need to confirm it (Wroblewski: smart defaults).
 */
export function smartPriorities(a: Answers): Priority[] {
  const score: Record<Priority, number> = {
    price: 8, reliability: 7, safety: 6, running: 5, space: 4, comfort: 3, style: 2, tech: 1,
  };
  const bump = (p: Priority, n: number) => (score[p] += n);
  if (a.passengers === "family" || a.passengers === "big" || (a.childSeats ?? 0) > 0) {
    bump("safety", 2.5);
    bump("space", 3);
  }
  if ((a.carry ?? []).some((c) => c !== "shopping")) bump("space", 2);
  if (a.driving === "motorway" || a.driving === "rural" || a.dailyKm === "80-150" || a.dailyKm === "150+") {
    bump("running", 3);
    bump("comfort", 2);
  }
  if (a.maintenance === "justwork") bump("reliability", 1.5);
  if (a.styles?.some((s) => ["sporty", "sleek", "cute", "classic"].includes(s)) || a.feel === "zippy") bump("style", 6);
  if (a.styles?.includes("luxurious") || a.feel === "comfy") bump("comfort", 2.5);
  if (a.styles?.includes("techy") || (a.features ?? []).some((f) => f !== "simple")) bump("tech", 3);
  if (a.styles?.includes("eco")) bump("running", 1.5);
  return (Object.keys(score) as Priority[]).sort((x, y) => score[y] - score[x]);
}
