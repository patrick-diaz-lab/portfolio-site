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
  - Planned (job contract, heartbeat, sandbox): first drawn dotted; since the follow-up (2026-11-11) **only built parts render**, with no status labels or legend. `status` stays in the data model and the content check.
  - Builder tooling (deploy lane, Remote Control, worktrees) comes later as its own piece. Guardrails stays on this map, apart from the runtime in a "build side" box, because it is an MVP page.
- **Files:**
  - `pieces/vision/piece.yaml`, `map.yaml` and `map.svg`, the hand-drawn schematic. Each part is a `<g id>` equal to its `map.yaml` id, holding its box, label, wire and signal dot.
  - `src/pages/[piece]/index.astro`: one overview page per piece folder, so a second piece needs no code change.
  - `src/components/Map.astro` and `src/scripts/map.ts`: turns each part group into an `<a>`, plus the card and the list.
  - `scripts/check-content.ts`: new rule `svg`, which needs each `map.yaml` part to have its element in the SVG, and each SVG part to be in `map.yaml`.
  - `scripts/map-check.ts` (`pnpm map-check`) and `scripts/lighthouse.ts` (`pnpm lighthouse`).
- **Behaviour:**
  - Every part is an `<a>` named by its label, described by its list entry, with no underline; focus shows as the amber ring.
  - Follow-up (2026-11-11): metric chips under the intro (aggregates from `sources/vision/` with `as_of`), larger box labels, the gateway annotated with the local model on the GPU PC on the LAN.
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

### Item 1.4 plan (Patrick's OK 2026-11-11: build now, rejected options under their decision)

The first part page, which also builds the part-page template that items 1.5–1.7 reuse.

- **Source:** `sources/vision/deep/litellm-gateway.md` and the gateway section of `notes.md`, at `source_commit` `bb4fb37…` (2026-11-10). Everything is rewritten, never pasted (`pnpm check` warns at 40 copied words).
- **Held back until the next sync:**
  - The worker's network in the subscription exception: the note's wording is being corrected upstream. The page names the exception (own messages only, explicit command, daily cap of 30, clean workspace) and leaves out its network.
  - The 65 % prompt-caching cut: not in the note yet.

  A small PR adds both after the sync.
- **Files:**
  - `src/pages/[piece]/[part].astro`, the template. A header has the title, summary and "as of"; then the fixed sections:
    - *What it does*: the MDX body.
    - *Why this way*: `decision` and `rejected` entries.
    - *How it's tested*: `testing` entries and an `evals[]` table.
    - *What I learned*: `learning` entries.

    Each entry renders under its own anchor, with a back link to `/vision/`. The page is `noindex` until launch.
  - `content/parts/vision/litellm-gateway.mdx`: frontmatter plus a short *What it does*. `evals[]` holds aggregates from the note:
    - the first 31 chat runs cost $0.05 in total (`cost_usd`, n 31);
    - 40 classifier cases on `cheap` cost $0.0023 (`cost_usd`, n 40).
  - `content/knowledge/vision/litellm-gateway/NN-<id>.md`: 16 entries, each a short rewritten paragraph; the file names set the order on the page. Rejected entries name the decision they lost to in `lost_to` (option b), checked by the content rule `lost-to`.
    - Decisions:
      - aliases only;
      - prices pinned in config;
      - one key and budget per flow, under a global cap;
      - out of funds is its own outcome;
      - the subscription exception.
    - Rejected:
      - a provider key in each service;
      - LiteLLM's own price map;
      - a cap matching the credits;
      - a generic error;
      - the subscription as the default.
    - Testing:
      - out of credit and over budget each get their own outcome and reply;
      - the cold-reboot check;
      - the budget numbers.
    - Learning:
      - budgets that never fired;
      - the DNS race after a reboot (fixed upstream DNS; no router, VPN or LAN details);
      - the fallback I couldn't see.
  - `pieces/vision/map.yaml`: the gateway gets `page: /vision/litellm-gateway/`, so the map, the card's "Open" and the list link there.
- **Done when** (PLAN row 1.4, plus):
  - `pnpm check` passes. The gateway part has all four entry kinds, and no run of 40 or more words is copied.
  - axe finds 0 violations, desktop and phone.
  - Lighthouse mobile is ≥ 95 on `/vision/litellm-gateway/`.
  - `map-check` checks that "Open" on the gateway reaches the page.
  - The page works with JS off.
  - Patrick merges the page and its entries, and the Cloudflare build's scan is clean.
