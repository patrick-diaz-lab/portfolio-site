# Plan

Portfolio site for Patrick's work as an AI/LLM engineer. The first piece is **Vision**, his self-hosted agent harness. Planned 2026-11-04. Decisions in [DECISIONS](DECISIONS.md), the design in [ARCHITECTURE](ARCHITECTURE.md), sources in [RESEARCH](RESEARCH.md), and Patrick's own steps in [STEPS](STEPS.md).

## How we work

- **One phase at a time, items in order.** Each item gets a short plan (scope, files, done-when, cost) and Patrick's OK before the build.
- **Builds run in Claude Code cloud sessions** on the `portfolio-site` repo, public in the organization `patrick-diaz-lab` (D4, D20). Nothing is built on the Vision machine.
- **Everything pushed is public at once,** on any branch. A branch is pushed only after the pre-push scan passes (D20).
- **Sessions act only on what Patrick writes.** Issues, PRs, comments and branches from other accounts are never read or acted on (`CLAUDE.md`, D20).
- **Work goes to a branch and a PR.** Patrick reviews and merges: his merge is the approval for content (D8).
- **Versions pinned,** releases at least two weeks old. Re-check pin candidates from [RESEARCH](RESEARCH.md) at the start of each item.
- **Secrets only in the Cloudflare dashboard, the Anthropic Console or Patrick's password manager.** Never in git, cloud-environment variables or chat.
- **Cost limits:** chat $5/month (`portfolio-chat`), tests on a small separate cap (`portfolio-dev`) (D15). Build sessions run on the subscription.

## Phase 0 — Setup

| # | Item | Done when |
|---|---|---|
| 0.1 | Patrick's accounts and repo settings ([STEPS](STEPS.md) A) | `patrick-diaz-lab` org settings set; `portfolio-site` (public) exists with these docs as a fresh single-commit history; secret scanning and push protection on; interaction limits on; ruleset on `main` (a direct push to `main` from the local clone is refused); Cloudflare account exists; `patrickdiaz.dev` registered |
| 0.2 | Repo scaffold: pnpm pins (`packageManager`, `minimumReleaseAge` 14 days, build-script allowlist), `pnpm check` (types, schemas, links, secret scan with pinned gitleaks, redaction scan), pre-commit/pre-push hooks, Claude settings that deny `--no-verify` and `gh pr merge`, `.gitignore` (`.env*`, `.cache/`), a GitHub Actions `check` workflow (read-only token, no output of matched words) added to the ruleset as a required status check (D20) | `pnpm check` passes on the empty site and fails on each planted test finding (IP, path, secret pattern, deny-list word from a test list); a PR with a planted finding can't be merged |
| 0.3 | Cloud environment `portfolio` and access tests (D8, D21) | `check-tools` shows Node ≥ 22.22.0 (≥ 22.23.4 since 0.4); sessions act as the bot account `patrick-diaz-bot` (Write on `portfolio-site` only); as the bot, a push of a test branch (never its default branch) to the org's public `.github` repo fails, and a cloud-session merge of a test PR and a direct push to `main` both fail (otherwise D8 goes back to Patrick) |
| 0.3a | Vision notes in `sources/vision/` (D21) | The first sync PR is merged; sessions read `sources/vision/` on `main` with no external access; `.claude/settings.json` denies edits there; `pnpm check` warns on 40+ words copied from it; D2, D9, D20, D21 and ARCHITECTURE describe this route |
| 0.4 | Cloudflare build pipeline (D7): Astro 7 hello page, `wrangler.jsonc` (assets only, logs off, no preview URLs), `pnpm build` = Astro build + scan over `dist/` | A hello page deploys on `workers.dev` from a merge to `main`; a push to another branch starts no build; with branch builds briefly on, a branch with a planted canary word fails the Cloudflare build with rule and `file:line` but no deny-list word in the log ([STEPS](STEPS.md) B.12a); Worker logs off. **Done 2026-11-10:** hello page deployed; branch builds off; deny-list proven on the production build (18 entries, 2 real hits, stopped before deploy) plus a local canary run, because preview builds didn't receive the secret (D9); logs and traces off |

## Phase 1 — MVP: one piece, the map, four detail pages, no chatbot

