// Salted hashes of the private deny-list for the sessions' pre-push scan (PLAN 1.3a, D20).
//
// Patrick runs this on his own machine, never in a Claude session. It reads the plaintext
// list from stdin (paste, then Ctrl+D; on Windows Ctrl+Z and Enter), so the list never
// lands on disk, and prints one line for the cloud-environment variable
// REDACTION_DENYLIST_HASHES. Node standard library only: it runs with plain Node >= 22.18
// and no `pnpm install`, so this one file is all that's needed.
//
//   node denylist-hash.ts            paste the list, then Ctrl+D
//
// The same file is imported by scripts/scan.ts, so the hashing and normalization can't
// drift between the generator and the scanner.
//
// Normalization (entries and scanned text alike, matching scan.ts's plaintext rule):
//   - Unicode NFC, then lowercase.
//   - Every whitespace run becomes one space (line breaks too).
//   - Whole word: text is split into tokens (maximal runs of letters and digits). A
//     candidate is a span of 1..span consecutive tokens with the characters between them
//     (at most 3 after collapsing whitespace). An entry must start and end with a letter or
//     digit, so it can only match as a whole word, as with the plaintext rule.
//   - Entries are separated by line breaks, "|" or ";"; empty entries and entries starting
//     with "#" are ignored.
//
// Limit: anyone who can read the variable can brute-force short or common entries (names,
// short words) despite the salt; scrypt only slows that down. Cloudflare's plaintext
// deny-list gate in the build stays authoritative (D9, D20).
import { createHash, randomBytes, scryptSync } from "node:crypto";

export const VERSION = "v1";
export const MAX_SPAN = 8;
export const MAX_SEP = 3;
/** scrypt cost: N=2^10, r=8, p=1 (~1 MiB, about 1 ms per hash). Stored in the value, so it
 *  can be raised later; scan.ts caches known misses, so a higher cost mostly hits the first run. */
export const DEFAULT_PARAMS = { N: 1024, r: 8, p: 1 } as const;
const HASH_BYTES = 16;
const TOKEN = /[\p{L}\p{N}]+/gu;
const EDGE = /^[\p{L}\p{N}](?:.*[\p{L}\p{N}])?$/u;

export type Params = { N: number; r: number; p: number };
export type HashSet = { params: Params; salt: Buffer; span: number; count: number; hashes: Set<string> };

export function splitEntries(raw: string): string[] {
  return raw
    .split(/\r?\n|[|;]/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !w.startsWith("#"));
}

export function normalize(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function spanOf(entry: string): number {
  return (entry.match(TOKEN) ?? []).length;
}

export function hashOne(norm: string, salt: Buffer, params: Params): string {
  return scryptSync(norm, salt, HASH_BYTES, { ...params, maxmem: 256 * params.N * params.r }).toString("hex");
}

export function buildValue(entries: string[], salt: Buffer = randomBytes(16), params: Params = DEFAULT_PARAMS) {
  const norm = [...new Set(entries.map(normalize))];
  const invalid = norm.map((e, i) => (EDGE.test(e) ? -1 : i + 1)).filter((i) => i > 0);
  if (invalid.length) throw new Error(`entries ${invalid.join(", ")} don't start and end with a letter or digit, so they could never match as whole words`);
  const span = Math.max(1, ...norm.map(spanOf));
  if (span > MAX_SPAN) throw new Error(`an entry has ${span} words; at most ${MAX_SPAN} are supported`);
  const hashes = norm.map((e) => hashOne(e, salt, params)).sort();
  const value = `${VERSION};scrypt=${params.N},${params.r},${params.p};salt=${salt.toString("hex")};span=${span};n=${hashes.length};h=${hashes.join(",")}`;
  const short = norm.map((e, i) => (e.length < 6 ? i + 1 : -1)).filter((i) => i > 0);
  return { value, count: hashes.length, span, short };
}

/** Parses REDACTION_DENYLIST_HASHES. Throws on anything malformed, never skips silently. */
export function parseValue(value: string): HashSet {
  const parts = value.trim().split(";");
  const [version, ...fields] = parts;
  if (version !== VERSION) throw new Error(`REDACTION_DENYLIST_HASHES: unknown format "${version?.slice(0, 8)}" (expected ${VERSION})`);
  const f = new Map(fields.map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)]));
  for (const k of ["scrypt", "salt", "span", "n", "h"]) if (!f.has(k)) throw new Error(`REDACTION_DENYLIST_HASHES: missing field ${k}`);
  const [N, r, p] = f.get("scrypt")!.split(",").map(Number);
  if (!N || !r || !p || (N & (N - 1)) !== 0) throw new Error("REDACTION_DENYLIST_HASHES: bad scrypt parameters");
  const salt = f.get("salt")!;
  if (!/^[0-9a-f]{32}$/.test(salt)) throw new Error("REDACTION_DENYLIST_HASHES: salt must be 32 hex characters");
  const span = Number(f.get("span"));
  if (!Number.isInteger(span) || span < 1 || span > MAX_SPAN) throw new Error(`REDACTION_DENYLIST_HASHES: span must be 1..${MAX_SPAN}`);
  const hs = f.get("h")!.split(",").filter(Boolean);
  if (hs.some((h) => !/^[0-9a-f]{32}$/.test(h))) throw new Error("REDACTION_DENYLIST_HASHES: every hash must be 32 hex characters");
  const count = Number(f.get("n"));
  if (count !== hs.length) throw new Error(`REDACTION_DENYLIST_HASHES: n=${f.get("n")} but ${hs.length} hashes (the value was cut off?)`);
  return { params: { N, r: r!, p: p! }, salt: Buffer.from(salt, "hex"), span, count, hashes: new Set(hs) };
}

