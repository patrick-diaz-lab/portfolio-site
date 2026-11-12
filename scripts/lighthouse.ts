// `pnpm lighthouse` (PLAN 1.3, a CI gate since 1.8): mobile Lighthouse on every page in
// dist/, both languages, except the internal style sheet (PLAN 1.9a). Each category must
// score at least 95, and each page must stay inside the budget below (from Lighthouse's own
// request list).
//
//   node scripts/lighthouse.ts [--min 95] [path ...]     default: those pages
//
// Lighthouse 13.6.0 is a pinned dev dependency. The browser is the pinned Playwright's
// Chromium (scripts/lib/browser.ts), never a system Chrome. `is-crawlable` is skipped while
// pages carry noindex until launch (PLAN 1.9). The Node API sends nothing anywhere.
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import lighthouse from "lighthouse";
import { chromiumPath } from "./lib/browser.ts";
import { DIST, serveDist } from "./lib/serve.ts";

const args = process.argv.slice(2);
const mi = args.indexOf("--min");
const MIN = mi >= 0 ? Number(args.splice(mi, 2)[1]) : 95;
// Default: every page in dist/ in every language, except the internal style sheet (PLAN 1.9a).
function distPages(dir = DIST, base = ""): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...distPages(f, `${base}${n}/`));
    else if (n === "index.html") out.push(`/${base}`);
  }
  return out.sort();
}
const paths = args.length ? args : distPages().filter((p) => p !== "/styleguide/");
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

// Size budget per page (PLAN 1.8), on transferred bytes as Lighthouse measured them.
const KB = 1024;
const BUDGET = { script: 5 * KB, font: 130 * KB, total: 250 * KB };
type Req = { url: string; resourceType?: string; transferSize?: number };

function budget(items: Req[], pageOrigin: string): { ok: boolean; line: string } {
  let script = 0, font = 0, total = 0;
  const foreign = new Set<string>();
  for (const r of items) {
    if (r.url.startsWith("data:")) continue;
    const size = r.transferSize ?? 0;
    total += size;
    if (r.resourceType === "Script") script += size;
    if (r.resourceType === "Font") font += size;
    if (new URL(r.url).origin !== pageOrigin) foreign.add(new URL(r.url).host);
  }
  const ok = script <= BUDGET.script && font <= BUDGET.font && total <= BUDGET.total && foreign.size === 0;
  const k = (n: number) => `${(n / KB).toFixed(1)} KB`;
  return { ok, line: `script ${k(script)} · fonts ${k(font)} · total ${k(total)} · other hosts ${foreign.size}` };
}

async function freePort(): Promise<number> {
  return new Promise((r) => {
    const s = createServer().listen(0, "localhost", () => {
      const { port } = s.address() as { port: number };
      s.close(() => r(port));
    });
  });
}

async function waitForDebugger(port: number): Promise<void> {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/json/version`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Chrome's debugging port didn't open");
}

const { origin, server } = await serveDist();
const port = await freePort();
const profile = mkdtempSync(join(tmpdir(), "lh-profile-"));
const chrome = spawn(chromiumPath().path, ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--disable-extensions", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });

let failed = 0;
try {
  await waitForDebugger(port);
  for (const path of paths) {
    const result = await lighthouse(`${origin}${path}`, { port, output: "json", logLevel: "error", onlyCategories: CATEGORIES }, {
      extends: "lighthouse:default",
      settings: { formFactor: "mobile", skipAudits: ["is-crawlable"] },
    });
    if (!result) throw new Error(`no Lighthouse result for ${path}`);
    const scores = CATEGORIES.map((c) => [c, Math.round((result.lhr.categories[c]?.score ?? 0) * 100)] as const);
    const requests = ((result.lhr.audits["network-requests"]?.details as { items?: Req[] } | undefined)?.items ?? []);
    const b = budget(requests, origin);
    const scored = scores.every(([, s]) => s >= MIN);
    const ok = scored && b.ok && requests.length > 0;
    if (!ok) failed++;
    process.stdout.write(`${ok ? "ok    " : "FAILED"} ${path.padEnd(12)} ${scores.map(([c, s]) => `${c} ${s}`).join(" · ")}\n`);
    process.stdout.write(`       budget: ${b.line}${b.ok ? "" : "  (over: script ≤ 5 KB, fonts ≤ 130 KB, total ≤ 250 KB, no other hosts)"}\n`);
    if (!scored) {
      for (const a of Object.values(result.lhr.audits)) {
        if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable") process.stdout.write(`       ${a.id}: ${a.displayValue ?? a.score}\n`);
      }
    }
  }
} finally {
  const exited = new Promise((r) => chrome.once("exit", r));
  chrome.kill();
  await exited;
  server.close();
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
process.stdout.write(failed ? `lighthouse: FAILED (${failed} page(s) under ${MIN} or over budget)\n` : `lighthouse: ok (mobile, every category ≥ ${MIN}, every page inside the budget)\n`);
process.exitCode = failed ? 1 : 0;
