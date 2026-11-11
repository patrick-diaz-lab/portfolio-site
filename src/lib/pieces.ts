// Reads the piece folders (PLAN 1.3, D19): pieces/<id>/piece.yaml, map.yaml and the map SVG.
// A second piece is a folder plus its SVG, with no code change. `pnpm check` validates the
// same files first (scripts/check-content.ts); here a bad file fails the build.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { mapSchema, pieceSchema } from "../content/schemas.ts";
import type { MapPart } from "./map-svg.ts";

const ROOT = join(process.cwd(), "pieces");

export type Piece = ReturnType<typeof pieceSchema.parse> & { parts: MapPart[]; svg: string };

export function loadPieces(): Piece[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT)
    .filter((n) => statSync(join(ROOT, n)).isDirectory() && existsSync(join(ROOT, n, "piece.yaml")))
    .map((n) => {
      const piece = pieceSchema.parse(parse(readFileSync(join(ROOT, n, "piece.yaml"), "utf8")));
      const map = mapSchema.parse(parse(readFileSync(join(ROOT, n, "map.yaml"), "utf8")));
      const svg = readFileSync(join(ROOT, n, piece.map_svg), "utf8");
      return { ...piece, parts: map.parts, svg };
    })
    .sort((a, b) => a.order - b.order);
}
