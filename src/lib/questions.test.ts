import { describe, expect, it } from "vitest";
import { QUESTIONS, activeQuestions, parseValue } from "./questions";
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
    expect(quick).toEqual(["A1", "A2", "A5", "B2", "C1", "C4", "D2", "E1", "G1"]);
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

describe("share links", () => {
  it("round-trips answers, including non-ASCII", () => {
    const a = { budget: 20000, county: "Dún Laoghaire test", styles: ["cute" as const] };
    expect(decodeAnswers(encodeAnswers(a))).toEqual(a);
  });
  it("returns null for junk", () => {
    expect(decodeAnswers("%%%")).toBeNull();
  });
});
