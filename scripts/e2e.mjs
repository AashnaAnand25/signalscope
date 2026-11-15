import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.BASE_URL || "http://127.0.0.1:8081";
const live = process.env.LIVE_RESEARCH === "1";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : chromium.executablePath()),
});
const results = [];
const ids = [
  "velocity-ai",
  "tariff-simulator",
  "ingredient-compass",
  "kearney-ignite",
  "perlab-design-to-value",
];
const names = [
  "Velocity AI",
  "Tariff Simulator",
  "Ingredient Compass",
  "Kearney Ignite",
  "PERLab Design-to-Value",
];
for (const mobile of [false, true]) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    reducedMotion: mobile ? "reduce" : "no-preference",
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  if (!live)
    await page.route("**/api/portfolio**", async (route) => {
      const productId =
        route.request().method() === "POST" ? route.request().postDataJSON().productId : ids[0];
      const product = names[ids.indexOf(productId)] || "Kearney AEPD";
      const url = "https://example.org/fixture";
      const cell = {
        value: "Fixture capability only",
        documentIds: ["test-source"],
        quote: "Test-only source evidence.",
      };
      await route.fulfill({
        json: {
          id: "e2e-fixture-" + productId,
          productId,
          status: "complete",
          stage: "Synthetic browser test only",
          startedAt: new Date().toISOString(),
          documents: [
            {
              id: "test-source",
              url,
              title: "Synthetic browser test",
              platform: "Fixture",
              text: "Test-only source evidence.",
              capturedAt: new Date().toISOString(),
              kind: "provider-claim",
              status: "captured",
              subject: product,
            },
          ],
          competitors: [1, 2, 3].map((i) => ({
            name: "Fixture alternative " + i,
            url,
            sourceUrl: url,
            rationale: "Synthetic test relevance only",
            relation: "adjacent",
          })),
          analysis: {
            comments: [],
            matrix: [
              {
                product,
                pricing: cell,
                ai: cell,
                timeToValue: cell,
                sentiment: { value: "Unknown", documentIds: [], quote: "" },
              },
            ],
            roadmap: [
              {
                title: "Test-only renewal hypothesis",
                improvement: "Test the requirement",
                hypothesis: "A testable fixture",
                experiment: "A test-only interview",
                documentIds: ["test-source"],
                quote: "Test-only source evidence.",
                basis: "provider-claim",
              },
            ],
          },
          records: [],
          errors: [],
          trace: [],
        },
      });
    });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Hear the need/ }).waitFor();
  await page
    .getByRole("link", { name: /^Try now/ })
    .last()
    .click();
  await page.getByRole("heading", { name: "Choose your product" }).waitFor();
  for (let i = 0; i < ids.length; i++) {
    await page.getByRole("button", { name: new RegExp("^" + names[i]) }).click();
    await page
      .getByRole("region", { name: "Product description" })
      .getByRole("heading", { name: names[i], exact: true })
      .waitFor();
    if (!(await page.getByRole("region", { name: "Product description" }).innerText()).length)
      throw Error("Missing description " + names[i]);
  }
  await page.getByRole("button", { name: /^Next: analyze/ }).click();
  if ((await page.getByRole("tab").count()) !== 2) throw Error("Expected two analysis tabs");
  await page.getByRole("tab", { name: "Comment Analysis" }).click();
  await page.getByText("No verified customer-feedback collection yet.", { exact: true }).waitFor();
  await page.getByRole("tab", { name: "Kearney Analysis" }).click();
  if (!live) {
    await page.getByRole("table").waitFor();
    if ((await page.getByText("Source: PERLab / Fixture", { exact: false }).count()) < 1)
      throw Error("Missing source badge");
    await page.getByRole("heading", { name: "Comparison evidence coverage" }).waitFor();
  }
  await page.getByRole("button", { name: /^Next: product roadmap/ }).click();
  await page.getByRole("heading", { name: "Product improvements supported by evidence" }).waitFor();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Finish: export/ }).click();
  await download;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) throw Error("Horizontal overflow at " + (mobile ? "390px" : "1440px"));
  if (errors.length) throw Error("Browser errors: " + errors.join("; "));
  await mkdir("test-results", { recursive: true });
  await page.screenshot({
    path: `test-results/roadmap-${mobile ? "mobile" : "desktop"}.png`,
    fullPage: true,
  });
  results.push({
    viewport: mobile ? "390x844" : "1440x1000",
    mode: live ? "live" : "fixture API, real browser",
    products: 5,
    flow: "passed",
    errors,
    overflow,
  });
  await context.close();
}
await browser.close();
await writeFile("test-results/e2e.json", JSON.stringify({ base, results }, null, 2));
console.log(JSON.stringify({ base, results }, null, 2));
