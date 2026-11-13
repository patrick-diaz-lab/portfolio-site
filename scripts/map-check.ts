// `pnpm map-check` (PLAN 1.3 done-when): browser tests for every piece map in dist/.
//   - every map.yaml part is a link with a name, reachable with Tab; Enter follows a part's
//     page, and on a part without a page only shows it in the panel
//   - the panel (layout A, 2026-11-13) shows a part on load, on hover (map and index) and on
//     keyboard focus; Previous and Next step through the parts
//   - on a touch screen the first tap shows the part without navigating; "Read the page"
//     navigates
//   - on a wide screen with JS the list is an index of names; with JS off, every part is
//     still a link, the list holds every part with its text, and no empty panel shows
//   - the signal dot runs on hover, and stands still under prefers-reduced-motion
//   - on a phone the list (the vertical wire) is shown
// Uses the pinned Playwright's Chromium (scripts/lib/browser.ts); a gate in CI since PLAN 1.8.
import { LOCALES, localePath } from "../src/i18n/ui.ts";
import { loadPieces } from "../src/lib/pieces.ts";
import { devices, launch, type Page } from "./lib/browser.ts";
import { serveDist } from "./lib/serve.ts";

// Every piece map in every language it has (PLAN 1.9a).
const pieces = LOCALES.flatMap((locale) => loadPieces(locale).map((piece) => ({ locale, piece })));
const { origin, server } = await serveDist();
const browser = await launch();
const desktop = { viewport: { width: 1280, height: 900 } };

let failures = 0;
const check = (ok: boolean, what: string) => {
  if (!ok) failures++;
  process.stdout.write(`${ok ? "ok    " : "FAILED"} ${what}\n`);
};
const sel = (id: string) => `a.part[id="${id}"]`;
const dotAnimation = (p: Page, id: string) => p.locator(`${sel(id)} .signal-dot`).evaluate((el) => getComputedStyle(el).animationName);

try {
  for (const { locale, piece } of pieces) {
    const url = origin + localePath(locale, `/${piece.id}/`);
    const ids = piece.parts.map((p) => p.id);
    process.stdout.write(`── ${localePath(locale, `/${piece.id}/`)} (${ids.length} parts)\n`);

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

      // Fresh loads, then Tab to a part, so :focus-visible applies as for a keyboard user.
      const tabTo = async (id: string) => {
        let guard = 0;
        while ((await page.evaluate(() => document.activeElement?.id ?? "")) !== id && guard++ < 80) await page.keyboard.press("Tab");
      };
      const title = () => page.locator("[data-card-title]").textContent();
      const label = (id: string) => piece.parts.find((p) => p.id === id)!.label;
      await page.goto(url);
      check((await page.locator("[data-card]").isVisible()) && (await title()) === piece.parts[0]!.label, "the panel shows the first part on load");
      check((await dotAnimation(page, ids[0]!)) === "none", "the signal dot doesn't run on load");
      const second = ids[Math.min(1, ids.length - 1)]!;
      await tabTo(second);
      check((await title()) === label(second), "keyboard focus shows the part in the panel");
      check((await dotAnimation(page, second)) === "signal-run", "the signal dot runs while a part has focus");
      const at = ids.indexOf(second);
      await page.locator("[data-card-next]").click();
      check((await title()) === label(ids[(at + 1) % ids.length]!), "Next shows the following part");
      await page.locator("[data-card-prev]").click();
      check((await title()) === label(second), "Previous goes back");

      const plain = piece.parts.find((p) => !p.page);
      if (plain) {
        await page.goto(url);
        await tabTo(plain.id);
        const before = page.url();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(150);
        check(page.url() === before && (await title()) === plain.label, "Enter on a part without a page shows it and stays");
      }
      const linked = piece.parts.find((p) => p.page);
      if (linked) {
        await page.goto(url);
        await tabTo(linked.id);
        await page.keyboard.press("Enter");
        await page.waitForURL((u) => u.pathname === linked.page, { timeout: 3000 }).catch(() => {});
        check(new URL(page.url()).pathname === linked.page, `Enter on a part with a page follows it (${linked.page})`);
      }
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

    // A mouse press focuses a part without the browser's own outline (Patrick, 2026-11-12).
    {
      const ctx = await browser.newContext(desktop);
      const page = await ctx.newPage();
      await page.goto(url);
      const box = await page.locator(`${sel(ids[0]!)} .box`).boundingBox();
      if (box) {
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.down();
      }
      const outline = await page.locator(sel(ids[0]!)).evaluate((el) => (document.activeElement === el ? getComputedStyle(el).outlineStyle : "not focused"));
      check(outline === "none", `a mouse press on a part shows no browser outline (${outline})`);
      await ctx.close();
    }

    // Hover shows the part in the panel, from the map and from the index.
    {
      const ctx = await browser.newContext(desktop);
      const page = await ctx.newPage();
      await page.goto(url);
      const title = () => page.locator("[data-card-title]").textContent();
      const id = ids[Math.min(2, ids.length - 1)]!;
      await page.locator(`${sel(id)} .box`).hover();
      await page.waitForTimeout(50);
      check((await page.locator("[data-card]").isVisible()) && (await title()) === piece.parts.find((p) => p.id === id)!.label, "hover on the map shows the part in the panel");
      check((await dotAnimation(page, id)) === "signal-run", "the signal dot runs on hover");
      const last = piece.parts.at(-1)!;
      await page.locator(`#part-${last.id} a.wire-name`).hover();
      await page.waitForTimeout(50);
      check((await title()) === last.label, "hover in the index shows the part in the panel");
      const names = await page.locator(".wire-item a.wire-name:visible").count();
      const texts = await page.locator(".wire-item p:visible").count();
      check(names === ids.length && texts === 0, `wide screen with JS: the list is an index of names (${names} names, ${texts} texts shown)`);
      await ctx.close();
    }

    // Touch: the first tap shows the part, "Read the page" navigates.
    {
      const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: false });
      const page = await ctx.newPage();
      await page.goto(url);
      const before = page.url();
      // The first part with a page, so "Open" leads to a real page when there is one.
      const p = piece.parts.find((x) => x.page) ?? piece.parts[0]!;
      await page.locator(`${sel(p.id)} .box`).tap();
      await page.waitForTimeout(150);
      check(page.url() === before && (await page.locator("[data-card-title]").textContent()) === p.label, "on touch, the first tap shows the part and doesn't navigate");
      if (await page.locator("[data-card-open]").isVisible()) {
        await page.locator("[data-card-open]").tap();
        await page.waitForTimeout(150);
      }
      const target = new URL(p.page ?? `#part-${p.id}`, url).href;
      check(page.url() === target, `on touch, "Read the page" follows the link (${new URL(target).pathname}${new URL(target).hash})`);
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
    for (const [view, opts] of [["desktop", desktop], ["phone", devices["iPhone 13"]!]] as const) {
      const ctx = await browser.newContext({ ...opts, javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(url);
      const links = await page.locator("a.part[href]").count();
      let listed = 0;
      for (const p of piece.parts) if (await page.locator(`#part-${p.id} a[href]`).isVisible()) listed++;
      let texts = 0;
      for (const p of piece.parts) if (await page.locator(`#desc-${p.id}`).isVisible()) texts++;
      check(links === ids.length && listed === ids.length && texts === ids.length, `JS off (${view}): ${links} part links, ${listed}/${ids.length} parts and ${texts} texts visible in the list`);
      check(!(await page.locator("[data-card]").isVisible()), `JS off (${view}): no empty panel`);
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