- **Cost:** build session on the subscription; no API spend.
- **Not in 1.4:** chunking and search (Phase 2), and the other part pages (1.5–1.7).

### Item 1.5 plan (Patrick's OK 2026-11-11, both proposals as written)

The agent core page, on the 1.4 template with no code change.

- **Source:** `sources/vision/deep/agent-core-routing.md` and the agent-core section of `notes.md`, at `source_commit` `bb4fb37…` (2026-11-10). Everything is rewritten, never pasted.
- **Held back until the next sync:** the rejected option "the gateway on the worker's network". It rests on the worker-network wording that is being corrected upstream, so it comes with the post-sync PR from 1.4. Two other worker points stay, because they don't depend on its network: the worker gets read-only tools, and it checks the tool stream.
- **Files:**
  - `content/parts/vision/agent-core.mdx`: frontmatter plus a short *What it does*.
  - `content/knowledge/vision/agent-core/NN-<id>.md`: 17 entries.

    | Kind | Entries |
    |---|---|
    | Decisions (5) | three tiers; one run step per model request; tools only on `smart` and the worker (read-only, at most 6 calls, wrapped as untrusted data); probe, short deadline, fallback to `smart`; chat context hygiene |
    | Rejected (6) | one model for everything; logging at the framework level; wrapping inside each server; a worker without tools; keeping the model loaded on the GPU PC; one prompt line for the reply language |
    | Testing (3) | the classifier evals; the agent eval (right source, planted instruction); latency |
    | Learning (3) | the classifier made me wait; a memory that never happened; one injection got through |

    Each rejected option has `lost_to`. The tools decision has two of them (wrapping inside each server, a worker without tools).
  - `evals[]` holds only rows with a stated case count:

    | Name | Metric | Value | n | Baseline |
    |---|---|---|---|---|
    | classifier `local`, dev | accuracy | 0.95 | 40 | |
    | classifier `local`, held-out | accuracy | 1.0 | 27 | |
    | classifier `cheap`, held-out | accuracy | 0.963 | 27 | |
    | planted instruction repeated | rate | 0 | 12 | 0.5 |
    | right source retrieved | rate | 1.0 | 18 | |

    Numbers without a case count stay in the testing text, not in the table: reply language 0.8 → 1.0, homelab questions 1.0, about 3 tool calls per question, median 6 s, 95th percentile 11.6 s.
  - `pieces/vision/map.yaml`: agent core gets `page: /vision/agent-core/`.
- **Wording rules:**
  - The "classifier made me wait" lesson says only that the GPU PC was unreachable. The cause (an update had reset its firewall rules) stays out, as a LAN-side detail.
  - Held-out results stay totals only (D19).
- **Done when:**
  - `pnpm check` passes: all four entry kinds, `lost_to` valid, no 40-word copies.
  - axe finds 0 violations, desktop and phone.
  - Lighthouse mobile is ≥ 95 on `/vision/agent-core/`.
  - `map-check` checks that the map and list link to the page and that it loads.
  - Patrick merges, and the Cloudflare build's scan is clean.
- **Cost:** build session on the subscription; no API spend.
- **Not in 1.5:** items 1.6 and 1.7, and the post-sync additions.

### Item 1.6 plan (Patrick's OK 2026-11-11, without classifier rows in the table)

The eval harness page, on the 1.4 template with no code change.

- **Source:** `sources/vision/deep/eval-harness.md` and the eval section of `notes.md`, at `source_commit` `bb4fb37…`. Everything is rewritten, never pasted.
- **Files:**
  - `content/parts/vision/eval-harness.mdx`
  - `content/knowledge/vision/eval-harness/NN-<id>.md`: 16 entries.

    | Kind | Entries |
    |---|---|
    | Decisions (5) | measure the production code; held-out sets are mine; code-checked metrics first; its own key and stop rules; scoped fixtures and a stop rule before tuning |
    | Rejected (4) | a prompt copy; one shared set; an LLM judge as the default; evals on the chat key. The fixtures decision has none. |
    | Testing (3) | the retrieval sets; the with-and-without results; what evals cost |
    | Learning (4) | result files leaked note names; the first comparison run failed on every case; a test that failed the right answer; a held-out set that wasn't independent |

  - `pieces/vision/map.yaml`: the eval harness gets `page: /vision/eval-harness/`.
