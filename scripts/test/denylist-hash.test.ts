// Tests for the hashed deny-list scan (PLAN 1.3a). Only made-up test words are hashed here;
// the real list never enters a session (D20).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import { buildValue, parseValue } from "../denylist-hash.ts";

const SCAN = resolve(import.meta.dirname, "..", "scan.ts");
const GEN = resolve(import.meta.dirname, "..", "denylist-hash.ts");
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

const W1 = "vexillo" + "grath";
const W2 = ["Trin", "Obalde"];
const W3 = "qa" + "-" + "zentrix";
const LIST = [W1, W2.join(" "), W3, "ulmq"];
const VALUE = buildValue(LIST).value;

function scan(body: string, value = VALUE) {
  const dir = mkdtempSync(join(tmpdir(), "hash-fixture-"));
  dirs.push(dir);
  writeFileSync(join(dir, "planted.md"), `# Fixture\n\n${body}\n`);
  const env: NodeJS.ProcessEnv = { ...process.env, REDACTION_DENYLIST_HASHES: value, REDACTION_HASH_CACHE: "off" };
  delete env.REDACTION_DENYLIST;
  delete env.REDACTION_DENYLIST_FILE;
  const r = spawnSync(process.execPath, [SCAN, "--dir", dir], { encoding: "utf8", env });
  return { status: r.status, output: r.stdout + r.stderr };
}

function assertNoText(output: string) {
  for (const w of [W1, ...W2, W3, "ulmq"]) assert.ok(!output.toLowerCase().includes(w.toLowerCase()), "no entry text in the output");
}

test("a hashed one-word entry is found at file:line, case-insensitively", () => {
  const { status, output } = scan(`Some text.\nThe value is ${W1.toUpperCase()} here.`);
  assert.equal(status, 1, output);
  assert.match(output, /deny-list\s+planted\.md:4/);
  assertNoText(output);
});

test("a two-word entry split across a line break is found", () => {
  const { status, output } = scan(`Signed by ${W2[0]}\n  ${W2[1]}, later.`);
  assert.equal(status, 1, output);
  assert.match(output, /deny-list\s+planted\.md:3/);
  assertNoText(output);
});

test("a hyphenated entry is found, and inside a longer word it isn't", () => {
  assert.equal(scan(`Host (${W3}) answered.`).status, 1);
  assert.equal(scan(`Host ${W3}x and ${W1}s answered.`).status, 0);
});

test("the summary shows the hashed entry count and span", () => {
  const { status, output } = scan("nothing private");
  assert.equal(status, 0, output);
  assert.match(output, /files clean \(deny-list: 4 hashed entries, span 2\)/);
});

test("a malformed or cut-off value fails the scan instead of being skipped", () => {
  for (const bad of ["v0;nope", VALUE.slice(0, -40), VALUE.replace(/salt=[0-9a-f]+/, "salt=xyz")]) {
    const { status, output } = scan("nothing private", bad);
    assert.equal(status, 2, output);
    assert.match(output, /REDACTION_DENYLIST_HASHES:/);
  }
});

test("REDACTION_REQUIRE_DENYLIST=1 without any list fails the scan", () => {
  const dir = mkdtempSync(join(tmpdir(), "hash-fixture-"));
  dirs.push(dir);
  writeFileSync(join(dir, "a.md"), "clean\n");
  const env: NodeJS.ProcessEnv = { ...process.env, REDACTION_REQUIRE_DENYLIST: "1" };
  for (const k of ["REDACTION_DENYLIST", "REDACTION_DENYLIST_FILE", "REDACTION_DENYLIST_HASHES"]) delete env[k];
  const r = spawnSync(process.execPath, [SCAN, "--dir", dir], { encoding: "utf8", env });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /REDACTION_REQUIRE_DENYLIST=1 but no deny-list is set/);
});

test("entries that can't match as whole words are rejected by the generator", () => {
  assert.throws(() => buildValue(["-leading", "ok"]), /don't start and end with a letter or digit/);
  assert.equal(parseValue(VALUE).count, 4);
  assert.deepEqual(buildValue(LIST).short, [4]);
});

test("the generator refuses to run inside a Claude Code session", () => {
  const r = spawnSync(process.execPath, [GEN], { encoding: "utf8", input: "something\n", env: { ...process.env, CLAUDECODE: "1" } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /refusing to run inside a Claude Code session/);
  assert.equal(r.stdout, "");
});
