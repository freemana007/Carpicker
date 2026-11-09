// Links to real car websites: each brand's official Irish site, and searches
// on the main car-for-sale sites in the Republic and Northern Ireland.
//
// URL patterns are checked by `npm run check-links` (needs network access to
// these sites).
//
// Last check, 9 November 2026:
// - Brand sites: BMW, Dacia, Ford, Hyundai, Kia, Land Rover, Mazda, Mercedes-Benz,
//   MG (mg.ie), Nissan, Renault, Skoda, Suzuki, Toyota and Volkswagen load. Citroën,
//   Fiat, Honda, Peugeot, Tesla and Volvo block automated checks (HTTP 403) and
//   MINI was too slow to answer: check those by hand.
// - Carzone: all 48 model searches open the right model's page, and the
//   maxPrice / minYear filters work (862 Octavias → 36 for €15–20k, 2020–2021).
// - AutoTrader UK: searches load; results are built in the browser, so the
//   price-to / year-from filters can't be confirmed by script.
// - DoneDeal and CarsIreland.ie sit behind security checks, so their search
//   addresses can't be confirmed. CarsIreland links go to its home page.
// - UsedCarsNI's robots.txt asks AI tools not to access it: home page link only,
//   and it's never fetched by our scripts.

import COSTS from "@/config/ireland-costs.json";
import type { Car } from "@/lib/types";

export const LINKS_CHECKED = "2026-11-08";

/** Official Irish websites (Irish distributors). */
export const BRAND_SITES: Record<string, string> = {
  BMW: "https://www.bmw.ie",
  "Citroën": "https://www.citroen.ie",
  Dacia: "https://www.dacia.ie",
  Fiat: "https://www.fiat.ie",
  Ford: "https://www.ford.ie",
  Honda: "https://www.honda.ie",
  Hyundai: "https://www.hyundai.ie",
  Kia: "https://www.kia.com/ie/",
  "Land Rover": "https://www.landrover.ie",
  MG: "https://www.mg.ie",
  MINI: "https://www.mini.ie",
  Mazda: "https://www.mazda.ie",
  "Mercedes-Benz": "https://www.mercedes-benz.ie",
  Nissan: "https://www.nissan.ie",
  Peugeot: "https://www.peugeot.ie",
  Renault: "https://www.renault.ie",
  Skoda: "https://www.skoda.ie",
  Suzuki: "https://www.suzuki.ie",
  Tesla: "https://www.tesla.com/en_ie",
  Toyota: "https://www.toyota.ie",
  Volkswagen: "https://www.volkswagen.ie",
  Volvo: "https://www.volvocars.com/ie/",
  // Added November 2026, not yet checked by `npm run check-links` (these sites
  // aren't on the network allow-list of the build environment):
  Audi: "https://www.audi.ie",
  BYD: "https://www.byd.com/ie",
  Cupra: "https://www.cupraofficial.ie",
  Jeep: "https://www.jeep.ie",
  Lexus: "https://www.lexus.ie",
  Opel: "https://www.opel.ie",
  Polestar: "https://www.polestar.com/ie/",
  SEAT: "https://www.seat.ie",
  Subaru: "https://www.subaru.ie",
};

export interface ListingFilters {
  /** Most you'll pay, in euro (your budget). */
  maxPriceEur?: number;
  /** Oldest year to show (so you get the right generation of the car). */
  minYear?: number;
}

