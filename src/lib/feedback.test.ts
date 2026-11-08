import { describe, expect, it } from "vitest";
import { TOTAL_MODELS, countFits, explainMissing, recommend, scoreOne, suggestFix, tagline } from "./engine";
import { PERSONAS } from "./personas";
import { aboutYou } from "./summary";

describe("live 'cars still fit' counter", () => {
  it("starts with every model and goes down as answers filter", () => {
    expect(countFits({})).toBe(TOTAL_MODELS);
    const auto = countFits({ autoOnly: "yes" });
    expect(auto).toBeLessThan(TOTAL_MODELS);
    expect(countFits({ autoOnly: "yes", mustHaves: ["seven"] })).toBeLessThan(auto);
  });
  it("matches the number of models in the results", () => {
    const a = PERSONAS.corkFamily;
    expect(countFits(a)).toBe(recommend(a).ranked.filter((s) => !s.option.stretch).length);
  });
});

describe("fix suggestions when nothing fits", () => {
  it("suggests raising the budget", () => {
    const a = { payMethod: "cash" as const, budget: 2000, condition: "used" as const };
    expect(countFits(a)).toBe(0);
    const fix = suggestFix(a)!;
    expect(fix.label).toMatch(/budget/);
    expect(countFits({ ...a, ...fix.patch })).toBeGreaterThan(0);
  });
  it("suggests dropping an impossible must-have", () => {
    const a = { mustHaves: ["seven" as const, "manual" as const], engines: ["ev" as const] };
    expect(countFits(a)).toBe(0);
    const fix = suggestFix(a);
    expect(fix).not.toBeNull();
    expect(countFits({ ...a, ...fix!.patch })).toBe(fix!.count);
  });
  it("returns nothing when cars already fit", () => {
    expect(countFits(PERSONAS.dreamer)).toBeGreaterThan(0);
  });
});

describe("why isn't my car here?", () => {
  it("explains a hard-filter exclusion", () => {
    const r = explainMissing("mazda-mx5", { autoOnly: "yes" })!;
    expect(r.status).toBe("excluded");
    expect(r.message).toMatch(/automatic/);
  });
  it("explains a car that's over budget", () => {
    const r = explainMissing("land-rover-defender", { payMethod: "cash", budget: 10000, condition: "used" })!;
    expect(r.status).toBe("budget");
    expect(r.message).toMatch(/over your budget/);
  });
  it("gives the rank of a car that fits but wasn't picked", () => {
    const a = PERSONAS.corkFamily;
    const picked = new Set(recommend(a).picks.map((p) => p.car.id));
    const other = recommend(a).ranked.find((s) => !picked.has(s.car.id) && !s.option.stretch)!;
    const r = explainMissing(other.car.id, a)!;
    expect(r.status).toBe("ranked");
    expect(r.rank).toBeGreaterThan(1);
  });
  it("accepts a model name", () => {
    expect(explainMissing("Toyota Corolla", {})?.car.model).toBe("Corolla");
  });
});

describe("descriptions and single-car scoring", () => {
  it("writes a one-line tagline", () => {
    const best = recommend(PERSONAS.corkFamily).picks[0];
    const t = tagline(best);
    expect(t).toMatch(/^An? .+\.$/);
    expect(t.length).toBeLessThan(90);
  });
  it("scores any car, even outside the shortlist", () => {
    const r = scoreOne("land-rover-defender", PERSONAS.dublinFirstJob)!;
    expect(r.scored.car.id).toBe("land-rover-defender");
    expect(r.scored.score).toBeGreaterThan(0);
  });
});

describe("About you summary", () => {
  it("describes the answers in plain sentences, each linked to a question", () => {
    const lines = aboutYou(PERSONAS.donegalBorder);
    const labels = lines.map((l) => l.label);
    expect(labels).toEqual(expect.arrayContaining(["Budget", "Northern Ireland", "County", "Who's coming", "Matters most"]));
    for (const l of lines) expect(l.qid).toMatch(/^[A-G]\d$/);
    expect(lines.find((l) => l.label === "Budget")!.text).toMatch(/€20,000/);
  });
});