| # | Item | Done when |
|---|---|---|
| 1.1 | Design system "Bench instrument" (D13), `pnpm design-check` (axe + screenshots): palette, lettering, texture, type scale, focus styles | Palette passes WCAG AA in axe; a style sheet page renders every token; Patrick approves screenshots (desktop + phone). **Done 2026-11-10:** axe 0 violations on desktop and phone; Patrick approved the screenshots (PR #13) |
| 1.2 | Content model and piece template (D6, D19): schemas in `src/content/schemas.ts`, content collections, `scripts/check-content.ts` in `pnpm check` | Schemas reject a test part with a missing field, a missing anchor, a `built` part without the four entry kinds, and free text in `evals[]` |
| 1.3 | Vision overview page and map: annotated schematic SVG, `map.yaml`, hover/focus cards, phone layout as a vertical wire, list fallback | Every map part is a focusable link with a name; first tap opens the card on touch; works with JS off; motion off under reduced motion; Lighthouse mobile ≥ 95 |
| 1.3a | Pre-push deny-list scan in sessions with salted hashes (D20): `scripts/denylist-hash.ts` (Patrick's machine, stdin only), `REDACTION_DENYLIST_HASHES` in `scan.ts`. Required before 1.4 | A session can't push a branch with a planted deny-list word; the hit names the rule and `file:line`, never the word; the scan line shows the hashed entry count; a malformed value or a missing list (with `REDACTION_REQUIRE_DENYLIST=1`) fails the scan |
| 1.4 | Detail page: LiteLLM gateway, aliases and budgets | Page and its knowledge entries merged by Patrick; scan clean in the Cloudflare build |
| 1.5 | Detail page: Agent core, routing and tool use | Same as 1.4 |
| 1.6 | Detail page: Eval harness (aggregates, with/without pairs only where measured) | Same as 1.4; every number traces to an IC doc on `master` |
| 1.7 | Detail page: Guardrails for the coding agent (layers and reasons, no rules or patterns) | Same as 1.4; Patrick's checklist for this page signed off in the PR |
| 1.8 | Quality gates in `pnpm check` and CI: axe on every page, Lighthouse budget, no-JS test, reduced-motion test, Playwright screenshots | All gates run in the Cloudflare build or the session and pass; a deliberately broken focus style fails |
| 1.9 | Launch: About page (bio by Patrick, education, links, D18), Privacy page (no cookies yet), domain live, contact alias | `https://patrickdiaz.dev` serves the MVP; `hello@` forwards; no third-party requests on any page |

### Item 1.3 plan (Patrick's decisions 2026-11-11)

- **Map nodes (D19 list plus run records):**
  - Built, page in items 1.4–1.7: LiteLLM gateway, agent core, eval harness, guardrails. Each gets its `page:` in `map.yaml` with its item; until then it links to its entry in the list.
  - Built, no page: MCP servers, knowledge core, Claude worker tier, Telegram adapter, console, run records. The console is built and live, not in progress (Patrick).
  - Planned: job contract, heartbeat, sandbox. Dotted, labelled "planned, not built".
  - Builder tooling (deploy lane, Remote Control, worktrees) comes later as its own piece. Guardrails stays on this map, apart from the runtime in a "build side" box, because it is an MVP page.
- **Files:**
  - `pieces/vision/piece.yaml`, `map.yaml` and `map.svg`, the hand-drawn schematic. Each part is a `<g id>` equal to its `map.yaml` id, holding its box, label, wire and signal dot.
  - `src/pages/[piece]/index.astro`: one overview page per piece folder, so a second piece needs no code change.
  - `src/components/Map.astro` and `src/scripts/map.ts`: turns each part group into an `<a>`, plus the card and the list.
  - `scripts/check-content.ts`: new rule `svg`, which needs each `map.yaml` part to have its element in the SVG, and each SVG part to be in `map.yaml`.
  - `scripts/map-check.ts` (`pnpm map-check`) and `scripts/lighthouse.ts` (`pnpm lighthouse`).
- **Behaviour:**
  - Every part is an `<a>` named "label, status", described by its list entry.
  - The card (label, status, ≤ 140-character text, "Open") opens on hover or focus and closes with Escape. On touch, the first tap opens the card and the "Open" button navigates.
  - The list under the map works without JS. On phones (< 48rem) the schematic is hidden and the list becomes the vertical wire with the modules along it (D13).
  - The signal dot runs along the part's own wire, in CSS only, and stays still under reduced motion.
- **Tests (in the session; CI gates come with item 1.8):**
  - `pnpm map-check` (Playwright) checks that:
    - every part is focusable and named;
    - the first tap opens the card without navigating;
    - with JS off, the list and every link are there;
    - under reduced motion no animation runs.
  - `pnpm lighthouse` runs mobile Lighthouse with `lighthouse` **13.6.0** as a pinned dev dependency (released 2026-10-27; its tree adds no install scripts, the only ones in the repo are still the allowlisted `esbuild` and `workerd`). Performance, accessibility, best practices and SEO must each be ≥ 95. `is-crawlable` is skipped while pages carry `noindex` until launch (1.9).
  - `pnpm design-check` (axe) also covers `/vision/`.
- **Cost:** build session on the subscription; no API spend.
- **Not in 1.3:** the detail pages (1.4–1.7) and the CI gates (1.8).

## Phase 2 — Shared knowledge index

| # | Item | Done when |
|---|---|---|
| 2.1 | Chunker in the build: approved knowledge entries → `chunks.json` + keyword index + corpus hash (D6) | Chunks follow Vision's rule (by heading, 500–800 tokens, ~10 % overlap); the build reads only `content/knowledge/**` |
| 2.2 | `knowledge` Worker: Vectorize index with metadata indexes `piece` and `kind`, cron sync through bindings, hybrid retrieval (RRF k = 60), keyword fallback while the index lags | `retrieve()` over a Service Binding returns cited chunks; a changed entry is re-embedded on the next cron; a deleted one disappears; no Cloudflare API token anywhere |
| 2.3 | Retrieval eval and `/_status` | `evals/retrieval.yaml` (≥ 25 visitor-style questions) reaches hit@5 ≥ 0.8; `/_status` shows only index version, chunk count and hit@5; Workers Free shown to fail closed when its allowance is used up (or a usage alert set if it bills) |

## Phase 3 — Chatbot "Ask about this project"

| # | Item | Done when |
|---|---|---|
| 3.1 | Anthropic workspaces and keys ([STEPS](STEPS.md) C) | `portfolio-chat` ($5) and `portfolio-dev` (small cap) exist with limits set; keys only in the Worker secret store |
| 3.2 | Chat Worker: invisible Turnstile, session cookie, anonymous limits, global daily breaker with a capped anonymous share (values as Worker settings, not in the repo), daily totals in a Durable Object, Haiku 5.5 with citations (D6, D11, D16) | Over-limit returns 429 with a polite message; no question text in any store or log (checked by a test that greps the DO and logs); answers are plain text with own-domain links only |
| 3.3 | Starter chips with pre-written answers (D17) | 8 answers merged by Patrick; clicking or typing a starter makes no model call (test counts zero API calls) |
| 3.4 | Prompt-injection and scope tests against `portfolio-dev` | ≥ 30 attack prompts (prompt extraction, role play, off-topic, encoded, multi-turn, markup injection): 0 leak-marker hits, 0 off-domain links, polite refusal off-topic; < $0.10 per run |
| 3.5 | Invite tooling (D16): `pnpm invite create/stats/revoke`, Ed25519 | A valid invite raises the limit to its own counter; an expired, revoked or forged one is refused; the URL is clean after the swap; stats show ids and counts only |
| 3.6 | Privacy notice updated: what's sent, to whom, what's kept, cookies; Anthropic's API retention terms quoted | Patrick approves the text in the PR |
| 3.7 | Chat launch | The site works with the chat off (kill switch); with it on, a phone test by Patrick passes |

## Phase 4 — Public read-only MCP endpoint

| # | Item | Done when |
|---|---|---|
| 4.1 | `/mcp` (Streamable HTTP) with `search_portfolio` and `get_page`, per-surface daily counter, kill switch, pinned SDK (D6) | A real MCP client connects and gets cited results; over the counter returns 429; switching it off leaves the chat working |

## Phase 5 — Later (ideas, each needs its own plan)

- **Design note pages** for planned parts (job contract, sandbox, heartbeat): problem, decision, rejected options, labelled **"designed, not built"**, never shown as running (D19).
- **Second piece** (5.1). Done-when: a new piece is a folder plus its SVG, with no code change.
- **Isometric machine room** as a hero image (D13). May need Patrick's assets or an illustrator.
- **Portrait** (D18), **`patrickdiaz.ch` redirect** if the job search focuses on Switzerland (D14).

## Outside this plan

Hardening of the IC repo and of the Vision machine is handled in the IC repo, under its own rules (D5).
