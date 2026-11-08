"use client";

import { useState } from "react";
import { NiAnswer } from "@/components/ni";
import { COUNTIES } from "@/config/counties";
import { CARS, CAR_BY_ID } from "@/data/cars";
import { CONFIG, maxAge, minAge, modelYear, niLandedCost } from "@/lib/costs";

const sorted = [...CARS].sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
const selectCls = "mt-1 min-h-12 w-full rounded-xl bg-surface-2 px-3";

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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="label">Car</span>
          <select className={selectCls} value={carId} onChange={(e) => setCarId(e.target.value)}>
            {sorted.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model} {c.variant}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Year</span>
          <select className={selectCls} value={safeAge} onChange={(e) => setAge(Number(e.target.value))}>
            {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((a) => (
              <option key={a} value={a}>
                {a === 0 ? `New (${modelYear(0)})` : `${modelYear(a)} (${a} yr${a > 1 ? "s" : ""} old)`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Your county</span>
          <select className={selectCls} value={county} onChange={(e) => setCounty(e.target.value)}>
            {COUNTIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <NiAnswer ni={ni} threshold={CONFIG.northernIreland.savingThresholdEur} carName={`${car.make} ${car.model}`} />
      <p className="text-xs text-muted">
        Prices are typical estimates, not real listings. Use the real asking price and Revenue&apos;s VRT calculator for
        exact figures.
      </p>
    </div>
  );
}
