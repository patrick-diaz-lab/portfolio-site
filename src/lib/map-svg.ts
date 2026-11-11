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

/** The SVG with each part group turned into a named link. Unknown groups are left as drawn. */
export function linkParts(svg: string, parts: MapPart[]): string {
  const byId = new Map(parts.map((p) => [p.id, p]));
  return svg
    .replace(/^\s*<\?xml[^>]*>\s*/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(PART, (whole, id: string, body: string) => {
      const p = byId.get(id);
      if (!p) return whole;
      const status = STATUS_TEXT[p.status];
      const attrs = [
        `id="${esc(id)}"`,
        `class="part"`,
        `href="${esc(partHref(p))}"`,
        `aria-label="${esc(`${p.label}, ${status.toLowerCase()}`)}"`,
        `aria-describedby="desc-${esc(id)}"`,
        `data-status="${p.status}"`,
        `data-label="${esc(p.label)}"`,
        `data-status-text="${esc(status)}"`,
        `data-hover="${esc(p.hover)}"`,
      ];
      return `<a ${attrs.join(" ")}>${body}</a>`;
    });
}