- **`evals[]`:** only docs retrieval hit@5, held-out: 0.875 (n 16).
  - No classifier rows (Patrick): their v1 numbers next to agent core's v2 numbers would read as a contradiction. The text says the classifier results are on the agent core page and links it.
  - Numbers without a case count stay in the text.
- **Held back or changed:**
  - The eval key's "$5 per 30 days" is from before 2026-11-06, so it's dropped; the $2 stop per run stays.
  - "Can't reach the subscription worker" includes "not on its network", which waits for the sync (post-sync list).
  - The leaked-names lesson says "headed for publication", with no repo, note names or paths.
- **Done when:**
  - Every number traces to a file in `sources/vision/` (D21), listed in its entry's `sources`.
  - The rest matches 1.5: `pnpm check`, axe, Lighthouse ≥ 95 and the map-check link test, then Patrick's merge and a clean Cloudflare build scan.
- **Cost:** build session on the subscription; no API spend.

### Item 1.7 plan (Patrick's OK 2026-11-11, with the layers-only check)

The guardrails page, on the 1.4 template. **Layers and reasons only:** no rules, patterns, paths, file names, command examples, or any limit that would show how to get around a layer (Patrick).

- **Source:** `sources/vision/deep/guardrails.md` and the guardrail section of `notes.md`, at `bb4fb37…`. Everything is rewritten at the level of layers, never pasted.
- **What the page says:**

  | Note section | On the page |
  |---|---|
  | A check before every command | A check runs before every command and file access, and answers deny, ask or allow. Every hard rule names what to do instead. A refusal names its rule. |
  | Deny / ask | Categories only, with the reason: deny what can't be undone, ask what I should see. |
  | Pushes and merges | Four layers: the pre-run check, a second check at push time, a secret scan on every commit and push, and a merge only I perform. |
  | Working copies and deploy lane | Each session in its own working copy; one locked lane holds secrets and deploys. |
  | Honest limits | One layer among several, "a seatbelt, not a wall"; known gaps are tracked as open items and closed. |
  | Lesson "Claude spoke as me" | A test produced messages that looked like mine; now Claude never acts as my chat, and identity tests come from me. |
  | Lesson "Two sessions in one folder" | Process only. |
  | Lesson "A guardrail out of date" | A merged change wasn't in force everywhere; I measured instead of assuming; now there is one current copy, and a change that would block every session can't be merged. |

  Everything else in the note stays out, and what stays out isn't described here either (D19, layers-only everywhere).

- **Entries (13):**

  | Kind | Entries |
  |---|---|
  | Decisions (5) | a check before every command; deny the irreversible, ask what I should see; pushes and merges stay with me; one working copy per session, one locked lane; honest limits |
  | Rejected (3) | rules in text only; asking for everything; relying on the hosting side as the backstop (worded as "I couldn't count on it, so protection is local and written down", with no plan or product detail) |
  | Testing (2) | hook tests grew from 106 to 768, and a new deny must fail on the previous version; the pre-push tests |
  | Learning (3) | the three lessons above |

- **`evals[]`:** pre-push hook tests passing, rate 1.0 (n 24). The test counts stay in the text.
- **Layers-only check (proposed):** a new optional `layers_only: true` on a part. For such a part, `pnpm check` fails on any of these in its page or its entries:
  - inline or fenced code;
  - path-like strings;
  - command-line flags;
  - file extensions.

  It gets tests. This makes the rule hold for later edits too, not only in this review.
- **Lessons (Patrick, 2026-11-11):** a fixed weakness may be told at layer level together with its fix, with no mechanism details. An open one stays "open item" without detail. Every claim still needs its source in `sources/vision/`.
- **Patrick's sign-off checklist** (in the PR, per D19/PLAN 1.7), for every entry:
  1. It names a layer or a reason, not a rule.
  2. It has no pattern, path, file name or command.
  3. It names no limit that tells how to get around a layer.
  4. Open weaknesses appear only as "open item", without detail.
  5. It names no infrastructure products or machine names.
