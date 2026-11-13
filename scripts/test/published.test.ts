// Tests for scripts/published-check.ts (live site rules, D22): a published path must stay a
// page, or 301 to one; a removed page without that redirect fails the build.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const CHECK = resolve(import.meta.dirname, "..", "published-check.ts");
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

const LIST = "# published\n/\n/de/\n/vision/guardrails/\n";

function site(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), "published-"));
  dirs.push(dir);
  const all = { "dist/index.html": "<p>home</p>", "dist/de/index.html": "<p>de</p>", "dist/vision/guardrails/index.html": "<p>g</p>", "published-urls.txt": LIST, ...files };
  for (const [p, c] of Object.entries(all)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), c);
  }
  return dir;
}

const run = (dir: string) => {
  const r = spawnSync(process.execPath, [CHECK, "--dist", join(dir, "dist"), "--list", join(dir, "published-urls.txt")], { encoding: "utf8" });
  return { status: r.status, output: r.stdout + r.stderr };
};

test("every published path that is still a page passes", () => {
  const { status, output } = run(site({}));
  assert.equal(status, 0, output);
  assert.match(output, /published-check: ok \(3 published paths\)/);
});

test("a removed page fails", () => {
  const dir = site({});
  rmSync(join(dir, "dist", "vision", "guardrails"), { recursive: true });
  const { status, output } = run(dir);
  assert.equal(status, 1, output);
  assert.match(output, /FAILED \/vision\/guardrails\/\s+no page and no redirect/);
});

test("a removed page with a 301 to its new home passes", () => {
  const dir = site({ "dist/vision/guardrails-v2/index.html": "<p>new</p>", "dist/_redirects": "/vision/guardrails/ /vision/guardrails-v2/ 301\n" });
  rmSync(join(dir, "dist", "vision", "guardrails"), { recursive: true });
  const { status, output } = run(dir);
  assert.equal(status, 0, output);
  assert.match(output, /ok\s+\/vision\/guardrails\/\s+301 → \/vision\/guardrails-v2\//);
});

test("a redirect that isn't a 301, or points at no page, fails", () => {
  const temp = site({ "dist/vision/new/index.html": "<p>new</p>", "dist/_redirects": "/vision/guardrails/ /vision/new/ 302\n" });
  rmSync(join(temp, "dist", "vision", "guardrails"), { recursive: true });
  const a = run(temp);
  assert.equal(a.status, 1, a.output);
  assert.match(a.output, /FAILED \/vision\/guardrails\/\s+redirect is 302, not 301/);

  const nowhere = site({ "dist/_redirects": "/vision/guardrails/ /vision/missing/ 301\n" });
  rmSync(join(nowhere, "dist", "vision", "guardrails"), { recursive: true });
  const b = run(nowhere);
  assert.equal(b.status, 1, b.output);
  assert.match(b.output, /FAILED \/vision\/guardrails\/\s+301 to \/vision\/missing\/, which isn't a page/);
});

test("a line that isn't a site path fails", () => {
  const { status, output } = run(site({ "published-urls.txt": `${LIST}vision/no-slash/\n` }));
  assert.equal(status, 1, output);
  assert.match(output, /FAILED list line 5: "vision\/no-slash\/" isn't a site path/);
});
