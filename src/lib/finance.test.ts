import { describe, expect, it } from "vitest";
import { CAR_BY_ID } from "@/data/cars";
import { FINANCE_OFFERS, liveOffers, offerFor } from "@/data/financeOffers";
import PHOTOS from "@/data/carPhotos.json";
import SOURCES from "../../scripts/car-photo-sources.json";

describe("0% finance offers", () => {
  it("only refers to cars that exist, with a source link and a check date", () => {
    for (const o of FINANCE_OFFERS) {
      for (const id of o.appliesTo) expect(CAR_BY_ID[id], id).toBeDefined();
      expect(o.source).toMatch(/^https:\/\//);
      expect(o.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("matches cars to their brand's offer", () => {
    expect(offerFor(CAR_BY_ID["vw-golf-tsi"], "2026-11-10")?.brand).toBe("Volkswagen");
    expect(offerFor(CAR_BY_ID["skoda-octavia-combi-tdi"], "2026-11-10")?.brand).toBe("Skoda");
    expect(offerFor(CAR_BY_ID["toyota-corolla-hybrid"], "2026-11-10")).toBeUndefined();
  });
  it("hides offers after they end", () => {
    expect(offerFor(CAR_BY_ID["vw-golf-tsi"], "2026-11-20")).toBeDefined();
    expect(offerFor(CAR_BY_ID["vw-golf-tsi"], "2026-11-21")).toBeUndefined();
    expect(liveOffers("2027-03-01").map((o) => o.brand)).toEqual(["Nissan"]);
    expect(liveOffers("2027-07-01")).toHaveLength(0);
  });
});

describe("car photos", () => {
  it("every car has a credited, freely licensed photo, unless deliberately skipped", () => {
    const photos = PHOTOS as Record<string, { file: string; author: string; license: string; source: string }>;
    const skipped = new Set(
      Object.entries(SOURCES as Record<string, { skip?: boolean }>).filter(([, v]) => v && v.skip).map(([k]) => k),
    );
    for (const id of Object.keys(CAR_BY_ID)) {
      const p = photos[id];
      if (skipped.has(id)) {
        expect(p, `${id} is skipped but has a photo`).toBeUndefined();
        continue;
      }
      expect(p, id).toBeDefined();
      expect(p.license).toMatch(/^(CC BY|CC0|Public domain)/i);
      expect(p.author.length).toBeGreaterThan(0);
      expect(p.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });
});
