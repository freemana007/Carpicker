// Browser smoke test: runs the quick quiz end to end against the built site.
// Usage: npm run build && npm run smoke
// Needs Playwright with Chromium available (require('playwright')).
const { spawn } = require("node:child_process");
const path = require("node:path");
const { chromium } = require("playwright");

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;

function serve() {
  const out = path.join(__dirname, "..", "out");
  return spawn("python3", ["-m", "http.server", String(PORT)], { cwd: out, stdio: "ignore" });
}

async function main() {
  const server = serve();
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${BASE}/quiz/?mode=quick&fresh=1`);
    await page.click("text=Cash / savings");
    await page.waitForSelector("#budget");
    await page.locator("#budget").fill("20000");
    await page.click("text=Next →");
    await page.click("text=Yes, show me");
    await page.waitForSelector('h1:has-text("automatic")');
    await page.click('button:has-text("No")');
    await page.click("text=Small family (3–4)");
    await page.click("text=A mix");
    await page.waitForSelector('h1:has-text("Which county")');
    await page.selectOption("select", "Donegal");
    await page.click("text=Next →");
    await page.click("text=Hybrid");
    await page.click("text=Next →");
    await page.click("text=Practical");
    await page.click("text=Next →");
    await page.click("text=See my cars");
    await page.waitForSelector('h1:has-text("Your car matches")');
    const cars = await page.locator("article h2").count();
    if (cars < 3) throw new Error(`Expected at least 3 result cards, got ${cars}`);
    if (!(await page.locator("text=Northern Ireland deal").count())) throw new Error("Expected a Northern Ireland deal card");

    // The share link must reproduce the same results.
    const first = await page.locator("article h2").first().textContent();
    const page2 = await browser.newPage();
    await page2.goto(page.url());
    await page2.waitForSelector("article h2");
    if ((await page2.locator("article h2").first().textContent()) !== first) throw new Error("Share link gave different results");

    if (errors.length) throw new Error(`Page errors: ${errors.join("; ")}`);
    console.log(`✓ Smoke test passed: ${cars} cards, top pick "${first}"`);
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((e) => {
  console.error("✗ Smoke test failed:", e.message);
  process.exit(1);
});
