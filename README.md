# portfolio-site

Patrick Diaz's portfolio site (AI/LLM engineering). The first piece is Vision, a self-hosted agent harness.

Status: planned, nothing built. Start with [docs/PLAN.md](docs/PLAN.md); the design is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), the decisions in [docs/DECISIONS.md](docs/DECISIONS.md), the sources in [docs/RESEARCH.md](docs/RESEARCH.md), and Patrick's own steps in [docs/STEPS.md](docs/STEPS.md).

## Checks

- `pnpm install` installs the pinned tools and points git at `.githooks` (pre-commit: scan of staged files; pre-push: `pnpm check` plus a scan of every commit being pushed).
- `pnpm check` runs types, schemas, links and the redaction scan (generic rules + pinned gitleaks; the private deny-list only when `REDACTION_DENYLIST` or `REDACTION_DENYLIST_FILE` is set). Hits print the rule and `file:line`, never the matched text.
- `pnpm test:check` runs the planted-finding tests.
- gitleaks is built from `tools/gitleaks` (pinned in `go.mod`/`go.sum`), so Go ≥ 1.24 must be on `PATH`; Go fetches the exact toolchain it needs.
