// Shared types for CarPicker Ireland.

export type Powertrain = "petrol" | "diesel" | "hybrid" | "phev" | "ev";
export type Gearbox = "manual" | "auto";
export type BodyType =
  | "city"
  | "supermini"
  | "hatchback"
  | "saloon"
  | "estate"
  | "crossover"
  | "suv"
  | "mpv"
  | "sports";
export type Style =
  | "sporty"
  | "rugged"
  | "luxurious"
  | "practical"
  | "eco"
  | "cute"
  | "classic"
  | "techy"
  | "sleek";
export type Feature = "carplay" | "touchscreen" | "heatedSeats" | "sunroof" | "stereo";
export type SafetyFeature = "aeb" | "blindSpot" | "acc" | "camera";
export type Retention = "high" | "mid" | "low";
export type ServiceClass = "small" | "medium" | "large" | "premium" | "ev";

export interface Car {
  id: string;
  make: string;
  model: string;
  /** Engine / version, e.g. "1.8 Hybrid". */
  variant: string;
  body: BodyType;
  seats: number;
  bootL: number;
  lengthMm: number;
  powertrain: Powertrain;
  gearbox: Gearbox[];
  /** Petrol/diesel use, L/100 km (WLTP combined). For PHEVs: use with an empty battery. */
  fuelL100?: number;
  /** Electricity use, kWh/100 km (EVs and PHEVs). */
  kwh100?: number;
  /** EV range in km (WLTP). PHEVs: electric-only range. */
  rangeKm?: number;
  /** WLTP CO2, g/km. */
  co2: number;
  /** NOx, mg/km. */
  nox: number;
  powerHp: number;
  /** UK-style insurance group 1–50 (Irish insurers use their own, this is a guide). */
  insuranceGroup: number;
  /** Current Irish list price in € (approx.). For cars no longer sold: last list price. */
  refPriceEur: number;
  /** True if still sold new in Ireland. */
  soldNew: boolean;
  /** First model year of this generation that we cover. */
  yearFrom: number;
  /** Last model year (if no longer sold new). */
  yearTo?: number;
  retention: Retention;
  serviceClass: ServiceClass;
  /** 1–5 */
  reliability: number;
  /** Euro NCAP stars; null = not yet tested. */
  ncapStars: number | null;
  ncapYear: number | null;
  /** Date (YYYY-MM-DD) the Irish price was read from the brand's own Irish website. Unset = our estimate. */
  priceChecked?: string;
  /** "new" = launched recently; shown with a "New model" tag. */
  isNewModel?: boolean;
  awd: "no" | "optional" | "standard";
  groundClearance: "low" | "normal" | "high";
  towKg: number;
  easyEntry: boolean;
  tallFriendly: boolean;
  goodVisibility: boolean;
  /** 1–5 */
  comfort: number;
  /** 1–5 */
  fun: number;
  /** 1–5 */
  tech: number;
  styles: Style[];
  featuresStd: Feature[];
  featuresOpt: Feature[];
  safetyStd: SafetyFeature[];
  safetyOpt: SafetyFeature[];
  /** CarPicker editorial score 1–5, summarising trusted reviews. */
  expertScore: number;
  /** "What reviewers agree on": written by the CarPicker team. */
  pros: string[];
  cons: string[];
  /** Model name used to build review search links. */
  reviewQuery: string;
}

// ---------- Quiz answers ----------

export type PayMethod = "cash" | "loan" | "finance" | "unsure";
export type Condition = "new" | "used" | "either";
export type NiChoice = "yes" | "big" | "no";
export type Licence = "learner" | "new" | "full";
export type AgeGroup = "u25" | "25-34" | "35-64" | "65+";
export type Passengers = "solo" | "plus1" | "family" | "big";
export type Carry = "shopping" | "buggy" | "dogs" | "diy" | "towing";
export type Driving = "town" | "mixed" | "motorway" | "rural";
export type DailyKm = "lt30" | "30-80" | "80-150" | "150+";
export type Parking = "driveway" | "street" | "apartment" | "tight";
export type Roads = "town" | "country" | "hills" | "farm";
export type Importance = "very" | "somewhat" | "not";
export type EngineChoice = "ev" | "hybrid" | "petrol" | "diesel";
export type Maintenance = "justwork" | "ok" | "diy";
export type Keep = "short" | "mid" | "long";
export type Feel = "comfy" | "zippy" | "powerful" | "easy";
export type Dream = "sports" | "4x4" | "luxury" | "ev" | "classic" | "camper" | "quirky";
export type MustHave = "auto" | "seven" | "tall" | "easyEntry" | "towing" | "manual";
export type DealBreaker = "big" | "tax" | "thirsty" | "insurance" | "boring" | "visibility";
export type Priority =
  | "price"
  | "reliability"
  | "safety"
  | "running"
  | "space"
  | "style"
  | "comfort"
  | "tech";
export type TakeHome = "lt2000" | "2000-3000" | "3000-4000" | "4000-5500" | "5500+";

export interface Answers {
  payMethod?: PayMethod;
  /** Budget value in €; total for cash, per month otherwise. */
  budget?: number;
  budgetUnknown?: boolean;
  takeHome?: TakeHome;
  condition?: Condition;
  ni?: NiChoice;
  tradeIn?: boolean;
  licence?: Licence;
  autoOnly?: "yes" | "no" | "unsure";
  ageGroup?: AgeGroup;
  passengers?: Passengers;
  childSeats?: number;
  carry?: Carry[];
  driving?: Driving;
  dailyKm?: DailyKm;
  parking?: Parking;
  roads?: Roads;
  county?: string;
  fuelImportance?: Importance;
  engines?: EngineChoice[];
  maintenance?: Maintenance;
  keep?: Keep;
  safety?: (SafetyFeature | "any")[];
  styles?: Style[];
  likedBodies?: BodyType[];
  feel?: Feel;
  features?: (Feature | "simple")[];
  brandsLove?: string[];
  brandsAvoid?: string[];
  dream?: Dream;
  mustHaves?: MustHave[];
  dealBreakers?: DealBreaker[];
  priorities?: Priority[];
}
