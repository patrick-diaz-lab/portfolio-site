// Map SVG helpers (PLAN 1.3, D7, D13). Shared by the page (src/components/Map.astro) and
// `pnpm check` (scripts/check-content.ts), so the build and the check read parts the same way.
//
// A part in the hand-drawn SVG is `<g id="<map.yaml id>" class="part"> … </g>` with no nested
// <g>. The page turns each one into an <a> with its link, name and status.

const PART = /<g\s+id="([^"]+)"\s+class="part">([\s\S]*?)<\/g>/g;
const PART_OPEN = /<g\s+id="([^"]+)"\s+class="part">/g;

/** Ids of every part group in the SVG, in drawing order. */
export function svgPartIds(svg: string): string[] {
  return [...svg.matchAll(PART_OPEN)].map((m) => m[1]!);
}

/** The data-t keys of the SVG's translatable texts (PLAN 1.9a). */
export function svgTextKeys(svg: string): string[] {
  return [...svg.matchAll(/<text\b[^>]*\bdata-t="([^"]+)"/g)].map((m) => m[1]!);
}

/** Texts that are neither a part's box label nor keyed: they couldn't be translated. */
export function svgUntranslatable(svg: string): string[] {
  return [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)]
    .filter((m) => !/\bclass="lbl"/.test(m[1]!) && !/\bdata-t="/.test(m[1]!))
    .map((m) => m[2]!.trim());
}

/** Part groups whose body holds a nested <g> (not allowed: the closing tag would be ambiguous). */
export function svgNestedParts(svg: string): string[] {
  return [...svg.matchAll(PART)].filter((m) => /<g[\s>]/.test(m[2]!)).map((m) => m[1]!);
}

export const STATUS_TEXT = { built: "Built", "in-progress": "In progress", planned: "Planned, not built" } as const;

export type MapPart = {
  id: string;
  label: string;
  hover: string;
  page?: string;
  status: keyof typeof STATUS_TEXT;
  line?: string;
};

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Where a part links: its page, or its entry in the list under the map. */
export const partHref = (p: MapPart) => p.page ?? `#part-${p.id}`;

export type SvgText = { ariaLabel?: string; text?: Record<string, string>; pageLang?: string };

/** The SVG with each part group turned into a named link. Unknown groups are left as drawn.
 *  Box labels come from the parts (upper case); keyed texts and the SVG's name from `t`, so
 *  one drawing serves every language (PLAN 1.9a). `pageLang` marks links to part pages
 *  that exist only in another language. */
