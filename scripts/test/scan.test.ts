// Planted-finding tests for the redaction scan (PLAN 0.2 done-when).
// Fixtures are built at runtime in a temp dir, so no planted string sits in the repo.
// Each test checks that the scan fails, names the rule and file:line, and never
// prints the planted text.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";

const SCAN = resolve(import.meta.dirname, "..", "scan.ts");
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

function scanFixture(planted: string, env: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "scan-fixture-"));
  dirs.push(dir);
  writeFileSync(join(dir, "planted.md"), `# Fixture\n\nThe value is ${planted} here.\n`);
  const clean = { ...process.env };
  delete clean.REDACTION_DENYLIST;
  delete clean.REDACTION_DENYLIST_FILE;
  // A session's hashed list (PLAN 1.3a) must not leak into the plaintext-list fixtures.
  delete clean.REDACTION_DENYLIST_HASHES;
  delete clean.REDACTION_REQUIRE_DENYLIST;
  const r = spawnSync(process.execPath, [SCAN, "--dir", dir], { encoding: "utf8", env: { ...clean, ...env } });
  return { status: r.status, output: r.stdout + r.stderr, dir };
}

function assertCaught(planted: string, rule: string, env: Record<string, string> = {}) {
  const { status, output } = scanFixture(planted, env);
  assert.equal(status, 1, `scan should fail:\n${output}`);
  assert.match(output, new RegExp(`${rule}\\S*\\s+planted\\.md:3`), `rule and file:line expected:\n${output}`);
  assert.ok(!output.includes(planted), "the planted text must never appear in the output");
}

test("IP address", () => assertCaught(["192", "0", "2", "17"].join("."), "ipv4"));

test("home path", () => assertCaught(["", "home", "someone", "notes.txt"].join("/"), "absolute-path"));

test("secret pattern (gitleaks)", () => {
  const alnum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const body = [...randomBytes(36)].map((b) => alnum[b % alnum.length]).join("");
  assertCaught("gh" + "p_" + body, "gitleaks:");
});

test("deny-list word from a test list", () => {
  const word = "quill" + "frost";
  const listDir = mkdtempSync(join(tmpdir(), "denylist-"));
  dirs.push(listDir);
  const list = join(listDir, "test-denylist.txt");
  writeFileSync(list, `# test list\n${word}\n`);
  assertCaught(word, "deny-list", { REDACTION_DENYLIST_FILE: list });
});

test("clean file passes", () => {
  const { status, output } = scanFixture("nothing private");
  assert.equal(status, 0, output);
});

// PLAN 0.4: a single-line secret field turns line breaks into spaces, so "|" and ";" also
// separate entries, and the summary prints the entry count (never the entries).
for (const [name, sep] of [["newline", "\n"], ["pipe", " | "], ["semicolon", ";"]] as const) {
  test(`deny-list entries separated by ${name} are each matched; count printed`, () => {
    const word = "brindle" + "vortash";
    const list = ["first entry", word, "third"].join(sep);
    const { status, output } = scanFixture(word, { REDACTION_DENYLIST: list });
    assert.equal(status, 1, output);
    assert.match(output, /deny-list\s+planted\.md:3/);
    assert.match(output, /\(deny-list: 3 entries\)/);
    assert.ok(!output.includes(word) && !output.includes("first entry"), "entries must never be printed");
  });
}

test("a clean scan with a list prints the entry count", () => {
  const { status, output } = scanFixture("nothing private", { REDACTION_DENYLIST: "# comment;alpha|beta" });
  assert.equal(status, 0, output);
  assert.match(output, /files clean \(deny-list: 2 entries\)/);
});
