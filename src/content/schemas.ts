// Content schemas for the piece template (PLAN 1.2, D6, D19). One set of rules, used by
// both the Astro build (src/content.config.ts) and `pnpm check` (scripts/check-content.ts).
// Every object is strict: an unknown key is an error, so no free text slips in.
import { z } from "astro/zod";

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SHA = /^[0-9a-f]{40}$/;
export const STATUSES = ["built", "in-progress", "planned"] as const;
export const KINDS = ["overview", "decision", "rejected", "testing", "learning"] as const;
/** The four kinds a `built` part with a page must have at least one of each (D19). */
export const REQUIRED_KINDS = ["decision", "rejected", "testing", "learning"] as const;
/** evals[] metrics (Patrick, 2026-11-10). Aggregates only, never cases (D19). */
export const METRICS = ["accuracy", "hit_at_5", "mrr", "rate", "count", "cost_usd", "seconds"] as const;

const slug = z.string().regex(SLUG, "must be a lowercase slug (a-z, 0-9, hyphens)");
const text = (max: number) => z.string().trim().min(1).max(max);

// YAML frontmatter may hand a date over as a Date object (Astro) or a string (yaml).
const isoDate = z.preprocess(
  (v) => (v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)")
    .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s), "must be a real date"),
);
const sha = z.string().regex(SHA, "must be a full 40-character commit hash");
const sourcePath = z
  .string()
  .regex(/^sources\/vision\/[\w./-]+\.md$/, "must be a Markdown file under sources/vision/")
  .refine((p) => !p.includes(".."), "must not contain ..");

/** One measured number. Aggregates only: no case text, ids or examples (D19).
 *  `n` is the case count; a count needs it, other metrics may lack it where the notes give
 *  none (a median time). `baseline` is the value before a change, and `baseline_n` the case
 *  count it was measured on, where that differs (1 of 2 before, 0 of 12 after). */
export const evalSchema = z
  .strictObject({
    name: z.string().max(48, "must be at most 48 characters").regex(SLUG, "must be a lowercase slug (a-z, 0-9, hyphens)"),
    metric: z.enum(METRICS),
    value: z.number().finite(),
    n: z.number().int().positive().optional(),
    date: isoDate,
    baseline: z.number().finite().optional(),
    baseline_n: z.number().int().positive().optional(),
    cost_usd: z.number().finite().nonnegative().optional(),
  })
  .refine((e) => e.metric !== "count" || e.n !== undefined, { message: "a count needs n", path: ["n"] })
  .refine((e) => e.baseline_n === undefined || e.baseline !== undefined, { message: "baseline_n needs a baseline", path: ["baseline_n"] });

/** A headline number at the top of a part page (layout 3, Patrick 2026-11-13): an eval of
 *  the same part, by name, with a short label. */
export const readoutSchema = z.strictObject({
  eval: slug,
  label: text(48),
});

/** A figure on a part page (layout 3, Patrick 2026-11-13): a hand-drawn SVG in the map's
 *  style under pieces/<piece>/figures/, an optional narrow version for phones, the text a
 *  screen reader gets, and the caption. Numbered FIG. <part>.<n> on the page. */
export const figureSchema = z.strictObject({
  svg: z.string().regex(/^[a-z0-9-]+\.svg$/, "must be a file name like agent-core-1.svg"),
  svg_narrow: z.string().regex(/^[a-z0-9-]+\.svg$/, "must be a file name like agent-core-1-narrow.svg").optional(),
  alt: text(400),
  caption: text(300),
});

/** A metric chip on a piece's overview page (item 1.3 follow-up): one aggregate number,
 *  sourced from sources/vision/, with the date it holds for. No case text (D19). */
export const chipSchema = z
  .strictObject({
    label: text(40),
    metric: z.enum(METRICS),
    value: z.number().finite(),
    /** Case count. Required for a count; optional where the notes give none (a per-case cost). */
    n: z.number().int().positive().optional(),
    /** The value before a change: the chip then shows the change in percent (Patrick, 2026-11-12). */
    baseline: z.number().finite().positive().optional(),
    sources: z.array(sourcePath).min(1),
    as_of: isoDate,
  })
  .refine((c) => c.metric !== "count" || c.n !== undefined, { message: "a count chip needs n", path: ["n"] });

