// `node scripts/design-lab-shots.ts` (docs/design-exploration.md): the review screenshots of
// the design lab, from dist/ (run `pnpm build` first). For every direction: homepage and
// project page at 1440 px and 375 px, in each mode the direction has, at deviceScaleFactor 2;
// plus the German pages at 375 px in the direction's main mode, because German runs longer.
// Saved under docs/design-exploration/<direction>/.
//
// It also checks what a screenshot can't be trusted to show: every one of those pages, in
// both languages, at 375, 768 and 1440 px, must not scroll sideways.
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { launch } from "./lib/browser.ts";
import { serveDist } from "./lib/serve.ts";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "docs", "design-exploration");
// The modes a direction has; the first is its main mode.
const MODES: Record<string, ("light" | "dark")[]> = { a: ["light", "dark"], b: ["light", "dark"], c: ["dark"], d: ["light", "dark"] };
const PAGES = [["home", ""], ["project", "vision/"]] as const;

const { origin, server } = await serveDist();
const browser = await launch();
let failed = 0;
try {
  for (const [dir, modes] of Object.entries(MODES)) {
    mkdirSync(join(OUT, dir), { recursive: true });
    for (const [name, path] of PAGES) {
      for (const lang of ["en", "de"] as const) {
        for (const width of [1440, 768, 375]) {
          for (const mode of modes) {
            const ctx = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, deviceScaleFactor: 2, colorScheme: mode, reducedMotion: "reduce" });
            const page = await ctx.newPage();
            await page.goto(`${origin}/design-lab/${dir}/${lang === "de" ? "de/" : ""}${path}`, { waitUntil: "networkidle" });
            await page.evaluate("document.fonts.ready");
            const over = await page.evaluate<number>("document.documentElement.scrollWidth - window.innerWidth");
            if (over > 0) {
              failed++;
              process.stdout.write(`FAILED ${dir} ${name} ${lang} ${width} ${mode}: scrolls sideways by ${over}px\n`);
            }
            const keep = width !== 768 && (lang === "en" || (width === 375 && mode === modes[0]));
            if (keep) await page.screenshot({ path: join(OUT, dir, `${name}-${width}-${mode}${lang === "de" ? "-de" : ""}.png`), fullPage: true });
            await ctx.close();
          }
        }
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}
process.stdout.write(failed ? `design-lab-shots: FAILED (${failed})\n` : `design-lab-shots: ok (${OUT})\n`);
process.exitCode = failed ? 1 : 0;
