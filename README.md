# portfolio-site

Patrick Diaz's portfolio site (AI/LLM engineering). The first piece is Vision, a self-hosted agent harness.

Status: planned, nothing built. Start with [docs/PLAN.md](docs/PLAN.md); the design is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), the decisions in [docs/DECISIONS.md](docs/DECISIONS.md), the sources in [docs/RESEARCH.md](docs/RESEARCH.md), and Patrick's own steps in [docs/STEPS.md](docs/STEPS.md).

## Checks

- `pnpm install` installs the pinned tools and points git at `.githooks` (pre-commit: scan of staged files; pre-push: `pnpm check` plus a scan of every commit being pushed).
- `pnpm check` runs types, schemas, links, a verbatim-copy warning against `sources/vision/` and the redaction scan (generic rules + pinned gitleaks; the private deny-list only when `REDACTION_DENYLIST` or `REDACTION_DENYLIST_FILE` is set).
  - Deny-list format: entries separated by line breaks, `|` or `;`; trimmed; empty entries and entries starting with `#` ignored. Case-insensitive, whole-word (no letter or digit directly before or after), literal text; whitespace inside an entry matches any whitespace. No accent or plural folding: list variants separately. The scan line prints `(deny-list: N entries)`, never the entries. Hits print the rule and `file:line`, never the matched text.
- `pnpm check` also checks the content in `pieces/` and `content/` against `src/content/schemas.ts` (fields, anchors, the four entry kinds for a built part, `related[]`, sources). `evals[]` holds aggregate numbers only, never individual cases or examples, and from held-out sets only totals (D19).
- `pnpm test:check` runs the planted-finding and verbatim-copy tests.
- `pnpm build` builds the static site into `dist/` (Astro) and scans `dist/`; Cloudflare deploys it with `wrangler.jsonc` on merges to `main` (D7).
- `pnpm design-check` (after `pnpm build`) serves `dist/`, runs axe-core (WCAG 2 A/AA) on every page, fails on any request to another host, and saves desktop and phone screenshots to `.cache/screens/`. It uses the cloud VM's preinstalled Playwright; the CI gate comes with PLAN 1.8.
- `pnpm check-tools` prints the toolchain versions and fails on Node < 22.23.4.
- gitleaks is built from `tools/gitleaks` (pinned in `go.mod`/`go.sum`), so Go ≥ 1.24 must be on `PATH`; Go fetches the exact toolchain it needs.
