// Content checks for the piece template (PLAN 1.2, D6, D19). Runs in `pnpm check`, before
// the build. Each problem prints as `rule  file:line  message`.
//
//   node scripts/check-content.ts                 this repo
//   node scripts/check-content.ts --root <dir>    another tree (tests)
//
// Rules:
//   schema         a missing, unknown or wrong field (src/content/schemas.ts); evals[] is
//                  strict, so free text there fails here
//   path           id/piece/part don't match the file's folder and name
//   anchor         an entry's page isn't its part's page, the part has no page, or the
//                  anchor repeats on that page (each page renders its entries under their
//                  anchors, so a unique anchor on an existing page exists in the build)
//   built-entries  a `built` part page without at least one decision, rejected, testing
//                  and learning entry
//   related        related[] names a part that doesn't exist
//   sources        a source file under sources/vision/ doesn't exist
//   map            map.yaml points at a page that doesn't exist
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { parse } from "yaml";
import type { z } from "astro/zod";
import { REQUIRED_KINDS, knowledgeSchema, mapSchema, partSchema, pieceSchema } from "../src/content/schemas.ts";

type Problem = { rule: string; file: string; line: number; msg: string };

function walk(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...walk(f, ext));
    else if (n.endsWith(ext)) out.push(f);
  }
  return out.sort();
}

type Doc = { data: unknown; text: string; offset: number; error?: string };

function readFrontmatter(file: string): Doc {
  const text = readFileSync(file, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!m) return { data: undefined, text, offset: 0, error: "no frontmatter (--- … ---) at the top" };
  try {
    return { data: parse(m[1]!), text: m[1]!, offset: 1 };
  } catch (e) {
    return { data: undefined, text: m[1]!, offset: 1, error: `frontmatter isn't valid YAML: ${(e as Error).message.split("\n")[0]}` };
  }
}

function readYaml(file: string): Doc {
  const text = readFileSync(file, "utf8");
  try {
    return { data: parse(text), text, offset: 0 };
  } catch (e) {
    return { data: undefined, text, offset: 0, error: `not valid YAML: ${(e as Error).message.split("\n")[0]}` };
  }
}

// Line of the first key in a path like ["evals", 0, "metric"], best effort.
function lineOf(doc: Doc, path: (string | number | symbol)[]): number {
  const lines = doc.text.split(/\r?\n/);
  const keys = path.filter((p): p is string => typeof p === "string");
  let start = 0;
  let found = -1;
  for (const k of keys) {
    const re = new RegExp(`^\\s*(?:-\\s+)?${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:`);
    const idx = lines.findIndex((l, i) => i >= start && re.test(l));
    if (idx < 0) break;
    found = idx;
    start = idx + 1;
  }
  return (found < 0 ? 0 : found) + 1 + doc.offset;
}

function validate<T>(schema: z.ZodType<T>, doc: Doc, file: string, out: Problem[]): T | undefined {
  if (doc.error) {
    out.push({ rule: "schema", file, line: 1, msg: doc.error });
    return undefined;
  }
  const r = schema.safeParse(doc.data);
  if (r.success) return r.data;
  for (const issue of r.error.issues) {
    const where = issue.path.length ? issue.path.join(".") : "(top level)";
    out.push({ rule: "schema", file, line: lineOf(doc, issue.path), msg: `${where}: ${issue.message}` });
  }
  return undefined;
}

