// `node scripts/redesign-shots.ts` (PLAN 1.18, D25): the review screenshots of the redesign,
// from dist/ (run `pnpm build` first), saved under .cache/screens/redesign/ (git-ignored, as
// the other review screenshots: PLAN 1.8). The homepage, the piece
// overview and the knowledge core page (the reference page), in the light and the dark mode,
// at 1440, 768 and 375 px, at deviceScaleFactor 2; the German pages at 375 px.
//
// It also checks what a screenshot can't be trusted to show, on those pages in both
// languages: no page scrolls sideways, no page logs an error to the console, and the switch
// in the site bar turns the page and its drawings to the other mode and back.
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { launch } from "./lib/browser.ts";
import { serveDist } from "./lib/serve.ts";

const OUT = join(resolve(import.meta.dirname, ".."), ".cache", "screens", "redesign");
const PAGES = [["home", "/"], ["vision", "/vision/"], ["knowledge-core", "/vision/knowledge-core/"]] as const;
mkdirSync(OUT, { recursive: true });

const { origin, server } = await serveDist();
const browser = await launch();
let failed = 0;
const fail = (what: string) => {
  failed++;
  process.stdout.write(`FAILED ${what}\n`);
};
try {
  for (const [name, path] of PAGES) {
    for (const lang of ["en", "de"] as const) {
      const url = origin + (lang === "de" ? "/de" : "") + path;
      for (const width of [1440, 768, 375]) {
        for (const mode of ["light", "dark"] as const) {
          const ctx = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, deviceScaleFactor: 2, colorScheme: mode, reducedMotion: "reduce" });
          const page = await ctx.newPage();
          const errors: string[] = [];
          page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
          page.on("pageerror", (e) => errors.push(String(e)));
          await page.goto(url, { waitUntil: "networkidle" });
          await page.evaluate("document.fonts.ready");
          const over = await page.evaluate<number>("document.documentElement.scrollWidth - window.innerWidth");
          if (over > 0) fail(`${url} ${width} ${mode}: scrolls sideways by ${over}px`);
          if (errors.length) fail(`${url} ${width} ${mode}: ${errors.length} console error(s)`);
          if (lang === "en" || width === 375) await page.screenshot({ path: join(OUT, `${name}-${width}-${mode}${lang === "de" ? "-de" : ""}.png`), fullPage: true });

          // The switch: the page, and a drawing's stroke, change with it and change back.
          if (width === 1440) {
            const look = () => page.evaluate(() => {
              const box = document.querySelector("svg.schematic .box, svg.locator .box");
              return `${getComputedStyle(document.body).backgroundColor} | ${box ? getComputedStyle(box).stroke : "no drawing"}`;
            });
            const before = await look();
            await page.locator("[data-theme-toggle]").click();
            const after = await look();
            await page.locator("[data-theme-toggle]").click();
            const back = await look();
            const [bgA, strokeA] = before.split(" | ");
            const [bgB, strokeB] = after.split(" | ");
            if (bgA === bgB || strokeA === strokeB || back !== before) fail(`${url} ${mode}: the switch didn't turn the page and its drawing (${before} -> ${after} -> ${back})`);
          }
          await ctx.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}
process.stdout.write(failed ? `redesign-shots: FAILED (${failed})\n` : `redesign-shots: ok (${OUT})\n`);
process.exitCode = failed ? 1 : 0;