export function linkParts(svg: string, parts: MapPart[], t: SvgText = {}): string {
  const byId = new Map(parts.map((p) => [p.id, p]));
  let out = svg.replace(/^\s*<\?xml[^>]*>\s*/, "").replace(/<!--[\s\S]*?-->/g, "");
  if (t.ariaLabel) out = out.replace(/(<svg\b[^>]*\baria-label=")[^"]*(")/, `$1${esc(t.ariaLabel)}$2`);
  if (t.text) {
    out = out.replace(/(<text\b[^>]*\bdata-t="([^"]+)"[^>]*>)[^<]*(<\/text>)/g, (whole, open: string, key: string, close: string) =>
      t.text![key] === undefined ? whole : `${open}${esc(t.text![key]!)}${close}`,
    );
  }
  return out
    .replace(PART, (whole, id: string, body: string) => {
      const p = byId.get(id);
      if (!p) return whole;
      body = body.replace(/(<text\b[^>]*\bclass="lbl"[^>]*>)[^<]*(<\/text>)/, `$1${esc(p.label.toUpperCase())}$2`);
      // Only built parts render, so the name carries no status (Patrick, 2026-11-11).
      const attrs = [
        `id="${esc(id)}"`,
        `class="part"`,
        `href="${esc(partHref(p))}"`,
        `aria-label="${esc(p.label)}"`,
        `aria-describedby="desc-${esc(id)}"`,
        ...(p.page && t.pageLang ? [`hreflang="${esc(t.pageLang)}"`] : []),
        `data-label="${esc(p.label)}"`,
        `data-hover="${esc(p.hover)}"`,
      ];
      return `<a ${attrs.join(" ")}>${body}</a>`;
    });
}

const BOX = /<rect\s+class="box"\s+x="([\d.]+)"\s+y="([\d.]+)"\s+width="([\d.]+)"\s+height="([\d.]+)"/;

/** The two ends of a wire path made of absolute M, L, H and V commands. */
function wireEnds(d: string): [number, number][] {
  const tokens = d.match(/[MLHV]|-?[\d.]+/g) ?? [];
  let x = 0, y = 0, cmd = "M";
  const points: [number, number][] = [];
  for (let i = 0; i < tokens.length; ) {
    if (/[MLHV]/.test(tokens[i]!)) cmd = tokens[i++]!;
    if (cmd === "M" || cmd === "L") { x = Number(tokens[i++]); y = Number(tokens[i++]); }
    else if (cmd === "H") x = Number(tokens[i++]);
    else if (cmd === "V") y = Number(tokens[i++]);
    else i++;
    points.push([x, y]);
  }
  return points.length ? [points[0]!, points.at(-1)!] : [];
}

/** Terminals in the drawing (`<g class="terminal">`): each circle with the texts beside it. */
function terminals(svg: string): { x: number; y: number; lines: string[] }[] {
  const out: { x: number; y: number; lines: string[] }[] = [];
  for (const g of svg.matchAll(/<g\s+class="terminal"[^>]*>([\s\S]*?)<\/g>/g)) {
    const texts = [...g[1]!.matchAll(/<text\b[^>]*\bx="([\d.]+)"[^>]*\by="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), t: m[3]!.trim() }));
    for (const c of g[1]!.matchAll(/<circle\b[^>]*\bcx="([\d.]+)"[^>]*\bcy="([\d.]+)"/g)) {
      const x = Number(c[1]);
      const y = Number(c[2]);
      out.push({ x, y, lines: texts.filter((t) => t.x > x && t.y - y >= -12 && t.y - y <= 24).sort((a, b) => a.y - b.y).map((t) => t.t) });
    }
  }
  return out;
}

/** A part page's "you are here" sheet (layout 3, Patrick 2026-11-13; drawn compact after his
 *  review of #33): the part's box in the map's style, and every part wired to it (a wire of
 *  one ending on the other's box) as a named terminal on the side where it sits on the map,
 *  joined by a bus. A part wired to no other part shows where its own wire leads, labelled
 *  as on the map. Hidden from screen readers; the page names the neighbours as text links. */
export function locator(svg: string, partId: string, labelOf: (id: string) => string): { svg: string; neighbours: string[] } | undefined {
  const boxes = new Map<string, [number, number, number, number]>();
  const wires = new Map<string, [number, number][]>();
  for (const m of svg.matchAll(PART)) {
    const b = BOX.exec(m[2]!);
    if (b) boxes.set(m[1]!, [Number(b[1]), Number(b[2]), Number(b[3]), Number(b[4])]);
    const w = /<path\s+class="wire"\s+d="([^"]+)"/.exec(m[2]!);
    wires.set(m[1]!, w ? wireEnds(w[1]!) : []);
  }
  const here = boxes.get(partId);
  if (!here) return undefined;
  const on = ([bx, by, bw, bh]: [number, number, number, number], [px, py]: [number, number]) =>
    px >= bx - 2 && px <= bx + bw + 2 && py >= by - 2 && py <= by + bh + 2;
  const neighbours = [...boxes.keys()].filter((id) =>
    id !== partId && ((wires.get(id) ?? []).some((p) => on(here, p)) || (wires.get(partId) ?? []).some((p) => on(boxes.get(id)!, p))));

  // Sides as on the map; a neighbour straight above or below goes to the shorter side.
  const mid = (b: [number, number, number, number]) => b[0] + b[2] / 2;
  const left: string[] = [];
  const right: string[] = [];
  const ties: string[] = [];
  for (const id of neighbours) {
    const d = mid(boxes.get(id)!) - mid(here);
    (d < -1 ? left : d > 1 ? right : ties).push(id);
  }
  for (const id of ties) (left.length <= right.length ? left : right).push(id);
  const top = (id: string) => boxes.get(id)![1];
  left.sort((a, b) => top(a) - top(b));
  right.sort((a, b) => top(a) - top(b));
  const outside = neighbours.length
    ? []
    : (terminals(svg).find((t) => (wires.get(partId) ?? []).some(([px, py]) => Math.abs(px - t.x) <= 6 && Math.abs(py - t.y) <= 6))?.lines ?? []);

  // The sheet: labels | terminal | bus | the part | bus | terminal | labels.
  // One scale for every sheet, so a part with one neighbour isn't drawn bigger than a hub.
  const SCALE = 0.72;
  const STEP = 34, BH = 64, BX = 210, BW = 210;
  const L = { end: 168, dot: 178, bus: 196 };
  const R = { bus: BX + BW + 14, dot: BX + BW + 32, start: BX + BW + 42 };
  const rows = Math.max(left.length, right.length, 1);
  const H = Math.max(BH, (rows - 1) * STEP + 28) + 32;
  const yc = H / 2;
  const ys = (n: number) => Array.from({ length: n }, (_, i) => yc + (i - (n - 1) / 2) * STEP);
  const parts: string[] = [];
  const side = (ids: string[], s: "left" | "right") => {
    if (!ids.length) return;
    const y = ys(ids.length);
    const bus = s === "left" ? L.bus : R.bus;
    const dot = s === "left" ? L.dot : R.dot;
    const edge = s === "left" ? BX : BX + BW;
    ids.forEach((id, i) => {
      parts.push(`<path class="wire-static" d="M${s === "left" ? dot + 4 : bus} ${y[i]} H${s === "left" ? bus : dot - 4}" />`);
      parts.push(`<circle class="loc-dot" cx="${dot}" cy="${y[i]}" r="4" />`);
      parts.push(`<text class="loc-n${s === "left" ? " loc-end" : ""}" x="${s === "left" ? L.end : R.start}" y="${y[i]! + 5}">${esc(labelOf(id).toUpperCase())}</text>`);
    });
    const lo = Math.min(...y, yc);
    const hi = Math.max(...y, yc);
    if (hi > lo) parts.push(`<path class="wire-static" d="M${bus} ${lo} V${hi}" />`);
    parts.push(`<path class="wire-static" d="M${Math.min(bus, edge)} ${yc} H${Math.max(bus, edge)}" />`);
  };
  side(left, "left");
  side(right, "right");
  if (outside.length) {
    parts.push(`<path class="wire-static" d="M${BX + BW} ${yc} H${R.dot - 4}" />`, `<circle class="loc-dot" cx="${R.dot}" cy="${yc}" r="4" />`);
    outside.forEach((line, j) => parts.push(`<text class="loc-n loc-dim" x="${R.start}" y="${yc + 5 + (j - (outside.length - 1) / 2) * 17}">${esc(line)}</text>`));
  }
  parts.push(`<g class="part is-here"><rect class="box" x="${BX}" y="${yc - BH / 2}" width="${BW}" height="${BH}" /><text class="lbl loc-mid" x="${BX + BW / 2}" y="${yc + 6}">${esc(labelOf(partId).toUpperCase())}</text></g>`);

  const x0 = left.length ? 0 : BX - 16;
  const x1 = right.length || outside.length ? R.start + 178 : BX + BW + 16;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} 0 ${x1 - x0} ${H}" width="${Math.round((x1 - x0) * SCALE)}" height="${Math.round(H * SCALE)}" class="schematic locator" aria-hidden="true" focusable="false">${parts.join("")}</svg>`,
    neighbours,
  };
}
