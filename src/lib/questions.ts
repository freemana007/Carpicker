// The fixed quiz: every question, answer option and skip rule.

import type { Answers, BodyType, Priority } from "./types";

export type QuestionKind = "single" | "multi" | "budget" | "ranking" | "county" | "brands" | "bodies";

export interface Option {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
}

export interface Question {
  id: string;
  /** Answer field this question fills. */
  field: keyof Answers;
  section: string;
  kind: QuestionKind;
  title: string;
  /** "Why we ask" hint shown under the question. */
  hint?: string;
  options?: Option[];
  maxSelect?: number;
  /** Optional explainer, opened from a "What do these mean?" link. */
  explainer?: { title: string; body: string[] };
  /** Included in quick mode. */
  quick?: boolean;
  optional?: boolean;
  showIf?: (a: Answers) => boolean;
}

export const SECTIONS = [
  "Budget",
  "About you as a driver",
  "Your everyday life",
  "Running costs",
  "Dreams & personality",
  "Must-haves",
  "Priorities",
];

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
  // ---------------- A: Budget ----------------
  {
    id: "A1",
    field: "payMethod",
    section: "Budget",
    kind: "single",
    quick: true,
    title: "How would you like to pay?",
    hint: "This decides whether we ask for a total price or a monthly amount.",
    options: [
      { value: "cash", label: "Cash / savings", emoji: "💶" },
      { value: "loan", label: "Credit union or bank loan", emoji: "🏦" },
      { value: "finance", label: "Dealer finance (PCP or hire purchase)", emoji: "📝" },
      { value: "unsure", label: "Not sure yet", emoji: "🤔" },
    ],
    explainer: {
      title: "Ways to pay for a car",
      body: [
        "Cash: you pay the full price up front. Simplest, and you can often haggle a little.",
        "Credit union or bank loan: you borrow the money and own the car straight away. You pay it back monthly, usually over 3–5 years.",
        "Hire purchase (HP): dealer finance where you pay monthly and own the car after the last payment.",
        "PCP: lower monthly payments, but at the end there's a big 'balloon payment' if you want to keep the car. Otherwise you hand it back or trade it in. You don't own the car until you pay that.",
        "Northern Ireland dealers usually can't offer finance to people living in the Republic, so cash or a loan works best there.",
      ],
    },
  },
  {
    id: "A2",
    field: "budget",
    section: "Budget",
    kind: "budget",
    quick: true,
    title: "What's the most you'd be comfortable spending?",
    hint: "We'll only show cars that fit. Cars just over budget are shown separately.",
  },
  {
    id: "A3",
    field: "takeHome",
    section: "Budget",
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
    section: "Budget",
    kind: "single",
    title: "New, used, or either?",
    hint: "A 2–4-year-old car is often the best value: someone else has paid for the biggest drop in value.",
    options: [
      { value: "new", label: "New", emoji: "✨" },
      { value: "used", label: "Used", emoji: "🔁" },
      { value: "either", label: "Either, show me the best value", emoji: "⚖️" },
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
    section: "Budget",
    kind: "single",
    quick: true,
    title: "Would you consider buying a car in Northern Ireland?",
    hint: "Cars there are often cheaper, but you pay VRT and need some paperwork. We'll do the maths for you.",
    options: [
      { value: "yes", label: "Yes, show me", emoji: "👍" },
      { value: "big", label: "Only if it saves a lot", emoji: "💰" },
      { value: "no", label: "No, Republic only", emoji: "🇮🇪" },
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
    id: "A6",
    field: "tradeIn",
    section: "Budget",
    kind: "single",
    optional: true,
    title: "Do you have a car to trade in?",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },

  // ---------------- B: Driver ----------------
  {
    id: "B1",
    field: "licence",
    section: "About you as a driver",
    kind: "single",
    title: "What licence do you have?",
    hint: "Insurance in Ireland costs much more for learner and new drivers, so we'll favour cars that are cheaper to insure.",
    options: [
      { value: "learner", label: "Learner permit", emoji: "🔰" },
      { value: "new", label: "Full licence, under 2 years", emoji: "🆕" },
      { value: "full", label: "Full licence, 2+ years", emoji: "🪪" },
    ],
  },
  {
    id: "B2",
    field: "autoOnly",
    section: "About you as a driver",
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
    id: "B3",
    field: "ageGroup",
    section: "About you as a driver",
    kind: "single",
    optional: true,
    title: "What's your age group?",
    hint: "Optional. Only used to warn you about insurance costs. It never changes which cars you see.",
    options: [
      { value: "u25", label: "Under 25" },
      { value: "25-34", label: "25 – 34" },
      { value: "35-64", label: "35 – 64" },
      { value: "65+", label: "65 +" },
    ],
  },

  // ---------------- C: Everyday life ----------------
  {
    id: "C1",
    field: "passengers",
    section: "Your everyday life",
    kind: "single",
    quick: true,
    title: "Who usually travels with you?",
    options: [
      { value: "solo", label: "Just me", emoji: "🧍" },
      { value: "plus1", label: "Me + 1", emoji: "🧑‍🤝‍🧑" },
      { value: "family", label: "Small family (3–4)", emoji: "👨‍👩‍👧" },
      { value: "big", label: "Big family or lifts for others (5–7)", emoji: "👨‍👩‍👧‍👦" },
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
      { value: "shopping", label: "Shopping only", emoji: "🛒" },
      { value: "buggy", label: "Buggy or sports gear", emoji: "🏑" },
      { value: "dogs", label: "Dogs", emoji: "🐕" },
      { value: "diy", label: "DIY, furniture, tools", emoji: "🧰" },
      { value: "towing", label: "Towing a trailer, horsebox or caravan", emoji: "🚚" },
    ],
  },
  {
    id: "C4",
    field: "driving",
    section: "Your everyday life",
    kind: "single",
    quick: true,
    title: "What does a normal week of driving look like?",
    options: [
      { value: "town", label: "Short town trips", emoji: "🏙️" },
      { value: "mixed", label: "A mix", emoji: "🔀" },
      { value: "motorway", label: "Lots of motorway / long commute", emoji: "🛣️" },
      { value: "rural", label: "Rural roads and long distances", emoji: "🌾" },
    ],
  },
  {
    id: "C5",
    field: "dailyKm",
    section: "Your everyday life",
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
    id: "C6",
    field: "parking",
    section: "Your everyday life",
    kind: "single",
    title: "Where do you park at night?",
    hint: "Electric cars are much cheaper to run if you can charge at home.",
    options: [
      { value: "driveway", label: "My own driveway", emoji: "🏠" },
      { value: "street", label: "On the street", emoji: "🚏" },
      { value: "apartment", label: "Apartment car park", emoji: "🏢" },
      { value: "tight", label: "Tight city spaces", emoji: "📏" },
    ],
  },
  {
    id: "C7",
    field: "roads",
    section: "Your everyday life",
    kind: "single",
    title: "What are the roads like where you live?",
    options: [
      { value: "town", label: "Town or city", emoji: "🏘️" },
      { value: "country", label: "Country roads", emoji: "🌳" },
      { value: "hills", label: "Hills and mountain roads", emoji: "⛰️" },
      { value: "farm", label: "Farm lanes, gravel, fields", emoji: "🚜" },
    ],
  },
  {
    id: "C8",
    field: "county",
    section: "Your everyday life",
    kind: "county",
    title: "Which county do you live in?",
    hint: "Used to estimate the cost of travelling to Northern Ireland to collect a car.",
    optional: true,
    showIf: (a) => a.ni === "yes" || a.ni === "big",
  },

  // ---------------- D: Running costs ----------------
  {
    id: "D1",
    field: "fuelImportance",
    section: "Running costs",
    kind: "single",
    title: "How important is keeping fuel costs low?",
    options: [
      { value: "very", label: "Very important" },
      { value: "somewhat", label: "Somewhat" },
      { value: "not", label: "Not really" },
    ],
  },
  {
    id: "D2",
    field: "engines",
    section: "Running costs",
    kind: "multi",
    quick: true,
    title: "What kind of engine are you open to?",
    hint: "Pick all you're happy with. Skip this if you have no idea: we'll consider them all.",
    options: [
      { value: "ev", label: "Electric", emoji: "🔌" },
      { value: "hybrid", label: "Hybrid", emoji: "🍃" },
      { value: "petrol", label: "Petrol", emoji: "⛽" },
      { value: "diesel", label: "Diesel", emoji: "🛢️" },
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
    section: "Running costs",
    kind: "single",
    title: "How do you feel about repairs and maintenance?",
    options: [
      { value: "justwork", label: "I want it to just work", emoji: "😌" },
      { value: "ok", label: "I'm OK with some upkeep", emoji: "🔧" },
      { value: "diy", label: "I can fix things myself", emoji: "🛠️" },
    ],
  },
  {
    id: "D4",
    field: "keep",
    section: "Running costs",
    kind: "single",
    title: "How long do you plan to keep it?",
    options: [
      { value: "short", label: "1 – 3 years" },
      { value: "mid", label: "4 – 7 years" },
      { value: "long", label: "Until it dies" },
    ],
  },
  {
    id: "D5",
    field: "safety",
    section: "Running costs",
    kind: "multi",
    title: "Which safety features matter to you?",
    options: [
      { value: "aeb", label: "Automatic emergency braking", description: "Brakes for you if you're about to crash." },
      { value: "blindSpot", label: "Blind-spot warning", description: "Warns you about cars beside you." },
      { value: "acc", label: "Adaptive cruise control", description: "Keeps a safe gap on the motorway." },
      { value: "camera", label: "Reversing camera" },
      { value: "any", label: "Just make it safe" },
    ],
  },

  // ---------------- E: Dreams ----------------
  {
    id: "E1",
    field: "styles",
    section: "Dreams & personality",
    kind: "multi",
    quick: true,
    maxSelect: 3,
    title: "Pick up to 3 words that describe your dream car.",
    options: [
      { value: "sporty", label: "Sporty", emoji: "🏎️" },
      { value: "rugged", label: "Rugged / outdoorsy", emoji: "🏕️" },
      { value: "luxurious", label: "Luxurious", emoji: "🛋️" },
      { value: "practical", label: "Practical", emoji: "📦" },
      { value: "eco", label: "Eco-friendly", emoji: "🌱" },
      { value: "cute", label: "Cute / quirky", emoji: "🐣" },
      { value: "classic", label: "Classic", emoji: "🎩" },
      { value: "techy", label: "Techy / futuristic", emoji: "🚀" },
      { value: "sleek", label: "Sleek / stylish", emoji: "🕶️" },
    ],
  },
  {
    id: "E2",
    field: "likedBodies",
    section: "Dreams & personality",
    kind: "bodies",
    title: "Tap the shapes that catch your eye.",
    hint: "Go with your gut. Pick as many as you like.",
  },
  {
    id: "E3",
    field: "feel",
    section: "Dreams & personality",
    kind: "single",
    title: "How should driving feel?",
    options: [
      { value: "comfy", label: "Calm & comfy", emoji: "☁️" },
      { value: "zippy", label: "Zippy & fun", emoji: "⚡" },
      { value: "powerful", label: "Powerful", emoji: "💪" },
      { value: "easy", label: "Easy, I just want to get there", emoji: "🙂" },
    ],
  },
  {
    id: "E4",
    field: "features",
    section: "Dreams & personality",
    kind: "multi",
    title: "What do you want inside?",
    options: [
      { value: "carplay", label: "Apple CarPlay / Android Auto", emoji: "📱" },
      { value: "touchscreen", label: "Big touchscreen", emoji: "🖥️" },
      { value: "heatedSeats", label: "Heated seats", emoji: "🔥" },
      { value: "sunroof", label: "Sunroof", emoji: "☀️" },
      { value: "stereo", label: "Good stereo", emoji: "🎵" },
      { value: "simple", label: "Keep it simple", emoji: "🔘" },
    ],
  },
  {
    id: "E5",
    field: "brandsLove",
    section: "Dreams & personality",
    kind: "brands",
    optional: true,
    title: "Any brands you love or want to avoid?",
    hint: "Tap once to favour a brand 💚, twice to avoid it 🚫, three times to clear.",
  },
  {
    id: "E6",
    field: "dream",
    section: "Dreams & personality",
    kind: "single",
    title: "If money were no object, which would you pick?",
    hint: "We'll find the closest thing in your budget.",
    options: [
      { value: "sports", label: "Sports car", emoji: "🏁" },
      { value: "4x4", label: "Big 4x4", emoji: "🛻" },
      { value: "luxury", label: "Luxury saloon", emoji: "🥂" },
      { value: "ev", label: "Futuristic electric car", emoji: "⚡" },
      { value: "classic", label: "Classic car", emoji: "📻" },
      { value: "camper", label: "Camper van", emoji: "🏕️" },
      { value: "quirky", label: "Something quirky", emoji: "🎈" },
    ],
  },

  // ---------------- F: Must-haves ----------------
  {
    id: "F1",
    field: "mustHaves",
    section: "Must-haves",
    kind: "multi",
    title: "Anything you absolutely need?",
    options: [
      { value: "auto", label: "Automatic gearbox" },
      { value: "seven", label: "7 seats" },
      { value: "tall", label: "Room for a tall driver" },
      { value: "easyEntry", label: "Easy to get in and out" },
      { value: "towing", label: "Towing" },
      { value: "manual", label: "Manual gearbox" },
    ],
  },
  {
    id: "F2",
    field: "dealBreakers",
    section: "Must-haves",
    kind: "multi",
    title: "Anything that's a deal-breaker?",
    options: [
      { value: "big", label: "Too big to park" },
      { value: "tax", label: "High motor tax" },
      { value: "thirsty", label: "Uses a lot of fuel" },
      { value: "insurance", label: "Expensive insurance" },
      { value: "boring", label: "Looks boring" },
      { value: "visibility", label: "Hard to see out of" },
    ],
  },

  // ---------------- G: Priorities ----------------
  {
    id: "G1",
    field: "priorities",
    section: "Priorities",
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
  const v = a[q.field];
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && v !== "";
}
