import { describe, expect, it } from "vitest";
import { CAR_BY_ID } from "@/data/cars";
import { listingLinks, primaryListing } from "@/data/carLinks";

const octavia = CAR_BY_ID["skoda-octavia-combi-tdi"];

describe("car-for-sale links", () => {
  it("filters Carzone to the budget and the car's generation", () => {
    const cz = listingLinks(octavia, false, { maxPriceEur: 19800 }).find((l) => l.name === "Carzone")!;
    expect(cz.url).toBe("https://www.carzone.ie/used-cars/skoda/octavia?maxPrice=20000&minYear=2020");
    expect(cz.filtered).toBe(true);
    expect(cz.status).toBe("checked");
  });
  it("still filters by year when there's no budget", () => {
    const cz = listingLinks(octavia, false).find((l) => l.name === "Carzone")!;
    expect(cz.url).toBe("https://www.carzone.ie/used-cars/skoda/octavia?minYear=2020");
  });
  it("converts the budget to pounds for AutoTrader UK", () => {
    const at = listingLinks(octavia, true, { maxPriceEur: 23000 }).find((l) => l.region === "Northern Ireland" && l.name.startsWith("AutoTrader"))!;
    expect(at.url).toContain("price-to=20000");
    expect(at.url).toContain("year-from=2020");
    expect(at.url).toContain("postcode=BT1+1AA");
  });
  it("only shows Northern Ireland sites when asked", () => {
    expect(listingLinks(octavia, false).every((l) => l.region === "Republic")).toBe(true);
    expect(listingLinks(octavia, true).some((l) => l.region === "Northern Ireland")).toBe(true);
  });
  it("links UsedCarsNI and CarsIreland to their home pages only", () => {
    const links = listingLinks(octavia, true);
    expect(links.find((l) => l.name === "UsedCarsNI")!.url).toBe("https://www.usedcarsni.com");
    expect(links.find((l) => l.name === "CarsIreland.ie")!.url).toBe("https://www.carsireland.ie");
  });
  it("picks Carzone for Republic cards and AutoTrader for NI deals", () => {
    expect(primaryListing(octavia, false).name).toBe("Carzone");
    expect(primaryListing(octavia, true).name).toBe("AutoTrader UK (near Belfast)");
  });
  it("uses the sales sites' model names", () => {
    const golf = listingLinks(CAR_BY_ID["vw-golf-gti"], false).find((l) => l.name === "Carzone")!;
    expect(golf.url).toContain("/volkswagen/golf?");
  });
});
