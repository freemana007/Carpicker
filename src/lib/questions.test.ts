import { describe, expect, it } from "vitest";
import { CHAPTERS, QUESTIONS, activeQuestions, disabledReason, parseValue, smartPriorities } from "./questions";
import { decodeAnswers, encodeAnswers } from "./share";

const ids = (a: Parameters<typeof activeQuestions>[0], quick = false) => activeQuestions(a, quick).map((q) => q.id);

describe("quiz skip logic", () => {
  it("skips the car-seat question when travelling alone", () => {
    expect(ids({ passengers: "solo" })).not.toContain("C2");
    expect(ids({ passengers: "family" })).toContain("C2");
  });
  it("skips the automatic-only question for learners", () => {
    expect(ids({ licence: "learner" })).not.toContain("B2");
    expect(ids({ licence: "full" })).toContain("B2");
  });
  it("asks for take-home pay only when the budget is unknown", () => {
    expect(ids({})).not.toContain("A3");
    expect(ids({ budgetUnknown: true })).toContain("A3");
    expect(ids({ budgetUnknown: true }, true)).toContain("A3");
  });
  it("asks for the county only when open to Northern Ireland", () => {
    expect(ids({ ni: "no" })).not.toContain("C8");
    expect(ids({ ni: "yes" })).toContain("C8");
    expect(ids({ ni: "big" }, true)).toContain("C8");
  });
  it("quick mode is short", () => {
    const quick = ids({}, true);
    expect(quick.length).toBeLessThanOrEqual(10);
    expect(quick).toEqual(["A1", "A2", "A5", "B2", "C4", "C1", "E1", "D2", "G1"]);
  });
  it("the full quiz is about 20 questions (was 31)", () => {
    const typical = ids({ licence: "full", passengers: "family", ni: "no" });
    expect(typical.length).toBeLessThanOrEqual(22);
    expect(QUESTIONS.length).toBeLessThanOrEqual(24);
  });
  it("every question belongs to one of the 5 chapters, in chapter order", () => {
    expect(CHAPTERS).toHaveLength(5);
    const order = QUESTIONS.map((q) => CHAPTERS.findIndex((c) => c.title === q.section));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it("every question has a unique id and choice questions have options", () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) if (q.kind === "single" || q.kind === "multi") expect(q.options!.length).toBeGreaterThan(1);
  });
  it("parses numbers and booleans", () => {
    expect(parseValue("childSeats", "2")).toBe(2);
    expect(parseValue("tradeIn", "true")).toBe(true);
    expect(parseValue("driving", "town")).toBe("town");
  });
});

describe("constraints and smart defaults", () => {
  const needs = QUESTIONS.find((q) => q.id === "F1")!;
  it("disables manual for an automatic-only licence", () => {
    expect(disabledReason(needs, "manual", { autoOnly: "yes" })).toMatch(/automatic only/);
    expect(disabledReason(needs, "manual", {})).toBeNull();
  });
  it("makes automatic and manual mutually exclusive", () => {
    expect(disabledReason(needs, "auto", { mustHaves: ["manual"] })).not.toBeNull();
    expect(disabledReason(needs, "manual", { mustHaves: ["auto"] })).not.toBeNull();
  });
  it("orders priorities from earlier answers", () => {
    expect(smartPriorities({})[0]).toBe("price");
    const family = smartPriorities({ passengers: "family", childSeats: 2, carry: ["buggy"] });
    expect(family.slice(0, 3)).toContain("space");
    expect(family.slice(0, 3)).toContain("safety");
    const commuter = smartPriorities({ driving: "rural", dailyKm: "150+" });
    expect(commuter.indexOf("running")).toBeLessThan(3);
    const sporty = smartPriorities({ styles: ["sporty"], feel: "zippy" });
    expect(sporty.indexOf("style")).toBeLessThan(3);
    expect(new Set(sporty).size).toBe(8);
  });
});

describe("share links", () => {
  it("round-trips answers, including non-ASCII", () => {
    const a = { budget: 20000, county: "Dún Laoghaire test", styles: ["cute" as const] };
    expect(decodeAnswers(encodeAnswers(a))).toEqual(a);
  });
  it("returns null for junk", () => {
    expect(decodeAnswers("%%%")).toBeNull();
  });
});
