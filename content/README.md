# Content

Written content for each piece, checked by `pnpm check` (`scripts/check-content.ts`) against the schemas in `src/content/schemas.ts` (PLAN 1.2). The layout is in [ARCHITECTURE](../docs/ARCHITECTURE.md#3-content-model-the-reusable-piece-template).

- `parts/<piece>/<part>.mdx`: one detail page per part, frontmatter plus the page text.
- `knowledge/<piece>/<part>/NN-<id>.md`: one entry per decision, rejected option, testing note or lesson. Each part page renders its own entries under their anchors, in file-name order. A `rejected` entry names the decision it lost to in `lost_to`, and renders right under it. Each entry starts with its heading: `###` for decisions, testing notes and lessons, `#### Rejected: …` for rejected options.

Everything here is rewritten from `sources/vision/`, never pasted (D9, D21). `evals[]` holds aggregate numbers only, never individual cases or examples, and never anything from a held-out set beyond its totals (D19).
