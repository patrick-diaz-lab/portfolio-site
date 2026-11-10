// Tests for the verbatim-copy check (D9, D21). Fixtures are built in a temp dir.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";

const CHECK = resolve(import.meta.dirname, "..", "check-verbatim.ts");
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

// 60 distinct made-up words, so no run of them exists anywhere else.
const SOURCE = Array.from({ length: 60 }, (_, i) => `zorb${i}x`).join(" ");

function run(page: string) {
  const dir = mkdtempSync(join(tmpdir(), "verbatim-"));
  dirs.push(dir);
  mkdirSync(join(dir, "sources", "vision"), { recursive: true });
  writeFileSync(join(dir, "sources", "vision", "notes.md"), `# Notes\n\n${SOURCE}\n`);
  mkdirSync(join(dir, "content"), { recursive: true });
  writeFileSync(join(dir, "content", "page.md"), `# Page\n\n${page}\n`);
  const r = spawnSync(process.execPath, [CHECK, "--root", dir], { encoding: "utf8" });
  return { status: r.status, output: r.stdout + r.stderr };
}

test("a pasted run of 40 words is reported with file:line, without the text", () => {
  const pasted = SOURCE.split(" ").slice(5, 50).join(" ");
  const { status, output } = run(`Intro line.\n\n${pasted}`);
  assert.equal(status, 0, "warning only");
  assert.match(output, /WARNING 1 passage/);
  assert.match(output, /content\/page\.md:5\s+from sources\/vision\/notes\.md:3/);
  assert.ok(!output.includes("zorb10x"), "copied text must not be printed");
});

test("39 copied words pass", () => {
  const { output } = run(SOURCE.split(" ").slice(0, 39).join(" "));
  assert.match(output, /verbatim: ok/);
});

test("case and punctuation changes still count as a copy", () => {
  const pasted = SOURCE.split(" ").slice(0, 45).map((w, i) => (i % 7 === 0 ? `${w.toUpperCase()},` : w)).join(" ");
  assert.match(run(pasted).output, /WARNING 1 passage/);
});
