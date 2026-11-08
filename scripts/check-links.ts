// Checks the brand websites and car-for-sale search links in src/data/carLinks.ts.
// Usage: npm run check-links   (needs network access to those sites)
// 403/429 usually means the site blocks automated checks: open those links in a
// browser to confirm them by hand.
import { CARS } from "../src/data/cars";
import { BRAND_SITES, listingLinks } from "../src/data/carLinks";

interface Link {
  kind: string;
  label: string;
  url: string;
}

async function check(url: string) {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "CarPickerIreland link checker" },
      signal: AbortSignal.timeout(15000),
    });
    return { status: r.status, final: r.url };
  } catch (e) {
    const err = e as { cause?: { code?: string }; message: string };
    return { status: 0, final: err.cause?.code ?? err.message };
  }
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
  const unique = [...new Map(links.map((l) => [l.url, l])).values()];
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
