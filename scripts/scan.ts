// Redaction scan (D9, D20). Reports rule id and file:line, never the matched text.
//
//   node scripts/scan.ts                  tracked files in the working tree (default)
//   node scripts/scan.ts --staged         staged files, as they are in the index (pre-commit)
//   node scripts/scan.ts --commits <sha>… files each commit adds or changes (pre-push)
//   node scripts/scan.ts --dir <path>     every file under a directory (dist/, tests)
//
// Private deny-list (never in git): REDACTION_DENYLIST and/or REDACTION_DENYLIST_FILE (a
// path to such a list). Entries are separated by line breaks, "|" or ";". The summary line
// prints the number of entries (never the entries); without a list, only the generic
// rules and gitleaks run, and the scan says so.
//
// In sessions the plaintext list never exists (D20): REDACTION_DENYLIST_HASHES holds salted
// hashes of it instead (scripts/denylist-hash.ts, PLAN 1.3a), matched as whole words of 1..span
// tokens. A malformed value fails the scan rather than being skipped.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { parse } from "yaml";
import { runGitleaks } from "./lib/gitleaks.ts";
import { RULES, denyListRule, parseDenyList, type Rule } from "./lib/rules.ts";
import { matchHashes, missKey, parseValue, type HashSet } from "./denylist-hash.ts";

const ROOT = resolve(import.meta.dirname, "..");

// snap: which snapshot the file comes from ("" = working tree, ":" = index, else a commit).
// Exceptions are read from the same snapshot, so an uncommitted edit to
// redaction/exceptions.yaml can't silence the hooks.
type Source = { label: string; path: string; content: Buffer; snap: string };
type Finding = { rule: string; label: string; path: string; line: number; snap: string; text?: string };
type Exception = { path: string; rule: string; snippet: string; reason: string };

