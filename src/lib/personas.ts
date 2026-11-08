// Test personas from PLAN.md §10.
import type { Answers } from "./types";

export const PERSONAS: Record<string, Answers> = {
  dublinFirstJob: {
    payMethod: "cash", budget: 8000, condition: "used", ni: "no", licence: "new", ageGroup: "u25",
    passengers: "solo", driving: "town", dailyKm: "lt30", parking: "street", roads: "town",
    styles: ["cute"], priorities: ["price", "running", "reliability", "safety"],
  },
  newDriverAuto: {
    payMethod: "cash", budget: 12000, condition: "used", ni: "no", licence: "new", autoOnly: "yes", ageGroup: "u25",
    passengers: "plus1", driving: "mixed", parking: "street", priorities: ["price", "safety", "reliability"],
  },
  corkFamily: {
    payMethod: "loan", budget: 600, condition: "either", ni: "no", licence: "full",
    passengers: "family", childSeats: 2, carry: ["buggy", "dogs"], driving: "mixed", dailyKm: "30-80",
    parking: "driveway", roads: "town", county: "Cork", priorities: ["space", "safety", "reliability", "price"],
  },
  mayoRural: {
    payMethod: "cash", budget: 25000, condition: "used", ni: "no", licence: "full",
    passengers: "plus1", driving: "rural", dailyKm: "80-150", parking: "driveway", roads: "country",
    fuelImportance: "very", engines: ["diesel", "hybrid"], feel: "comfy", priorities: ["running", "comfort", "reliability"],
  },
  donegalBorder: {
    payMethod: "cash", budget: 20000, condition: "used", ni: "yes", county: "Donegal", licence: "full",
    passengers: "family", driving: "mixed", dailyKm: "30-80", parking: "driveway", priorities: ["price", "reliability"],
  },
  kildareEv: {
    payMethod: "cash", budget: 35000, condition: "either", ni: "no", licence: "full",
    passengers: "plus1", driving: "motorway", dailyKm: "30-80", parking: "driveway", engines: ["ev"],
    styles: ["techy"], features: ["carplay", "touchscreen"], priorities: ["running", "tech", "price"],
  },
  dreamer: {
    payMethod: "cash", budget: 25000, condition: "used", ni: "no", licence: "full",
    passengers: "solo", dream: "sports", feel: "zippy", styles: ["sporty"], priorities: ["style", "price"],
  },
  galwayRetiree: {
    payMethod: "cash", budget: 30000, condition: "either", ni: "no", licence: "full", ageGroup: "65+",
    passengers: "plus1", mustHaves: ["easyEntry", "auto"], feel: "comfy", features: ["simple"],
    maintenance: "justwork", priorities: ["reliability", "comfort", "safety"],
  },
};
