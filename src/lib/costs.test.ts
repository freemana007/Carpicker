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

describe("VRT (rates checked on revenue.ie)", () => {
  it("picks the rate for the CO2 band", () => {
    expect(vrtRate(0)).toBe(0.07);
    expect(vrtRate(50)).toBe(0.07);
    expect(vrtRate(51)).toBe(0.09);
    expect(vrtRate(102)).toBe(0.1275);
    expect(vrtRate(148)).toBe(0.25);
    expect(vrtRate(191)).toBe(0.41);
  });

  it("calculates the NOx levy in tiers, with no cap", () => {
    expect(noxLevy(0)).toBe(0);
    expect(noxLevy(8)).toBe(40); // Revenue example: 8 mg/km = €40
    expect(noxLevy(90)).toBe(1050); // Revenue example: 90 mg/km = €1,050
    expect(noxLevy(300)).toBe(200 + 600 + 220 * 25);
  });

  it("matches Revenue's worked example (2016 petrol saloon)", () => {
    // 148 g/km, NOx 8 mg/km, OMSP €27,871 -> €6,967 + €40 = €7,007
    const car = { ...corolla, powertrain: "petrol" as const, co2: 148, nox: 8 };
    const vrt = estimateVrt(car, 27871);
    expect(vrt.co2Part).toBe(6968); // 27,871 x 25% = 6,967.75
    expect(vrt.noxPart).toBe(40);
    expect(Math.abs(vrt.total - 7007)).toBeLessThanOrEqual(5);
  });

  it("applies the band minimum for very cheap cars", () => {
    const vrt = estimateVrt(corolla, 1000); // 12.75% band: minimum €255
    expect(vrt.co2Part).toBe(255);
  });

  it("gives electric cars full relief up to €40,000 OMSP (so €0 VRT)", () => {
    expect(estimateVrt(leaf, 30000).total).toBe(0); // Revenue example 2
    expect(estimateVrt(leaf, 40000).total).toBe(0); // Revenue example 1
  });

  it("reduces EV relief between €40,000 and €50,000, and none from €50,000", () => {
    const at45 = estimateVrt(leaf, 45000);
    expect(at45.evRelief).toBe(2500);
    expect(at45.total).toBe(Math.round((45000 * 0.07 - 2500) / 10) * 10);
    expect(estimateVrt(leaf, 50000).evRelief).toBe(0);
  });

  it("knows the flat NOx charge when there's no NOx evidence", () => {
    expect(estimateVrt(tiguan, 20000).noxIfNoEvidence).toBe(4850);
    expect(estimateVrt(corolla, 20000).noxIfNoEvidence).toBe(600);
    expect(estimateVrt(leaf, 20000).noxIfNoEvidence).toBe(0);
  });
});

describe("motor tax (rates checked on motortax.ie)", () => {
  it("uses WLTP bands for cars registered from 2021", () => {
    expect(motorTax(corolla, 0)).toBe(180); // 102 g/km: 101–110 band
    expect(motorTax(leaf, 3)).toBe(120); // 0 g/km
    expect(motorTax(CAR_BY_ID["land-rover-defender"], 0)).toBe(2400); // 245 g/km
  });
  it("uses NEDC bands for 2008–2020 cars, converting with Revenue's formula", () => {
    // 2018 Corolla: (102 - 34.554) / 0.9227 = 73 g/km NEDC -> 2–80 band €170
    expect(motorTax(corolla, CONFIG.currentYear - 2018)).toBe(170);
    expect(motorTax(leaf, CONFIG.currentYear - 2019)).toBe(120);
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
