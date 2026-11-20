// Metric chip values and notes (D19: aggregates only), per language (PLAN 1.9a). Shared by
// the piece overview and the homepage's featured card. Swiss number style: 0.875 in both.
// A chip with a baseline shows the change in percent, with before → after in its note
// (Patrick, 2026-11-12): "−65%" in English, "−65 %" in German.
// A share measured on n cases reads "k of n" (Patrick, 2026-11-20), as on the part pages.
import { t, type Locale } from "../i18n/ui.ts";
import { casesOf } from "./evals.ts";

type Chip = { metric: string; value: number; n?: number; baseline?: number; note?: string; as_of: string };

const money = (v: number) => "$" + v.toFixed(3);

export function chipValue(c: Chip, locale: Locale): string {
  const of = t(locale, "part.of");
  if (c.baseline !== undefined) {
    const pct = Math.round(((c.value - c.baseline) / c.baseline) * 100);
    return `${pct < 0 ? "−" : "+"}${Math.abs(pct)}${locale === "de" ? " %" : "%"}`;
  }
  if (c.metric === "count") return `${c.value} ${of} ${c.n}`;
  if (c.metric === "total") return String(c.value);
  if (c.metric === "cost_usd") return "$" + String(c.value);
  if (c.metric === "seconds") return `${c.value} s`;
  const k = casesOf(c.metric, c.value, c.n);
  if (k !== undefined) return `${k} ${of} ${c.n}`;
  return c.value.toLocaleString(locale === "de" ? "de-CH" : "en", { minimumFractionDigits: 1, maximumFractionDigits: 3 });
}

export function chipNote(c: Chip, locale: Locale): string {
  const asOf = `${t(locale, "chip.asOf")} ${c.as_of}`;
  const lead = c.note ? `${c.note} · ` : "";
  if (c.baseline !== undefined) {
    const fmt = (v: number) => (c.metric === "cost_usd" ? money(v) : String(v));
    return `${lead}${fmt(c.baseline)} → ${fmt(c.value)} · ${asOf}`;
  }
  // "27 of 27" already carries its case count.
  const saysN = c.metric === "count" || casesOf(c.metric, c.value, c.n) !== undefined;
  return saysN || c.n === undefined ? `${lead}${asOf}` : `${lead}n = ${c.n} · ${asOf}`;
}
