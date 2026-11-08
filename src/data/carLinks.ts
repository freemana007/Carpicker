// Links to real car websites: each brand's official Irish site, and searches
// on the main car-for-sale sites in the Republic and Northern Ireland.
//
// URL patterns are checked by `npm run check-links` (needs network access to
// these sites).
//
// Last check, 8 November 2026:
// - Brand sites: BMW, Dacia, Ford, Hyundai, Kia, Land Rover, Mazda, Mercedes-Benz,
//   Nissan, Renault, Skoda, Suzuki, Toyota and Volkswagen load. Citroën, Fiat,
//   Honda, Peugeot, Tesla and Volvo block automated checks (HTTP 403), MINI was
//   too slow to answer, and MG moved to www.mg.ie: check those by hand.
// - Carzone: all 48 model searches open the right model's page (title checked).
// - AutoTrader UK: all 48 searches load (results are built in the browser, so
//   the model can't be confirmed by script).
// - DoneDeal, CarsIreland.ie and UsedCarsNI block automated checks: check by hand.

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
};

export interface ListingSite {
  name: string;
  region: "Republic" | "Northern Ireland";
  home: string;
  /** Builds a search URL for a make and model. */
  search: (make: string, model: string) => string;
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
  return car.model.replace(/ (Combi|Electric|EV|GTI)$/i, "").replace(/^MG4$/, "MG4 EV");
}

export const LISTING_SITES: ListingSite[] = [
  {
    name: "DoneDeal",
    region: "Republic",
    home: "https://www.donedeal.ie/cars",
    search: (make, model) => `https://www.donedeal.ie/cars/${encodeURIComponent(make.replace(/ /g, "-"))}/${encodeURIComponent(model.replace(/ /g, "-"))}`,
  },
  {
    name: "Carzone",
    region: "Republic",
    home: "https://www.carzone.ie",
    search: (make, model) => `https://www.carzone.ie/used-cars/${slug(make)}/${slug(model)}`,
  },
  {
    name: "CarsIreland.ie",
    region: "Republic",
    home: "https://www.carsireland.ie",
    search: (make, model) => `https://www.carsireland.ie/used-cars/${slug(make)}/${slug(model)}`,
  },
  {
    name: "UsedCarsNI",
    region: "Northern Ireland",
    home: "https://www.usedcarsni.com",
    search: () => "https://www.usedcarsni.com",
  },
  {
    name: "AutoTrader UK (near Belfast)",
    region: "Northern Ireland",
    home: "https://www.autotrader.co.uk",
    search: (make, model) =>
      `https://www.autotrader.co.uk/car-search?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&postcode=BT1%201AA`,
  },
];

export function brandSite(car: Car): string | undefined {
  return BRAND_SITES[car.make];
}

export function listingLinks(car: Car, includeNi: boolean) {
  const model = listingModel(car);
  return LISTING_SITES.filter((s) => includeNi || s.region === "Republic").map((s) => ({
    name: s.name,
    region: s.region,
    url: s.search(car.make, model),
  }));
}
