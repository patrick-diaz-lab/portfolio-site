// `pnpm design-check` (PLAN 1.1): serves dist/, runs axe-core (WCAG 2 A/AA) on every page,
// fails on any violation or any request to another host, and saves desktop and phone
// screenshots for Patrick's review.
//
//   node scripts/design-check.ts [--shots <dir>]     default dir: .cache/screens (git-ignored)
//
// Needs a Chromium through Playwright. In the cloud VM the preinstalled Playwright is used
// (it isn't a repo dependency); the CI gate for this comes with PLAN 1.8.
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const i = process.argv.indexOf("--shots");
const SHOTS = resolve(i > 0 ? (process.argv[i + 1] ?? ".cache/screens") : join(ROOT, ".cache", "screens"));

type Page = { goto(u: string, o?: object): Promise<unknown>; addScriptTag(o: object): Promise<unknown>; evaluate<T>(f: string): Promise<T>; screenshot(o: object): Promise<unknown>; on(e: string, f: (r: { url(): string }) => void): void; close(): Promise<void> };
type Browser = { newContext(o?: object): Promise<{ newPage(): Promise<Page>; close(): Promise<void> }>; close(): Promise<void> };
type PW = { chromium: { launch(o?: object): Promise<Browser> }; devices: Record<string, object> };

function loadPlaywright(): PW {
  const req = createRequire(import.meta.url);
  try {
    return req("playwright") as PW;
  } catch {
    throw new Error("Playwright isn't available here. In the cloud VM it is preinstalled; elsewhere run this in CI (PLAN 1.8).");
  }
}

const TYPES: Record<string, string> = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

function pages(dir = DIST, base = ""): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...pages(f, `${base}${n}/`));
    else if (n === "index.html") out.push(`/${base}`);
  }
  return out.sort();
}

async function main(): Promise<number> {
  if (!existsSync(join(DIST, "index.html"))) {
    process.stdout.write("design-check: dist/ is missing; run pnpm build first\n");
    return 1;
  }
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url ?? "/").split("?")[0]!);
    if (p.endsWith("/")) p += "index.html";
    const f = resolve(DIST, `.${p}`);
    if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
    createReadStream(f).pipe(res);
  });
  await new Promise<void>((r) => server.listen(0, "localhost", r));
  const port = (server.address() as { port: number }).port;
  const origin = `http://localhost:${port}`;

  const { chromium, devices } = loadPlaywright();
  const browser = await chromium.launch();
  const axe = readFileSync(join(ROOT, "node_modules", "axe-core", "axe.min.js"), "utf8");
  mkdirSync(SHOTS, { recursive: true });

  let failed = 0;
  const views: [string, object][] = [
    ["desktop", { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 }],
    ["phone", { ...devices["iPhone 13"] }],
  ];
  try {
    for (const path of pages()) {
      const slug = path === "/" ? "home" : path.replace(/\//g, "-").replace(/^-|-$/g, "");
      for (const [view, opts] of views) {
        const ctx = await browser.newContext({ ...opts, colorScheme: "dark" });
        const page = await ctx.newPage();
        const foreign: string[] = [];
        page.on("request", (r) => {
          const u = r.url();
          if (!u.startsWith(origin) && !u.startsWith("data:")) foreign.push(u);
        });
        await page.goto(origin + path, { waitUntil: "networkidle" });
        await page.evaluate("document.fonts.ready");
        await page.addScriptTag({ content: axe });
        const result = await page.evaluate<{ violations: { id: string; impact: string; nodes: unknown[] }[] }>(
          "axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })",
        );
        const shot = join(SHOTS, `${slug}-${view}.png`);
        await page.screenshot({ path: shot, fullPage: true });
        const v = result.violations;
        const status = v.length === 0 && foreign.length === 0 ? "ok" : "FAILED";
        if (status !== "ok") failed++;
        process.stdout.write(`${status.padEnd(6)} ${path.padEnd(14)} ${view.padEnd(8)} axe: ${v.length} violation(s), other hosts: ${foreign.length}\n`);
        for (const x of v) process.stdout.write(`       ${x.id} (${x.impact}) on ${x.nodes.length} element(s)\n`);
        for (const u of foreign) process.stdout.write(`       request to another host: ${new URL(u).host}\n`);
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  process.stdout.write(`screenshots: ${SHOTS}\n`);
  process.stdout.write(failed ? `design-check: FAILED (${failed})\n` : "design-check: ok\n");
  return failed ? 1 : 0;
}

process.exitCode = await main();
