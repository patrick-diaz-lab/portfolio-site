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
