# Design exploration

Four design directions for the site, built as preview pages next to the live design. Nothing on the live site changes: the previews live under `/design-lab/`, on the branch `item/design-exploration`, and are not meant to be merged as they are.

- **Start page of the lab:** `/design-lab/` (links to every preview).
- **Per direction:** `/design-lab/<a|b|c|d>/` (homepage) and `/design-lab/<a|b|c|d>/vision/` (project page with the part map), each also under `…/de/`.
- **Content:** the site's own files (`content/home/`, `pieces/vision/`), read through `src/design-lab/shared/data.ts`. No text was invented; the lab adds only interface words (`src/design-lab/shared/ui.ts`, English and German).
- **Screenshots:** [`docs/design-exploration/`](design-exploration/), listed [below](#screenshots).

## The starting point: what makes the current "blueprint" style

Read from `src/styles/tokens.css`, `base.css`, `schematic.css`, the components and the map.

- **Lines.** Hairlines only: 1 px dim rules, 1.5 px outlines around modules, corners almost square (2 px). Section heads carry a rule that runs to the page edge.
- **Grid.** A 4 px spacing grid inside a 72 rem page. Content sits in outlined "modules"; two columns side by side that stack on a phone.
- **Type.** Three roles: Barlow to read, Barlow Condensed in tracked capitals for "panel titles", JetBrains Mono in tracked capitals for labels and values. Scale 1.25 on 17 px.
- **Color.** Dark only: a graphite panel, silk-white text, a dimmer silk for secondary text, and exactly one amber for the signal, notes, focus and hover. A faint vertical brushing as texture.
- **Diagram language.** Labelled boxes, wires at right angles, open circles as terminals, frames with a tab label (RUNTIME, BUILD SIDE), one dimension mark, a sheet mark, amber side notes on dashed lead lines, and a signal dot that runs along a part's own wire.
- **Details.** Everything is numbered and dated like a drawing set (Project 01, Part 03, Fig. 1.1, "as of"). Results are mono readouts written "k of n". State is told by shape (dot, dashed line, outline), never by a second color.
- **Interaction.** The map is the project's navigation: every part is a link, a panel beside the drawing shows one part at a time, and on a phone the drawing gives way to a vertical wire with the parts along it.

What every direction keeps from this: the same hand-drawn schematic (`pieces/vision/map.svg`) with its boxes, wires, terminals and lettered frames; mono lettering for labels and numbers; "k of n" results with their date; numbered parts; thin lines and square corners; and one accent color used for one thing.

## How "different" was measured

A direction had to differ from every other in at least four of eight dimensions: layout and grid, typography, navigation, information density, how the blueprint is used, how the part map is presented, motion and interaction, and the main color mode. The [comparison table](#comparison) lists them side by side.

## Direction A: Drawing sheet

**Idea.** The page is one framed engineering sheet: a strip of cells on top holds the navigation ("Sheet 01 Profile", "Sheet 02 Vision"), each section is a lettered zone along the left edge, and a title block closes the sheet. The map is the assembly drawing: every part carries an item number, a detail line under the drawing names the part you point at, and the parts list below is the drawing's bill of parts. In dark mode the sheet becomes a blueprint, white lines on Prussian blue.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` (the sheet) | `#f4f2ea` | `#0f2747` |
| `--color-surface` (boxes, tables, title block) | `#fbfaf5` | `#14305a` |
| `--color-text` | `#14213a` (14.3:1) | `#e6eefb` (12.8:1) |
| `--color-text-dim` | `#485572` (6.6:1) | `#a6bbdb` (7.7:1) |
| `--color-line` / `--color-line-fine` | `#14213a` / `#a9b0bf` | `#c9d9f2` / `#456592` |
| `--color-accent` (highlighter, with `--color-on-accent` `#14213a`, 8.6:1) | `#f2b23e` | `#f2b23e` |
| `--color-accent-text` (notes) | `#8a5200` (5.7:1) | `#f6c463` (9.3:1) |
| `--color-focus` | `#8a5200` | `#f2b23e` |

| Type, spacing, lines | Value |
|---|---|
| Families | IBM Plex Mono 400/600 for titles, labels, values and tables; IBM Plex Sans 400 for running text |
| Scale | 12 · 14 · 16 (base) · 18 · 24 · 28 · 44 px; titles in capitals |
| Leading, measure | 1.55 body, 1.15 titles; 62 characters |
| Spacing | 4 px grid: 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Lines | frame 2 px, boxes and wires 1.5 px, cell dividers 1 px; radius 0 |
| Layout | one sheet up to 84 rem; 2.5 rem zone column; 12 columns inside a zone |

- **Better than the others:** the strongest and most consistent identity, and the closest to the map's own language; the part map and its list read as one object (numbers on the drawing, numbers in the list); both modes are equally finished, and the dark one is the most literal "blueprint" of the four.
- **Worse than the others:** capitals and mono type slow down reading of longer text; tables everywhere make the homepage feel like a form; the metaphor (sheets, zones, title block) needs a moment to learn.
- **For whom:** the technical reader who enjoys precision, and a recruiter who remembers the site because it looks like nothing else. Less suited to someone who wants to read three paragraphs quickly.

## Direction B: Technical report

**Idea.** A Swiss typographic page: one statement in large display type, then numbered sections on a 12-column grid with three columns of margin for section numbers and mono annotations. The results are large numbers, the work lines are numbered rows, and the white space does the structuring that boxes do today. The blueprint appears only where a report would have it: in the fine mono annotations and as "Fig. 1", the schematic on a plate with a numbered legend whose texts are always visible.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#ffffff` | `#111315` |
| `--color-surface` (figure plates) | `#f3f3f0` | `#1b1e21` |
| `--color-text` | `#111111` (18.9:1) | `#f2f2ef` (16.6:1) |
| `--color-text-dim` | `#5a5a57` (6.9:1) | `#a3a39d` (7.3:1) |
| `--color-line` / `--color-line-fine` | `#111111` / `#d4d4cf` | `#f2f2ef` / `#373b3f` |
| `--color-accent` (marker on the selected part, with `--color-on-accent` `#111111`, 10.1:1) | `#f2b23e` | `#f2b23e` |
| `--color-accent-text` (figure notes) | `#8a5200` (6.4:1) | `#f2b23e` (9.9:1) |
| `--color-focus` | `#111111` | `#f2b23e` |

| Type, spacing, lines | Value |
|---|---|
| Families | Inter Tight 700 for display and titles; Inter 400/600 to read; JetBrains Mono 400 for annotations |
| Scale | ratio 1.333 on 18 px: 12 · 14 · 18 · 24 · 32 · 43 · 57 · 76 px; the project title up to 128 px |
| Leading, tracking | 1.55 body, 1.0 display; display −0.025 em |
| Spacing | 8 px grid with large steps: 8 · 16 · 24 · 32 · 48 · 64 · 96 |
| Lines | section rule 2 px, drawing 1.25 px, dividers 1 px; radius 0 |
| Layout | page up to 78 rem; 12 columns with 2 rem gutters; margin 3, text 9 |

- **Better than the others:** the fastest first read: who, what, and the three results are legible from across the room; the most conventional navigation (a top bar with three words); the best frame for the long part pages, which are mostly text; German copy fits without special handling because the type can hyphenate and wrap.
- **Worse than the others:** the blueprint is the weakest on the first screen (it arrives with the figure); the pages are the longest; the look is the least specific to this site, since a large grotesk on white is a common portfolio style.
- **For whom:** the recruiter and the hiring manager, on any device. The technical reader gets less "system at a glance" than in A or C.

## Direction C: Control room

**Idea.** An application shell: a rail on the left with the navigation and all ten parts by group, and a board of panels beside it. The schematic is the largest panel on both pages; an inspector next to it shows the selected part and steps through the parts, and a dot marks the part's wire. Type is small and everything has a place, so the homepage fits on roughly one screen. Dark only, on purpose: the calm dark room is the idea.

| Token | Dark (only mode) |
|---|---|
| `--color-bg` | `#0b1014` |
| `--color-surface` (panels, rail) | `#121a20` |
| `--color-surface-2` (boxes, hover, current) | `#1a252d` |
| `--color-text` | `#dbe4ea` (14.8:1 on bg, 13.6:1 on panels) |
| `--color-text-dim` | `#93a4af` (7.4:1 on bg, 6.8:1 on panels, 6.1:1 on boxes) |
| `--color-line` (drawing strokes) | `#7d93a1` (5.5:1 on panels) |
| `--color-line-fine` (panel borders) | `#26343e` |
| `--color-accent` (selected, focus, signal; `--color-on-accent` `#0b1014`) | `#f2b23e` (10.2:1) |

| Type, spacing, lines | Value |
|---|---|
| Families | Geist Sans 400/600 for the interface; Geist Mono 400/500 for labels and values |
| Scale | ratio 1.2 on 14 px: 12 · 13 · 14 · 16 · 19 · 24 px |
| Leading | 1.5 body, 1.2 titles |
| Spacing | 4 px grid, small steps: 4 · 8 · 12 · 16 · 20 · 24 · 32; 12 px between panels |
| Lines | drawing 1.5 px, panel borders 1 px; radius 3 px |
| Layout | rail 15 rem (from 72 rem width; a top bar below), board of 12 columns from 90 rem |

- **Better than the others:** the most information per screen without clutter; the best presentation of the map as a working tool (inspector, previous and next, the rail's part list); the closest to what the project is, a system someone operates.
- **Worse than the others:** small type is harder for a quick read and on a projector; an app shell can suggest live data, which this isn't; dark only; the rail's ten part links add Tab stops before the content (a skip link is there).
- **For whom:** the technical reader and the engineer on the hiring panel. A recruiter gets the facts, but has to look for them.

## Direction D: Minimal paper

**Idea.** One column of serif text with wide margins, no boxes and no cards: the page reads like a letter. There is one color, a blueprint blue, used for links and focus. The blueprint itself appears in exactly one place, a blue plate with the map as a white line drawing, wider than the text column; under it one sentence names the part you point at, and the parts follow as a numbered list.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` (paper) | `#fbfaf6` | `#161514` |
| `--color-surface` (selected row) | `#f2f0e9` | `#201f1d` |
| `--color-text` | `#1d1c1a` (16.3:1) | `#ece8e0` (14.9:1) |
| `--color-text-dim` | `#625f58` (6.1:1) | `#a8a39a` (7.3:1) |
| `--color-line-fine` | `#dcd8ce` | `#383632` |
| `--color-accent` (links, focus) | `#1d3c78` (10.2:1) | `#a9c1ff` (10.2:1) |
| `--color-plate` / `--color-plate-line` / `--color-plate-dim` | `#1d3c78` / `#f1f5ff` (9.8:1) / `#b9c8ee` (6.4:1) | the same |

| Type, spacing, lines | Value |
|---|---|
| Families | Source Serif 4 400, 400 italic, 600 for everything; JetBrains Mono 400 only inside the plate |
| Scale | ratio 1.25 on 19 px: 15 · 19 · 24 · 32 · 48 px |
| Leading, measure | 1.6 body, 1.2 titles; a 38 rem column (about 65 characters) |
| Spacing | steps of the base line: 4 · 8 · 15 · 30 · 61 · 104 px |
| Lines | drawing 1.5 px, one hairline 1 px; radius 0 |
| Layout | text column 38 rem, plate up to 64 rem |

- **Better than the others:** the most comfortable to read and the lightest to maintain; the plate has the most impact per pixel, because it is the only color on the page; the smallest risk of looking dated in two years.
- **Worse than the others:** the least recognizably "this site" outside the plate; no at-a-glance structure, so a reader has to read; the results are the least prominent of the four.
- **For whom:** a reader who wants the writing, and a recruiter who distrusts effects. The weakest fit for someone skimming for numbers.

## Comparison

| Dimension | A · Drawing sheet | B · Technical report | C · Control room | D · Minimal paper |
|---|---|---|---|---|
| Layout and grid | one framed sheet, lettered zones, cells and tables | 12 columns, 3 of margin, heavy rule per section | app shell: rail and a board of panels | one centered column |
| Typography | mono capitals lead, sans to read; 16 px | large tight grotesk, 18 px, scale 1.333 | compact sans and mono, 14 px, scale 1.2 | one serif, 19 px |
| Navigation | the sheet's top strip (sheets as tabs) and the title block | sticky top bar, three words | left rail with the parts tree; a bar on phones | one line of text links |
| Density | medium to high | low | high | very low |
| Blueprint | dominant: the page is the drawing | accent: annotations and figures | dominant: the schematic as a tool | only the plate |
| Part map | assembly drawing, item numbers, detail line, parts list | "Fig. 1" on a plate, numbered legend with texts | main panel, inspector with previous / next, dense table | white on blue plate, one sentence under it, numbered list |
| Motion | none; a highlight on the part and its row | short color transitions | the signal dot runs on the part you point at or focus | none |
| Main mode | light (dark is a real blueprint) | light (dark finished) | dark only | light (dark finished) |
| Phone | zones stack, key plan with numbers, list as blocks | one column, key plan, legend | bar on top, key plan, parts on a vertical wire | one column, key plan on the plate, list |
| Fonts loaded | 52 KB | 67 to 91 KB | 88 KB | 82 KB |

Every pair of directions differs in at least six of the first eight rows.

## Recommendation

**B, Technical report, as the site's frame, with A's map treatment kept for the project pages.**

1. **The site's job is a job application.** The link sits in applications and is opened by people with little time, often on a phone. B answers "who is this, what does he want, is there proof" in the first screen: the statement, the role and the three results in the largest type of the four.
2. **Most of the site is text.** The ten part pages are decisions, tests and lessons. B's grid (margin for numbers and annotations, a readable column, large section rules) is the frame those pages need; A and C would set long text in capitals or at 14 px.
3. **It fixes the current design's two real limits** without giving up its character: there is a finished light mode, and running text is larger and calmer. The blueprint stays where it carries meaning, in the figure and the annotations, and stops being a costume for every paragraph.
4. **It travels best into German.** Longer words wrap and hyphenate in the display type; A's capitals in cells and C's narrow panels needed the most care.
5. **What to take from the others.** From A: the item numbers on the drawing with the matching list (B already uses them as its legend) and the detail line under the drawing. From C: the inspector's previous / next for wide screens, if the map should work as a tour. From D: nothing structural, but its restraint is a good test for every element added later.

If the site should instead be remembered first and read second, **A is the second choice**: it is the most original and the most faithful to the map's language, and its dark mode is the best single image in the lab. C is the right idea for a later, separate thing (a real console page for Vision), not for the front door. D is a safe fallback.

## How it is built

- **Routes.** `src/pages/design-lab/<dir>/[...path].astro`, one file per direction, so each direction's styles and fonts are bundled only into its own pages. `src/pages/design-lab/index.astro` is the lab's start page.
- **Per direction** (`src/design-lab/<dir>/`): `tokens.css` (colors, type, spacing, lines, layout sizes), `styles.css`, `Layout.astro`, `Home.astro`, `Project.astro`. A direction can be adopted by moving its folder; no direction imports from another.
- **Token contract.** Every `tokens.css` defines the same core names (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-dim`, `--color-line`, `--color-line-fine`, `--color-accent`, `--color-on-accent`, `--color-accent-text`, `--color-focus`, `--font-body`, `--font-label`, `--text-*`, `--space-*`). Colors with two modes are written `light-dark(light, dark)`; the mode follows the system, or `data-theme` on `<html>` after the visitor used the switch.
- **Shared** (`src/design-lab/shared/`): the content loader, the lab's interface words, the map helpers (the full drawing with numbered parts, a static version, and a small "key plan" for phones), one script for the map's selection (about 1 KB), the mode switch, and the thin "Design lab" strip above every preview.
- **Fonts.** Self-hosted from `@fontsource`, Latin subset, exact versions pinned in `package.json` (`ibm-plex-mono`, `ibm-plex-sans`, `inter`, `inter-tight`, `geist-sans`, `geist-mono` at 5.3.0; `source-serif-4` at 5.3.1; all older than the 14-day rule). No framework and no library was added for effects.
- **Not indexed, not linked.** Every preview carries `noindex`, has no canonical link and no hreflang alternates, and is listed in `NOINDEX` in `scripts/sitemap.ts`, so the sitemap leaves it out and the build fails if a preview ever loses its `noindex`. No page of the site links to the lab.
- **Screenshots.** `node scripts/design-lab-shots.ts` (after a build) writes them and fails if any preview scrolls sideways at 375, 768 or 1440 px in either language.

## What was checked

- **Accessibility:** axe (WCAG 2.2 A and AA rules) on every preview, both languages, at 375, 768 and 1440 px, in each mode: no violations. Semantic landmarks, one `h1` per page, a skip link, visible focus on every Tab stop (an outline of 2 to 3 px; on a map part its focus ring), no motion and no transitions under `prefers-reduced-motion`. The pages work without JavaScript: every part is a link and every text is in the page; the detail line, the inspector and the mode switch appear only when the script runs.
- **Contrast:** the ratios in the token tables are computed from the token values; every text pair is above 4.5:1 and every drawing stroke above 3:1.
- **Responsive:** no sideways scrolling at 375, 768 and 1440 px in English and German. Below 56 rem the full drawing gives way to the numbered key plan, because its lettering would be too small to read; the parts list carries the same numbers.
- **German:** every preview was laid out and checked with the German copy; the German box labels and notes fit the drawing in all four type settings (checked by measuring each label against its box).
- **Performance:** Lighthouse (mobile) on all 17 lab pages of the built site: 100 in performance, accessibility, best practices and SEO on every page, each inside the site's size budget. Per page: at most 2.1 KB of script, 52 to 91 KB of fonts, 79 to 130 KB in total, no request to another host.
- **The repo's other gates** (`pnpm gates`: links, axe, the map, focus, no-JS, reduced motion) ran in the session over the whole built site with the previews in it; their result is in the session summary that came with this branch.

## Limits of this exploration

- **Two pages per direction.** The part pages, the privacy page and the 404 page were not redesigned. Links to a part leave the lab and open the live part page.
- **C has no light mode.** That is a choice, not an omission; a light "day shift" variant would be a separate piece of work.
- **The German interface words of the lab** (for example "Stückliste", "Übersichtsplan", "Zum Inhalt springen") are mine and need Patrick's read before any of them reaches the live site.
- **The previews are not for `main`.** Adopting a direction means moving its tokens and layouts into `src/styles/` and `src/components/`, redoing the part pages in it, and removing the lab.

## Screenshots

All at `deviceScaleFactor` 2, full page. `…-de.png` is the German page at 375 px in the direction's main mode.

| Direction | Homepage | Project page |
|---|---|---|
| A · Drawing sheet | [1440 light](design-exploration/a/home-1440-light.png) · [1440 dark](design-exploration/a/home-1440-dark.png) · [375 light](design-exploration/a/home-375-light.png) · [375 dark](design-exploration/a/home-375-dark.png) · [375 German](design-exploration/a/home-375-light-de.png) | [1440 light](design-exploration/a/project-1440-light.png) · [1440 dark](design-exploration/a/project-1440-dark.png) · [375 light](design-exploration/a/project-375-light.png) · [375 dark](design-exploration/a/project-375-dark.png) · [375 German](design-exploration/a/project-375-light-de.png) |
| B · Technical report | [1440 light](design-exploration/b/home-1440-light.png) · [1440 dark](design-exploration/b/home-1440-dark.png) · [375 light](design-exploration/b/home-375-light.png) · [375 dark](design-exploration/b/home-375-dark.png) · [375 German](design-exploration/b/home-375-light-de.png) | [1440 light](design-exploration/b/project-1440-light.png) · [1440 dark](design-exploration/b/project-1440-dark.png) · [375 light](design-exploration/b/project-375-light.png) · [375 dark](design-exploration/b/project-375-dark.png) · [375 German](design-exploration/b/project-375-light-de.png) |
| C · Control room | [1440 dark](design-exploration/c/home-1440-dark.png) · [375 dark](design-exploration/c/home-375-dark.png) · [375 German](design-exploration/c/home-375-dark-de.png) | [1440 dark](design-exploration/c/project-1440-dark.png) · [375 dark](design-exploration/c/project-375-dark.png) · [375 German](design-exploration/c/project-375-dark-de.png) |
| D · Minimal paper | [1440 light](design-exploration/d/home-1440-light.png) · [1440 dark](design-exploration/d/home-1440-dark.png) · [375 light](design-exploration/d/home-375-light.png) · [375 dark](design-exploration/d/home-375-dark.png) · [375 German](design-exploration/d/home-375-light-de.png) | [1440 light](design-exploration/d/project-1440-light.png) · [1440 dark](design-exploration/d/project-1440-dark.png) · [375 light](design-exploration/d/project-375-light.png) · [375 dark](design-exploration/d/project-375-dark.png) · [375 German](design-exploration/d/project-375-light-de.png) |
