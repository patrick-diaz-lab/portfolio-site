// Interface text in English and German (PLAN 1.9a). German is written, not machine-pasted,
// and goes through the same scans. A key missing in German is a type error.
export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

const en = {
  "site.name": "Patrick Diaz",
  "site.role": "AI agent systems",
  "lang.switch": "Language",
  "lang.en": "English",
  "lang.de": "Deutsch",
  "piece.label": "Piece",
  "piece.asOf": "As of",
  "piece.measured": "Measured results",
  "piece.openMap": "Open the map",
  "home.pieces": "All pieces",
  "chip.asOf": "as of",
  "map.schematic": "Schematic",
  "map.allParts": "All parts",
  "map.readPage": "Read the page",
  "map.prev": "Previous",
  "map.next": "Next",
  "map.selected": "Selected part",
  "map.englishPage": "",
  "line.surfaces": "Surfaces",
  "line.core": "Core",
  "line.models-and-tools": "Models and tools",
  "line.build-side": "Build side",
  "line.parts": "Parts",
  "footer.privacy": "Privacy",
  "footer.contact": "Contact",
} as const;

export type UiKey = keyof typeof en;

const de: Record<UiKey, string> = {
  "site.name": "Patrick Diaz",
  "site.role": "KI-Agent-Systeme",
  "lang.switch": "Sprache",
  "lang.en": "English",
  "lang.de": "Deutsch",
  "piece.label": "Projekt",
  "piece.asOf": "Stand",
  "piece.measured": "Gemessene Ergebnisse",
  "piece.openMap": "Zur Übersicht",
  "home.pieces": "Alle Projekte",
  "chip.asOf": "Stand",
  "map.schematic": "Schema",
  "map.allParts": "Alle Teile",
  "map.readPage": "Zur Seite",
  "map.prev": "Zurück",
  "map.next": "Weiter",
  "map.selected": "Gewählter Teil",
  "map.englishPage": "(Englisch)",
  "line.surfaces": "Eingänge",
  "line.core": "Kern",
  "line.models-and-tools": "Modelle und Werkzeuge",
  "line.build-side": "Bauseite",
  "line.parts": "Teile",
  "footer.privacy": "Datenschutz",
  "footer.contact": "Kontakt",
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, de };

export const t = (locale: Locale, key: UiKey) => ui[locale][key];

/** The path of a page in a locale: English has no prefix, German lives under /de/. */
export const localePath = (locale: Locale, path: string) => (locale === "en" ? path : `/de${path}`);

/** A line name (map.yaml `line`) in a locale, or the slug made readable. */
export function lineName(locale: Locale, line: string): string {
  const key = `line.${line}` as UiKey;
  if (key in ui[locale]) return ui[locale][key];
  return (line.charAt(0).toUpperCase() + line.slice(1)).replace(/-/g, " ");
}
