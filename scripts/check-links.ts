// Checks the brand websites and car-for-sale search links in src/data/carLinks.ts.
// Usage: npm run check-links   (needs network access to those sites)
// 403/429 usually means the site blocks automated checks: open those links in a
// browser to confirm them by hand.
import { execFile } from "node:child_process";
import { CARS } from "../src/data/cars";
import { BRAND_SITES, listingLinks } from "../src/data/carLinks";

interface Link {
  kind: string;
  label: string;
  url: string;
}

// Uses curl so the system proxy settings (HTTPS_PROXY) are respected.
function check(url: string): Promise<{ status: number; final: string }> {
  return new Promise((resolve) => {
    execFile(
      "curl",
      ["-s", "-o", "/dev/null", "-L", "--max-time", "20", "-A", "CarPickerIreland link checker", "-w", "%{http_code} %{url_effective}", url],
      (_err, stdout) => {
        const [code, final] = String(stdout).trim().split(" ");
        resolve({ status: Number(code) || 0, final: final ?? "" });
      },
    );
  });
}

async function main() {
  const links: Link[] = Object.entries(BRAND_SITES).map(([brand, url]) => ({ kind: "Official site", label: brand, url }));
  const seen = new Set<string>();
  for (const c of CARS) {
    const key = `${c.make} ${c.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const l of listingLinks(c, true)) links.push({ kind: l.name, label: key, url: l.url });
  }
  // UsedCarsNI's robots.txt asks AI tools and crawlers like ours not to access it: never fetch it.
  const SKIP = ["usedcarsni.com"];
  const unique = [...new Map(links.map((l) => [l.url, l])).values()].filter((l) => !SKIP.some((d) => l.url.includes(d)));
  let ok = 0;
  for (const l of unique) {
    const r = await check(l.url);
    const good = r.status >= 200 && r.status < 400;
    if (good) ok++;
    console.log(
      `${good ? "✓" : "✗"} ${String(r.status).padStart(3)} ${l.kind.padEnd(28)} ${l.label.padEnd(26)} ${l.url}${
        r.final && r.final !== l.url ? `  → ${r.final}` : ""
      }`,
    );
  }
  console.log(`\n${ok} of ${unique.length} links OK.`);
}

main();
