// Metric chip values and notes (D19: aggregates only), per language (PLAN 1.9a). Shared by
// the piece overview and the homepage's featured card. Swiss number style: 0.875 in both.
import { t, type Locale } from "../i18n/ui.ts";

type Chip = { metric: string; value: number; n: number; as_of: string };

export function chipValue(c: Chip, locale: Locale): string {
  if (c.metric === "count") return `${c.value} / ${c.n}`;
  if (c.metric === "cost_usd") return "$" + String(c.value);
  if (c.metric === "seconds") return `${c.value} s`;
  return c.value.toLocaleString(locale === "de" ? "de-CH" : "en", { minimumFractionDigits: 1, maximumFractionDigits: 3 });
}

export function chipNote(c: Chip, locale: Locale): string {
  const asOf = `${t(locale, "chip.asOf")} ${c.as_of}`;
  return c.metric === "count" ? asOf : `n = ${c.n} · ${asOf}`;
}
