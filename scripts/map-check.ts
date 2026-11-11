// `pnpm map-check` (PLAN 1.3 done-when): browser tests for every piece map in dist/.
//   - every map.yaml part is a link with a name, reachable with Tab, and Enter follows it
//   - hover and keyboard focus open the card; Escape closes it
//   - on a touch screen the first tap opens the card without navigating; "Open" navigates
//   - with JS off, every part is still a link and the list holds every part
//   - the signal dot runs on hover, and stands still under prefers-reduced-motion
//   - on a phone the list (the vertical wire) is shown
// Needs Playwright's Chromium (preinstalled in the cloud VM; the CI gate comes with PLAN 1.8).
import { createRequire } from "node:module";
import { loadPieces } from "../src/lib/pieces.ts";
import { serveDist } from "./lib/serve.ts";

type Loc = { count(): Promise<number>; getAttribute(n: string): Promise<string | null>; isVisible(): Promise<boolean>; hover(): Promise<void>; tap(): Promise<void>; textContent(): Promise<string | null>; evaluate<T>(f: string | ((el: Element) => T)): Promise<T>; first(): Loc };
type Page = { goto(u: string): Promise<unknown>; url(): string; locator(s: string): Loc; keyboard: { press(k: string): Promise<void> }; evaluate<T>(f: string | (() => T)): Promise<T>; waitForTimeout(ms: number): Promise<void>; waitForURL(u: (url: URL) => boolean, o?: object): Promise<void> };
type Ctx = { newPage(): Promise<Page>; close(): Promise<void> };
type PW = { chromium: { launch(): Promise<{ newContext(o?: object): Promise<Ctx>; close(): Promise<void> }> }; devices: Record<string, object> };

const pw = createRequire(import.meta.url)("playwright") as PW;
const pieces = loadPieces();
const { origin, server } = await serveDist();
const browser = await pw.chromium.launch();
const desktop = { viewport: { width: 1280, height: 900 } };

let failures = 0;
const check = (ok: boolean, what: string) => {
  if (!ok) failures++;
  process.stdout.write(`${ok ? "ok    " : "FAILED"} ${what}\n`);
};
const sel = (id: string) => `a.part[id="${id}"]`;
const dotAnimation = (p: Page, id: string) => p.locator(`${sel(id)} .signal-dot`).evaluate((el) => getComputedStyle(el).animationName);

