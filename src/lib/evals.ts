// Eval numbers on part pages (D19: aggregates only). Shared by the table under "How it's
// tested", the readouts under the header and the case cards (layout 3, Patrick 2026-11-13).
import type { z } from "astro/zod";
import type { evalSchema } from "../content/schemas.ts";

export type Eval = z.infer<typeof evalSchema>;

/** Metrics on a 0–1 scale: their before → after can be drawn on one track. */
const SHARE = new Set(["accuracy", "hit_at_5", "mrr", "rate"]);

// Counts stay integers ("0 of 12", like the chip on the overview page); ratios keep at least
// one decimal (1.0, not 1).
export function evalValue(metric: string, v: number, n?: number): string {
  if (metric === "cost_usd") return `$${v}`;
  if (metric === "seconds") return `${v} s`;
  if (metric === "count") return n === undefined ? String(v) : `${v} of ${n}`;
  return v.toLocaleString("en", { minimumFractionDigits: 1, maximumFractionDigits: 4 });
}

/** The value before a change, on the case count it was measured on. */
export const evalBefore = (e: Eval) => (e.baseline === undefined ? undefined : evalValue(e.metric, e.baseline, e.baseline_n ?? e.n));

/** A slug made readable: "reply-language" → "Reply language". */
export const evalName = (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)).replace(/-/g, " ");

/** Before and after as shares of 0–1, when both can be drawn on one track. */
export function evalShares(e: Eval): { before: number; after: number } | undefined {
  if (e.baseline === undefined) return undefined;
  if (SHARE.has(e.metric)) return { before: e.baseline, after: e.value };
  if (e.metric === "count" && e.n && (e.baseline_n ?? e.n)) return { before: e.baseline / (e.baseline_n ?? e.n), after: e.value / e.n };
  return undefined;
}