/** Key under which a known miss is cached on disk: truncated SHA-256 of the candidate. */
export function missKey(cand: string): string {
  return createHash("sha256").update(cand).digest("hex").slice(0, 24);
}

/** Every whole-word candidate of 1..span tokens, with the index of its first token. */
export function* candidates(text: string, span: number): Generator<{ cand: string; index: number }> {
  const toks = [...text.matchAll(TOKEN)].map((m) => ({ t: m[0], i: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  for (let a = 0; a < toks.length; a++) {
    let s = toks[a]!.t;
    yield { cand: normalize(s), index: toks[a]!.i };
    for (let b = a + 1; b < toks.length && b - a < span; b++) {
      const sep = text.slice(toks[b - 1]!.end, toks[b]!.i).replace(/\s+/g, " ");
      if (sep.length > MAX_SEP) break;
      s += sep + toks[b]!.t;
      yield { cand: normalize(s), index: toks[a]!.i };
    }
  }
}

/** Returns the indexes in `text` where a hashed entry starts. `cache` is shared per run. */
export function matchHashes(text: string, set: HashSet, cache: Map<string, boolean>): number[] {
  const hits: number[] = [];
  for (const { cand, index } of candidates(text, set.span)) {
    let hit = cache.get(cand) ?? (cache.get(`#${missKey(cand)}`) === false ? false : undefined);
    if (hit === undefined) {
      hit = set.hashes.has(hashOne(cand, set.salt, set.params));
      cache.set(cand, hit);
    }
    if (hit) hits.push(index);
  }
  return hits;
}

async function main(): Promise<number> {
  const inSession = ["CLAUDECODE", "CLAUDE_CODE_REMOTE", "CLAUDE_CODE_SESSION_ID", "CLAUDE_CODE_ENTRYPOINT"].some((k) => process.env[k]);
  if (inSession) {
    process.stderr.write("denylist-hash: refusing to run inside a Claude Code session. Run it in your own terminal (STEPS B.11a).\n");
    return 2;
  }
  if (process.stdin.isTTY) process.stderr.write("Paste the deny-list (entries separated by line breaks, | or ;), then press Ctrl+D (Windows: Ctrl+Z, then Enter).\n");
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const entries = splitEntries(raw);
  raw = "";
  if (entries.length === 0) {
    process.stderr.write("denylist-hash: no entries read.\n");
    return 1;
  }
  const { value, count, span, short } = buildValue(entries);
  process.stderr.write(`\n${count} entries (after removing duplicates), longest entry ${span} word(s).\n`);
  if (short.length) process.stderr.write(`Note: entries ${short.join(", ")} are shorter than 6 characters and guessable from their hash; that's expected. Cloudflare's plaintext gate stays authoritative.\n`);
  process.stderr.write("Set this line as REDACTION_DENYLIST_HASHES in the cloud environment `portfolio`:\n\n");
  process.stdout.write(`${value}\n`);
  return 0;
}

if (import.meta.main) {
  main().then(
    (c) => (process.exitCode = c),
    (e: Error) => {
      process.stderr.write(`denylist-hash: ${e.message}\n`);
      process.exitCode = 1;
    },
  );
}
