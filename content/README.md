# Content

Written content for each piece, checked by `pnpm check` (`scripts/check-content.ts`) against the schemas in `src/content/schemas.ts` (PLAN 1.2). The layout is in [ARCHITECTURE](../docs/ARCHITECTURE.md#3-content-model-the-reusable-piece-template).

- `parts/<piece>/<part>.mdx`: one detail page per part, frontmatter plus the page text.
- `knowledge/<piece>/<id>.md`: one entry per decision, rejected option, testing note or lesson. Each part page renders its own entries under their anchors.

Everything here is rewritten from `sources/vision/`, never pasted (D9, D21). `evals[]` holds aggregate numbers only, never individual cases or examples, and never anything from a held-out set beyond its totals (D19).
