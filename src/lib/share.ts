// Save answers in the browser and in a share link. No server, no account.

import type { Answers } from "./types";

const STORAGE_KEY = "carpicker.answers.v1";
const CHECKLIST_KEY = "carpicker.niChecklist.v1";

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeAnswers(a: Answers): string {
  return toBase64Url(JSON.stringify(a));
}

export function decodeAnswers(s: string): Answers | null {
  try {
    const parsed = JSON.parse(fromBase64Url(s));
    return parsed && typeof parsed === "object" ? (parsed as Answers) : null;
  } catch {
    return null;
  }
}

export function saveAnswers(a: Answers): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    /* storage unavailable: fine, answers live in the URL */
  }
}

export function loadAnswers(): Answers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Answers) : null;
  } catch {
    return null;
  }
}

export function clearAnswers(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadChecklist(carId: string): string[] {
  try {
    const all = JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? "{}");
    return Array.isArray(all[carId]) ? all[carId] : [];
  } catch {
    return [];
  }
}

export function saveChecklist(carId: string, done: string[]): void {
  try {
    const all = JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? "{}");
    all[carId] = done;
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function resultsUrl(a: Answers): string {
  return `/results/#a=${encodeAnswers(a)}`;
}
