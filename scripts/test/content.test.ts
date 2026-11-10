// Tests for the content checks (PLAN 1.2 done-when). Fixtures are built in a temp dir:
// a valid built part with one entry of each kind, then one broken variant per rule.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, test } from "node:test";

const CHECK = resolve(import.meta.dirname, "..", "check-content.ts");
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

const SHA = "0123456789abcdef0123456789abcdef01234567";

const PART = `---
id: gateway
piece: demo
title: Demo gateway
summary: A part used only in tests.
status: built
as_of: 2026-11-10
source_commit: ${SHA}
sources:
  - sources/vision/notes.md
evals:
  - name: classifier-local-heldout
    metric: accuracy
    value: 0.95
    n: 20
    date: 2026-11-04
related: []
---

What it does.
`;

const entry = (id: string, kind: string, extra = "") => `---
id: ${id}
piece: demo
part: gateway
page: /demo/gateway/
anchor: ${id}
kind: ${kind}
sources:
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: ${SHA}${extra}
---

Entry text.
`;

function fixture(change: (files: Record<string, string>) => void = () => {}) {
  const files: Record<string, string> = {
    "sources/vision/notes.md": "# Notes\n",
    "content/parts/demo/gateway.mdx": PART,
    "content/knowledge/demo/why-gateway.md": entry("why-gateway", "decision"),
    "content/knowledge/demo/no-sdk-keys.md": entry("no-sdk-keys", "rejected"),
    "content/knowledge/demo/budget-test.md": entry("budget-test", "testing"),
    "content/knowledge/demo/price-lesson.md": entry("price-lesson", "learning"),
  };
  change(files);
  const dir = mkdtempSync(join(tmpdir(), "content-"));
  dirs.push(dir);
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), c);
  }
  const r = spawnSync(process.execPath, [CHECK, "--root", dir], { encoding: "utf8" });
  return { status: r.status, output: r.stdout + r.stderr };
}

test("a valid built part with all four entry kinds passes", () => {
  const { status, output } = fixture();
  assert.equal(status, 0, output);
  assert.match(output, /content: ok \(0 piece\(s\), 1 part page\(s\), 4 entries\)/);
});

test("a part with a missing field fails, naming field and file:line", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace(/^summary: .*\n/m, "");
  });
  assert.equal(status, 1, output);
  assert.match(output, /schema\s+content\/parts\/demo\/gateway\.mdx:\d+\s+summary:/);
});

test("an entry pointing at a missing page or anchor fails", () => {
  const { status, output } = fixture((f) => {
    f["content/knowledge/demo/stray.md"] = entry("stray", "decision").replace("part: gateway", "part: router").replace("/demo/gateway/", "/demo/router/");
    f["content/knowledge/demo/dupe.md"] = entry("dupe", "testing").replace("anchor: dupe", "anchor: why-gateway");
  });
  assert.equal(status, 1, output);
  assert.match(output, /anchor\s+content\/knowledge\/demo\/stray\.md:\d+\s+part "router" has no page/);
  assert.match(output, /anchor\s+content\/knowledge\/demo\/(dupe|why-gateway)\.md:\d+\s+anchor "why-gateway" is already used/);
});

test("a built part without the four entry kinds fails", () => {
  const { status, output } = fixture((f) => {
    delete f["content/knowledge/demo/no-sdk-keys.md"];
    delete f["content/knowledge/demo/price-lesson.md"];
  });
  assert.equal(status, 1, output);
  assert.match(output, /built-entries\s+content\/parts\/demo\/gateway\.mdx:\d+\s+.*missing: rejected, learning/);
});

test("free text in evals[] fails", () => {
  const variants: [string, string, RegExp][] = [
    ["    value: 0.95", "    value: about 95 percent", /evals\.0\.value: Invalid input: expected number/],
    ["    metric: accuracy", "    metric: pretty accurate", /evals\.0\.metric: Invalid option/],
    ["  - name: classifier-local-heldout", "  - name: Classifier on my held-out set", /evals\.0\.name: must be a lowercase slug/],
    ["    n: 20", "    n: 20\n    example: the case about the router", /evals\.0: Unrecognized key: "example"/],
  ];
  for (const [from, to, expect] of variants) {
    assert.ok(PART.includes(from), `fixture must contain ${from}`);
    const { status, output } = fixture((f) => {
      f["content/parts/demo/gateway.mdx"] = PART.replace(from, to);
    });
    assert.equal(status, 1, output);
    assert.match(output, expect, output);
  }
});

test("an eval name longer than 48 characters fails", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace("name: classifier-local-heldout", `name: ${"a".repeat(49)}`);
  });
  assert.equal(status, 1, output);
  assert.match(output, /evals\.0\.name: must be at most 48 characters/);
});

test("a missing source file and an unknown related part fail", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace("related: []", "related:\n  - router").replace("sources/vision/notes.md", "sources/vision/gone.md");
  });
  assert.equal(status, 1, output);
  assert.match(output, /related\s+.*related part "router" doesn't exist/);
  assert.match(output, /sources\s+.*sources\/vision\/gone\.md doesn't exist/);
});
