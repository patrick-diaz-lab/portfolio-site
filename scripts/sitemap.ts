// `node scripts/sitemap.ts` (PLAN 1.9b, Patrick 2026-11-16): writes dist/sitemap.xml from the
// built pages, so it lists exactly what is served. Runs in `pnpm build`, after astro build.
//
// Every page in dist/ is indexable except the few that carry noindex on purpose (NOINDEX
// below). For each indexable page the build must hold:
//   - a canonical link to its own URL on the site's domain;
//   - hreflang alternates, if any, that point to indexable pages in dist/.
// A noindex page outside NOINDEX, or an indexable page inside it, fails the build, so a page
// can't drop out of search by accident.
//
//   node scripts/sitemap.ts [--dist <dir>]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SITE } from "../src/site.ts";

/** Pages that stay out of search: the privacy notice and the internal style sheet. */
export const NOINDEX = new Set(["/privacy/", "/de/privacy/", "/styleguide/"]);

export type Page = { path: string; noindex: boolean; canonical?: string; alternates: { lang: string; href: string }[] };

/** The facts the sitemap needs from one built page. */
export function readPage(path: string, html: string): Page {
  const head = html.split("</head>")[0] ?? html;
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(head);
  const canonical = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(head)?.[1];
  const alternates = [...head.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)].map((m) => ({ lang: m[1]!, href: m[2]! }));
  return { path, noindex, canonical, alternates };
}

function distPages(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...distPages(f, `${base}${n}/`));
    else if (n === "index.html") out.push(`/${base}`);
  }
  return out.sort();
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** The sitemap and any problems that should stop the build. */
export function buildSitemap(pages: Page[], origin = SITE.origin): { xml: string; problems: string[]; count: number } {
  const problems: string[] = [];
  const indexable = new Set(pages.filter((p) => !p.noindex).map((p) => p.path));
  const urls: string[] = [];
  for (const p of pages) {
    if (p.noindex) {
      if (!NOINDEX.has(p.path)) problems.push(`${p.path} carries noindex but isn't one of the pages meant to stay out of search`);
      continue;
    }
    if (NOINDEX.has(p.path)) problems.push(`${p.path} should carry noindex`);
    const loc = origin + p.path;
    if (p.canonical !== loc) problems.push(`${p.path} needs <link rel="canonical" href="${loc}"> (found ${p.canonical ?? "none"})`);
    for (const a of p.alternates) {
      const target = a.href.startsWith(origin) ? a.href.slice(origin.length) : undefined;
      if (!target || !indexable.has(target)) problems.push(`${p.path}: hreflang ${a.lang} points to ${a.href}, which isn't an indexable page of the site`);
    }
    const links = p.alternates.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.href)}"/>`).join("");
    urls.push(`  <url>\n    <loc>${esc(loc)}</loc>${links}\n  </url>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
  return { xml, problems, count: urls.length };
}

if (import.meta.main) {
  const i = process.argv.indexOf("--dist");
  const dist = resolve(i > 0 ? (process.argv[i + 1] ?? "dist") : join(import.meta.dirname, "..", "dist"));
  if (!existsSync(join(dist, "index.html"))) throw new Error(`${dist} has no index.html; run astro build first`);
  const pages = distPages(dist).map((p) => readPage(p, readFileSync(join(dist, p, "index.html"), "utf8")));
  const { xml, problems, count } = buildSitemap(pages);
  if (problems.length) {
    process.stdout.write(`sitemap: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}\n`).join("")}`);
    process.exitCode = 1;
  } else {
    writeFileSync(join(dist, "sitemap.xml"), xml);
    process.stdout.write(`sitemap: ok (${count} pages, ${pages.length - count} noindex)\n`);
  }
}
