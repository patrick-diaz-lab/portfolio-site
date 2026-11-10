// Verbatim-copy check (D9, D21): warns when a tracked text file outside sources/vision/
// repeats 40 or more consecutive words from Vision's notes in sources/vision/.
// Pages and knowledge entries are rewritten from the notes, never pasted.
//
// Warning only (exit 0), so quoting a short passage stays possible; a reviewer sees it.
// Prints file:line and the source file, never the copied text.
//
//   node scripts/check-verbatim.ts                 tracked files of this repo
//   node scripts/check-verbatim.ts --root <dir>    another tree (tests)
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export const WINDOW = 40;
const SOURCES = "sources/vision/";
const TEXT = /\.(md|mdx|txt|ya?ml|json|astro|html|ts|tsx|js|svg)$/i;
const SKIP = /^(pnpm-lock\.yaml|node_modules\/|\.cache\/|dist\/)/;

type Word = { w: string; line: number };

function words(text: string): Word[] {
  const out: Word[] = [];
  text.split(/\r?\n/).forEach((l, i) => {
    for (const m of l.toLowerCase().matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu)) out.push({ w: m[0], line: i + 1 });
  });
  return out;
}

function files(root: string): string[] {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: root, stdio: ["ignore", "pipe", "ignore"] });
    const list = out.toString("utf8").split("\0").filter(Boolean);
    if (list.length) return list;
  } catch {
    // not a git checkout: walk the tree (tests)
  }
  const list: string[] = [];
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      const f = join(d, n);
      if (statSync(f).isDirectory()) {
        if (n !== ".git" && n !== "node_modules") walk(f);
      } else list.push(relative(root, f).split("\\").join("/"));
    }
  };
  walk(root);
  return list;
}

export type Hit = { file: string; line: number; source: string; sourceLine: number };

export function findCopies(root: string): Hit[] {
  const all = files(root).filter((f) => TEXT.test(f) && !SKIP.test(f));
  const index = new Map<string, { source: string; line: number }>();
  for (const f of all.filter((f) => f.startsWith(SOURCES))) {
    const ws = words(readFileSync(join(root, f), "utf8"));
    for (let i = 0; i + WINDOW <= ws.length; i++) {
      const key = ws.slice(i, i + WINDOW).map((x) => x.w).join(" ");
      if (!index.has(key)) index.set(key, { source: f, line: ws[i]!.line });
    }
  }
  const hits: Hit[] = [];
  if (index.size === 0) return hits;
  for (const f of all.filter((f) => !f.startsWith(SOURCES))) {
    const ws = words(readFileSync(join(root, f), "utf8"));
    // One hit per copied passage: report a window only if the one before it didn't match.
    let prev = false;
    for (let i = 0; i + WINDOW <= ws.length; i++) {
      const src = index.get(ws.slice(i, i + WINDOW).map((x) => x.w).join(" "));
      if (src && !prev) hits.push({ file: f, line: ws[i]!.line, source: src.source, sourceLine: src.line });
      prev = !!src;
    }
  }
  return hits;
}

if (import.meta.main) {
  const i = process.argv.indexOf("--root");
  const root = resolve(i > 0 ? process.argv[i + 1] ?? "." : resolve(import.meta.dirname, ".."));
  const hits = findCopies(root);
  if (hits.length === 0) {
    process.stdout.write(`verbatim: ok (no run of ${WINDOW}+ words from ${SOURCES})\n`);
  } else {
    process.stdout.write(`verbatim: WARNING ${hits.length} passage(s) of ${WINDOW}+ words copied from ${SOURCES}\n`);
    for (const h of hits) process.stdout.write(`  ${h.file}:${h.line}  from ${h.source}:${h.sourceLine}\n`);
    process.stdout.write("Rewrite these passages in your own words (D9). The copied text is not printed.\n");
  }
}