function git(args: string[]): Buffer {
  return execFileSync("git", args, { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}

function splitZ(b: Buffer): string[] {
  return b.toString("utf8").split("\0").filter((s) => s.length > 0);
}

function collect(argv: string[]): Source[] {
  const mode = argv[0];
  if (mode === "--staged") {
    return splitZ(git(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"])).map((p) => ({
      label: p,
      path: p,
      content: git(["show", `:${p}`]),
      snap: ":",
    }));
  }
  if (mode === "--commits") {
    const out: Source[] = [];
    for (const sha of argv.slice(1)) {
      const short = sha.slice(0, 7);
      const files = splitZ(git(["diff-tree", "--no-commit-id", "-r", "--root", "--name-only", "-z", "--diff-filter=ACMR", sha]));
      for (const p of files) out.push({ label: `${p}@${short}`, path: p, content: git(["show", `${sha}:${p}`]), snap: sha });
    }
    return out;
  }
  if (mode === "--dir") {
    const base = resolve(argv[1] ?? ".");
    const out: Source[] = [];
    const walk = (d: string) => {
      for (const name of readdirSync(d)) {
        const full = join(d, name);
        if (statSync(full).isDirectory()) walk(full);
        else {
          const rel = relative(base, full);
          out.push({ label: rel, path: rel, content: readFileSync(full), snap: "" });
        }
      }
    };
    walk(base);
    return out;
  }
  if (mode !== undefined) throw new Error(`unknown mode ${mode}`);
  return splitZ(git(["ls-files", "-z"])).flatMap((p) => {
    try {
      return [{ label: p, path: p, content: readFileSync(join(ROOT, p)), snap: "" }];
    } catch {
      return []; // deleted in the working tree
    }
  });
}

function isBinary(b: Buffer): boolean {
  return b.subarray(0, 8000).includes(0);
}

function lineOf(text: string, index: number): number {
  let n = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function loadDenyList(): string[] {
  const words: string[] = [];
  const inline = process.env.REDACTION_DENYLIST;
  if (inline) words.push(...parseDenyList(inline));
  const file = process.env.REDACTION_DENYLIST_FILE;
  if (file) words.push(...parseDenyList(readFileSync(file, "utf8")));
  return words;
}

const EXCEPTIONS_FILE = "redaction/exceptions.yaml";
const exceptionCache = new Map<string, Exception[]>();

function loadExceptions(snap: string): Exception[] {
  const cached = exceptionCache.get(snap);
  if (cached) return cached;
  let text: string;
  try {
    text = snap === "" ? readFileSync(join(ROOT, EXCEPTIONS_FILE), "utf8") : git(["show", snap === ":" ? `:${EXCEPTIONS_FILE}` : `${snap}:${EXCEPTIONS_FILE}`]).toString("utf8");
  } catch {
    text = ""; // not in that snapshot: no exceptions
  }
  const doc = parse(text) as { exceptions?: Exception[] } | null;
  const list = doc?.exceptions ?? [];
  exceptionCache.set(snap, list);
  return list;
}

function scanText(src: Source, text: string, rules: Rule[]): Finding[] {
  const out: Finding[] = [];
  for (const rule of rules) {
    for (const m of text.matchAll(rule.pattern)) {
      if (rule.accept && !rule.accept(m[0])) continue;
      out.push({ rule: rule.id, label: src.label, path: src.path, line: lineOf(text, m.index ?? 0), snap: src.snap, text: m[0] });
    }
  }
  return out;
}

// Known misses of the hashed scan, cached across runs in the git-ignored .cache/ (one file per
// salt and cost). Only candidates that are NOT on the list are stored, as truncated SHA-256,
// so the cache never holds a deny-list word. Hits are never written anywhere.
function missCacheFile(value: string): string {
  const id = createHash("sha256").update(value.split(";h=")[0]!).digest("hex").slice(0, 16);
  return join(ROOT, ".cache", `denylist-misses-${id}.txt`);
}
function saveMisses(file: string, cache: Map<string, boolean>): void {
  const keys = new Set<string>();
  for (const [k, hit] of cache) if (!hit) keys.add(k.startsWith("#") ? k.slice(1) : missKey(k));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, [...keys].join("\n"));
}

function main(): number {
  const sources = collect(process.argv.slice(2)).filter((s) => !isBinary(s.content));
  const denyWords = loadDenyList();
  const deny = denyListRule(denyWords);
  const rules = deny ? [...RULES, deny] : RULES;
  const hashVar = process.env.REDACTION_DENYLIST_HASHES;
  const hashed: HashSet | undefined = hashVar ? parseValue(hashVar) : undefined;
  if (!deny && !hashed && process.env.REDACTION_REQUIRE_DENYLIST === "1") {
    throw new Error("REDACTION_REQUIRE_DENYLIST=1 but no deny-list is set (REDACTION_DENYLIST_HASHES missing from the environment?)");
  }
  const hashCache = new Map<string, boolean>();
  const missFile = hashed && process.env.REDACTION_HASH_CACHE !== "off" ? missCacheFile(hashVar!) : undefined;
  if (missFile && existsSync(missFile)) for (const k of readFileSync(missFile, "utf8").split("\n")) if (k) hashCache.set(`#${k}`, false);

  const findings: Finding[] = [];
  for (const src of sources) {
    const text = src.content.toString("utf8");
    findings.push(...scanText(src, text, rules));
    if (hashed) {
      for (const index of matchHashes(text, hashed, hashCache)) {
        findings.push({ rule: "deny-list", label: src.label, path: src.path, line: lineOf(text, index), snap: src.snap });
      }
    }
  }

  // gitleaks over the same file set, materialized in a temp dir.
  if (sources.length > 0) {
    const tmp = mkdtempSync(join(tmpdir(), "scan-"));
    try {
      const byTmp = new Map<string, Source>();
      sources.forEach((s, i) => {
        const rel = join(String(i), s.path);
        mkdirSync(dirname(join(tmp, rel)), { recursive: true });
        writeFileSync(join(tmp, rel), s.content);
        byTmp.set(rel, s);
      });
      for (const f of runGitleaks(tmp)) {
        const s = byTmp.get(f.file);
        findings.push({ rule: f.rule, label: s?.label ?? "?", path: s?.path ?? "?", line: f.line, snap: s?.snap ?? "" });
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  if (missFile) saveMisses(missFile, hashCache);

  const reported = findings.filter(
    (f) =>
      f.rule === "deny-list" ||
      f.text === undefined ||
      !loadExceptions(f.snap).some(
        (e) =>
          e.rule === f.rule &&
          e.snippet === f.text &&
          // An entry also covers its own snippet inside the exceptions file.
          (e.path === f.path || f.path === EXCEPTIONS_FILE),
      ),
  );

  const lists: string[] = [];
  if (deny) lists.push(`${denyWords.length} ${denyWords.length === 1 ? "entry" : "entries"}`);
  if (hashed) lists.push(`${hashed.count} hashed ${hashed.count === 1 ? "entry" : "entries"}, span ${hashed.span}`);
  const note = lists.length ? ` (deny-list: ${lists.join("; ")})` : " (no deny-list set: generic rules and gitleaks only)";
  if (reported.length === 0) {
    process.stdout.write(`scan: ${sources.length} files clean${note}\n`);
    return 0;
  }
  reported.sort((a, b) => a.label.localeCompare(b.label) || a.line - b.line);
  process.stdout.write(`scan: ${reported.length} finding(s) in ${sources.length} files${note}\n`);
  for (const f of reported) process.stdout.write(`  ${f.rule}  ${f.label}:${f.line}\n`);
  process.stdout.write("Matched text is never printed. Fix the line, or add a reviewed entry to redaction/exceptions.yaml (never for deny-list).\n");
  return 1;
}

try {
  process.exitCode = main();
} catch (e) {
  // Error messages here come from our own code or git, never from scanned content.
  process.stderr.write(`scan: failed: ${(e as Error).message}\n`);
  process.exitCode = 2;
}
