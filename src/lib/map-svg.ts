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

/** A part page's "you are here" map (layout 3, Patrick 2026-11-13): the piece's drawing cut
 *  down to the part and the parts wired to it (a wire of one ending on the other's box),
 *  everything else hidden, the part marked, no links or notes. The drawing is hidden from
 *  screen readers; the page names the neighbours as text links. */
export function locator(svg: string, partId: string, pad = 16): { svg: string; neighbours: string[] } | undefined {
  const view = /viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg);
  const boxes = new Map<string, [number, number, number, number]>();
  const wires = new Map<string, [number, number][]>();
  for (const m of svg.matchAll(PART)) {
    const b = BOX.exec(m[2]!);
    if (b) boxes.set(m[1]!, [Number(b[1]), Number(b[2]), Number(b[3]), Number(b[4])]);
    const w = /<path\s+class="wire"\s+d="([^"]+)"/.exec(m[2]!);
    wires.set(m[1]!, w ? wireEnds(w[1]!) : []);
  }
  const here = boxes.get(partId);
  if (!view || !here) return undefined;
  const on = ([bx, by, bw, bh]: [number, number, number, number], [px, py]: [number, number]) =>
    px >= bx - 2 && px <= bx + bw + 2 && py >= by - 2 && py <= by + bh + 2;
  const neighbours = [...boxes.keys()].filter((id) =>
    id !== partId && ((wires.get(id) ?? []).some((p) => on(here, p)) || (wires.get(partId) ?? []).some((p) => on(boxes.get(id)!, p))));
  // A part wired to nothing is shown with the parts around it instead.
  const shown = neighbours.length ? [partId, ...neighbours] : [...boxes.keys()];
  const near = neighbours.length ? shown.map((id) => boxes.get(id)!) : [[here[0] - 260, here[1] - 120, here[2] + 520, here[3] + 240] as [number, number, number, number]];
  const [vx, vy, vw, vh] = view.slice(1).map(Number) as [number, number, number, number];
  const x0 = Math.max(vx, Math.min(...near.map((b) => b[0])) - pad);
  const y0 = Math.max(vy, Math.min(...near.map((b) => b[1])) - pad);
  const x1 = Math.min(vx + vw, Math.max(...near.map((b) => b[0] + b[2])) + pad);
  const y1 = Math.min(vy + vh, Math.max(...near.map((b) => b[1] + b[3])) + pad);
  const keep = new Set(shown);
  const out = svg
    .replace(/^\s*<\?xml[^>]*>\s*/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<svg\b[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" class="schematic locator" aria-hidden="true" focusable="false">`)
    .replace(PART_OPEN, (_whole, id: string) => `<g data-part="${esc(id)}" class="part${id === partId ? " is-here" : keep.has(id) ? "" : " is-away"}">`);
  return { svg: out, neighbours: neighbours.length ? neighbours : [] };
}
