"use client";

import { useState } from "react";
import { NiBreakdown } from "@/components/NiPanels";
import { COUNTIES } from "@/config/counties";
import { CARS, CAR_BY_ID } from "@/data/cars";
import { CONFIG, maxAge, minAge, modelYear, niLandedCost } from "@/lib/costs";

const sorted = [...CARS].sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));

export function NiCalculator() {
  const [carId, setCarId] = useState("toyota-corolla-hybrid");
  const [age, setAge] = useState(3);
  const [county, setCounty] = useState("Dublin");
  const car = CAR_BY_ID[carId];
  const lo = minAge(car);
  const hi = Math.min(maxAge(car), CONFIG.northernIreland.maxAgeYears);
  const safeAge = Math.min(Math.max(age, lo), hi);
  const ni = niLandedCost(car, safeAge, county);

  return (
    <div className="card space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">Car</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
          >
            {sorted.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model} {c.variant}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Year</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={safeAge}
            onChange={(e) => setAge(Number(e.target.value))}
          >
            {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((a) => (
              <option key={a} value={a}>
                {a === 0 ? `New (${modelYear(0)})` : `${modelYear(a)} (${a} yr${a > 1 ? "s" : ""} old)`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Your county</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          >
            {COUNTIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <NiBreakdown ni={ni} threshold={CONFIG.northernIreland.savingThresholdEur} carName={`${car.make} ${car.model}`} />
      <p className="text-xs text-slate-500">
        Prices are typical estimates, not real listings. Use a real price from a Northern Ireland seller and Revenue's VRT
        calculator to get exact figures.
      </p>
    </div>
  );
}
