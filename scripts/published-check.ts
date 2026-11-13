// `pnpm published-check` (live site rules, D22, Patrick 2026-11-13): every path in
// published-urls.txt must keep resolving in the built site: a page (200), or a 301 in
// `_redirects` to a path that is itself a page. Runs at the end of `pnpm build`, so a broken
// published URL fails CI and never deploys. Only Patrick adds lines to the list; none is
// ever removed.
//
//   node scripts/published-check.ts [--dist <dir>] [--list <file>]
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

type Result = { path: string; ok: boolean; how: string };

/** The paths in the list: one per line; blank lines and lines starting with # are skipped. */
export function readList(text: string): { paths: string[]; problems: string[] } {
  const paths: string[] = [];
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    if (!line.startsWith("/") || /\s/.test(line)) problems.push(`line ${i + 1}: "${line}" isn't a site path like /vision/`);
    else paths.push(line);
  });
  if (paths.length === 0) problems.push("the list is empty");
  return { paths, problems };
}

/** Redirect rules from a `_redirects` file: `from to [status]`; Cloudflare's default is 302. */
export function readRedirects(text: string): Map<string, { to: string; status: number }> {
  const rules = new Map<string, { to: string; status: number }>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [from, to, status] = line.split(/\s+/);
    if (from && to && !rules.has(from)) rules.set(from, { to, status: status ? Number(status) : 302 });
  }
  return rules;
}

/** Whether the built site serves a page at this path. */
export function isPage(dist: string, path: string): boolean {
  const clean = path.split(/[?#]/)[0]!;
  const candidates = clean.endsWith("/") ? [`${clean}index.html`] : [clean, `${clean}.html`, `${clean}/index.html`];
  return candidates.some((c) => {
    const f = resolve(dist, `.${c}`);
    return f.startsWith(resolve(dist)) && existsSync(f) && statSync(f).isFile();
  });
}

export function checkPublished(dist: string, paths: string[], redirects: Map<string, { to: string; status: number }>): Result[] {
  return paths.map((path) => {
    if (isPage(dist, path)) return { path, ok: true, how: "200" };
    const r = redirects.get(path);
    if (!r) return { path, ok: false, how: "no page and no redirect" };
    if (r.status !== 301) return { path, ok: false, how: `redirect is ${r.status}, not 301` };
    if (!isPage(dist, r.to)) return { path, ok: false, how: `301 to ${r.to}, which isn't a page` };
    return { path, ok: true, how: `301 → ${r.to}` };
  });
}

if (import.meta.main) {
  const arg = (name: string) => {
    const i = process.argv.indexOf(name);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const dist = resolve(arg("--dist") ?? join(ROOT, "dist"));
  const listFile = resolve(arg("--list") ?? join(ROOT, "published-urls.txt"));
  let failed = 0;
  if (!existsSync(join(dist, "index.html"))) {
    process.stdout.write(`published-check: FAILED (no built site in ${dist}; run the build first)\n`);
    process.exit(1);
  }
  if (!existsSync(listFile)) {
    process.stdout.write("published-check: FAILED (published-urls.txt is missing)\n");
    process.exit(1);
  }
  const { paths, problems } = readList(readFileSync(listFile, "utf8"));
  for (const p of problems) {
    failed++;
    process.stdout.write(`FAILED list ${p}\n`);
  }
  const redirectsFile = join(dist, "_redirects");
  const redirects = readRedirects(existsSync(redirectsFile) ? readFileSync(redirectsFile, "utf8") : "");
  for (const r of checkPublished(dist, paths, redirects)) {
    if (!r.ok) failed++;
    process.stdout.write(`${r.ok ? "ok    " : "FAILED"} ${r.path}  ${r.how}\n`);
  }
  process.stdout.write(failed ? `published-check: FAILED (${failed})\n` : `published-check: ok (${paths.length} published paths)\n`);
  process.exitCode = failed ? 1 : 0;
}
