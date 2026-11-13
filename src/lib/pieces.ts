// Reads the piece folders (PLAN 1.3, D19): pieces/<id>/piece.yaml, map.yaml and the map SVG.
// A second piece is a folder plus its SVG, with no code change. `pnpm check` validates the
// same files first (scripts/check-content.ts); here a bad file fails the build.
//
// German (PLAN 1.9a): piece.de.yaml and map.de.yaml hold only translated text; numbers, ids,
// pages and status come from the English files. A piece without both overlays has no
// German pages.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { mapOverlaySchema, mapSchema, pieceOverlaySchema, pieceSchema } from "../content/schemas.ts";
import type { Locale } from "../i18n/ui.ts";
import type { MapPart, SvgText } from "./map-svg.ts";

const ROOT = join(process.cwd(), "pieces");

export type Piece = ReturnType<typeof pieceSchema.parse> & {
  parts: MapPart[];
  svg: string;
  svgText: SvgText;
  locales: Locale[];
};

const yaml = (f: string) => parse(readFileSync(f, "utf8"));

function readPiece(dir: string, locale: Locale): Piece | null {
  const base = pieceSchema.parse(yaml(join(dir, "piece.yaml")));
  const map = mapSchema.parse(yaml(join(dir, "map.yaml")));
  const svg = readFileSync(join(dir, base.map_svg), "utf8");
  const hasDe = existsSync(join(dir, "piece.de.yaml")) && existsSync(join(dir, "map.de.yaml"));
  const locales: Locale[] = hasDe ? ["en", "de"] : ["en"];
  // Only built parts render (Patrick, 2026-11-11); `status` stays in the data model.
  const built = map.parts.filter((p) => p.status === "built");
  if (locale === "en") return { ...base, parts: built, svg, svgText: {}, locales };
  if (!hasDe) return null;

  const po = pieceOverlaySchema.parse(yaml(join(dir, "piece.de.yaml")));
  const mo = mapOverlaySchema.parse(yaml(join(dir, "map.de.yaml")));
  return {
    ...base,
    title: po.title,
    tagline: po.tagline,
    summary: po.summary,
    chips: base.chips.map((c, i) => ({ ...c, label: po.chips[i] ?? c.label })),
    parts: built.map((p) => ({ ...p, label: mo.parts[p.id]?.label ?? p.label, hover: mo.parts[p.id]?.hover ?? p.hover })),
    svg,
    // Part pages exist in English only for now; links to them are marked (PLAN 1.9a).
    svgText: { ariaLabel: mo.aria_label, text: mo.svg_text, pageLang: "en" },
    locales,
  };
}

/** The built pieces, in their order. Only finished pieces are published (Patrick, 2026-11-13):
 *  a piece that isn't built gets no overview, no part pages and no place on the homepage. */
export function loadPieces(locale: Locale = "en"): Piece[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT)
    .filter((n) => statSync(join(ROOT, n)).isDirectory() && existsSync(join(ROOT, n, "piece.yaml")))
    .map((n) => readPiece(join(ROOT, n), locale))
    .filter((p): p is Piece => p !== null && p.status === "built")
    .sort((a, b) => a.order - b.order);
}
