// Eval numbers on part pages (D19: aggregates only). Shared by the table under "How it's
// tested", the readouts under the header and the case cards (layout 3, Patrick 2026-11-13).
import type { z } from "astro/zod";
import type { evalSchema } from "../content/schemas.ts";

export type Eval = z.infer<typeof evalSchema>;

/** Metrics on a 0–1 scale: their before → after can be drawn on one track. */
const SHARE = new Set(["accuracy", "hit_at_5", "mrr", "rate"]);

/** A share of n cases as the whole number of cases it stands for: 0.963 of 27 is 26. Only
 *  where the share really is k of n (to within the rounding of three decimals); MRR never is. */
export function casesOf(metric: string, v: number, n?: number): number | undefined {
  if (n === undefined || !SHARE.has(metric) || metric === "mrr") return undefined;
  const k = Math.round(v * n);
  return Math.abs(k / n - v) < 0.0006 ? k : undefined;
}

// A share measured on n cases reads "k of n" ("27 of 27", not "1.0": Patrick, 2026-11-20), and
// so does a count. A share without n keeps at least one decimal (1.0, not 1).
export function evalValue(metric: string, v: number, n?: number, digits?: number, of = "of"): string {
  if (metric === "cost_usd") return `$${digits === undefined ? v : v.toFixed(digits)}`;
  if (metric === "seconds") return v >= 60 ? `${Math.floor(v / 60)} min ${Math.round(v % 60)} s` : `${v} s`;
  if (metric === "total") return String(v);
  if (metric === "count") return n === undefined ? String(v) : `${v} ${of} ${n}`;
  const k = casesOf(metric, v, n);
  if (k !== undefined) return `${k} ${of} ${n}`;
  return v.toLocaleString("en", { minimumFractionDigits: 1, maximumFractionDigits: 4 });
}

/** Whether a value already carries its case count ("27 of 27"), so a note needn't repeat it. */
export const showsN = (e: Eval) => e.metric === "count" || casesOf(e.metric, e.value, e.n) !== undefined;

const decimals = (v: number) => (String(v).split(".")[1] ?? "").length;

/** The value before a change, on the case count it was measured on. A cost keeps as many
 *  decimals as the value after it ($0.040 → $0.014, not $0.04). */
export const evalBefore = (e: Eval, of = "of") =>
  e.baseline === undefined
    ? undefined
    : evalValue(e.metric, e.baseline, e.baseline_n ?? e.n, e.metric === "cost_usd" ? Math.max(decimals(e.value), decimals(e.baseline)) : undefined, of);

/** A slug made readable: "reply-language" → "Reply language". Only a fallback: every eval has
 *  a written label (`eval_labels`, `pnpm check`). */
export const evalName = (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)).replace(/-/g, " ");

/** Fewer cases than this on either side, and before → after stays text: a bar would draw
 *  1 of 2 as half a track (2026-11-20). */
export const TRACK_MIN_N = 10;

/** Before and after as shares of 0–1, when both can be drawn on one track. */
export function evalShares(e: Eval): { before: number; after: number } | undefined {
  if (e.baseline === undefined) return undefined;
  const nBefore = e.baseline_n ?? e.n;
  if ((e.n !== undefined && e.n < TRACK_MIN_N) || (nBefore !== undefined && nBefore < TRACK_MIN_N)) return undefined;
  if (SHARE.has(e.metric)) return { before: e.baseline, after: e.value };
  if (e.metric === "count" && e.n && nBefore) return { before: e.baseline / nBefore, after: e.value / e.n };
  return undefined;
}
