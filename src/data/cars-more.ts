// Cars added in November 2026: the rest of the Irish new-car market.
//
// Irish prices marked `checked` were read from the brand's own Irish website
// on 9 November 2026 (Toyota, Kia, Nissan, Renault, Dacia, Volkswagen, Skoda,
// Mercedes-Benz, Mazda). EV prices on brand sites usually already include the
// SEAI grant and VRT relief. All other prices, and the specs (CO2, boot, power,
// range…), are our ESTIMATES and must be checked before launch (see DATA.md).
// Euro NCAP stars are only given where we're confident of the result;
// otherwise `null` = shown as "not yet tested".

import type { BodyType, Car, Powertrain, Retention, ServiceClass, Style } from "@/lib/types";
import { car } from "./carFactory";

const CHECKED = "2026-11-09";

const RELIABILITY: Record<string, number> = {
  Toyota: 5, Lexus: 5, Honda: 4.5, Mazda: 4.5, Suzuki: 4.5, Subaru: 4, Kia: 4, Hyundai: 4, Volvo: 4,
  Skoda: 3.5, Volkswagen: 3.5, Dacia: 3.5, BYD: 3.5, Cupra: 3.5, SEAT: 3.5, Audi: 3, BMW: 3,
  "Mercedes-Benz": 3, Renault: 3, Peugeot: 3, "Citroën": 3, Opel: 3, Fiat: 3, Ford: 3, Nissan: 3,
  MG: 3, MINI: 3, Polestar: 3, Jeep: 2.5, "Land Rover": 2.5,
};
const PREMIUM = new Set(["Audi", "BMW", "Mercedes-Benz", "Lexus", "Volvo", "Polestar", "Land Rover"]);
const HIGH_RETENTION = new Set(["Toyota", "Lexus", "Dacia", "Suzuki", "Honda", "Subaru"]);
const LOW_RETENTION = new Set(["MG", "BYD", "Citroën", "Peugeot", "Opel", "Fiat", "Renault"]);

interface Spec {
  make: string;
  model: string;
  variant: string;
  body: BodyType;
  pt: Powertrain;
  price: number;
  checked?: boolean;
  hp: number;
  boot: number;
  len: number;
  seats?: number;
  co2?: number;
  l100?: number;
  kwh?: number;
  range?: number;
  ncap?: [number, number];
  ins?: number;
  year?: number;
  isNew?: boolean;
  awd?: Car["awd"];
  tow?: number;
  manualToo?: boolean;
  comfort?: number;
  fun?: number;
  tech?: number;
  exp?: number;
  styles: Style[];
  pros?: string[];
  cons?: string[];
  reviewQuery?: string;
}

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function insuranceFor(price: number, hp: number): number {
  const base = price < 22000 ? 9 : price < 30000 ? 15 : price < 40000 ? 21 : price < 55000 ? 27 : price < 75000 ? 33 : 40;
  return Math.min(50, base + (hp > 300 ? 8 : hp > 220 ? 4 : 0));
}

function serviceFor(s: Spec): ServiceClass {
  if (s.pt === "ev") return "ev";
  if (PREMIUM.has(s.make)) return "premium";
  return s.price < 25000 ? "small" : s.price < 50000 ? "medium" : "large";
}

const GENERIC: Record<Powertrain, { pros: string[]; cons: string[] }> = {
  ev: { pros: ["Very cheap to run if you can charge at home", "Quiet and smooth to drive"], cons: ["Check the real-world range and charging speed for your longest trips"] },
  hybrid: { pros: ["Low fuel use, especially in town", "No plugging in needed"], cons: ["Engine can sound busy when you accelerate hard"] },
  phev: { pros: ["Short trips on electricity if you charge at home", "Low motor tax"], cons: ["Uses a lot of fuel on long trips once the battery is empty"] },
  petrol: { pros: ["Simple and cheaper to buy than a hybrid or electric car"], cons: ["Higher fuel and motor tax costs than a hybrid"] },
  diesel: { pros: ["Economical on long motorway and rural drives"], cons: ["Not suited to lots of short trips"] },
};

function add(s: Spec): Car {
  const isEv = s.pt === "ev";
  const retention: Retention = HIGH_RETENTION.has(s.make) ? "high" : LOW_RETENTION.has(s.make) || isEv ? "low" : "mid";
  const raised = s.body === "suv" || s.body === "crossover";
  return car({
    id: `${slug(s.make)}-${slug(s.model)}`,
    make: s.make,
    model: s.model,
    variant: s.variant,
    body: s.body,
    seats: s.seats ?? (s.body === "sports" ? 2 : 5),
    bootL: s.boot,
    lengthMm: s.len,
    powertrain: s.pt,
    gearbox: s.pt === "petrol" || s.pt === "diesel" ? (s.manualToo === false ? ["auto"] : ["manual", "auto"]) : ["auto"],
    fuelL100: isEv ? undefined : s.l100 ?? (s.pt === "phev" ? 6.5 : 5.5),
    kwh100: isEv || s.pt === "phev" ? s.kwh ?? 17 : undefined,
    rangeKm: s.range,
    co2: isEv ? 0 : s.co2 ?? 30,
    nox: { ev: 0, hybrid: 5, phev: 8, petrol: 20, diesel: 40 }[s.pt],
    powerHp: s.hp,
    insuranceGroup: s.ins ?? insuranceFor(s.price, s.hp),
    refPriceEur: s.price,
    priceChecked: s.checked ? CHECKED : undefined,
    isNewModel: s.isNew,
    yearFrom: s.year ?? 2024,
    retention,
    serviceClass: serviceFor(s),
    reliability: RELIABILITY[s.make] ?? 3,
    ncapStars: s.ncap ? s.ncap[0] : null,
    ncapYear: s.ncap ? s.ncap[1] : null,
    awd: s.awd ?? "no",
    groundClearance: raised ? "high" : s.body === "sports" ? "low" : "normal",
    towKg: s.tow ?? (isEv ? (raised ? 1000 : 0) : s.body === "suv" ? 1600 : s.body === "city" ? 0 : 1200),
    easyEntry: raised || s.body === "mpv",
    tallFriendly: s.body !== "city" && s.body !== "sports",
    comfort: s.comfort ?? (PREMIUM.has(s.make) ? 4 : 3),
    fun: s.fun ?? 3,
    tech: s.tech ?? (isEv || PREMIUM.has(s.make) ? 4 : 3),
    styles: s.styles,
    featuresStd: ["carplay", "touchscreen"],
    featuresOpt: ["heatedSeats", "sunroof", "stereo"],
    safetyStd: ["aeb", ...(s.price > 40000 ? (["acc", "camera"] as const) : [])],
    safetyOpt: s.price > 40000 ? ["blindSpot"] : ["blindSpot", "acc", "camera"],
    expertScore: s.exp ?? 3.5,
    pros: s.pros ?? GENERIC[s.pt].pros,
    cons: s.cons ?? GENERIC[s.pt].cons,
    reviewQuery: s.reviewQuery ?? `${s.make} ${s.model}`,
  });
}

