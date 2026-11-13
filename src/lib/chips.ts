// Metric chip values and notes (D19: aggregates only), per language (PLAN 1.9a). Shared by
// the piece overview and the homepage's featured card. Swiss number style: 0.875 in both.
// A chip with a baseline shows the change in percent ("−65 %"), with before → after in its
// note (Patrick, 2026-11-12).
import { t, type Locale } from "../i18n/ui.ts";

type Chip = { metric: string; value: number; n?: number; baseline?: number; as_of: string };

const money = (v: number) => "$" + v.toFixed(3);

export function chipValue(c: Chip, locale: Locale): string {
  if (c.baseline !== undefined) {
    const pct = Math.round(((c.value - c.baseline) / c.baseline) * 100);
    return `${pct < 0 ? "−" : "+"}${Math.abs(pct)} %`;
  }
  if (c.metric === "count") return `${c.value} ${locale === "de" ? "von" : "of"} ${c.n}`;
  if (c.metric === "cost_usd") return "$" + String(c.value);
  if (c.metric === "seconds") return `${c.value} s`;
  return c.value.toLocaleString(locale === "de" ? "de-CH" : "en", { minimumFractionDigits: 1, maximumFractionDigits: 3 });
}

export function chipNote(c: Chip, locale: Locale): string {
  const asOf = `${t(locale, "chip.asOf")} ${c.as_of}`;
  if (c.baseline !== undefined) {
    const fmt = (v: number) => (c.metric === "cost_usd" ? money(v) : String(v));
    return `${fmt(c.baseline)} → ${fmt(c.value)} · ${asOf}`;
  }
  return c.metric === "count" || c.n === undefined ? asOf : `n = ${c.n} · ${asOf}`;
}