export const pieceSchema = z.strictObject({
  id: slug,
  title: text(80),
  tagline: text(120),
  summary: text(300),
  status: z.enum(STATUSES),
  as_of: isoDate,
  source_commit: sha,
  order: z.number().int().nonnegative(),
  map_svg: z.string().regex(/^[\w-]+\.svg$/, "must be an .svg file name in the piece folder"),
  chat_enabled: z.boolean(),
  chips: z.array(chipSchema).max(4, "at most 4 chips").default([]),
});

export const mapSchema = z.strictObject({
  parts: z
    .array(
      z.strictObject({
        id: slug,
        label: text(40),
        hover: text(140),
        page: z.string().regex(/^\/[a-z0-9-]+\/[a-z0-9-]+\/$/, "must be a part page path like /vision/litellm-gateway/").optional(),
        status: z.enum(STATUSES),
        line: slug.optional(),
      }),
    )
    .min(1),
});

// German overlays (PLAN 1.9a): only the translatable text of a piece, next to the English
// files. Numbers, ids, pages and status stay in the base files. `pnpm check` (rule i18n)
// holds an overlay to the base: same part ids, same chip count, every schematic text.
export const pieceOverlaySchema = z.strictObject({
  title: text(80),
  tagline: text(120),
  summary: text(300),
  chips: z.array(text(40)).max(4).default([]),
});

export const mapOverlaySchema = z.strictObject({
  aria_label: text(120),
  parts: z.record(z.string().regex(SLUG), z.strictObject({ label: text(40), hover: text(140) })),
  svg_text: z.record(z.string().regex(SLUG), text(80)).default({}),
});

/** The homepage text per language (content/home/<locale>.yaml, PLAN 1.9a). Patrick edits it. */
export const homeSchema = z.strictObject({
  title: text(80),
  description: text(160),
  positioning: text(140),
  background: z.array(text(400)).min(1).max(3),
  featured: z.strictObject({ piece: slug, cta: text(40) }),
  work_heading: text(40),
  work: z
    .array(z.strictObject({ title: text(60), text: text(160), href: z.string().regex(/^\/[a-z0-9/-]*$/, "must be a site path") }))
    .min(3)
    .max(4),
  contact_heading: text(40),
  contact_text: text(200),
  cv: text(80),
});

export const partSchema = z.strictObject({
  id: slug,
  piece: slug,
  title: text(80),
  summary: text(200),
  status: z.enum(STATUSES),
  as_of: isoDate,
  source_commit: sha,
  sources: z.array(sourcePath).min(1),
  evals: z.array(evalSchema).default([]),
  /** Up to 4 evals shown as readouts under the page's header (layout 3). */
  readouts: z.array(readoutSchema).max(4, "at most 4 readouts").default([]),
  figures: z.array(figureSchema).default([]),
  related: z.array(slug).default([]),
  /** Security pages (item 1.7): the page and its entries may name layers and reasons only.
   *  `pnpm check` then refuses code, paths, command-line flags and file names in them. */
  layers_only: z.boolean().optional(),
});

export const knowledgeSchema = z.strictObject({
  id: slug,
  piece: slug,
  part: slug,
  page: z.string().regex(/^\/[a-z0-9-]+\/[a-z0-9-]+\/$/, "must be a part page path like /vision/litellm-gateway/"),
  anchor: slug,
  kind: z.enum(KINDS),
  /** Rejected entries only: the id of the decision this option lost to, on the same part.
   *  The page renders it right under that decision (Patrick, 2026-11-11, item 1.4). */
  lost_to: slug.optional(),
  /** Learning entries only: an eval of the same part shown as the case's headline number,
   *  before → after (layout 3, Patrick 2026-11-13). */
  metric: slug.optional(),
  sources: z.array(sourcePath).min(1),
  as_of: isoDate,
  source_commit: sha,
});

export type Part = z.infer<typeof partSchema>;
export type Knowledge = z.infer<typeof knowledgeSchema>;