export const MORE_CARS: Car[] = [
  // ---------------- Toyota (Irish prices checked) ----------------
  add({ make: "Toyota", model: "Aygo X", variant: "1.5 Hybrid", body: "city", pt: "hybrid", price: 24835, checked: true, hp: 116, boot: 231, len: 3776, seats: 4, co2: 86, l100: 3.9, ncap: [4, 2022], year: 2025, isNew: true, styles: ["cute", "eco"], pros: ["Hybrid economy in a tiny, easy-to-park car", "Toyota reliability"], cons: ["Small boot and tight back seats"] }),
  add({ make: "Toyota", model: "Corolla Touring Sports", variant: "1.8 Hybrid estate", body: "estate", pt: "hybrid", price: 35530, checked: true, hp: 140, boot: 596, len: 4650, co2: 103, l100: 4.5, ncap: [5, 2019], year: 2019, styles: ["practical", "eco"], exp: 4, pros: ["Big estate boot with hybrid running costs", "Excellent reliability"], cons: ["Not exciting to drive"] }),
  add({ make: "Toyota", model: "Corolla Saloon", variant: "1.8 Hybrid", body: "saloon", pt: "hybrid", price: 34605, checked: true, hp: 140, boot: 471, len: 4630, co2: 101, l100: 4.5, ncap: [5, 2019], year: 2019, styles: ["practical", "eco"], exp: 3.5 }),
  add({ make: "Toyota", model: "Corolla Cross", variant: "1.8 Hybrid", body: "crossover", pt: "hybrid", price: 40605, checked: true, hp: 140, boot: 433, len: 4460, co2: 110, l100: 4.9, year: 2022, awd: "optional", styles: ["practical", "eco"], exp: 3.5 }),
  add({ make: "Toyota", model: "C-HR+", variant: "Electric", body: "crossover", pt: "ev", price: 37444, checked: true, hp: 224, boot: 416, len: 4520, kwh: 16, range: 455, year: 2026, isNew: true, styles: ["sleek", "eco", "techy"] }),
  add({ make: "Toyota", model: "bZ", variant: "Electric", body: "suv", pt: "ev", price: 42204, checked: true, hp: 224, boot: 452, len: 4690, kwh: 15.5, range: 500, ncap: [5, 2022], year: 2022, awd: "optional", styles: ["eco", "practical"] }),
  add({ make: "Toyota", model: "bZ Touring", variant: "Electric", body: "suv", pt: "ev", price: 48445, checked: true, hp: 224, boot: 600, len: 4830, kwh: 16, range: 520, year: 2026, isNew: true, awd: "optional", styles: ["eco", "practical", "rugged"] }),
  add({ make: "Toyota", model: "Prius", variant: "2.0 Plug-in Hybrid", body: "hatchback", pt: "phev", price: 47100, checked: true, hp: 223, boot: 284, len: 4600, co2: 20, l100: 4.5, kwh: 14, range: 70, year: 2024, styles: ["sleek", "eco", "techy"], cons: ["Small boot and limited headroom in the back"] }),
  add({ make: "Toyota", model: "Land Cruiser", variant: "2.8 D-4D mild hybrid 7-seat", body: "suv", pt: "diesel", price: 76580, checked: true, hp: 204, boot: 260, len: 4925, seats: 7, co2: 260, l100: 9.9, year: 2024, awd: "standard", tow: 3500, manualToo: false, comfort: 4, styles: ["rugged", "classic"], exp: 4, pros: ["Go-anywhere toughness and a huge towing limit"], cons: ["Very high motor tax and fuel bills"] }),
  add({ make: "Toyota", model: "GR Yaris", variant: "1.6 turbo four-wheel drive", body: "supermini", pt: "petrol", price: 88920, checked: true, hp: 280, boot: 141, len: 3995, seats: 4, co2: 190, l100: 8.4, year: 2024, awd: "standard", fun: 5, ins: 42, styles: ["sporty"], exp: 4.5, pros: ["A rally car for the road"], cons: ["Very expensive, high tax and insurance"] }),

  // ---------------- Kia (Irish prices checked unless noted) ----------------
  add({ make: "Kia", model: "Stonic", variant: "1.0 T-GDi mild hybrid", body: "crossover", pt: "petrol", price: 28050, checked: true, hp: 100, boot: 352, len: 4140, co2: 123, l100: 5.4, year: 2021, styles: ["practical", "cute"] }),
  add({ make: "Kia", model: "K4", variant: "1.6 T-GDi", body: "hatchback", pt: "petrol", price: 32000, checked: true, hp: 150, boot: 438, len: 4440, co2: 146, l100: 6.4, year: 2026, isNew: true, styles: ["sleek", "practical"] }),
  add({ make: "Kia", model: "EV2", variant: "Electric", body: "crossover", pt: "ev", price: 28660, checked: true, hp: 147, boot: 362, len: 4060, kwh: 15, range: 317, year: 2026, isNew: true, styles: ["eco", "cute", "techy"] }),
  add({ make: "Kia", model: "EV3", variant: "58 kWh", body: "crossover", pt: "ev", price: 36790, checked: true, hp: 204, boot: 460, len: 4300, kwh: 15, range: 436, ncap: [5, 2024], year: 2024, styles: ["eco", "techy", "practical"], exp: 4.5, pros: ["Long range for a small SUV", "7-year Kia warranty"] }),
  add({ make: "Kia", model: "EV4", variant: "Electric hatchback", body: "hatchback", pt: "ev", price: 42840, hp: 204, boot: 435, len: 4430, kwh: 14, range: 440, year: 2025, isNew: true, styles: ["eco", "techy", "sleek"] }),
  add({ make: "Kia", model: "EV5", variant: "Electric", body: "suv", pt: "ev", price: 46000, hp: 218, boot: 566, len: 4615, kwh: 16.5, range: 530, year: 2025, isNew: true, styles: ["eco", "practical", "rugged"] }),
  add({ make: "Kia", model: "EV6", variant: "84 kWh", body: "crossover", pt: "ev", price: 49000, hp: 229, boot: 480, len: 4695, kwh: 16, range: 560, ncap: [5, 2022], year: 2022, styles: ["sporty", "techy", "eco"], exp: 4.5, pros: ["Ultra-fast charging", "Fun to drive"] }),
  add({ make: "Kia", model: "Seltos", variant: "1.6 Hybrid", body: "crossover", pt: "hybrid", price: 39890, checked: true, hp: 141, boot: 440, len: 4430, co2: 112, l100: 4.9, year: 2026, isNew: true, styles: ["practical", "rugged"] }),
  add({ make: "Kia", model: "EV9", variant: "Electric 7-seat", body: "suv", pt: "ev", price: 85500, checked: true, hp: 204, boot: 333, len: 5010, seats: 7, kwh: 21, range: 505, ncap: [5, 2023], year: 2023, awd: "optional", tow: 2500, comfort: 4, styles: ["luxurious", "techy", "practical"], exp: 4.5 }),
  add({ make: "Kia", model: "PV5 Passenger", variant: "Electric people carrier", body: "mpv", pt: "ev", price: 42550, checked: true, hp: 163, boot: 1330, len: 4695, kwh: 18, range: 400, year: 2025, isNew: true, styles: ["practical"], pros: ["Huge, van-like space for people and gear"] }),

  // ---------------- Nissan (Irish prices checked) ----------------
  add({ make: "Nissan", model: "Juke", variant: "1.6 Hybrid", body: "crossover", pt: "hybrid", price: 30900, checked: true, hp: 143, boot: 354, len: 4210, co2: 114, l100: 5.0, ncap: [5, 2019], year: 2020, styles: ["sleek", "cute", "sporty"] }),
  add({ make: "Nissan", model: "Micra", variant: "Electric", body: "supermini", pt: "ev", price: 25995, checked: true, hp: 122, boot: 326, len: 3974, kwh: 15, range: 317, year: 2026, isNew: true, styles: ["cute", "eco"] }),
  add({ make: "Nissan", model: "Leaf (new)", variant: "Electric", body: "crossover", pt: "ev", price: 36095, checked: true, hp: 217, boot: 437, len: 4350, kwh: 14, range: 604, year: 2026, isNew: true, styles: ["eco", "techy", "sleek"], reviewQuery: "Nissan Leaf 2026" }),
  add({ make: "Nissan", model: "Ariya", variant: "63 kWh", body: "suv", pt: "ev", price: 39995, checked: true, hp: 218, boot: 468, len: 4595, kwh: 17, range: 403, ncap: [5, 2022], year: 2022, comfort: 4, styles: ["eco", "techy", "sleek"] }),
  add({ make: "Nissan", model: "X-Trail", variant: "e-Power 7-seat", body: "suv", pt: "hybrid", price: 49495, checked: true, hp: 204, boot: 177, len: 4680, seats: 7, co2: 145, l100: 6.4, ncap: [5, 2022], year: 2022, awd: "optional", tow: 1650, styles: ["practical", "rugged"] }),

  // ---------------- Renault (Irish prices checked) ----------------
  add({ make: "Renault", model: "5", variant: "E-Tech Electric", body: "supermini", pt: "ev", price: 26295, checked: true, hp: 150, boot: 326, len: 3922, kwh: 15, range: 410, ncap: [4, 2024], year: 2024, fun: 4, styles: ["cute", "classic", "techy"], exp: 4.5, pros: ["Retro looks, fun to drive and good value"], reviewQuery: "Renault 5 E-Tech" }),
  add({ make: "Renault", model: "4", variant: "E-Tech Electric", body: "crossover", pt: "ev", price: 26995, checked: true, hp: 150, boot: 420, len: 4144, kwh: 15.5, range: 409, year: 2025, isNew: true, styles: ["cute", "classic", "practical"], reviewQuery: "Renault 4 E-Tech" }),
  add({ make: "Renault", model: "Megane E-Tech", variant: "Electric", body: "hatchback", pt: "ev", price: 34495, checked: true, hp: 220, boot: 440, len: 4200, kwh: 16, range: 450, ncap: [4, 2022], year: 2022, styles: ["eco", "techy"] }),
  add({ make: "Renault", model: "Captur", variant: "E-Tech Hybrid", body: "crossover", pt: "hybrid", price: 30890, checked: true, hp: 143, boot: 440, len: 4239, co2: 105, l100: 4.7, ncap: [5, 2019], year: 2020, styles: ["practical", "sleek"] }),
  add({ make: "Renault", model: "Symbioz", variant: "E-Tech Hybrid", body: "crossover", pt: "hybrid", price: 32395, checked: true, hp: 160, boot: 492, len: 4413, co2: 106, l100: 4.7, year: 2024, styles: ["practical", "eco"] }),
  add({ make: "Renault", model: "Scenic E-Tech", variant: "Electric", body: "suv", pt: "ev", price: 39995, checked: true, hp: 220, boot: 545, len: 4470, kwh: 16.5, range: 610, ncap: [5, 2024], year: 2024, styles: ["practical", "eco", "techy"], exp: 4.5, pros: ["Very long range and a roomy family cabin"] }),
  add({ make: "Renault", model: "Austral", variant: "E-Tech Hybrid", body: "suv", pt: "hybrid", price: 41995, checked: true, hp: 200, boot: 430, len: 4510, co2: 105, l100: 4.6, ncap: [5, 2022], year: 2023, styles: ["practical", "sleek"] }),

  // ---------------- Dacia (Irish prices checked) ----------------
  add({ make: "Dacia", model: "Sandero Stepway", variant: "1.0 TCe", body: "crossover", pt: "petrol", price: 20690, checked: true, hp: 90, boot: 328, len: 4099, co2: 121, l100: 5.4, ncap: [2, 2021], year: 2021, styles: ["rugged", "practical"], pros: ["A raised, rugged small car for very little money"], cons: ["Only 2 Euro NCAP stars because it lacks some driver aids"] }),
  add({ make: "Dacia", model: "Bigster", variant: "Hybrid 155", body: "suv", pt: "hybrid", price: 29990, checked: true, hp: 155, boot: 667, len: 4570, co2: 115, l100: 5.1, year: 2025, isNew: true, awd: "optional", styles: ["rugged", "practical"], pros: ["Huge boot and lots of space for the price"] }),

  // ---------------- Volkswagen (Irish prices checked unless noted) ----------------
  add({ make: "Volkswagen", model: "T-Cross", variant: "1.0 TSI", body: "crossover", pt: "petrol", price: 30225, checked: true, hp: 95, boot: 455, len: 4135, co2: 127, l100: 5.6, ncap: [5, 2019], year: 2019, styles: ["practical"] }),
  add({ make: "Volkswagen", model: "T-Roc", variant: "1.5 eTSI mild hybrid", body: "crossover", pt: "petrol", price: 40400, checked: true, hp: 150, boot: 475, len: 4370, co2: 127, l100: 5.6, year: 2026, isNew: true, manualToo: false, styles: ["sleek", "practical"] }),
  add({ make: "Volkswagen", model: "Passat", variant: "1.5 eTSI estate", body: "estate", pt: "petrol", price: 48995, checked: true, hp: 150, boot: 690, len: 4917, co2: 132, l100: 5.8, ncap: [5, 2024], year: 2024, manualToo: false, comfort: 5, styles: ["practical", "luxurious"], exp: 4.5, pros: ["Enormous boot and limo-like comfort"] }),
  add({ make: "Volkswagen", model: "Tayron", variant: "1.5 eTSI 7-seat", body: "suv", pt: "petrol", price: 57495, checked: true, hp: 150, boot: 345, len: 4770, seats: 7, co2: 148, l100: 6.5, year: 2025, isNew: true, manualToo: false, tow: 2000, styles: ["practical"] }),
  add({ make: "Volkswagen", model: "ID.7", variant: "Pro electric", body: "saloon", pt: "ev", price: 54990, checked: true, hp: 286, boot: 532, len: 4961, kwh: 14.5, range: 620, ncap: [5, 2023], year: 2023, comfort: 5, styles: ["luxurious", "techy", "eco"], exp: 4.5 }),
  add({ make: "Volkswagen", model: "ID.7 Tourer", variant: "Pro electric estate", body: "estate", pt: "ev", price: 55790, checked: true, hp: 286, boot: 605, len: 4961, kwh: 15.5, range: 600, ncap: [5, 2023], year: 2024, comfort: 5, styles: ["practical", "techy", "eco"], exp: 4.5 }),
  add({ make: "Volkswagen", model: "ID. Polo", variant: "Electric", body: "supermini", pt: "ev", price: 26000, hp: 211, boot: 435, len: 4053, kwh: 14.5, range: 450, year: 2026, isNew: true, styles: ["eco", "practical", "techy"] }),
  add({ make: "Volkswagen", model: "ID. Buzz", variant: "Electric", body: "mpv", pt: "ev", price: 66000, hp: 286, boot: 1121, len: 4712, kwh: 21, range: 425, ncap: [5, 2022], year: 2022, styles: ["classic", "cute", "practical"], pros: ["Retro camper-van looks with lots of space"], cons: ["Expensive, and range drops at motorway speeds"] }),

  // ---------------- Skoda ----------------
  add({ make: "Skoda", model: "Kamiq", variant: "1.0 TSI", body: "crossover", pt: "petrol", price: 31000, hp: 115, boot: 400, len: 4241, co2: 123, l100: 5.4, ncap: [5, 2019], year: 2019, styles: ["practical"], exp: 4 }),
  add({ make: "Skoda", model: "Scala", variant: "1.0 TSI", body: "hatchback", pt: "petrol", price: 29500, hp: 115, boot: 467, len: 4362, co2: 121, l100: 5.3, ncap: [5, 2019], year: 2019, styles: ["practical"], exp: 4, pros: ["Big boot and back seat for a mid-size hatchback"] }),
  add({ make: "Skoda", model: "Karoq", variant: "1.5 TSI", body: "suv", pt: "petrol", price: 38500, hp: 150, boot: 521, len: 4390, co2: 140, l100: 6.2, ncap: [5, 2017], year: 2018, styles: ["practical"], exp: 4 }),
  add({ make: "Skoda", model: "Elroq", variant: "60 electric", body: "suv", pt: "ev", price: 36966, checked: true, hp: 204, boot: 470, len: 4488, kwh: 15.5, range: 400, year: 2025, isNew: true, styles: ["eco", "practical"], exp: 4.5 }),
  add({ make: "Skoda", model: "Epiq", variant: "Electric", body: "crossover", pt: "ev", price: 25309, checked: true, hp: 211, boot: 475, len: 4100, kwh: 14.5, range: 400, year: 2026, isNew: true, styles: ["eco", "practical"] }),
  add({ make: "Skoda", model: "Peaq", variant: "Electric 7-seat", body: "suv", pt: "ev", price: 54995, checked: true, hp: 286, boot: 320, len: 4870, seats: 7, kwh: 18, range: 550, year: 2026, isNew: true, styles: ["practical", "eco", "luxurious"] }),

  // ---------------- Mercedes-Benz (Irish prices checked) ----------------
  add({ make: "Mercedes-Benz", model: "CLA", variant: "CLA 200 hybrid", body: "saloon", pt: "hybrid", price: 57960, checked: true, hp: 163, boot: 405, len: 4723, co2: 125, l100: 5.4, ncap: [5, 2025], year: 2025, isNew: true, styles: ["sleek", "luxurious", "techy"] }),
  add({ make: "Mercedes-Benz", model: "CLA Electric", variant: "CLA 250+", body: "saloon", pt: "ev", price: 56925, checked: true, hp: 272, boot: 405, len: 4723, kwh: 12.5, range: 790, ncap: [5, 2025], year: 2025, isNew: true, styles: ["sleek", "luxurious", "techy"], exp: 4.5, pros: ["Very efficient, with a huge range"] }),
  add({ make: "Mercedes-Benz", model: "GLA", variant: "GLA 180", body: "crossover", pt: "petrol", price: 56430, checked: true, hp: 136, boot: 435, len: 4410, co2: 145, l100: 6.4, ncap: [5, 2019], year: 2020, manualToo: false, styles: ["luxurious", "practical"] }),
  add({ make: "Mercedes-Benz", model: "GLB", variant: "GLB 200 7-seat", body: "suv", pt: "petrol", price: 60775, checked: true, hp: 163, boot: 150, len: 4634, seats: 7, co2: 158, l100: 7.0, ncap: [5, 2019], year: 2020, manualToo: false, styles: ["luxurious", "practical"] }),
  add({ make: "Mercedes-Benz", model: "C-Class", variant: "C 200 saloon", body: "saloon", pt: "petrol", price: 57625, checked: true, hp: 204, boot: 455, len: 4751, co2: 150, l100: 6.6, ncap: [5, 2022], year: 2021, manualToo: false, styles: ["luxurious", "sleek"] }),
  add({ make: "Mercedes-Benz", model: "GLC", variant: "GLC 220 d 4MATIC", body: "suv", pt: "diesel", price: 78920, checked: true, hp: 197, boot: 620, len: 4716, co2: 155, l100: 5.9, ncap: [5, 2022], year: 2022, manualToo: false, awd: "standard", tow: 2500, styles: ["luxurious", "practical"] }),
  add({ make: "Mercedes-Benz", model: "GLC Electric", variant: "GLC 400 4MATIC", body: "suv", pt: "ev", price: 75935, checked: true, hp: 489, boot: 570, len: 4845, kwh: 17, range: 600, year: 2026, isNew: true, awd: "standard", styles: ["luxurious", "techy"] }),
  add({ make: "Mercedes-Benz", model: "E-Class", variant: "E 220 d saloon", body: "saloon", pt: "diesel", price: 77945, checked: true, hp: 197, boot: 540, len: 4949, co2: 137, l100: 5.2, ncap: [5, 2023], year: 2023, manualToo: false, comfort: 5, styles: ["luxurious", "classic"], exp: 4.5 }),

  // ---------------- Hyundai (estimated prices) ----------------
  add({ make: "Hyundai", model: "i20", variant: "1.0 T-GDi", body: "supermini", pt: "petrol", price: 26000, hp: 100, boot: 352, len: 4065, co2: 123, l100: 5.4, year: 2020, styles: ["practical", "sleek"] }),
  add({ make: "Hyundai", model: "Bayon", variant: "1.0 T-GDi", body: "crossover", pt: "petrol", price: 27500, hp: 100, boot: 411, len: 4180, co2: 123, l100: 5.4, year: 2021, styles: ["practical"] }),
  add({ make: "Hyundai", model: "Kona Hybrid", variant: "1.6 Hybrid", body: "crossover", pt: "hybrid", price: 36000, hp: 141, boot: 466, len: 4350, co2: 108, l100: 4.8, year: 2023, styles: ["practical", "techy"], reviewQuery: "Hyundai Kona Hybrid" }),
  add({ make: "Hyundai", model: "Inster", variant: "49 kWh", body: "city", pt: "ev", price: 26000, hp: 115, boot: 280, len: 3825, seats: 4, kwh: 14.3, range: 360, year: 2025, isNew: true, styles: ["cute", "techy", "eco"], pros: ["Tiny outside, clever and roomy inside"] }),
  add({ make: "Hyundai", model: "Ioniq 6", variant: "77 kWh", body: "saloon", pt: "ev", price: 50000, hp: 229, boot: 401, len: 4855, kwh: 14, range: 614, ncap: [5, 2022], year: 2022, styles: ["sleek", "techy", "eco"], exp: 4.5 }),
  add({ make: "Hyundai", model: "Santa Fe", variant: "1.6 Hybrid 7-seat", body: "suv", pt: "hybrid", price: 62000, hp: 215, boot: 192, len: 4830, seats: 7, co2: 148, l100: 6.4, year: 2024, awd: "standard", tow: 1650, styles: ["practical", "rugged"] }),
  add({ make: "Hyundai", model: "Ioniq 9", variant: "Electric 7-seat", body: "suv", pt: "ev", price: 80000, hp: 218, boot: 338, len: 5060, seats: 7, kwh: 20, range: 600, year: 2025, isNew: true, awd: "optional", comfort: 4, styles: ["luxurious", "techy", "practical"] }),

  // ---------------- MG (estimated prices) ----------------
  add({ make: "MG", model: "MG3", variant: "Hybrid+", body: "supermini", pt: "hybrid", price: 22000, hp: 194, boot: 293, len: 4113, co2: 100, l100: 4.4, year: 2024, styles: ["practical", "eco"], pros: ["Cheapest full hybrid you can buy"], cons: ["Cheap-feeling interior"] }),
  add({ make: "MG", model: "ZS", variant: "Hybrid+", body: "crossover", pt: "hybrid", price: 29000, hp: 197, boot: 443, len: 4430, co2: 113, l100: 5.0, year: 2025, styles: ["practical"] }),
  add({ make: "MG", model: "HS", variant: "1.5T", body: "suv", pt: "petrol", price: 34000, hp: 170, boot: 507, len: 4655, co2: 167, l100: 7.3, year: 2025, manualToo: false, styles: ["practical"], cons: ["Thirsty, so higher motor tax"] }),
  add({ make: "MG", model: "S5", variant: "Electric", body: "crossover", pt: "ev", price: 34000, hp: 231, boot: 453, len: 4476, kwh: 17, range: 430, year: 2025, isNew: true, styles: ["eco", "practical"] }),
  add({ make: "MG", model: "Cyberster", variant: "Electric roadster", body: "sports", pt: "ev", price: 66000, hp: 340, boot: 249, len: 4535, kwh: 19, range: 507, year: 2024, fun: 5, styles: ["sporty", "sleek", "techy"], pros: ["Electric two-seat convertible with scissor doors"], cons: ["Only two seats; heavy for a sports car"] }),

  // ---------------- Ford (estimated prices) ----------------
  add({ make: "Ford", model: "Puma Gen-E", variant: "Electric", body: "crossover", pt: "ev", price: 35000, hp: 168, boot: 523, len: 4214, kwh: 13.1, range: 376, year: 2025, isNew: true, fun: 4, styles: ["sporty", "practical", "eco"], reviewQuery: "Ford Puma Gen-E" }),
  add({ make: "Ford", model: "Explorer", variant: "Electric", body: "suv", pt: "ev", price: 45000, hp: 286, boot: 470, len: 4468, kwh: 16, range: 600, year: 2024, styles: ["rugged", "eco", "practical"], reviewQuery: "Ford Explorer EV" }),
  add({ make: "Ford", model: "Capri", variant: "Electric", body: "crossover", pt: "ev", price: 50000, hp: 286, boot: 572, len: 4634, kwh: 16, range: 627, year: 2024, styles: ["sleek", "classic", "eco"], reviewQuery: "Ford Capri EV" }),
  add({ make: "Ford", model: "Mustang Mach-E", variant: "Extended range", body: "suv", pt: "ev", price: 55000, hp: 294, boot: 402, len: 4713, kwh: 18, range: 600, ncap: [5, 2021], year: 2021, fun: 4, styles: ["sporty", "techy", "eco"] }),

  // ---------------- Peugeot, Citroën, Opel, Fiat, Jeep (estimated prices) ----------------
  add({ make: "Peugeot", model: "2008", variant: "1.2 Hybrid 136", body: "crossover", pt: "hybrid", price: 32000, hp: 136, boot: 434, len: 4304, co2: 110, l100: 4.9, year: 2020, styles: ["sleek", "practical"] }),
  add({ make: "Peugeot", model: "308", variant: "1.2 Hybrid 145", body: "hatchback", pt: "hybrid", price: 34000, hp: 145, boot: 412, len: 4367, co2: 112, l100: 5.0, ncap: [4, 2021], year: 2022, styles: ["sleek", "techy"] }),
  add({ make: "Peugeot", model: "3008", variant: "1.2 Hybrid 145", body: "suv", pt: "hybrid", price: 40000, hp: 145, boot: 520, len: 4542, co2: 125, l100: 5.5, year: 2024, styles: ["sleek", "techy", "practical"] }),
  add({ make: "Peugeot", model: "5008", variant: "1.2 Hybrid 7-seat", body: "suv", pt: "hybrid", price: 45000, hp: 145, boot: 260, len: 4791, seats: 7, co2: 131, l100: 5.8, year: 2024, styles: ["practical", "sleek"] }),
  add({ make: "Citroën", model: "C3", variant: "1.2 petrol", body: "supermini", pt: "petrol", price: 22000, hp: 100, boot: 310, len: 4015, co2: 131, l100: 5.8, year: 2024, comfort: 4, styles: ["practical", "cute"], pros: ["Soft, comfortable ride and good value"] }),
  add({ make: "Citroën", model: "C3 Aircross", variant: "1.2 Hybrid", body: "crossover", pt: "hybrid", price: 28000, hp: 136, boot: 460, len: 4390, co2: 120, l100: 5.3, year: 2024, comfort: 4, styles: ["practical"] }),
  add({ make: "Citroën", model: "C4", variant: "1.2 Hybrid", body: "hatchback", pt: "hybrid", price: 31000, hp: 136, boot: 380, len: 4360, co2: 113, l100: 5.0, ncap: [4, 2021], year: 2021, comfort: 4, styles: ["practical", "sleek"] }),
  add({ make: "Citroën", model: "C5 Aircross", variant: "1.2 Hybrid", body: "suv", pt: "hybrid", price: 40000, hp: 145, boot: 565, len: 4652, co2: 120, l100: 5.3, year: 2025, isNew: true, comfort: 5, styles: ["practical"] }),
  add({ make: "Opel", model: "Corsa", variant: "1.2 Hybrid", body: "supermini", pt: "hybrid", price: 25000, hp: 110, boot: 309, len: 4060, co2: 105, l100: 4.6, ncap: [4, 2019], year: 2020, styles: ["practical"] }),
  add({ make: "Opel", model: "Mokka", variant: "1.2 turbo", body: "crossover", pt: "petrol", price: 30000, hp: 136, boot: 350, len: 4151, co2: 127, l100: 5.6, year: 2021, styles: ["sleek", "cute"] }),
  add({ make: "Opel", model: "Astra", variant: "1.2 Hybrid", body: "hatchback", pt: "hybrid", price: 32000, hp: 136, boot: 422, len: 4374, co2: 113, l100: 5.0, ncap: [4, 2022], year: 2022, styles: ["sleek", "practical"] }),
  add({ make: "Opel", model: "Frontera", variant: "1.2 Hybrid", body: "crossover", pt: "hybrid", price: 27000, hp: 110, boot: 460, len: 4385, co2: 122, l100: 5.4, year: 2025, isNew: true, styles: ["practical", "rugged"] }),
  add({ make: "Opel", model: "Grandland", variant: "1.2 Hybrid", body: "suv", pt: "hybrid", price: 38000, hp: 145, boot: 550, len: 4650, co2: 122, l100: 5.4, year: 2025, isNew: true, styles: ["practical"] }),
  add({ make: "Fiat", model: "Grande Panda", variant: "1.2 Hybrid", body: "supermini", pt: "hybrid", price: 24000, hp: 110, boot: 412, len: 3990, co2: 125, l100: 5.5, year: 2025, isNew: true, styles: ["cute", "classic", "practical"], pros: ["Quirky retro style and a big boot for its size"] }),
  add({ make: "Fiat", model: "600", variant: "1.2 Hybrid", body: "crossover", pt: "hybrid", price: 30000, hp: 100, boot: 385, len: 4171, co2: 113, l100: 5.0, year: 2024, styles: ["cute", "sleek"] }),
  add({ make: "Jeep", model: "Avenger", variant: "1.2 petrol", body: "crossover", pt: "petrol", price: 28000, hp: 100, boot: 380, len: 4084, co2: 126, l100: 5.6, ncap: [4, 2022], year: 2023, awd: "optional", styles: ["rugged", "cute"] }),

  // ---------------- Cupra & SEAT (estimated prices) ----------------
  add({ make: "Cupra", model: "Born", variant: "59 kWh", body: "hatchback", pt: "ev", price: 38000, hp: 231, boot: 385, len: 4322, kwh: 15.5, range: 425, ncap: [5, 2022], year: 2022, fun: 4, styles: ["sporty", "techy", "eco"] }),
  add({ make: "Cupra", model: "Formentor", variant: "1.5 TSI", body: "crossover", pt: "petrol", price: 40000, hp: 150, boot: 450, len: 4450, co2: 143, l100: 6.3, ncap: [5, 2021], year: 2021, fun: 4, styles: ["sporty", "sleek"], exp: 4 }),
  add({ make: "Cupra", model: "Tavascan", variant: "Electric", body: "suv", pt: "ev", price: 50000, hp: 286, boot: 540, len: 4644, kwh: 17, range: 550, year: 2024, styles: ["sporty", "sleek", "techy"] }),
  add({ make: "Cupra", model: "Terramar", variant: "1.5 eTSI", body: "suv", pt: "petrol", price: 42000, hp: 150, boot: 540, len: 4519, co2: 140, l100: 6.2, year: 2024, manualToo: false, styles: ["sporty", "practical"] }),
  add({ make: "Cupra", model: "Leon", variant: "1.5 eTSI", body: "hatchback", pt: "petrol", price: 36000, hp: 150, boot: 380, len: 4398, co2: 134, l100: 5.9, ncap: [5, 2020], year: 2020, fun: 4, styles: ["sporty", "sleek"] }),
  add({ make: "SEAT", model: "Ibiza", variant: "1.0 TSI", body: "supermini", pt: "petrol", price: 24000, hp: 95, boot: 355, len: 4059, co2: 122, l100: 5.4, ncap: [5, 2017], year: 2018, fun: 4, styles: ["sporty", "practical"] }),
  add({ make: "SEAT", model: "Arona", variant: "1.0 TSI", body: "crossover", pt: "petrol", price: 27000, hp: 95, boot: 400, len: 4153, co2: 127, l100: 5.6, ncap: [5, 2017], year: 2018, styles: ["practical"] }),
  add({ make: "SEAT", model: "Leon", variant: "1.5 TSI", body: "hatchback", pt: "petrol", price: 31000, hp: 115, boot: 380, len: 4368, co2: 129, l100: 5.7, ncap: [5, 2020], year: 2020, styles: ["practical", "sleek"] }),

  // ---------------- Audi, BMW, MINI (estimated prices) ----------------
  add({ make: "Audi", model: "A3", variant: "Sportback 30 TFSI", body: "hatchback", pt: "petrol", price: 40000, hp: 116, boot: 380, len: 4352, co2: 132, l100: 5.8, ncap: [5, 2020], year: 2020, styles: ["luxurious", "sleek"] }),
  add({ make: "Audi", model: "Q3", variant: "35 TFSI", body: "suv", pt: "petrol", price: 50000, hp: 150, boot: 488, len: 4531, co2: 150, l100: 6.6, year: 2025, isNew: true, manualToo: false, styles: ["luxurious", "practical"] }),
  add({ make: "Audi", model: "Q4 e-tron", variant: "45 electric", body: "suv", pt: "ev", price: 55000, hp: 286, boot: 520, len: 4588, kwh: 17, range: 515, ncap: [5, 2021], year: 2021, styles: ["luxurious", "eco", "techy"] }),
  add({ make: "Audi", model: "A6 e-tron", variant: "Sportback electric", body: "saloon", pt: "ev", price: 78000, hp: 367, boot: 502, len: 4928, kwh: 15, range: 700, year: 2024, comfort: 5, styles: ["luxurious", "sleek", "techy"] }),
  add({ make: "BMW", model: "1 Series", variant: "120", body: "hatchback", pt: "petrol", price: 42000, hp: 170, boot: 300, len: 4361, co2: 121, l100: 5.3, year: 2024, manualToo: false, fun: 4, styles: ["sporty", "luxurious"] }),
  add({ make: "BMW", model: "X1", variant: "sDrive18i", body: "suv", pt: "petrol", price: 50000, hp: 136, boot: 540, len: 4500, co2: 141, l100: 6.2, ncap: [5, 2022], year: 2022, manualToo: false, styles: ["luxurious", "practical"] }),
  add({ make: "BMW", model: "iX1", variant: "eDrive20", body: "suv", pt: "ev", price: 50000, hp: 204, boot: 490, len: 4500, kwh: 16, range: 475, ncap: [5, 2022], year: 2023, styles: ["luxurious", "eco", "techy"] }),
  add({ make: "BMW", model: "X3", variant: "20 xDrive", body: "suv", pt: "petrol", price: 70000, hp: 208, boot: 570, len: 4755, co2: 158, l100: 7.0, year: 2024, manualToo: false, awd: "standard", tow: 2400, styles: ["luxurious", "practical"] }),
  add({ make: "BMW", model: "i4", variant: "eDrive35", body: "saloon", pt: "ev", price: 60000, hp: 286, boot: 470, len: 4785, kwh: 16, range: 490, ncap: [4, 2022], year: 2022, fun: 4, styles: ["sporty", "luxurious", "techy"] }),
  add({ make: "MINI", model: "Cooper E", variant: "Electric", body: "supermini", pt: "ev", price: 33000, hp: 184, boot: 210, len: 3858, seats: 4, kwh: 14.5, range: 305, year: 2024, fun: 5, styles: ["cute", "sporty", "classic"], cons: ["Small boot and tight back seats"], reviewQuery: "MINI Cooper Electric" }),
  add({ make: "MINI", model: "Countryman", variant: "C", body: "suv", pt: "petrol", price: 45000, hp: 170, boot: 460, len: 4433, co2: 145, l100: 6.4, year: 2024, manualToo: false, styles: ["cute", "practical"] }),
  add({ make: "MINI", model: "Aceman", variant: "E electric", body: "crossover", pt: "ev", price: 38000, hp: 184, boot: 300, len: 4079, kwh: 14.5, range: 310, year: 2024, fun: 4, styles: ["cute", "techy"] }),

  // ---------------- Volvo, Polestar (estimated prices) ----------------
  add({ make: "Volvo", model: "EX30", variant: "Single motor", body: "crossover", pt: "ev", price: 38000, hp: 272, boot: 318, len: 4233, kwh: 16, range: 476, year: 2024, styles: ["sleek", "techy", "eco"] }),
  add({ make: "Volvo", model: "XC40", variant: "B3 mild hybrid", body: "suv", pt: "petrol", price: 47000, hp: 163, boot: 452, len: 4440, co2: 158, l100: 7.0, ncap: [5, 2018], year: 2018, manualToo: false, styles: ["luxurious", "practical"], exp: 4 }),
  add({ make: "Volvo", model: "XC90", variant: "T8 Plug-in Hybrid 7-seat", body: "suv", pt: "phev", price: 95000, hp: 455, boot: 262, len: 4953, seats: 7, co2: 30, l100: 8.0, kwh: 22, range: 70, ncap: [5, 2015], year: 2015, awd: "standard", tow: 2400, comfort: 5, styles: ["luxurious", "practical"] }),
  add({ make: "Volvo", model: "EX90", variant: "Electric 7-seat", body: "suv", pt: "ev", price: 100000, hp: 408, boot: 310, len: 5037, seats: 7, kwh: 21, range: 600, year: 2024, awd: "standard", comfort: 5, styles: ["luxurious", "techy"] }),
  add({ make: "Polestar", model: "2", variant: "Long range single motor", body: "hatchback", pt: "ev", price: 52000, hp: 299, boot: 405, len: 4606, kwh: 15, range: 650, ncap: [5, 2020], year: 2020, styles: ["sleek", "techy", "eco"] }),
  add({ make: "Polestar", model: "4", variant: "Long range single motor", body: "suv", pt: "ev", price: 62000, hp: 272, boot: 526, len: 4840, kwh: 17.5, range: 620, year: 2024, styles: ["sleek", "techy", "luxurious"], cons: ["No rear window: you use a camera mirror instead"] }),

  // ---------------- BYD (estimated prices) ----------------
  add({ make: "BYD", model: "Dolphin Surf", variant: "Electric", body: "city", pt: "ev", price: 23000, hp: 156, boot: 308, len: 3990, kwh: 15, range: 322, year: 2025, isNew: true, styles: ["cute", "eco"] }),
  add({ make: "BYD", model: "Dolphin", variant: "60 kWh", body: "hatchback", pt: "ev", price: 30000, hp: 204, boot: 345, len: 4290, kwh: 15.9, range: 427, ncap: [5, 2023], year: 2023, styles: ["eco", "practical", "techy"] }),
  add({ make: "BYD", model: "Atto 2", variant: "Electric", body: "crossover", pt: "ev", price: 31000, hp: 177, boot: 400, len: 4310, kwh: 15.6, range: 312, year: 2025, isNew: true, styles: ["eco", "practical"] }),
  add({ make: "BYD", model: "Atto 3", variant: "Electric", body: "suv", pt: "ev", price: 38000, hp: 204, boot: 440, len: 4455, kwh: 15.6, range: 420, ncap: [5, 2022], year: 2022, styles: ["eco", "techy"] }),
  add({ make: "BYD", model: "Seal", variant: "Electric", body: "saloon", pt: "ev", price: 48000, hp: 313, boot: 400, len: 4800, kwh: 16, range: 570, ncap: [5, 2023], year: 2023, fun: 4, styles: ["sleek", "techy", "sporty"] }),
  add({ make: "BYD", model: "Seal U DM-i", variant: "Plug-in Hybrid", body: "suv", pt: "phev", price: 42000, hp: 218, boot: 425, len: 4775, co2: 30, l100: 5.5, kwh: 18, range: 80, year: 2024, styles: ["practical", "eco"] }),
  add({ make: "BYD", model: "Sealion 7", variant: "Electric", body: "suv", pt: "ev", price: 55000, hp: 313, boot: 500, len: 4830, kwh: 18, range: 500, year: 2025, styles: ["sleek", "techy"] }),

  // ---------------- Honda, Suzuki, Subaru (estimated prices) ----------------
  add({ make: "Honda", model: "HR-V", variant: "e:HEV hybrid", body: "crossover", pt: "hybrid", price: 37000, hp: 131, boot: 319, len: 4340, co2: 122, l100: 5.4, year: 2021, styles: ["practical", "sleek"], pros: ["Fold-up 'magic' rear seats", "Easy to get in and out"] }),
  add({ make: "Honda", model: "ZR-V", variant: "e:HEV hybrid", body: "suv", pt: "hybrid", price: 42000, hp: 184, boot: 380, len: 4568, co2: 127, l100: 5.6, year: 2023, styles: ["practical", "sleek"] }),
  add({ make: "Honda", model: "CR-V", variant: "e:HEV hybrid", body: "suv", pt: "hybrid", price: 50000, hp: 184, boot: 587, len: 4706, co2: 147, l100: 6.5, year: 2023, awd: "optional", tow: 1500, comfort: 4, styles: ["practical"] }),
  add({ make: "Suzuki", model: "Vitara", variant: "1.5 Full Hybrid", body: "crossover", pt: "hybrid", price: 32000, hp: 115, boot: 289, len: 4185, co2: 125, l100: 5.5, ncap: [5, 2015], year: 2015, awd: "optional", styles: ["rugged", "practical"] }),
  add({ make: "Suzuki", model: "S-Cross", variant: "1.4 mild hybrid", body: "crossover", pt: "petrol", price: 33000, hp: 129, boot: 430, len: 4300, co2: 132, l100: 5.8, year: 2022, awd: "optional", styles: ["practical", "rugged"] }),
  add({ make: "Suzuki", model: "e Vitara", variant: "Electric", body: "crossover", pt: "ev", price: 38000, hp: 174, boot: 306, len: 4275, kwh: 16, range: 426, year: 2025, isNew: true, awd: "optional", styles: ["rugged", "eco"] }),
  add({ make: "Subaru", model: "Forester", variant: "e-Boxer hybrid", body: "suv", pt: "hybrid", price: 45000, hp: 136, boot: 508, len: 4655, co2: 168, l100: 7.4, year: 2025, awd: "standard", tow: 1870, styles: ["rugged", "practical"], pros: ["Permanent four-wheel drive, great on rough rural roads"], cons: ["Thirsty for a hybrid, so higher motor tax"] }),

  // ---------------- Mazda (6e price checked; others estimated) ----------------
  add({ make: "Mazda", model: "3", variant: "2.0 e-Skyactiv G", body: "hatchback", pt: "petrol", price: 33000, hp: 150, boot: 351, len: 4460, co2: 138, l100: 6.1, ncap: [5, 2019], year: 2019, fun: 4, styles: ["sleek", "sporty"], exp: 4, cons: ["Poor view out of the back"] }),
  add({ make: "Mazda", model: "CX-30", variant: "2.0 e-Skyactiv G", body: "crossover", pt: "petrol", price: 35000, hp: 150, boot: 430, len: 4395, co2: 140, l100: 6.2, ncap: [5, 2019], year: 2019, styles: ["sleek", "practical"], exp: 4 }),
  add({ make: "Mazda", model: "CX-5", variant: "2.0 e-Skyactiv G", body: "suv", pt: "petrol", price: 40000, hp: 165, boot: 522, len: 4575, co2: 159, l100: 7.0, ncap: [5, 2017], year: 2017, styles: ["practical", "sleek"], exp: 4 }),
  add({ make: "Mazda", model: "CX-60", variant: "3.3 e-Skyactiv D", body: "suv", pt: "diesel", price: 55000, hp: 200, boot: 570, len: 4745, co2: 130, l100: 5.0, ncap: [5, 2022], year: 2022, manualToo: false, awd: "optional", tow: 2500, styles: ["luxurious", "practical"] }),
  add({ make: "Mazda", model: "CX-80", variant: "3.3 e-Skyactiv D 7-seat", body: "suv", pt: "diesel", price: 70000, hp: 254, boot: 258, len: 4990, seats: 7, co2: 150, l100: 5.7, year: 2024, manualToo: false, awd: "standard", tow: 2500, comfort: 5, styles: ["luxurious", "practical"] }),
  add({ make: "Mazda", model: "6e", variant: "Electric", body: "saloon", pt: "ev", price: 37935, checked: true, hp: 258, boot: 330, len: 4921, kwh: 16.6, range: 479, year: 2025, isNew: true, styles: ["sleek", "techy"] }),

  // ---------------- Lexus, Land Rover (estimated prices) ----------------
  add({ make: "Lexus", model: "LBX", variant: "Hybrid", body: "crossover", pt: "hybrid", price: 37000, hp: 136, boot: 332, len: 4190, co2: 102, l100: 4.5, year: 2024, comfort: 4, styles: ["luxurious", "eco"] }),
  add({ make: "Lexus", model: "UX", variant: "300h hybrid", body: "crossover", pt: "hybrid", price: 45000, hp: 199, boot: 315, len: 4495, co2: 115, l100: 5.0, ncap: [5, 2019], year: 2019, styles: ["luxurious", "eco"] }),
  add({ make: "Lexus", model: "NX", variant: "350h hybrid", body: "suv", pt: "hybrid", price: 60000, hp: 244, boot: 520, len: 4660, co2: 133, l100: 5.8, ncap: [5, 2021], year: 2022, comfort: 5, styles: ["luxurious", "practical"] }),
  add({ make: "Lexus", model: "RX", variant: "350h hybrid", body: "suv", pt: "hybrid", price: 85000, hp: 250, boot: 461, len: 4890, co2: 145, l100: 6.4, ncap: [5, 2022], year: 2023, awd: "standard", comfort: 5, styles: ["luxurious"] }),
  add({ make: "Land Rover", model: "Range Rover Evoque", variant: "D165 mild hybrid", body: "suv", pt: "diesel", price: 55000, hp: 163, boot: 472, len: 4371, co2: 158, l100: 6.0, ncap: [5, 2019], year: 2019, manualToo: false, awd: "standard", styles: ["luxurious", "sleek"] }),
  add({ make: "Land Rover", model: "Discovery Sport", variant: "D165 7-seat", body: "suv", pt: "diesel", price: 58000, hp: 163, boot: 157, len: 4597, seats: 7, co2: 168, l100: 6.4, year: 2019, manualToo: false, awd: "standard", tow: 2200, styles: ["rugged", "practical"] }),
  add({ make: "Land Rover", model: "Range Rover Velar", variant: "P400e Plug-in Hybrid", body: "suv", pt: "phev", price: 85000, hp: 404, boot: 513, len: 4797, co2: 39, l100: 8.0, kwh: 22, range: 64, year: 2023, awd: "standard", tow: 2000, comfort: 5, styles: ["luxurious", "sleek"] }),
];
