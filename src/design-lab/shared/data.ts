// Design lab (docs/design-exploration.md): the content every direction renders. The same
// files as the live site (content/home/, pieces/), read once per language, so a direction
// only decides how things look. Nothing here is written for the lab: no invented text.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { homeSchema } from "../../content/schemas.ts";
import { lineName, localePath, t, type Locale } from "../../i18n/ui.ts";
import { chipNote, chipValue } from "../../lib/chips.ts";
import { loadPieces, partPath } from "../../lib/pieces.ts";
import { SITE } from "../../site.ts";

export const DIRS = { a: "Drawing sheet", b: "Technical report", c: "Control room", d: "Minimal paper" } as const;
export type Dir = keyof typeof DIRS;
export type LabPage = "home" | "project";
/** The one project the lab shows. */
export const PIECE = "vision";

/** A preview page's path: /design-lab/<dir>/[de/][vision/]. */
export function labPath(dir: Dir, locale: Locale, page: LabPage): string {
  return `/design-lab/${dir}/${locale === "de" ? "de/" : ""}${page === "project" ? `${PIECE}/` : ""}`;
}

/** The four pages of a direction, for its [...path] route. */
export function labStaticPaths() {
  return (["en", "de"] as const).flatMap((locale) =>
    (["home", "project"] as const).map((page) => ({
      params: { path: [locale === "de" ? "de" : "", page === "project" ? PIECE : ""].filter(Boolean).join("/") || undefined },
      props: { locale, page },
    })),
  );
}

export type LabPart = {
  n: string;
  id: string;
  label: string;
  hover: string;
  href: string;
  hreflang?: string;
  line: string;
  lineLabel: string;
  start: boolean;
};

export function loadLab(locale: Locale) {
  const home = homeSchema.parse(parse(readFileSync(join(process.cwd(), "content", "home", `${locale}.yaml`), "utf8")));
  const piece = loadPieces(locale).find((p) => p.id === PIECE);
  if (!piece) throw new Error(`design lab: piece "${PIECE}" has no ${locale} text`);

  const parts: LabPart[] = piece.parts.map((p, i) => ({
    n: String(i + 1).padStart(2, "0"),
    id: p.id,
    label: p.label,
    hover: p.hover,
    href: p.page ?? `#part-${p.id}`,
    hreflang: p.page && p.pageLang ? p.pageLang : undefined,
    line: p.line ?? "parts",
    lineLabel: lineName(locale, p.line ?? "parts"),
    start: p.start === true,
  }));
  const groups: { line: string; label: string; parts: LabPart[] }[] = [];
  for (const p of parts) {
    let g = groups.find((x) => x.line === p.line);
    if (!g) groups.push((g = { line: p.line, label: p.lineLabel, parts: [] }));
    g.parts.push(p);
  }

  const chips = piece.chips.map((c) => ({
    value: chipValue(c, locale),
    label: c.label,
    /** What stands before the date in the chip's note ("46 cases, run twice"), if anything. */
    note: chipNote(c, locale).slice(0, -(`${t(locale, "chip.asOf")} ${c.as_of}`.length)).replace(/\s*·\s*$/, ""),
    asOf: c.as_of,
  }));

  // The work lines name English part pages; each links its page in this language and is
  // tagged with its part, as on the live homepage.
  const work = home.work.map((w, i) => {
    const [, pid, partId] = w.href.split("/");
    const part = parts.find((p) => p.id === partId);
    const where = pid && partId ? partPath(locale, pid, partId, w.href) : { href: w.href };
    return { n: String(i + 1).padStart(2, "0"), title: w.title, text: w.text, href: where.href, hreflang: where.lang, tag: part ? `${piece.title} · ${part.label}` : piece.title, partN: part?.n };
  });

  return {
    locale,
    home,
    piece,
    pieceNo: String(piece.order).padStart(2, "0"),
    parts,
    groups,
    chips,
    work,
    site: SITE,
    cvHref: `mailto:${SITE.email}?subject=${encodeURIComponent(home.cv)}`,
    privacyHref: localePath(locale, "/privacy/"),
  };
}
export type Lab = ReturnType<typeof loadLab>;
