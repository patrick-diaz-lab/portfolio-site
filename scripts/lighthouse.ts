// `pnpm lighthouse` (PLAN 1.3 done-when, gate in CI with 1.8): mobile Lighthouse on every
// piece overview page and every part page its map links to (PLAN 1.4). Each category must
// score at least 95.
//
//   node scripts/lighthouse.ts [--min 95] [path ...]     default: those pages
//
// Lighthouse 13.6.0 is a pinned dev dependency; Chrome is Playwright's Chromium (preinstalled
// in the cloud VM), or CHROME_PATH. `is-crawlable` is skipped while pages carry noindex
// until launch (PLAN 1.9). Lighthouse sends nothing anywhere: the Node API has no telemetry.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import lighthouse from "lighthouse";
import { loadPieces } from "../src/lib/pieces.ts";
import { serveDist } from "./lib/serve.ts";

const args = process.argv.slice(2);
const mi = args.indexOf("--min");
const MIN = mi >= 0 ? Number(args.splice(mi, 2)[1]) : 95;
const paths = args.length ? args : loadPieces().flatMap((p) => [`/${p.id}/`, ...p.parts.flatMap((x) => (x.page ? [x.page] : []))]);
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

function chromePath(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const pw = createRequire(import.meta.url)("playwright") as { chromium: { executablePath(): string } };
  return pw.chromium.executablePath();
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
const chrome = spawn(chromePath(), ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--disable-extensions", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });

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
    const ok = scores.every(([, s]) => s >= MIN);
    if (!ok) failed++;
    process.stdout.write(`${ok ? "ok    " : "FAILED"} ${path.padEnd(12)} ${scores.map(([c, s]) => `${c} ${s}`).join(" · ")}\n`);
    if (!ok) {
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
process.stdout.write(failed ? `lighthouse: FAILED (${failed} page(s) under ${MIN})\n` : `lighthouse: ok (mobile, every category ≥ ${MIN})\n`);
process.exitCode = failed ? 1 : 0;
