// Builds a Car record with sensible defaults, so each car only lists what differs.

import type { Car } from "@/lib/types";

type CarInput = Omit<
  Car,
  | "gearbox"
  | "featuresStd"
  | "featuresOpt"
  | "safetyStd"
  | "safetyOpt"
  | "awd"
  | "groundClearance"
  | "easyEntry"
  | "tallFriendly"
  | "goodVisibility"
  | "soldNew"
  | "reviewQuery"
  | "towKg"
> &
  Partial<Car>;

export function car(c: CarInput): Car {
  return {
    gearbox: ["manual", "auto"],
    featuresStd: ["carplay", "touchscreen"],
    featuresOpt: ["heatedSeats", "sunroof", "stereo"],
    safetyStd: ["aeb"],
    safetyOpt: ["blindSpot", "acc", "camera"],
    awd: "no",
    groundClearance: "normal",
    easyEntry: false,
    tallFriendly: true,
    goodVisibility: true,
    soldNew: true,
    towKg: 1200,
    reviewQuery: `${c.make} ${c.model}`,
    ...c,
  };
}

export const AUTO: Car["gearbox"] = ["auto"];
export const MANUAL: Car["gearbox"] = ["manual"];

