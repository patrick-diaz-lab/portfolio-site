// `pnpm link-check` (PLAN 1.9b): every link on every built page, both languages.
//   internal   a link to a page of this site resolves to a file in dist/, and its #anchor
//              exists on that page; preloaded assets and hreflang alternates exist too
//   external   only the hosts the site may link to (D14, D18): its own domain, GitHub and
//              LinkedIn; the only email address is the public contact
//
//   node scripts/link-check.ts                         over dist/ (run `pnpm build` first)
//   node scripts/link-check.ts --live https://patrickdiaz.dev
//                                                      also requests every page from the live
//                                                      site and expects 200 (after deploy)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { SITE } from "../src/site.ts";
import { DIST } from "./lib/serve.ts";

const li = process.argv.indexOf("--live");
const LIVE = li > 0 ? process.argv[li + 1]?.replace(/\/$/, "") : undefined;
const ALLOWED_HOSTS = new Set([new URL(SITE.origin).host, new URL(SITE.github).host, new URL(SITE.linkedin).host]);
const ALLOWED_MAIL = `mailto:${SITE.email}`;

function pages(dir = DIST, base = ""): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) { if (!n.startsWith(".")) out.push(...pages(f, `${base}${n}/`)); }
    else if (n === "index.html") out.push(`/${base}`);
  }
  return out.sort();
}

const fileOf = (path: string) => {
  const p = decodeURIComponent(path);
  if (p.endsWith("/")) return join(DIST, p, "index.html");
  if (existsSync(join(DIST, p)) && statSync(join(DIST, p)).isFile()) return join(DIST, p);
  return join(DIST, p, "index.html");
};
const idsCache = new Map<string, Set<string>>();
const idsOf = (file: string) => {
  if (!idsCache.has(file)) idsCache.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!)));
  return idsCache.get(file)!;
};

const problems: string[] = [];
const hosts = new Map<string, number>();
let internal = 0;
const list = pages();
for (const page of list) {
  const html = readFileSync(fileOf(page), "utf8");
  const hrefs = [...html.matchAll(/<(?:a|link)\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1]!.replace(/&amp;/g, "&"));
  for (const href of hrefs) {
    if (href.startsWith("data:")) continue;
    if (href.startsWith("mailto:")) {
      if (href.split("?")[0] !== ALLOWED_MAIL) problems.push(`${page}  ${href}  email other than ${SITE.email}`);
      continue;
    }
    if (/^https?:\/\//.test(href)) {
      const u = new URL(href);
      hosts.set(u.host, (hosts.get(u.host) ?? 0) + 1);
      if (!ALLOWED_HOSTS.has(u.host)) problems.push(`${page}  ${href}  host not allowed`);
      else if (u.host === new URL(SITE.origin).host) checkInternal(page, u.pathname + u.hash);
      continue;
    }
    checkInternal(page, href);
  }
}

function checkInternal(page: string, href: string) {
  internal++;
  const [rawPath, frag] = href.split("#");
  const path = rawPath === "" ? page : rawPath!.startsWith("/") ? rawPath! : new URL(rawPath!, `http://x${page}`).pathname;
  const file = fileOf(path.split("?")[0]!);
  if (!existsSync(file)) return void problems.push(`${page}  ${href}  no such page or file`);
  if (frag && file.endsWith(".html") && !idsOf(file).has(decodeURIComponent(frag))) problems.push(`${page}  ${href}  no element with id "${frag}"`);
}

if (LIVE) {
  for (const page of list.filter((p) => p !== "/styleguide/")) {
    try {
      const res = await fetch(LIVE + page, { redirect: "manual" });
      if (res.status !== 200) problems.push(`live ${LIVE}${page}  status ${res.status}`);
    } catch (e) {
      problems.push(`live ${LIVE}${page}  ${(e as Error).message}`);
    }
  }
}

process.stdout.write(`link-check: ${list.length} pages, ${internal} internal links, external hosts: ${[...hosts].map(([h, n]) => `${h} (${n})`).join(", ") || "none"}${LIVE ? `, live: ${LIVE}` : ""}\n`);
for (const p of problems) process.stdout.write(`  ${p}\n`);
process.stdout.write(problems.length ? `link-check: FAILED (${problems.length})\n` : "link-check: ok\n");
process.exitCode = problems.length ? 1 : 0;