- **Map:** guardrails gets `page: /vision/guardrails/`.
- **Done when:**
  - `pnpm check` passes, including the layers-only check.
  - axe finds 0 violations; Lighthouse is ≥ 95; the map-check link test passes.
  - Patrick signs off the checklist in the PR and merges, and the Cloudflare build's scan is clean.
- **Cost:** build session on the subscription; no API spend.

### Item 1.8 plan (Patrick's OK 2026-11-12, both choices as proposed)

Turn the browser checks from items 1.1 and 1.3 into gates that run on every PR, and close their gaps.

- **Where the gates run:** a second job, `gates`, in the existing `check` workflow (GitHub Actions, read-only token), plus `pnpm gates` in sessions. The Cloudflare build stays `pnpm check && pnpm build`: it has no browser, and adding one would put a large download into every deploy. After its first run, Patrick adds `gates` as a required status check on `main` (STEPS B2).
- **Pin:** `playwright` **1.64.1** (2026-10-14) as a dev dependency. It has no install scripts; CI installs its Chromium with Playwright's own installer. Sessions keep the preinstalled browser: a shared launcher falls back to it when the pinned version's own browser isn't there. Lighthouse uses the same browser.
- **Gates (`pnpm gates` runs them all, over `dist/`):**

  | Gate | Covers | Fails when |
  |---|---|---|
  | axe (`design-check`) | every page, desktop and phone | any WCAG 2.2 A/AA violation, or any request to another host |
  | focus (new) | every page | a focusable element shows no visible focus: no outline of at least 2 px, or on the map no focus ring |
  | no-JS (new, all pages) | every page, desktop and phone | a link or a block of text present with JS is missing without it |
  | reduced motion (new, all pages) | every page | any animation or transition runs under `prefers-reduced-motion`, after hovering and focusing every part |
  | map (`map-check`) | every piece map | as today: names, Tab, cards, touch, links |
  | Lighthouse budget (`lighthouse`) | every piece and part page, mobile | any category under 95, or the page goes over budget: script > 5 KB, fonts > 130 KB, total > 250 KB, any third-party request |

  Today's sizes: about 13 KB CSS, 113 KB fonts for five faces, under 2 KB inline script, and 13–16 KB of HTML per page.
- **Broken focus must fail:** `pnpm gates --self-test` injects a style that hides every focus indicator, and passes only if the focus gate then fails. CI runs it on every PR, so the gate can't silently stop catching anything.
- **CI rules (Patrick):**
  - Every GitHub Action pinned by full commit SHA.
  - Workflow permission `contents: read` only.
  - No secrets in CI.
  - Triggered by `pull_request`, never `pull_request_target`.
  - The CI browser comes from the pinned Playwright version. No system Chrome, in CI or in sessions; Lighthouse uses the same browser.
- **Screenshots:** stay review output, desktop and phone from `design-check`, kept in the session's git-ignored cache. There are no pixel-diff baselines: font rendering differs between CI and sessions, so they would fail without a real change, and binary baselines would grow the public repo.
- **Done when:**
  - All gates pass in CI and in the session.
  - The self-test shows a broken focus style failing.
  - Patrick has made `gates` a required check.
- **Cost:** CI minutes on a public repo (free); no API spend.

### After the next sync of `sources/vision/` (one small PR)

- Gateway page: the worker's network in the subscription exception, and the 65 % prompt-caching cut (held back in 1.4).
- Agent core page: the rejected option "the gateway on the worker's network" (held back in 1.5).
- Map texts: check run records and the Claude worker tier against the corrected notes.
- Eval harness page: that the harness can't reach the subscription worker, including its network (held back in 1.6).
- Guardrails page, "Claude spoke as me": the signed sender identity as the fix. The synced notes still list it as decided, not built (Patrick says it's done), so the lesson names only the layers the notes back up.
- Guardrails page, once the guardrail-fix item is merged and in the notes (Patrick, 2026-11-11): this week's guardrail gap, where force pushes went through twice, the sessions found it themselves, and the guardrail-fix item closed it. It's written at layer level, like the rest of the page: what failed, who found it, which layer closed it, never how.
- If the notes have it by then (Patrick, 2026-11-11): the lesson from the ADR full-text item. A search for "ADR 18" never found titles written "ADR 0018", and the baseline eval exposed it. It probably belongs on the eval harness page (1.6) or the knowledge core.

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
