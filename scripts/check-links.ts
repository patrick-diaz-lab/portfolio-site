// Checks that relative links and #anchors in tracked Markdown files resolve.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

// GitHub-style heading anchors, with -1, -2 … for repeated headings.
function anchors(md: string): Set<string> {
  const seen = new Map<string, number>();
  const out = new Set<string>();
  let fence = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    const m = /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = (m[1] ?? "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[`*_~]/g, (c) => (c === "_" ? "_" : ""));
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n === 0 ? base : `${base}-${n}`);
  }
  return out;
}

const files = execFileSync("git", ["ls-files", "-z", "*.md"], { cwd: ROOT })
  .toString("utf8")
  .split("\0")
  .filter(Boolean);
const cache = new Map<string, Set<string>>();
const anchorsOf = (p: string) => {
  if (!cache.has(p)) cache.set(p, anchors(readFileSync(join(ROOT, p), "utf8")));
  return cache.get(p)!;
};

const errors: string[] = [];
for (const file of files) {
  const md = readFileSync(join(ROOT, file), "utf8");
  const lines = md.split(/\r?\n/);
  let fence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) return;
    const noCode = line.replace(/`[^`]*`/g, "");
    for (const m of noCode.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1] ?? "";
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // https:, mailto: …
      const [pathPart, anchor] = target.split("#", 2) as [string, string | undefined];
      const dest = pathPart === "" ? file : normalize(join(dirname(file), decodeURIComponent(pathPart)));
      const where = `${file}:${i + 1}`;
      if (!existsSync(join(ROOT, dest))) {
        errors.push(`${where}: missing ${dest}`);
        continue;
      }
      if (anchor && dest.endsWith(".md") && statSync(join(ROOT, dest)).isFile() && !anchorsOf(dest).has(anchor.toLowerCase())) {
        errors.push(`${where}: no heading #${anchor} in ${dest}`);
      }
    }
  });
}

if (errors.length) {
  for (const e of errors) process.stdout.write(`links: ${e}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`links: ok (${files.length} Markdown files)\n`);
}
