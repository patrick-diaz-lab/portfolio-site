// Design lab: the project map, from the same hand-drawn SVG as the live site
// (pieces/<id>/map.svg through src/lib/map-svg.ts). Two forms:
//   labMap    the full drawing, every part a named link, plus a numbered tag on each part
//             (its place in map.yaml, the same number the lists show). A direction styles
//             or hides the tags, the notes and the signal dot in its own CSS.
//   keyPlan   a small static plan for phones and teasers: frames, wires and boxes, with the
//             part numbers large enough to read at 343 px. Hidden from screen readers; the
//             list beside it carries the links.
import { esc, linkParts } from "../../lib/map-svg.ts";
import type { Lab } from "./data.ts";

const LINK = /<a id="([^"]+)" class="part"([^>]*)>([\s\S]*?)<\/a>/g;
const BOX = /<rect\s+class="box"\s+x="([\d.]+)"\s+y="([\d.]+)"\s+width="([\d.]+)"\s+height="([\d.]+)"/;

export function labMap(lab: Lab, opts: { labels?: "upper" | "as-written" } = {}): string {
  const byId = new Map(lab.parts.map((p) => [p.id, p]));
  return linkParts(lab.piece.svg, lab.piece.parts, lab.piece.svgText).replace(LINK, (whole, id: string, attrs: string, body: string) => {
    const p = byId.get(id);
    const b = BOX.exec(body);
    if (!p || !b) return whole;
    // Box labels are upper case as drawn; a direction can ask for them as written in map.yaml.
    if (opts.labels === "as-written") body = body.replace(/(<text\b[^>]*\bclass="lbl"[^>]*>)[^<]*(<\/text>)/, `$1${esc(p.label)}$2`);
    const [x, y, w, h] = [Number(b[1]), Number(b[2]), Number(b[3]), Number(b[4])];
    // The tag sits on the box's lower right corner, clear of every wire and note.
    const tag = `<circle class="tag" cx="${x + w - 4}" cy="${y + h}" r="11" /><text class="tag-t" x="${x + w - 4}" y="${y + h + 4}" text-anchor="middle" aria-hidden="true">${p.n}</text>`;
    // The name carries the number too, so it holds every text the part shows.
    attrs = attrs.replace(/aria-label="[^"]*"/, `aria-label="${esc(p.label)} ${p.n}"`);
    return `<a id="${esc(id)}" class="part"${attrs} data-part="${esc(id)}" data-n="${p.n}" data-line="${esc(p.lineLabel)}">${body}${tag}</a>`;
  });
}

export function keyPlan(lab: Lab, opts: { numbers?: boolean } = {}): string {
  const { numbers = true } = opts;
  const svg = lab.piece.svg.replace(/<!--[\s\S]*?-->/g, "");
  const out: string[] = [];
  const frame = /<g class="frame"[^>]*>([\s\S]*?)<\/g>/.exec(svg)?.[1] ?? "";
  for (const m of frame.matchAll(/<(?:path|rect)\b(?![^>]*class="dim")[^>]*\/>/g)) out.push(m[0].replace(/\/>$/, 'class="kp-frame" />'));
  for (const m of svg.matchAll(/<path class="wire-static" d="([^"]+)" \/>/g)) out.push(`<path class="kp-wire" d="${m[1]}" />`);
  for (const m of svg.matchAll(/<g class="terminal"[^>]*>([\s\S]*?)<\/g>/g)) {
    for (const c of m[1]!.matchAll(/<circle\b[^>]*\bcx="([\d.]+)"[^>]*\bcy="([\d.]+)"/g)) out.push(`<circle class="kp-term" cx="${c[1]}" cy="${c[2]}" r="5" />`);
  }
  const boxes: string[] = [];
  for (const m of svg.matchAll(/<g\s+id="([^"]+)"\s+class="part">([\s\S]*?)<\/g>/g)) {
    const p = lab.parts.find((x) => x.id === m[1]);
    const b = BOX.exec(m[2]!);
    if (!p || !b) continue;
    const w = /<path\s+class="wire"\s+d="([^"]+)"/.exec(m[2]!);
    if (w) out.push(`<path class="kp-wire" d="${w[1]}" />`);
    const [x, y, bw, bh] = [Number(b[1]), Number(b[2]), Number(b[3]), Number(b[4])];
    boxes.push(`<rect class="kp-box" data-plan="${esc(p.id)}" x="${x}" y="${y}" width="${bw}" height="${bh}" />`);
    if (numbers) boxes.push(`<text class="kp-n" x="${x + bw / 2}" y="${y + bh / 2 + 14}" text-anchor="middle">${p.n}</text>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 1060 440" class="keyplan" aria-hidden="true" focusable="false">${out.join("")}${boxes.join("")}</svg>`;
}

/** The full drawing without links, for a figure that is one link as a whole (a teaser).
 *  Hidden from screen readers; the link around it carries the name. */
export function staticMap(lab: Lab, opts: { labels?: "upper" | "as-written" } = {}): string {
  return labMap(lab, opts)
    .replace(/<a id="[^"]+" class="part"[^>]*>/g, '<g class="part">')
    .replace(/<\/a>/g, "</g>")
    .replace(/<svg\b([^>]*)\srole="group"\s+aria-label="[^"]*"/, '<svg$1 aria-hidden="true" focusable="false"');
}