try {
  for (const piece of pieces) {
    const url = `${origin}/${piece.id}/`;
    const ids = piece.parts.map((p) => p.id);
    process.stdout.write(`── /${piece.id}/ (${ids.length} parts)\n`);

    // Links, names, tab order, focus card, Escape, Enter.
    {
      const ctx = await browser.newContext(desktop);
      const page = await ctx.newPage();
      await page.goto(url);
      let named = 0;
      for (const p of piece.parts) {
        const a = page.locator(sel(p.id));
        const name = (await a.count()) === 1 ? await a.getAttribute("aria-label") : null;
        const href = await a.getAttribute("href").catch(() => null);
        if (name && name.startsWith(p.label) && href) named++;
      }
      check(named === ids.length, `every part is a link with a name (${named}/${ids.length})`);
      const drawn = await page.locator("svg.schematic .part").count();
      check(drawn === ids.length, `only built parts are drawn (${drawn} drawn, ${ids.length} built)`);
      const titles = await page.locator("svg.schematic title").count();
      check(titles === 0 && !!(await page.locator("svg.schematic").getAttribute("aria-label")), "the schematic has an aria-label and no <title> tooltip");
      const underlined = await page.evaluate(() =>
        [...document.querySelectorAll("svg.schematic a.part, svg.schematic a.part text")].filter((el) => getComputedStyle(el).textDecorationLine !== "none").length,
      );
      check(underlined === 0, "part links and their labels have no underline");

      const reached = new Set<string>();
      for (let i = 0; i < 80 && reached.size < ids.length; i++) {
        await page.keyboard.press("Tab");
        const id = await page.evaluate(() => (document.activeElement?.matches("a.part") ? document.activeElement.id : ""));
        if (id) reached.add(id);
      }
      check(reached.size === ids.length, `every part is reachable with Tab (${reached.size}/${ids.length})`);

      // Fresh load, then Tab to the first part, so :focus-visible applies as for a keyboard user.
      await page.goto(url);
      const first = ids[0]!;
      let guard = 0;
      while ((await page.evaluate(() => document.activeElement?.id ?? "")) !== first && guard++ < 80) await page.keyboard.press("Tab");
      const card = page.locator("[data-card]");
      const title = await page.locator("[data-card-title]").textContent();
      check((await card.isVisible()) && title === piece.parts[0]!.label, "keyboard focus opens the part's card");
      check((await dotAnimation(page, first)) === "signal-run", "the signal dot runs while a part has focus");
      await page.keyboard.press("Escape");
      check(!(await card.isVisible()), "Escape closes the card");
      const before = page.url();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
      check(page.url() !== before, "Enter on a focused part follows its link");
      await ctx.close();
    }

    // Parts with a page link to it, and the page is there (PLAN 1.4).
    {
      const ctx = await browser.newContext(desktop);
      const page = await ctx.newPage();
      await page.goto(url);
      for (const p of piece.parts.filter((x) => x.page)) {
        const href = await page.locator(sel(p.id)).getAttribute("href");
        const listHref = await page.locator(`#part-${p.id} a.wire-name`).getAttribute("href");
        const res = await fetch(new URL(p.page!, url));
        check(href === p.page && listHref === p.page && res.ok, `${p.label}: map and list link to ${p.page}, which loads (${res.status})`);
      }
      await ctx.close();
    }

    // Hover opens the card.
    {
      const ctx = await browser.newContext(desktop);
      const page = await ctx.newPage();
      await page.goto(url);
      const id = ids[Math.min(2, ids.length - 1)]!;
      await page.locator(`${sel(id)} .box`).hover();
      await page.waitForTimeout(50);
      check((await page.locator("[data-card]").isVisible()) && (await page.locator("[data-card-title]").textContent()) === piece.parts.find((p) => p.id === id)!.label, "hover opens the part's card");
      check((await dotAnimation(page, id)) === "signal-run", "the signal dot runs on hover");
      await ctx.close();
    }

    // Touch: first tap opens the card, "Open" navigates.
    {
      const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: false });
      const page = await ctx.newPage();
      await page.goto(url);
      const before = page.url();
      // The first part with a page, so "Open" leads to a real page when there is one.
      const p = piece.parts.find((x) => x.page) ?? piece.parts[0]!;
      await page.locator(`${sel(p.id)} .box`).tap();
      await page.waitForTimeout(150);
      check(page.url() === before && (await page.locator("[data-card]").isVisible()), "on touch, the first tap opens the card and doesn't navigate");
      if (await page.locator("[data-card-open]").isVisible()) {
        await page.locator("[data-card-open]").tap();
        await page.waitForTimeout(150);
      }
      const target = new URL(p.page ?? `#part-${p.id}`, url).href;
      check(page.url() === target, `on touch, the card's Open button follows the link (${new URL(target).pathname}${new URL(target).hash})`);
      await ctx.close();
    }

    // Reduced motion: the dot doesn't run.
    {
      const ctx = await browser.newContext({ ...desktop, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(url);
      await page.locator(`${sel(ids[0]!)} .box`).hover();
      check((await dotAnimation(page, ids[0]!)) === "none", "under reduced motion the signal dot stands still");
      await ctx.close();
    }

    // JS off: parts are still links, the list holds every part.
    for (const [view, opts] of [["desktop", desktop], ["phone", pw.devices["iPhone 13"]!]] as const) {
      const ctx = await browser.newContext({ ...opts, javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(url);
      const links = await page.locator("a.part[href]").count();
      let listed = 0;
      for (const p of piece.parts) if (await page.locator(`#part-${p.id} a[href]`).isVisible()) listed++;
      check(links === ids.length && listed === ids.length, `JS off (${view}): ${links} part links, ${listed}/${ids.length} parts visible in the list`);
      if (view === "phone") check(!(await page.locator(".map-frame").isVisible()), "phone: the list (vertical wire) replaces the schematic");
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
process.stdout.write(failures ? `map-check: FAILED (${failures})\n` : "map-check: ok\n");
process.exitCode = failures ? 1 : 0;
