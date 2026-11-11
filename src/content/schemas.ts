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

/** One measured number. Aggregates only: no case text, ids or examples (D19). */
export const evalSchema = z.strictObject({
  name: z.string().max(48, "must be at most 48 characters").regex(SLUG, "must be a lowercase slug (a-z, 0-9, hyphens)"),
  metric: z.enum(METRICS),
  value: z.number().finite(),
  n: z.number().int().positive(),
  date: isoDate,
  baseline: z.number().finite().optional(),
  cost_usd: z.number().finite().nonnegative().optional(),
});

/** A metric chip on a piece's overview page (item 1.3 follow-up): one aggregate number,
 *  sourced from sources/vision/, with the date it holds for. No case text (D19). */
export const chipSchema = z.strictObject({
  label: text(40),
  metric: z.enum(METRICS),
  value: z.number().finite(),
  n: z.number().int().positive(),
  sources: z.array(sourcePath).min(1),
  as_of: isoDate,
});

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
  sources: z.array(sourcePath).min(1),
  as_of: isoDate,
  source_commit: sha,
});

export type Part = z.infer<typeof partSchema>;
export type Knowledge = z.infer<typeof knowledgeSchema>;
