# portfolio-site

Patrick Diaz's portfolio site (AI/LLM engineering). The first piece is Vision, a self-hosted agent harness.

Status: planned, nothing built. Start with [docs/PLAN.md](docs/PLAN.md); the design is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), the decisions in [docs/DECISIONS.md](docs/DECISIONS.md), the sources in [docs/RESEARCH.md](docs/RESEARCH.md), and Patrick's own steps in [docs/STEPS.md](docs/STEPS.md).

## Checks

- `pnpm install` installs the pinned tools and points git at `.githooks` (pre-commit: scan of staged files; pre-push: `pnpm check` plus a scan of every commit being pushed).
- `pnpm check` runs types, schemas, links, a verbatim-copy warning against `sources/vision/` and the redaction scan (generic rules + pinned gitleaks; the private deny-list only when `REDACTION_DENYLIST` or `REDACTION_DENYLIST_FILE` is set).
  - Deny-list format: entries separated by line breaks, `|` or `;`; trimmed; empty entries and entries starting with `#` ignored. Case-insensitive, whole-word (no letter or digit directly before or after), literal text; whitespace inside an entry matches any whitespace. No accent or plural folding: list variants separately. The scan line prints `(deny-list: N entries)`, never the entries. Hits print the rule and `file:line`, never the matched text.
- `pnpm check` also checks the content in `pieces/` and `content/` against `src/content/schemas.ts` (fields, anchors, the four entry kinds for a built part, `related[]`, sources). `evals[]` holds aggregate numbers only, never individual cases or examples, and from held-out sets only totals (D19).
- In cloud sessions the plaintext list never exists: `REDACTION_DENYLIST_HASHES` holds salted scrypt hashes made by `scripts/denylist-hash.ts` on Patrick's machine (stdin only, Node standard library only; STEPS B.11a). The scan matches every whole-word run of 1 to `span` words against them and prints `(deny-list: N hashed entries, span K)`. Short entries are guessable from their hashes; Cloudflare's plaintext gate stays authoritative (D20).
- `pnpm test:check` runs the planted-finding and verbatim-copy tests.
- `pnpm build` builds the static site into `dist/` (Astro) and scans `dist/`; Cloudflare deploys it with `wrangler.jsonc` on merges to `main` (D7).
- `pnpm gates` (after `pnpm build`) runs every browser gate over `dist/`. It is the CI job `gates` and runs in sessions too (PLAN 1.8):
  - `pnpm design-check`: axe-core (WCAG 2.2 A/AA) on every page, desktop and phone; fails on any request to another host; saves screenshots to `.cache/screens/`.
  - `pnpm map-check`: every piece map's names, Tab order, cards, touch, links and click focus.
  - `pnpm page-check`: on every page, visible focus at every Tab stop, nothing missing with JS off, and no animation under reduced motion. `--self-test` hides every focus indicator and passes only if the focus gate then fails.
  - `pnpm lighthouse`: mobile, every category ≥ 95, and a size budget per page (script ≤ 5 KB, fonts ≤ 130 KB, total ≤ 250 KB, no other hosts).
- The browser is the pinned `playwright` (1.64.1) package's own Chromium. CI installs it with `pnpm exec playwright install --with-deps chromium`. In a cloud session, the gates fall back to the preinstalled Chromium under `PLAYWRIGHT_BROWSERS_PATH` when the pinned build is missing. No system Chrome is used.
- `pnpm check-tools` prints the toolchain versions and fails on Node < 22.23.4.
- gitleaks is built from `tools/gitleaks` (pinned in `go.mod`/`go.sum`), so Go ≥ 1.24 must be on `PATH`; Go fetches the exact toolchain it needs.
