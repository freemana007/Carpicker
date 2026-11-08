import { describe, expect, it } from "vitest";
import { CARS, CAR_BY_ID } from "@/data/cars";
import { CONFIG } from "./costs";
import { excludeReason, recommend } from "./engine";
import { PERSONAS } from "./personas";
import type { Answers } from "./types";

const modelOf = (id: string) => `${CAR_BY_ID[id].make} ${CAR_BY_ID[id].model}`;

describe("general rules", () => {
  it("gives the same results for the same answers", () => {
    const a = PERSONAS.corkFamily;
    expect(JSON.stringify(recommend(a).picks)).toBe(JSON.stringify(recommend(a).picks));
  });

  it("returns 3–5 different models with reasons and a heads-up", () => {
    for (const [name, a] of Object.entries(PERSONAS)) {
      const r = recommend(a);
      expect(r.picks.length, name).toBeGreaterThanOrEqual(3);
      expect(r.picks.length, name).toBeLessThanOrEqual(5);
      const models = r.picks.map((p) => modelOf(p.car.id));
      expect(new Set(models).size, name).toBe(models.length);
      for (const p of r.picks) {
        expect(p.reasons.length, `${name} ${p.car.id}`).toBeGreaterThanOrEqual(1);
        expect(p.reasons.length).toBeLessThanOrEqual(3);
        expect(p.headsUp.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps every pick within budget", () => {
    for (const [name, a] of Object.entries(PERSONAS)) {
      const r = recommend(a);
      for (const p of r.picks) expect(p.option.price, `${name} ${p.car.id}`).toBeLessThanOrEqual(r.budget!);
      for (const s of r.stretch) expect(s.option.price).toBeLessThanOrEqual(r.budget! * (1 + CONFIG.budgetStretch));
    }
  });

  it("works with no answers at all", () => {
    const r = recommend({});
    expect(r.picks.length).toBeGreaterThanOrEqual(3);
  });
});

describe("hard filters", () => {
  it("only shows automatics for an automatic-only licence", () => {
    const r = recommend(PERSONAS.newDriverAuto);
    for (const s of r.ranked) expect(s.car.gearbox).toContain("auto");
    expect(excludeReason(CAR_BY_ID["mazda-mx5"], { autoOnly: "yes" })).toBe("no automatic version");
  });

  it("needs 7 seats when asked", () => {
    const r = recommend({ mustHaves: ["seven"] });
    for (const s of r.ranked) expect(s.car.seats).toBe(7);
  });

  it("leaves out brands the user wants to avoid", () => {
    const r = recommend({ brandsAvoid: ["Toyota"] });
    expect(r.ranked.some((s) => s.car.make === "Toyota")).toBe(false);
  });

  it("leaves out EVs whose range is too short", () => {
    expect(excludeReason(CAR_BY_ID["nissan-leaf"], { dailyKm: "150+" })).toMatch(/range/);
    expect(excludeReason(CAR_BY_ID["tesla-model-3"], { dailyKm: "150+" })).toBeNull();
  });

  it("needs 4x4 or high ground clearance for farm lanes", () => {
    const r = recommend({ roads: "farm" });
    for (const s of r.ranked) expect(s.car.awd !== "no" || s.car.groundClearance === "high").toBe(true);
  });

  it("respects towing needs", () => {
    const r = recommend({ carry: ["towing"] });
    for (const s of r.ranked) expect(s.car.towKg).toBeGreaterThanOrEqual(1300);
  });

  it("drops cars with high motor tax when that's a deal-breaker", () => {
    const r = recommend({ dealBreakers: ["tax"] });
    expect(r.ranked.some((s) => s.car.id === "land-rover-defender")).toBe(false);
  });
});

describe("Northern Ireland", () => {
  it("never shows NI options when the user says Republic only", () => {
    const r = recommend({ ...PERSONAS.donegalBorder, ni: "no" });
    for (const s of r.ranked) {
      expect(s.option.source).toBe("ie");
      expect(s.niCompare).toBeUndefined();
    }
  });

  it("only recommends an NI car when it's cheaper after all costs", () => {
    for (const ni of ["yes", "big"] as const) {
      const a: Answers = { ...PERSONAS.donegalBorder, ni };
      const r = recommend(a);
      const threshold = ni === "big" ? CONFIG.northernIreland.bigSavingThresholdEur : CONFIG.northernIreland.savingThresholdEur;
      for (const p of r.picks.filter((p) => p.option.source === "ni")) {
        expect(p.option.ni!.saving).toBeGreaterThanOrEqual(threshold);
        expect(p.option.ni!.total).toBeLessThanOrEqual(r.budget!);
      }
    }
  });

  it("shows an NI deal for the Donegal border buyer", () => {
    const r = recommend(PERSONAS.donegalBorder);
    const ni = r.picks.find((p) => p.role === "ni");
    expect(ni).toBeDefined();
    expect(ni!.option.source).toBe("ni");
    expect(ni!.option.ni!.lines.map((l) => l.label)).toContain("VRT (estimate)");
  });

  it("does not recommend high-VRT cars from NI when they cost more", () => {
    const a: Answers = { ni: "yes", county: "Kerry", budget: 30000, payMethod: "cash", condition: "used" };
    const r = recommend(a);
    const def = r.ranked.find((s) => s.car.id === "vw-tiguan-tdi");
    if (def?.niCompare) expect(def.niCompare.verdict).not.toBe("worth");
    expect(r.picks.some((p) => p.car.id === "vw-tiguan-tdi" && p.option.source === "ni")).toBe(false);
  });
});

describe("personas (PLAN.md §10)", () => {
  it("first job in Dublin: small cheap car, low insurance", () => {
    const r = recommend(PERSONAS.dublinFirstJob);
    const best = r.picks[0];
    expect(["city", "supermini"]).toContain(best.car.body);
    expect(best.car.insuranceGroup).toBeLessThanOrEqual(12);
  });

  it("new driver, automatic only: automatics with a warning when needed", () => {
    const r = recommend(PERSONAS.newDriverAuto);
    for (const p of r.picks) expect(p.car.gearbox).toContain("auto");
    expect(r.picks[0].car.insuranceGroup).toBeLessThanOrEqual(15);
  });

  it("growing family in Cork: roomy cars with 5+ seats", () => {
    const r = recommend(PERSONAS.corkFamily);
    for (const p of r.picks) {
      expect(p.car.seats).toBeGreaterThanOrEqual(5);
      expect(p.factors.space).toBeGreaterThanOrEqual(75);
    }
  });

  it("rural commuter in Mayo: not a tiny car, diesel or hybrid", () => {
    const r = recommend(PERSONAS.mayoRural);
    const best = r.picks[0];
    expect(["city", "supermini"]).not.toContain(best.car.body);
    for (const p of r.picks) expect(["diesel", "hybrid", "phev"]).toContain(p.car.powertrain);
  });

  it("EV commuter in Kildare: only electric cars", () => {
    const r = recommend(PERSONAS.kildareEv);
    for (const p of r.picks) expect(p.car.powertrain).toBe("ev");
  });

  it("dreamer: the dream pick is a real sports car", () => {
    const r = recommend(PERSONAS.dreamer);
    const dream = r.picks.find((p) => p.role === "dream");
    expect(dream?.car.id).toBe("mazda-mx5");
  });

  it("retiree in Galway: easy to get into and automatic", () => {
    const r = recommend(PERSONAS.galwayRetiree);
    for (const p of r.picks) {
      expect(p.car.easyEntry).toBe(true);
      expect(p.car.gearbox).toContain("auto");
    }
    expect(r.picks[0].car.reliability).toBeGreaterThanOrEqual(4.5);
  });
});

describe("data sanity", () => {
  it("has unique ids and sensible values", () => {
    expect(new Set(CARS.map((c) => c.id)).size).toBe(CARS.length);
    for (const c of CARS) {
      expect(c.refPriceEur).toBeGreaterThan(5000);
      expect(c.seats).toBeGreaterThanOrEqual(2);
      expect(c.reliability).toBeLessThanOrEqual(5);
      expect(c.pros.length).toBeGreaterThan(0);
      expect(c.cons.length).toBeGreaterThan(0);
      if (c.powertrain === "ev") expect(c.rangeKm).toBeGreaterThan(0);
      else expect(c.fuelL100).toBeGreaterThan(0);
    }
  });
});
