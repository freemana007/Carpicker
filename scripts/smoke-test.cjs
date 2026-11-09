// Browser smoke test + accessibility checks against the built site.
// Usage: npm run build && npm run smoke
// Needs Playwright with Chromium available (require('playwright')).
// Set SCREENSHOTS=<dir> to save screenshots of each page.
const { spawn } = require("node:child_process");
const path = require("node:path");
const { chromium } = require("playwright");

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;
const AXE = path.join(__dirname, "..", "node_modules", "axe-core", "axe.min.js");
const SHOTS = process.env.SCREENSHOTS;

function serve() {
  const out = path.join(__dirname, "..", "out");
  return spawn("python3", ["-m", "http.server", String(PORT)], { cwd: out, stdio: "ignore" });
}

async function axe(page, label) {
  await page.addScriptTag({ path: AXE });
  const res = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0].target.join(" ")}`);
  });
  if (res.length) throw new Error(`Accessibility problems on ${label}:\n  ${res.join("\n  ")}`);
}

async function shot(page, name) {
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
}

async function main() {
  const server = serve();
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(e.message));

    // --- Quick quiz ---
    await page.goto(`${BASE}/quiz/?mode=quick&fresh=1`);
    await page.getByRole("radio", { name: /Cash/ }).click();
    await page.waitForSelector("#budget");
    await page.locator("#budget").fill("20000");
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByRole("radio", { name: /Yes, show me/ }).click();
    await page.getByRole("radio", { name: /^No$/ }).click();
    await page.getByRole("radio", { name: /A mix/ }).click();
    await page.waitForSelector("select");
    await page.selectOption("select", "Donegal");
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByRole("radio", { name: /Small family/ }).click();
    const counter = await page.getByText(/cars still fit/).textContent();
    await page.getByRole("checkbox", { name: /Practical/ }).click();
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByRole("checkbox", { name: /Hybrid/ }).click();
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.waitForSelector("text=ordered these from your answers");
    await axe(page, "quiz (ranking)");
    await page.getByRole("button", { name: /See my cars/ }).click();

    // --- Results (reveal plays first) ---
    await page.waitForSelector('h1:has-text("Your shortlist")');
    await page.waitForTimeout(2200);
    const hero = await page.locator("article h2").first().textContent();
    const cards = await page.locator("article").count();
    if (cards < 3) throw new Error(`Expected at least 3 cards, got ${cards}`);
    if (!(await page.getByText("Northern Ireland deal").count())) throw new Error("Expected a Northern Ireland deal card");
    await axe(page, "results");
    await shot(page, "results-light");

    // Share link reproduces the same top pick.
    const page2 = await ctx.newPage();
    await page2.goto(page.url());
    await page2.waitForSelector("article h2");
    if ((await page2.locator("article h2").first().textContent()) !== hero) throw new Error("Share link gave different results");
    await page2.close();

    // Compare two cars.
    const toggles = page.getByRole("checkbox", { name: /^Compare / });
    await toggles.nth(0).click();
    await toggles.nth(1).click();
    await page.getByRole("link", { name: /Compare side by side/ }).click();
    await page.waitForSelector('h1:has-text("Compare")');
    const cols = await page.locator("thead th").count();
    if (cols < 3) throw new Error("Compare table should show 2 cars");
    await axe(page, "compare");
    await shot(page, "compare");

    // Car page of the NI deal.
    await page.goBack();
    await page.waitForSelector("article");
    const niCard = page.locator("article", { hasText: "Northern Ireland deal" });
    await niCard.getByRole("link", { name: /Details/ }).click();
    await page.waitForSelector("#ni");
    if (!(await page.getByText(/You save about/).count())) throw new Error("Car page should lead with the NI saving");
    await axe(page, "car page");
    await shot(page, "car-page");

    // Other pages, light + dark.
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => localStorage.setItem("carpicker.theme", t), theme);
      for (const p of ["/", "/northern-ireland/", "/glossary/", "/results/", "/finance-offers/", "/credits/", "/coming-soon/"]) {
        await page.goto(`${BASE}${p}`);
        await page.waitForTimeout(300);
        await axe(page, `${p} (${theme})`);
        if (p === "/" || p === "/results/") await shot(page, `${p === "/" ? "home" : "results"}-${theme}`);
      }
    }

    // Phone width: no sideways scrolling, sticky quiz bar visible.
    const phone = await browser.newContext({ viewport: { width: 375, height: 800 }, deviceScaleFactor: 1 });
    const m = await phone.newPage();
    for (const p of ["/", "/quiz/", "/results/", "/northern-ireland/"]) {
      await m.goto(`${BASE}${p}`);
      await m.waitForTimeout(300);
      const sw = await m.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 375) throw new Error(`${p} scrolls sideways on a phone (${sw}px)`);
      await axe(m, `${p} (phone)`);
    }
    await m.goto(`${BASE}/quiz/`);
    await shot(m, "quiz-phone");

    if (errors.length) throw new Error(`Page errors: ${errors.join("; ")}`);
    console.log(`✓ Smoke + accessibility test passed: ${cards} cards, top pick "${hero}", counter "${counter}"`);
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((e) => {
  console.error("✗ Smoke test failed:", e.message);
  process.exit(1);
});
