// Redaction scan (D9, D20). Reports rule id and file:line, never the matched text.
//
//   node scripts/scan.ts                  tracked files in the working tree (default)
//   node scripts/scan.ts --staged         staged files, as they are in the index (pre-commit)
//   node scripts/scan.ts --commits <sha>… files each commit adds or changes (pre-push)
//   node scripts/scan.ts --dir <path>     every file under a directory (dist/, tests)
//
// Private deny-list (never in git): REDACTION_DENYLIST (one entry per line) and/or
// REDACTION_DENYLIST_FILE (a path to such a list). Without either, only the generic
// rules and gitleaks run, and the scan says so.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { parse } from "yaml";
import { runGitleaks } from "./lib/gitleaks.ts";
import { RULES, denyListRule, type Rule } from "./lib/rules.ts";

const ROOT = resolve(import.meta.dirname, "..");

type Source = { label: string; path: string; content: Buffer };
type Finding = { rule: string; label: string; path: string; line: number; text?: string };
type Exception = { path: string; rule: string; snippet: string; reason: string };

function git(args: string[]): Buffer {
  return execFileSync("git", args, { cwd: ROOT, maxBuffer: 256 * 1024 * 1024 });
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
    }));
  }
  if (mode === "--commits") {
    const out: Source[] = [];
    for (const sha of argv.slice(1)) {
      const short = sha.slice(0, 7);
      const files = splitZ(git(["diff-tree", "--no-commit-id", "-r", "--root", "--name-only", "-z", "--diff-filter=ACMR", sha]));
      for (const p of files) out.push({ label: `${p}@${short}`, path: p, content: git(["show", `${sha}:${p}`]) });
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
          out.push({ label: rel, path: rel, content: readFileSync(full) });
        }
      }
    };
    walk(base);
    return out;
  }
  if (mode !== undefined) throw new Error(`unknown mode ${mode}`);
  return splitZ(git(["ls-files", "-z"])).flatMap((p) => {
    try {
      return [{ label: p, path: p, content: readFileSync(join(ROOT, p)) }];
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
  if (inline) words.push(...inline.split(/\r?\n/));
  const file = process.env.REDACTION_DENYLIST_FILE;
  if (file) words.push(...readFileSync(file, "utf8").split(/\r?\n/));
  return words;
}

function loadExceptions(): Exception[] {
  const doc = parse(readFileSync(join(ROOT, "redaction", "exceptions.yaml"), "utf8")) as { exceptions?: Exception[] };
  return doc?.exceptions ?? [];
}

function scanText(src: Source, text: string, rules: Rule[]): Finding[] {
  const out: Finding[] = [];
  for (const rule of rules) {
    for (const m of text.matchAll(rule.pattern)) {
      if (rule.accept && !rule.accept(m[0])) continue;
      out.push({ rule: rule.id, label: src.label, path: src.path, line: lineOf(text, m.index ?? 0), text: m[0] });
    }
  }
  return out;
}

function main(): number {
  const sources = collect(process.argv.slice(2)).filter((s) => !isBinary(s.content));
  const deny = denyListRule(loadDenyList());
  const rules = deny ? [...RULES, deny] : RULES;
  const exceptions = loadExceptions();

  const findings: Finding[] = [];
  for (const src of sources) findings.push(...scanText(src, src.content.toString("utf8"), rules));

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
        findings.push({ rule: f.rule, label: s?.label ?? "?", path: s?.path ?? "?", line: f.line });
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  const reported = findings.filter(
    (f) =>
      f.rule === "deny-list" ||
      f.text === undefined ||
      !exceptions.some(
        (e) =>
          e.rule === f.rule &&
          e.snippet === f.text &&
          // An entry also covers its own snippet inside the exceptions file.
          (e.path === f.path || f.path === "redaction/exceptions.yaml"),
      ),
  );

  const note = deny ? "" : " (no deny-list set: generic rules and gitleaks only)";
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
