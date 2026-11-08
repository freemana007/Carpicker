import { describe, expect, it } from "vitest";
import { CAR_BY_ID } from "@/data/cars";
import {
  CONFIG,
  annualEnergyCost,
  budgetTotal,
  estimateVrt,
  iePrice,
  monthlyToTotal,
  motorTax,
  niLandedCost,
  niVerdict,
  noxLevy,
  totalToMonthly,
  vrtRate,
} from "./costs";

const corolla = CAR_BY_ID["toyota-corolla-hybrid"];
const leaf = CAR_BY_ID["nissan-leaf"];
const tiguan = CAR_BY_ID["vw-tiguan-tdi"];

describe("VRT", () => {
  it("picks the rate for the CO2 band", () => {
    expect(vrtRate(0)).toBe(0.07);
    expect(vrtRate(50)).toBe(0.07);
    expect(vrtRate(51)).toBe(0.09);
    expect(vrtRate(102)).toBe(0.1275);
    expect(vrtRate(250)).toBe(0.37);
  });

  it("calculates the NOx levy in tiers and caps it", () => {
    expect(noxLevy(0, false)).toBe(0);
    expect(noxLevy(20, false)).toBe(100);
    expect(noxLevy(40, false)).toBe(200);
    expect(noxLevy(50, false)).toBe(200 + 150);
    expect(noxLevy(100, false)).toBe(CONFIG.vrt.noxLevy.capOtherEur);
    expect(noxLevy(100, true)).toBe(200 + 600 + 500);
  });

  it("applies the minimum VRT", () => {
    const vrt = estimateVrt(leaf, 1000);
    expect(vrt.total).toBe(CONFIG.vrt.minimumEur);
  });

  it("gives electric cars VRT relief", () => {
    const vrt = estimateVrt(leaf, 20000);
    expect(vrt.evRelief).toBe(1400);
    expect(vrt.total).toBe(CONFIG.vrt.minimumEur);
  });

  it("is OMSP x rate + NOx for a hybrid", () => {
    const vrt = estimateVrt(corolla, 20000);
    expect(vrt.total).toBe(Math.round((20000 * 0.1275 + 25) / 10) * 10);
  });
});

describe("motor tax", () => {
  it("uses WLTP bands for cars registered from 2021", () => {
    expect(motorTax(corolla, 0)).toBe(180); // 102 g/km: 101–110 band
    expect(motorTax(leaf, 3)).toBe(120);
  });
  it("uses NEDC bands (estimated) for older cars", () => {
    // 2018 car: 102 x 0.85 = 86.7 g/km NEDC -> €180 band
    expect(motorTax(corolla, CONFIG.currentYear - 2018)).toBe(180);
  });
});

describe("loans and budget", () => {
  it("converts monthly to total and back", () => {
    const total = monthlyToTotal(400);
    expect(total).toBeGreaterThan(19000);
    expect(total).toBeLessThan(21000);
    expect(Math.abs(totalToMonthly(total) - 400)).toBeLessThan(5);
  });
  it("reads cash budgets as totals and loan budgets as monthly", () => {
    expect(budgetTotal({ payMethod: "cash", budget: 15000 })).toBe(15000);
    expect(budgetTotal({ payMethod: "loan", budget: 400 })).toBe(monthlyToTotal(400));
  });
  it("suggests a budget from take-home pay when unknown", () => {
    const b = budgetTotal({ budgetUnknown: true, takeHome: "3000-4000" });
    expect(b).toBe(monthlyToTotal(3500 * 0.12));
  });
  it("returns undefined without a budget", () => {
    expect(budgetTotal({})).toBeUndefined();
  });
});

describe("running costs", () => {
  it("makes EVs much cheaper to run with home charging", () => {
    const home = annualEnergyCost(leaf, { parking: "driveway" });
    const street = annualEnergyCost(leaf, { parking: "street" });
    expect(home).toBeLessThan(street);
  });
  it("scales with distance", () => {
    expect(annualEnergyCost(corolla, { dailyKm: "150+" })).toBeGreaterThan(
      annualEnergyCost(corolla, { dailyKm: "lt30" }),
    );
  });
});

describe("Northern Ireland landed cost", () => {
  it("adds up every cost line", () => {
    const ni = niLandedCost(corolla, 3, "Dublin");
    const sum = ni.lines.reduce((s, l) => s + l.eur, 0);
    expect(ni.total).toBe(sum);
    expect(ni.saving).toBe(iePrice(corolla, 3) - ni.total);
    expect(ni.lines.map((l) => l.label)).toContain("VRT (estimate)");
  });

  it("charges Irish VAT on a new car", () => {
    const ni = niLandedCost(corolla, 0, "Dublin");
    expect(ni.isNew).toBe(true);
    expect(ni.lines.some((l) => l.label.startsWith("Irish VAT"))).toBe(true);
  });

  it("does not charge VAT on a used car", () => {
    const ni = niLandedCost(corolla, 2, "Dublin");
    expect(ni.lines.some((l) => l.label.startsWith("Irish VAT"))).toBe(false);
  });

  it("adds the NCT for cars 4 years or older", () => {
    expect(niLandedCost(corolla, 5).needsNct).toBe(true);
    expect(niLandedCost(corolla, 5).lines.find((l) => l.label === "NCT")!.eur).toBe(CONFIG.importFees.nctFeeEur);
    expect(niLandedCost(corolla, 2).lines.find((l) => l.label === "NCT")!.eur).toBe(0);
  });

  it("costs less to collect from a border county", () => {
    const louth = niLandedCost(corolla, 3, "Louth");
    const kerry = niLandedCost(corolla, 3, "Kerry");
    expect(louth.total).toBeLessThan(kerry.total);
  });

  it("can cost more than buying in the Republic for a high-CO2 car", () => {
    const ni = niLandedCost(tiguan, 3, "Cork");
    expect(ni.saving).toBeLessThan(0);
    expect(niVerdict(ni.saving, 1000)).toBe("more");
  });

  it("verdict thresholds", () => {
    expect(niVerdict(2000, 1000)).toBe("worth");
    expect(niVerdict(500, 1000)).toBe("small");
    expect(niVerdict(-10, 1000)).toBe("more");
  });
});
