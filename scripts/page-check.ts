// `pnpm page-check` (PLAN 1.8): browser gates on every page in dist/.
//   focus           every element reached with Tab shows a visible focus indicator: an
//                   outline of at least 2 px, or for a map part its focus ring
//   no-JS           every link and text block present with JS is also present without it
//                   (desktop and phone)
//   reduced motion  under prefers-reduced-motion no animation runs, at load and after
//                   hovering and focusing every link
//
//   node scripts/page-check.ts [--self-test]
//
// --self-test hides every focus indicator first, and passes only if the focus gate then
// fails: proof that a broken focus style can't slip through (PLAN 1.8 done-when).
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { devices, launch, type Page } from "./lib/browser.ts";
import { DIST, serveDist } from "./lib/serve.ts";

const SELF_TEST = process.argv.includes("--self-test");
const BREAK_FOCUS = "*:focus, *:focus-visible { outline: none !important; } .schematic .ring { opacity: 0 !important; }";
const desktop = { viewport: { width: 1280, height: 900 } };

function pages(dir = DIST, base = ""): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...pages(f, `${base}${n}/`));
    else if (n === "index.html") out.push(`/${base}`);
  }
  return out.sort();
}

let failures = 0;
const report = (ok: boolean, what: string, details: string[] = []) => {
  if (!ok) failures++;
  process.stdout.write(`${ok ? "ok    " : "FAILED"} ${what}\n`);
  for (const d of details.slice(0, 8)) process.stdout.write(`       ${d}\n`);
};

// Tab through the page; return the elements whose focus isn't visible.
async function invisibleFocus(page: Page): Promise<{ stops: number; bad: string[] }> {
  const bad: string[] = [];
  const seen = new Set<string>();
  let stops = 0;
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press("Tab");
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | SVGElement | null;
      if (!el || el === document.body) return null;
      const key = `${el.tagName}#${el.id}|${(el.getAttribute("href") ?? "")}|${(el.textContent ?? "").trim().slice(0, 40)}`;
      let visible: boolean;
      if (el.matches("svg a.part")) {
        // A map part shows focus as its ring, or (the style sheet's sample) as an amber
        // stroke of at least 2 px on its box. SVG links draw no outline of their own.
        const amber = getComputedStyle(document.documentElement).getPropertyValue("--color-amber").trim();
        const probe = document.createElement("i");
        probe.style.color = amber;
        document.body.append(probe);
        const amberRgb = getComputedStyle(probe).color;
        probe.remove();
        const ring = el.querySelector(".ring");
        const ringOn = !!ring && Number(getComputedStyle(ring).opacity) >= 0.9 && getComputedStyle(ring).stroke !== "none";
        const strokeOn = [...el.querySelectorAll("rect")].some((r) => {
          const c = getComputedStyle(r);
          return c.stroke === amberRgb && parseFloat(c.strokeWidth) >= 2 && Number(c.opacity) >= 0.9;
        });
        visible = ringOn || strokeOn;
      } else {
        const c = getComputedStyle(el);
        visible = c.outlineStyle !== "none" && parseFloat(c.outlineWidth) >= 2 && !/rgba\([^)]*,\s*0\)$|transparent/.test(c.outlineColor);
      }
      return { key, visible };
    });
    if (!r || seen.has(r.key)) break;
    seen.add(r.key);
    stops++;
    if (!r.visible) bad.push(r.key);
  }
  return { stops, bad };
}

async function snapshot(page: Page): Promise<{ links: string[]; text: string[] }> {
  return page.evaluate(() => ({
    links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
    text: [...document.querySelectorAll("main :is(h1, h2, h3, h4, p, li, th, td)")]
      .filter((e) => !e.closest("[data-card]"))
      .map((e) => (e.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean),
  }));
}

const { origin, server } = await serveDist();
const browser = await launch();
try {
  for (const path of pages()) {
    const url = origin + path;
    process.stdout.write(`── ${path}\n`);

    // Focus.
    {
      const ctx = await browser.newContext(desktop);
      const page = await ctx.newPage();
      await page.goto(url);
      if (SELF_TEST) await page.addStyleTag({ content: BREAK_FOCUS });
      const { stops, bad } = await invisibleFocus(page);
      if (SELF_TEST) report(bad.length > 0, `self-test: with focus hidden, the focus gate catches ${bad.length} of ${stops} Tab stops`);
      else report(bad.length === 0 && stops > 0, `focus visible on all ${stops} Tab stops${bad.length ? ` (${bad.length} without)` : ""}`, bad);
      await ctx.close();
    }
    if (SELF_TEST) continue;

    // No-JS: nothing that is there with JS may be missing without it.
    for (const [view, opts] of [["desktop", desktop], ["phone", devices["iPhone 13"]!]] as const) {
      const on = await browser.newContext({ ...opts });
      const off = await browser.newContext({ ...opts, javaScriptEnabled: false });
      const p1 = await on.newPage();
      const p2 = await off.newPage();
      await p1.goto(url);
      await p2.goto(url);
      const a = await snapshot(p1);
      const b = await snapshot(p2);
      const missingLinks = a.links.filter((h) => !b.links.includes(h));
      const missingText = a.text.filter((t) => !b.text.includes(t));
      report(missingLinks.length === 0 && missingText.length === 0, `no-JS (${view}): ${b.links.length} links, ${b.text.length} text blocks`, [
        ...missingLinks.map((h) => `missing link ${h}`),
        ...missingText.map((t) => `missing text "${t.slice(0, 60)}"`),
      ]);
      await on.close();
      await off.close();
    }

    // Reduced motion: nothing runs, at load or after hover and focus.
    {
      const ctx = await browser.newContext({ ...desktop, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(url);
      const running = () => page.evaluate(() => document.getAnimations().filter((x) => x.playState === "running").length);
      let worst = await running();
      const targets = await page.locator("a[href]:visible").count();
      for (let i = 0; i < Math.min(targets, 60); i++) {
        const a = page.locator("a[href]:visible").nth(i);
        await a.hover().catch(() => {});
        worst = Math.max(worst, await running());
        await a.focus().catch(() => {});
        worst = Math.max(worst, await running());
      }
      report(worst === 0, `reduced motion: no animation runs (${Math.min(targets, 60)} links hovered and focused)`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (SELF_TEST) {
  // Every page must have its hidden focus caught.
  process.stdout.write(failures ? `page-check self-test: FAILED (broken focus not caught on ${failures} page(s))\n` : `page-check self-test: ok (broken focus caught on all ${pages().length} pages)\n`);
  process.exitCode = failures ? 1 : 0;
} else {
  process.stdout.write(failures ? `page-check: FAILED (${failures})\n` : "page-check: ok\n");
  process.exitCode = failures ? 1 : 0;
}
