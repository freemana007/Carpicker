// Approximate road distance (km) from each county's main town to the nearest
// large Northern Ireland town with plenty of car dealers. Rough estimates for
// travel-cost calculations only.

export interface County {
  name: string;
  nearestNiTown: string;
  kmToNi: number;
}

export const COUNTIES: County[] = [
  { name: "Carlow", nearestNiTown: "Newry", kmToNi: 190 },
  { name: "Cavan", nearestNiTown: "Enniskillen", kmToNi: 65 },
  { name: "Clare", nearestNiTown: "Enniskillen", kmToNi: 250 },
  { name: "Cork", nearestNiTown: "Newry", kmToNi: 360 },
  { name: "Donegal", nearestNiTown: "Derry", kmToNi: 35 },
  { name: "Dublin", nearestNiTown: "Newry", kmToNi: 105 },
  { name: "Galway", nearestNiTown: "Enniskillen", kmToNi: 205 },
  { name: "Kerry", nearestNiTown: "Newry", kmToNi: 400 },
  { name: "Kildare", nearestNiTown: "Newry", kmToNi: 135 },
  { name: "Kilkenny", nearestNiTown: "Newry", kmToNi: 210 },
  { name: "Laois", nearestNiTown: "Newry", kmToNi: 180 },
  { name: "Leitrim", nearestNiTown: "Enniskillen", kmToNi: 70 },
  { name: "Limerick", nearestNiTown: "Enniskillen", kmToNi: 270 },
  { name: "Longford", nearestNiTown: "Enniskillen", kmToNi: 100 },
  { name: "Louth", nearestNiTown: "Newry", kmToNi: 20 },
  { name: "Mayo", nearestNiTown: "Enniskillen", kmToNi: 170 },
  { name: "Meath", nearestNiTown: "Newry", kmToNi: 90 },
  { name: "Monaghan", nearestNiTown: "Armagh", kmToNi: 30 },
  { name: "Offaly", nearestNiTown: "Enniskillen", kmToNi: 165 },
  { name: "Roscommon", nearestNiTown: "Enniskillen", kmToNi: 120 },
  { name: "Sligo", nearestNiTown: "Enniskillen", kmToNi: 70 },
  { name: "Tipperary", nearestNiTown: "Newry", kmToNi: 270 },
  { name: "Waterford", nearestNiTown: "Newry", kmToNi: 260 },
  { name: "Westmeath", nearestNiTown: "Enniskillen", kmToNi: 140 },
  { name: "Wexford", nearestNiTown: "Newry", kmToNi: 230 },
  { name: "Wicklow", nearestNiTown: "Newry", kmToNi: 140 },
];

export const DEFAULT_KM_TO_NI = 180;

export function kmToNi(county?: string): number {
  return COUNTIES.find((c) => c.name === county)?.kmToNi ?? DEFAULT_KM_TO_NI;
}