export function checkContent(root: string): { problems: Problem[]; counts: { pieces: number; parts: number; entries: number } } {
  const P: Problem[] = [];
  const rel = (f: string) => relative(root, f).split("\\").join("/");

  // Pieces and maps.
  const pieceDirs = existsSync(join(root, "pieces")) ? readdirSync(join(root, "pieces")).filter((n) => statSync(join(root, "pieces", n)).isDirectory()) : [];
  const maps: { file: string; doc: Doc; parts: { id: string; page?: string }[] }[] = [];
  for (const dir of pieceDirs) {
    const pf = join(root, "pieces", dir, "piece.yaml");
    if (!existsSync(pf)) {
      P.push({ rule: "path", file: rel(join(root, "pieces", dir)), line: 1, msg: "piece folder without piece.yaml" });
      continue;
    }
    const pdoc = readYaml(pf);
    const piece = validate(pieceSchema, pdoc, rel(pf), P);
    if (piece && piece.id !== dir) P.push({ rule: "path", file: rel(pf), line: lineOf(pdoc, ["id"]), msg: `id "${piece.id}" must match the folder "${dir}"` });
    const mf = join(root, "pieces", dir, "map.yaml");
    if (existsSync(mf)) {
      const mdoc = readYaml(mf);
      const map = validate(mapSchema, mdoc, rel(mf), P);
      if (map) maps.push({ file: rel(mf), doc: mdoc, parts: map.parts });
    }
  }

  // Part pages.
  const parts = new Map<string, { file: string; doc: Doc; status: string; related: string[]; sources: string[] }>();
  for (const f of walk(join(root, "content", "parts"), ".mdx")) {
    const file = rel(f);
    const doc = readFrontmatter(f);
    const part = validate(partSchema, doc, file, P);
    if (!part) continue;
    const [, , pieceDir] = file.split("/");
    const name = basename(f, ".mdx");
    if (part.id !== name) P.push({ rule: "path", file, line: lineOf(doc, ["id"]), msg: `id "${part.id}" must match the file name "${name}"` });
    if (part.piece !== pieceDir) P.push({ rule: "path", file, line: lineOf(doc, ["piece"]), msg: `piece "${part.piece}" must match the folder "${pieceDir}"` });
    parts.set(`${part.piece}/${part.id}`, { file, doc, status: part.status, related: part.related, sources: part.sources });
  }

  // Knowledge entries.
  const kinds = new Map<string, Set<string>>();
  const anchors = new Map<string, string>();
  const entries: { file: string; doc: Doc; sources: string[] }[] = [];
  for (const f of walk(join(root, "content", "knowledge"), ".md")) {
    const file = rel(f);
    const doc = readFrontmatter(f);
    const e = validate(knowledgeSchema, doc, file, P);
    if (!e) continue;
    entries.push({ file, doc, sources: e.sources });
    const [, , pieceDir] = file.split("/");
    if (e.piece !== pieceDir) P.push({ rule: "path", file, line: lineOf(doc, ["piece"]), msg: `piece "${e.piece}" must match the folder "${pieceDir}"` });
    const key = `${e.piece}/${e.part}`;
    const expected = `/${e.piece}/${e.part}/`;
    if (!parts.has(key)) P.push({ rule: "anchor", file, line: lineOf(doc, ["part"]), msg: `part "${e.part}" has no page (content/parts/${e.piece}/${e.part}.mdx)` });
    else if (e.page !== expected) P.push({ rule: "anchor", file, line: lineOf(doc, ["page"]), msg: `page must be ${expected}, the page that renders this entry` });
    const ak = `${e.page}#${e.anchor}`;
    const prev = anchors.get(ak);
    if (prev) P.push({ rule: "anchor", file, line: lineOf(doc, ["anchor"]), msg: `anchor "${e.anchor}" is already used on ${e.page} by ${prev}` });
    else anchors.set(ak, file);
    if (!kinds.has(key)) kinds.set(key, new Set());
    kinds.get(key)!.add(e.kind);
  }

  // Cross-file rules.
  for (const [key, p] of parts) {
    if (p.status === "built") {
      const have = kinds.get(key) ?? new Set<string>();
      const missing = REQUIRED_KINDS.filter((k) => !have.has(k));
      if (missing.length) P.push({ rule: "built-entries", file: p.file, line: lineOf(p.doc, ["status"]), msg: `a built part needs at least one entry of each kind; missing: ${missing.join(", ")}` });
    }
    const piece = key.split("/")[0]!;
    for (const r of p.related) {
      if (!parts.has(`${piece}/${r}`)) P.push({ rule: "related", file: p.file, line: lineOf(p.doc, ["related"]), msg: `related part "${r}" doesn't exist` });
    }
  }
  for (const s of [...parts.values(), ...entries]) {
    for (const src of s.sources) if (!existsSync(join(root, src))) P.push({ rule: "sources", file: s.file, line: lineOf(s.doc, ["sources"]), msg: `${src} doesn't exist` });
  }
  for (const m of maps) {
    for (const part of m.parts) {
      if (!part.page) continue;
      const [, piece, id] = part.page.split("/");
      if (!parts.has(`${piece}/${id}`)) P.push({ rule: "map", file: m.file, line: lineOf(m.doc, ["parts"]), msg: `part "${part.id}" links to ${part.page}, which has no page` });
    }
  }

  return { problems: P, counts: { pieces: pieceDirs.length, parts: parts.size, entries: entries.length } };
}

if (import.meta.main) {
  const i = process.argv.indexOf("--root");
  const root = resolve(i > 0 ? (process.argv[i + 1] ?? ".") : resolve(import.meta.dirname, ".."));
  const { problems, counts } = checkContent(root);
  if (problems.length === 0) {
    process.stdout.write(`content: ok (${counts.pieces} piece(s), ${counts.parts} part page(s), ${counts.entries} entr${counts.entries === 1 ? "y" : "ies"})\n`);
  } else {
    process.stdout.write(`content: ${problems.length} problem(s)\n`);
    for (const p of problems) process.stdout.write(`  ${p.rule.padEnd(14)} ${p.file}:${p.line}  ${p.msg}\n`);
    process.exitCode = 1;
  }
}