export interface ListingSite {
  name: string;
  region: "Republic" | "Northern Ireland";
  home: string;
  /**
   * "checked": search and filters confirmed to work.
   * "loads": search page loads, but its results couldn't be confirmed by script.
   * "unconfirmed": the site blocks automated checks; link may need fixing.
   * "home": links to the site's home page (search there).
   */
  status: "checked" | "loads" | "unconfirmed" | "home";
  /** Applies the budget and year filters. */
  filters: boolean;
  /** Builds a search URL for a make and model. */
  search: (make: string, model: string, f: ListingFilters) => string;
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Model name as the sales sites use it (e.g. "Octavia Combi" is listed under "Octavia"). */
export function listingModel(car: Car): string {
  return car.model
    .replace(/ \(new\)$/i, "")
    .replace(/ (Combi|Electric|EV|GTI|Hybrid|Tourer|Saloon|E-Tech|DM-i|Passenger)$/i, "")
    .replace(/^MG4$/, "MG4 EV");
}

const EUR_PER_GBP = COSTS.exchange.eurPerGbp;
const roundUp = (n: number, to: number) => Math.ceil(n / to) * to;

export const LISTING_SITES: ListingSite[] = [
  {
    name: "Carzone",
    region: "Republic",
    home: "https://www.carzone.ie",
    status: "checked",
    filters: true,
    search: (make, model, f) => {
      const q = new URLSearchParams();
      if (f.maxPriceEur) q.set("maxPrice", String(roundUp(f.maxPriceEur, 500)));
      if (f.minYear) q.set("minYear", String(f.minYear));
      const qs = q.toString();
      return `https://www.carzone.ie/used-cars/${slug(make)}/${slug(model)}${qs ? `?${qs}` : ""}`;
    },
  },
  {
    name: "DoneDeal",
    region: "Republic",
    home: "https://www.donedeal.ie/cars",
    status: "unconfirmed",
    filters: false,
    search: (make, model) =>
      `https://www.donedeal.ie/cars/${encodeURIComponent(make.replace(/ /g, "-"))}/${encodeURIComponent(model.replace(/ /g, "-"))}`,
  },
  {
    name: "CarsIreland.ie",
    region: "Republic",
    home: "https://www.carsireland.ie",
    status: "home",
    filters: false,
    search: () => "https://www.carsireland.ie",
  },
  {
    name: "AutoTrader UK (near Belfast)",
    region: "Northern Ireland",
    home: "https://www.autotrader.co.uk",
    status: "loads",
    filters: true,
    search: (make, model, f) => {
      const q = new URLSearchParams({ make, model, postcode: "BT1 1AA" });
      if (f.maxPriceEur) q.set("price-to", String(roundUp(f.maxPriceEur / EUR_PER_GBP, 500)));
      if (f.minYear) q.set("year-from", String(f.minYear));
      return `https://www.autotrader.co.uk/car-search?${q.toString()}`;
    },
  },
  {
    // UsedCarsNI's robots.txt asks AI tools not to access the site, so we only link to its home page.
    name: "UsedCarsNI",
    region: "Northern Ireland",
    home: "https://www.usedcarsni.com",
    status: "home",
    filters: false,
    search: () => "https://www.usedcarsni.com",
  },
];

/** Carzone's own model names where they differ from ours (from Carzone's brand pages, 9 November 2026). */
const CARZONE_MODEL: Record<string, string> = {
  "toyota-corolla-touring-sports": "corolla",
  "toyota-bz": "bz4x",
  "toyota-bz-touring": "bz4x",
  "toyota-land-cruiser": "landcruiser",
  "mercedes-benz-cla": "cla-class",
  "mercedes-benz-cla-electric": "cla-class",
  "mercedes-benz-gla": "gla-class",
  "mercedes-benz-glc": "glc-class",
  "mercedes-benz-glc-electric": "glc-class",
  "mg-s5": "mgs5",
  "ford-puma-gen-e": "puma",
  "audi-a6-e-tron": "a6-sportback-e-tron",
  "mini-cooper-e": "cooper",
  "mazda-3": "mazda3",
  "mazda-6e": "mazda6e",
  "lexus-ux": "ux-300h",
  "lexus-nx": "nx-350h",
  "lexus-rx": "rx-450h-plus",
};

export function brandSite(car: Car): string | undefined {
  return BRAND_SITES[car.make];
}

export interface ListingLink {
  name: string;
  region: ListingSite["region"];
  url: string;
  status: ListingSite["status"];
  filtered: boolean;
}

/** Search links for this car; filters to the budget and the car's generation where the site supports it. */
export function listingLinks(car: Car, includeNi: boolean, f: ListingFilters = {}): ListingLink[] {
  const model = listingModel(car);
  const filters: ListingFilters = { maxPriceEur: f.maxPriceEur, minYear: f.minYear ?? car.yearFrom };
  return LISTING_SITES.filter((s) => includeNi || s.region === "Republic").map((s) => ({
    name: s.name,
    region: s.region,
    url: s.search(car.make, s.name === "Carzone" ? CARZONE_MODEL[car.id] ?? model : model, filters),
    status: s.status,
    filtered: s.filters && !!(filters.maxPriceEur || filters.minYear),
  }));
}

/** The best single "Find one for sale" link for a card. */
export function primaryListing(car: Car, fromNi: boolean, f: ListingFilters = {}): ListingLink {
  const links = listingLinks(car, true, f);
  return links.find((l) => l.name === (fromNi ? "AutoTrader UK (near Belfast)" : "Carzone"))!;
}
