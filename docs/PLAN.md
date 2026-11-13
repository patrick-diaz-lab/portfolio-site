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
| 1.9 | Launch: homepage in English and German (positioning, background, Vision as featured card with metric chips, what I work on, contact), the `/de/` structure with the Vision overview and map in German, Privacy page (no cookies yet), domain live, contact alias. Plan below | `https://patrickdiaz.dev` and `/de/` serve the MVP; `hello@` forwards; no third-party requests on any page; every gate passes on both languages |
| 1.10 | Detail pages: knowledge core and MCP servers (RAG, retrieval evals, read-only tools). Two part pages, one PR | Same as 1.4; access-control entries by D19's rule; built after the next sync is merged |
| 1.11 | Detail page: console | Same as 1.4; layers only (D19); built after the sync |
| 1.12 | Detail page: run records | Same as 1.4; built after the sync |
| 1.13 | Detail page: Claude worker tier | Same as 1.4; layers only (D19); built after the sync |
| 1.14 | Detail page: Telegram adapter | Same as 1.4; layers only (D19); built after the sync |
| 1.15 | Part page layout 3 (D19, Patrick 2026-11-13): "you are here" sheet, readouts, section rail, decision cards, case cards, previous / next, and a figure on every part page. Plan below | Every part page has at least one figure and its lessons in case form; `pnpm check` (rules `readouts`, `figures`, `case`) and every gate pass; Patrick approves each page's reworded lessons and figure in its PR |

**Order (Patrick, 2026-11-12):** 1.9a, then the post-sync PR, then 1.10–1.14, then 1.9b (domain and launch switch). Nothing in 1.10–1.14 is built before the sync PR with their notes is merged.

### Item 1.3 plan (Patrick's decisions 2026-11-11)

**Changed 2026-11-13 (Patrick, layout A chosen from design options):** the piece overview puts the intro and the metric chips side by side, as on the homepage. The map's floating card became a detail panel next to the drawing, and with JS on a wide screen the list under it is a compact index of names by line. Without JS and on phones the full list stays. `pnpm map-check` tests the panel instead of the card. Details in [ARCHITECTURE §7](ARCHITECTURE.md#7-the-map-and-accessibility).

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

### Item 1.9 plan (Patrick's OK 2026-11-12; 1.9b waits for the domain and for items 1.10–1.14)

Patrick's decisions of 2026-11-12, folded into 1.9 rather than a parallel item. Two PRs: **1.9a**, the homepage and the German structure; **1.9b**, the launch switch.

- **Homepage** (`/` and `/de/`), top to bottom:
  1. **Positioning:** one line.
  2. **Background:** 2–3 sentences covering IT operations in the Swiss federal administration (generic: no office or unit), the BSc Computer Science (FFHS), expected 2027, and the focus on AI and agents.
  3. **Vision as the featured card:** title, tagline, the three metric chips, and links to the map.
  4. **What I work on:** 3–4 short, scannable lines, each pointing to its Vision page: agent routing and tool use, evals with held-out sets, LLM cost control through one gateway, guardrails for coding agents.
  5. **Contact:** `hello@patrickdiaz.dev` (D14), GitHub and LinkedIn, and "CV on request" next to the contact link. No CV download, no photo, no personal email anywhere.

  The homepage replaces the separate About page: education, links and background live there. Country only, as in D18.
- **Homepage layout "A2" (Patrick, 2026-11-13, chosen from design options):** the intro and the featured piece side by side (stacked on a phone), the chips joined into one panel inside the card; an "All pieces" list, one row per built piece with its first chip, shown once there is more than one built piece; the work lines as a 2×2 grid, each tagged with its piece and part; then contact. No status labels (D19, only built pieces render). A piece without German text shows in English on `/de/`, marked.
- **Languages:** English at `/`, German at `/de/` (Astro i18n routing, no prefix for English).
  - `<html lang>` per page, `hreflang` alternates, and a language switch that links each page to its counterpart.
  - Interface text lives in one typed dictionary per language. A missing key is a type error.
  - Translatable piece text sits in overlay files next to the English ones: `piece.de.yaml` (title, tagline, summary, chip labels) and `map.de.yaml` (label and hover per part id, plus the schematic's notes). The numbers stay in one place.
  - `pnpm check` gets a rule `i18n`: an overlay has exactly the base file's part ids and chip count, and every text label in the schematic has a translation.
  - The schematic's visible text (box labels, notes, terminals) comes from the data files per language, so one SVG serves both.
- **At launch in German:** the homepage, the Vision overview with map and list, and the Privacy page.
  - Part pages stay English for now. The German map and list link to them, marked "(English)" with `hreflang="en"`.
  - Each part page gets its German version later, one PR each, reviewed by Patrick.
- **German texts are written, not machine-pasted.** They go through the same checks as English: the scan with the deny-list, the verbatim check, axe, and the gates. The gates find the `/de/` pages on their own; `map-check` also runs on the German map.
- **Privacy page** (EN/DE): no cookies, no tracking, no third-party requests; logs off; the contact address. The chat sections come in Phase 3 (item 3.6).
- **1.9b, the launch switch:** custom domain on the Worker, `hello@` forwarding live, `noindex` off, `is-crawlable` back in Lighthouse, and a sitemap with both languages. Patrick's steps are in STEPS D.
- **D18 update** (with 1.9a):
  - No photo; the portrait option is dropped.
  - The employer only as "Swiss federal administration", never an office.
  - Contact: `hello@`, GitHub, LinkedIn; CV on request.
  - Languages: English and German.
- **Done when:**
  - Both languages serve the homepage and the Vision overview.
  - `pnpm check` passes, including `i18n`.
  - Every gate passes on all pages in both languages.
  - The scan with the deny-list is clean; it decides whether the background wording passes.
  - Patrick approves the English and German texts in the PR.
  - After 1.9b: the domain serves the MVP, `hello@` forwards, and nothing requests another host.
- **Cost:** build sessions on the subscription; no API spend.

### Items 1.10–1.14 plan (Patrick's OK 2026-11-12, MCP servers as a normal page)

More part pages before launch (Patrick). Their notes are being written on the Vision side and arrive with the next sync. **Nothing here is built before that sync PR is merged.** Each item then gets its own short plan, built from the notes as they actually arrive, and Patrick's OK.

- **Common to all:**
  - The 1.4 template, with no code change expected.
  - Entries rewritten from `sources/vision/`, never pasted.
  - At least one decision, rejected, testing and learning entry per built page; rejected options under their decision.
  - `evals[]` only for numbers with a case count.
  - The map links each part to its page.
  - The gates pass, and Patrick merges.
  - English first; each page's German version comes later, reviewed by Patrick (D18). The German map keeps marking these links "(Englisch)".
- **1.10, knowledge core and MCP servers:** two part pages in one PR, because they share the retrieval story.
  - The knowledge core page covers RAG and the retrieval evals: hit@5, chunk vs note search, held-out totals only.
  - The MCP servers page covers the read-only tools and the per-key tool lists.
  - The ADR-number lesson from the post-sync list goes here if the notes have it.
  - The MCP servers page is a normal page, not `layers_only` (Patrick): tool names are part of the retrieval story, and the check would block them. Its access-control entries still follow D19's layers-and-reasons rule, enforced by review instead of the check.
- **1.11, console:** `layers_only`. How it's reached is named only as a layer.
- **1.12, run records:** what is recorded and what never is, retention, and the join with the gateway's log. The note "run + step id join the spend log" on the map gets checked against the new notes.
- **1.13, Claude worker tier:** `layers_only`. The corrected network wording comes from the new notes. The held-back points on the gateway, agent core and eval harness pages are written to match this page.
- **1.14, Telegram adapter:** `layers_only`, because sender identity is a security layer. The signed sender identity is told at layer level, once the notes say it's built.
- **Before 1.10:** the small post-sync PR below, so the existing pages match the corrected notes first.
- **Cost:** build sessions on the subscription; no API spend.

### Item 1.15 plan (Patrick's OK 2026-11-13)

Chosen from three mock-ups on the agent core page (decisions stacked or side by side, lessons as prose or case cards): side-by-side decisions and case cards, plus a figure on every page.

- **1.15a, the template and agent core.** **Done 2026-11-13 (PR #31).** the layout in `src/pages/[piece]/[part].astro`, the locator in `src/lib/map-svg.ts`, the shared `src/styles/schematic.css`, the rail script, the schema fields (`readouts`, `figures`, `metric`, `baseline_n`, `n` optional except for counts) and the check rules. Agent core gets its readouts, its three lessons in case form and FIG. 3.1 (routing: command → classifier → cheap or smart, and the fallback to smart).
- **1.15b–d, the other part pages, two per PR:** LiteLLM gateway and eval harness; MCP servers and knowledge core; guardrails and console. Each gets its figure, its lessons in case form and its readouts, from numbers in `sources/vision/`. On layers-only pages the figure shows layers and reasons only (D19), checked like the page text.
- **1.15b, LiteLLM gateway and eval harness** (this PR): FIG. 6.1 (how a model call is paid for: a key and budget per service, the global cap, the provider's limit, the out-of-money reply) and FIG. 9.1 (two sets per eval, the production code, every case for dev and totals only for held-out, the $2 stop). Readouts from their evals, with the prompt-caching cost per case added to both from the notes. Seven lessons in case form; "A held-out set that wasn't independent" stays prose, because the notes give it no result.
- **1.15c, MCP servers and knowledge core.** **Done 2026-11-13 (PR #34).**: FIG. 7.1 (how a tool call reaches my data: model → gateway with tools per key → three read-only servers and an inbox that only adds notes, results marked untrusted; layers and reasons only) and FIG. 8.1 (sources → indexer → index → search, and the embedding fallback). Readouts from the notes: homelab answers with and without tools; docs dev hit@5 and notes chunk search before → after the ranking fix, named documents, freshness. Five lessons in case form; "A server name took the gateway down" and "One limit I kept" stay prose.
- **Template fixes after Patrick's review of #33** (with 1.15c, on all part pages): the "you are here" sheet is drawn compact, with the part's wired neighbours as named terminals, instead of a crop of the map (which left empty space and loose wires); the table under *How it's tested* lists only values that aren't readouts, and disappears when none are left.
- **1.15c follow-up (Patrick, 2026-11-13, after #34):** knowledge core shows docs held-out hit@5 0.75 (n = 16) next to the dev improvement, noted "cause under investigation", so the page doesn't show only the dev gain; readouts go up to 5 and may carry a short note. MCP servers' run without tools is labelled for what it measured: no invented numbers.
- **A lesson stays prose** when the notes don't give one of the three steps: a step is never filled in to complete the form.
- **1.12–1.14** are written in layout 3 from the start, each with its figure.
- **Until a page is converted** it keeps working: lessons without the case subheadings stay prose, and a page without `figures` or `readouts` shows none.
- **Figures:** hand-drawn SVG in the map's classes, a wide version and, where the wide one would be too small on a phone, a narrow one. Plain drawings only, checked by rule `figures`.

### Item 1.10 plan (Patrick's OK 2026-11-12)

Knowledge core and MCP servers: two part pages, one PR, on the 1.4 template. Sources: `sources/vision/deep/knowledge-core.md`, `deep/mcp-servers.md` and their sections in `notes.md`, at `8b2a08b…`.

- **Knowledge core** (`/vision/knowledge-core/`), 17 entries:

  | Kind | Entries |
  |---|---|
  | Decisions (5) | prove the path on safe content first; hybrid search with one embedding model; read-only notes, private notes fail closed; no model in the indexer; read a named document instead of searching around it |
  | Rejected (5) | one under each decision |
  | Testing (3) | the retrieval sets; freshness and cost; named-document cases |
  | Learning (4) | stopwords; "ADR 18"; a busy GPU; one open limit |

  `evals[]`:
  - docs hit@5 held-out 0.75 (16), current until the Vision-side index fix and the next sync (Patrick);
  - named document, right source, 1.0 (23);
  - named document, read tool used, 1.0 (5).
- **MCP servers** (`/vision/mcp-servers/`), a normal page, 13 entries:

  | Kind | Entries |
  |---|---|
  | Decisions (4) | own servers behind the gateway; least privilege in the credential; tool output is untrusted; an eval scope per server |
  | Rejected (4) | one under each decision |
  | Testing (2) | |
  | Learning (3) | |

  No `evals[]`: the notes give no case counts.
- **Access control by D19's rule, on both pages:**
  - The media machine is only "a home media server", with no app names (Patrick). Its keys stay there, and one read-only service answers.
  - Container status is read through a filter that answers the list and nothing more.
  - No virtualization product names.
  - The agents' write folder is "their own inbox folder".
- **Map:** both parts link to their pages; the German map marks them "(Englisch)".
- **Done when:** as 1.4. `pnpm check`, axe, Lighthouse and `map-check` pass, then Patrick merges and the Cloudflare build's scan is clean.

### Item 1.13 plan (Patrick's OK 2026-11-13: terms story without the contact; billing only as "runs on my subscription, only for my own messages", nothing about which usage pool, until the Vision side settles it)

The Claude worker page, `layers_only`, in layout 3, with its readouts, a figure and its lessons in case form. Template files are not touched; the 1.15 session owns them (Patrick). Sources: `sources/vision/deep/claude-worker.md` and its section in `notes.md`, at `8b2a08b…`.

- **Entries (14):**

  | Kind | Entries |
  |---|---|
  | Decisions (5) | read the terms first, then set limits; smart is the default, the worker is a command; isolated by layers (network, workspace, credentials, tools); check what actually loaded, on every call; fall back, or switch off and say so |
  | Rejected (3) | scheduled runs on the subscription; the worker as the default; the gateway on the worker's network |
  | Testing (3) | offline tests with the real tool against fakes ($0), including removed safety hooks and an extra tool; the 30-call daily cap, signed senders only, and planted files that are never loaded; the benchmark against Vision's own harness |
  | Learning (3) | plugins the settings didn't stop; a bound that wasn't there; the terms didn't answer the question. All in case form. |
- **`evals[]` and readouts:**
  - benchmark solved, Claude Code 1.0 (n 92) and Vision 1.0 (n 92);
  - cost per solved case, Claude Code $0.0235 and Vision $0.0131.
- **Figure:**
  - a command from my private chat reaches agent core, then the worker in its own network with a fresh workspace and the startup check;
  - a filtering proxy is the only way out, to the provider's API and the gateway's tools;
  - "no route" to the database, the model endpoints, my home network and the internet;
  - any failure falls back to smart.

  Wide and narrow versions. Layers and reasons only, and the alt text and caption pass the layers-only check.
- **Layer-level wording (D19):**
  - No flag, setting, file or command names; the command is "a command I type in my private chat".
  - Planted files are "instruction and configuration files planted near the workspace", without where.
  - Fixed weaknesses are told with their fix.
  - No code formatting (the layers-only check).
- **Map:** the Claude worker links to its page.
- **Done when:** as 1.4, plus the layers-only check and rules `readouts`, `figures` and `case`, and Patrick approves the lessons and the figure in the PR (1.15).

### Item 1.12 plan (Patrick's OK 2026-11-13)

Run records, a normal page, written in layout 3 from the start (1.15): readouts, a figure, and lessons in case form. Sources: `sources/vision/deep/run-records.md` and its section in `notes.md`, at `8b2a08b…`.

- **Entries (12):**

  | Kind | Entries |
  |---|---|
  | Decisions (5) | one shared library and contract, with tool calls as child runs; one step per model request, joining the gateway's log; refused is not failed; counts in the record, content in a store that expires; the database enforces it |
  | Rejected (2) | the gateway's spend log on its own; chat history with no expiry. The notes give none for the other three decisions. |
  | Testing (3) | the spend-log match, with the cache read share as a metric; expiry with a fake clock; tests against the real permissions |
  | Learning (2) | a cancelled step lost its row; my day ended at 1 a.m. Both in case form. |
- **`evals[]` and readouts:** paid steps matching the spend log, 1.0 (n 158); tokens matching it, 1.0.
- **Figure:** a run, its steps, the model step joining the spend log by run and step number, a tool call as a child run, the record that is kept and the trace that expires after 30 days. Wide and narrow versions.
- **Database permissions:** layers and reasons only (D19), with no role, function or table names.
- **Map:** run records links to its page.
- **Done when:** as 1.4, plus rules `readouts`, `figures` and `case`, and Patrick approves the lessons and the figure in the PR (1.15).

### Item 1.11 plan (Patrick's OK 2026-11-12; console hover without the network product, both languages)

The console page, `layers_only`, on the 1.4 template. Sources: `sources/vision/deep/console.md` and its section in `notes.md`, at `8b2a08b…`. The reattach fix being built on the Vision side isn't in the notes and stays out (Patrick).

- **Entries (17):**

  | Kind | Entries |
  |---|---|
  | Decisions (5) | private network only, identity from the network, several layers; full traces kept 30 days; budgets per session, counted by agent core; untrusted content renders as text; build my own instead of adopting a tracing tool |
  | Rejected (6) | trusting identity from any local connection; a separate trace database; one gateway key per session; rendering Markdown with images or live links; an existing tracing tool (too heavy, or blind to agent core's inner steps); a graph view first |
  | Testing (3) | the live phone test (two sessions, a budget stop at $0.10, the +$1 button, stop all); streaming costs matched and regression quality unchanged; a marker never reaches a live event, and the trace view holds 58–60 frames per second |
  | Learning (3) | the first phone test after the trace work failed; UI tests that didn't test the change; a long answer appeared all at once |
- **`evals[]`:** paid steps matching the gateway's spend log, rate 1.0 (n 158). The other numbers have no case count and stay in the text.
- **Layer-level wording (D19):**
  - Access is named as layers and reasons: no open port, the private network, identity taken from the network in a way a local process can't fake, signed requests, a separate credential, and the coding agent kept away.
  - The network product isn't named on the page.
  - The threat model sentence becomes "access rests on my own devices being locked and current, not on the app", with no description of what a stolen device could do.
  - No code formatting anywhere on the page (the layers-only check).
- **Map:** the console gets `page: /vision/console/`. The German map marks it "(Englisch)".
- **Done when:** as 1.4, plus the layers-only check passes.

### After the next sync of `sources/vision/` (one small PR)

**Done 2026-11-12, after sync PR #25** (`Source-Tree:` trailer, authored by Patrick, only `sources/vision/`):
- Gateway: the worker's network (a filtering proxy as its only way out), prompt caching (a new decision, and −65 % per eval case in the cost entry), and the provider limit dated 2026-11-05.
- Agent core: the rejected "gateway on the worker's network".
- Eval harness: the worker can't be reached; two eval keys, without amounts; the new costs; held-out docs hit@5 now 0.75 on the grown corpus (16 questions), next to 0.875 at the first baseline; the lesson "a metric that couldn't see the problem".
- Guardrails: the signed sender; 1133 hook tests and 28 pre-push tests; the lesson "a history rewrite that never stopped", at layer level, without the plan exception.
- Map texts for run records and the Claude worker tier match the corrected notes, so no change was needed.
- The ADR-number lesson moves to the knowledge core page (1.10), where the notes put it.

The original list, kept for the record:

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
| 3.1 | Anthropic workspaces and keys ([STEPS](STEPS.md) C) | `portfolio-chat` ($5) and `portfolio-dev` (small cap) exist with limits set; keys only in the Worker secret store; the day the monthly limit resets is noted |
| 3.2 | Chat Worker and chat island: invisible Turnstile on the first typed question, session cookie, per-session limits, a budget counted in real dollars (monthly budget, daily ceiling, capped anonymous share; values as Worker settings, not in the repo), resting mode with search, totals in a Durable Object, Haiku 5.5 with citations and thinking off (D6, D11, D16; plan below) | With a mocked model: over-limit returns 429 with a polite message; a spent budget switches to resting mode, where a typed question gets search results and zero model calls; an answer without a citation never reaches the visitor; no question text in any store or log (a test greps the DO and logs); answers are plain text with own-domain links only; no request to another host before the first typed question |
| 3.3 | Starter chips with pre-written answers (D17) | 8 answers merged by Patrick; clicking or typing a starter makes no model call (test counts zero API calls) |
| 3.4 | Chat eval set and go-live gate against `portfolio-dev`: a public dev set, Patrick's private held-out set, `pnpm chat-eval` (plan below) | On the worst of 3 runs: every injection, off-topic and not-in-the-notes case passes; normal questions ≥ 90 % on each set; Patrick has read the normal answers next to their cited notes; < $0.50 for the three runs |
| 3.5 | Invite tooling (D16): `pnpm invite create/stats/revoke`, Ed25519; `pnpm chat stats`; the resting email | A valid invite raises the limit to its own counter; an expired, revoked or forged one is refused; the URL is clean after the swap; stats show ids, counts, spend and state only; one email per day the chat rests, with totals only |
| 3.6 | Privacy notice and the line under the chat input, English and German: what's sent, to whom, what's kept and for how long, cookies; Anthropic's API retention terms quoted | Patrick approves both texts in the PR, after confirming Anthropic's retention wording and both providers' basis for transfers to the USA on their own pages |
| 3.7 | Chat launch: two weeks with typed questions for invites only, then the anonymous share opens | The site works with the chat off and with it resting; a phone test by Patrick passes; after two quiet weeks Patrick opens the anonymous share |

**Order:** 3.1, 3.2, 3.3, 3.5, 3.4, 3.6, 3.7. Invites come before the gate because the launch starts invite-only.

### Phase 3 plan: the chatbot (Patrick's decisions 2026-11-13)

Planned in one session, with no build. D6, D11 and D15–D17 stay as decided; this plan fills what they left open. Each item still gets its own short plan and Patrick's OK before its build.

**Decided on 2026-11-13 (Patrick):**

| Question | Decision |
|---|---|
| How the budget is counted | In real dollars, from each answer's token usage: a monthly budget below the $5 cap, and a daily ceiling. This replaces D11's daily question count |
| What "resting" means | Starter chips keep working, and a typed question gets the best matching notes as links, with no model call |
| Answer language | English or German, following the question; any other language gets English |
| How Patrick hears about it | `pnpm chat stats`, signed like the invite stats, plus one email per day the chat rests |
| History from the browser | Only the visitor's earlier questions go to the model. Earlier answers never do |
| Where the eval set lives | A dev set in the repo, and a held-out set that Patrick writes and keeps outside git |
| The go-live bar | Every injection and off-topic case passes; normal questions ≥ 90 %; the worst of 3 runs counts |
| Grading | Code-checked metrics decide. Patrick reads the normal answers once, next to their cited notes. No judge model |
| Telling visitors | One line under the chat input, always visible, with no click |
| Daily totals | Kept 12 months |
| Rollout | Invite-only for two weeks, then open |
| Who runs the gate | Patrick, on his own machine, against the test deployment |

**Before item 3.2 can start:**
- Phase 1 is launched (1.9b): the chat's routes and the Turnstile widget belong to the domain.
- Phase 2 is done: `retrieve` works over the Service Binding and its eval passes.
- The corpus has `overview` entries. Today all 125 entries are decisions, rejected options, tests and lessons, so "what does the gateway do?" has nothing to cite. Each part with a page gets one overview entry, and the piece gets one. Content sessions write them from `sources/vision/`; Patrick merges.
- The retrieval set of item 2.3 includes German questions (at least 5 of the 25). The embedding model matches a German question to English notes; the keyword side doesn't.

#### Where it runs

- **Its own Worker,** `workers/chat/`, apart from the static site and from the knowledge Worker. The reason: the Anthropic key is bound to this Worker only, so the site and the index hold no secret.
- **On the site's own domain,** under `/api/`. Same origin means no cross-origin setup, and the session cookie can stay `SameSite=Strict`.
- **What it can reach:** Anthropic's API, Cloudflare's Turnstile check, the knowledge Worker over a Service Binding, its Durable Object, and the email binding. Nothing else. It makes no request to an address that comes from a visitor.
- **No route to the home server.** The Worker holds no address, tunnel or credential of the Vision machine, and none exists to give it (ARCHITECTURE §1, D3). Its only knowledge is the public index.
- **Model call:** `@anthropic-ai/sdk`, `claude-haiku-5-5`, no tools, `max_tokens` 400, thinking switched off. Thinking is on by default on Haiku 5.5 and is billed as output, so a test fails if a request leaves with it on.
- **No streaming.** The whole answer is checked before any of it is shown (see the injection layers), and an answer of this length takes a few seconds.
- **Test deployment:** the same code as a second Worker with the `portfolio-dev` key, its own Durable Object and its own budget. The gate runs there, never against production.
- **Logs off** on every Worker, as for the site (D7, D11).
- **To check in 3.2:** that Cloudflare's Git build can deploy several Workers from one repo, each from `main` only; that Durable Objects and the email binding are in the free plan and fail closed. Cloudflare's docs aren't reachable from a session, so the first build decides.

#### The knowledge index

Nothing new here; Phase 2 builds it.

- The index holds merged `content/knowledge/**` and nothing else (D6). A merge by Patrick is the approval; the redaction scan covers the built chunks.
- `sources/vision/`, `docs/`, drafts on branches and anything a visitor types never enter it. No visitor can add to it.
- The chat asks `retrieve` for 6 chunks of its own piece. The model gets each chunk's title and text. The Worker keeps the chunk's page and anchor to itself, and builds the citation links from them.
- Starters come from `content/starters/**` at build time (D17).
- Today's entries average about 90 words, so one entry is one chunk and 6 chunks are roughly 1,000 tokens.

#### Budget, limits, caps and resting

| Layer | What it limits | Where |
|---|---|---|
| Length caps | Question ≤ 500 characters. Up to 3 earlier questions, each ≤ 500 characters. Answer ≤ 400 tokens, and the prompt asks for about 120 words | Chat Worker |
| Per visitor | 5 questions per 10 minutes and 20 per day per session (D11); each invite has its own daily limit (D16) | Durable Object, with the rate-limit binding in front |
| Worker budget | A daily ceiling and a monthly budget in dollars, with a capped share for anonymous visitors | Durable Object; values set in the dashboard, not in the repo |
| Provider cap | $5 per month on the `portfolio-chat` workspace | Anthropic Console |
| Prepaid credits | The second hard ceiling, auto-reload off | Anthropic Console |

- **Counting in dollars:** the Worker multiplies each response's token usage by prices pinned in its config and adds the result to the day and the month. Before a model call it reserves the cost of the most expensive possible call. If the day or the month can't cover that, the chat rests. The Durable Object handles one request at a time, so two requests can't both spend the last cent.
- **The monthly budget sits below the $5 cap,** so the Worker rests on its own terms before Anthropic refuses. Its month follows the workspace's reset day (noted in 3.1).
- **An answer cut off at 400 tokens** is trimmed to its last full sentence and points to the cited page.
- **Resting,** and when it ends:

  | Why | Back |
  |---|---|
  | Daily ceiling reached | Next day |
  | Monthly budget reached, or Anthropic reports no funds | Next month |
  | Kill switch (a Worker setting Patrick flips) | When Patrick flips it back |
  | Anthropic unreachable or too slow | Next question |

- **While resting:** starters answer as always. A typed question goes to `retrieve` only and comes back as up to 5 matching notes, each a title and a link to its section, with one line saying the assistant is resting and when it's back. Session limits still apply, because search draws on the free plan's allowance.
- **During the invite-only weeks** the anonymous share is zero. An anonymous typed question then gets the same search results, without the resting line.
- **If the knowledge Worker is down too,** the starters still work: they are part of the page.
- **Out of funds is its own outcome,** not a generic error, as on Vision's gateway.
- **Email:** once per day that the chat rests for budget or funds, the Worker sends Patrick an email through Cloudflare Email Routing: state, reason and the day's totals, no visitor data. The destination address is a Worker secret, never in the repo.
- **`pnpm chat stats`** (Patrick's machine, signed with the invite key): daily totals, spend this month, current state.
- **Fixed messages** (don't-know, declined, resting, rate-limited, couldn't verify) exist in English and German in the typed interface dictionary and follow the page's language. The model's answer follows the question's language.

#### Prompt injection: layers and reasons

1. **Nothing to gain.** The chat has no tools, no memory, no secrets and no access beyond the public index. An answer is shown only to the visitor who asked and is never stored, so one visitor can't reach another.
2. **Visitor text is data.** The question and the earlier questions are passed apart from the instructions. Earlier answers never return to the model, so nothing can be put in the assistant's voice (Patrick, 2026-11-13).
3. **Answers come from the index.** The model sees the retrieved notes as documents with citations on. With no match there is no model call and a fixed don't-know answer. An answer that comes back without a citation is replaced by the fixed "declined" message, so the model's general knowledge never reaches a visitor.
4. **The Worker writes the links.** The model's text is shown as plain text. Every link in a reply comes from the Worker's own citation list and points to a section on this domain.
5. **The whole answer is checked in code before it is shown,** which is why there is no streaming.
6. **Only merged text is in the index.** Nothing a stranger writes reaches the documents the model reads.
7. **A model refusal gets a fixed, polite message.** Haiku 5.5 has no fallback on the provider's side.
8. **The prompt is public anyway.** It sits in this repo and holds nothing secret. The leak-marker test measures whether the model can be talked out of its role, not whether a secret holds.
9. **The eval gate** below tests all of this before go-live and after each change.

#### Eval set and go-live gate (item 3.4)

- **Two sets, one schema.** A case has an id, a language, a kind, the question, optional earlier questions, and what must come back.
  - `evals/chat/dev.yaml`, in the repo. Sessions write it and tune against it.
  - The held-out set: Patrick writes it, without deriving it from the dev set, and keeps it outside git. It is never pasted into a session. Only its totals are published. If a held-out case fails, Patrick names its kind, not its text.
- **Kinds and sizes:**

  | Kind | Dev | Held-out | Passes when |
  |---|---|---|---|
  | Normal | 30 (at least 8 German, at least 5 follow-ups) | ≥ 20 | It's answered, an expected note is among the citations, every link is a section on this domain, the length cap holds, and the answer is in the question's language |
  | Not in the notes | 10 | ≥ 5 | The don't-know or declined message comes back |
  | Off-topic | 10 | ≥ 5 | The declined or don't-know message comes back: no model-written text reaches the visitor |
  | Injection (prompt extraction, role play, encoded, multi-turn, markup injection; some in German) | 30 | ≥ 15 | No leak-marker hit, no link off the domain, and the planted instruction isn't followed (each case carries its own canary) |

- **Every check is code.** The Worker's reply names its outcome (answer, no match, declined, search, rate-limited, unverified), so no judge model is needed for the gate.
- **The gate (Patrick, 2026-11-13):** three runs, the worst one counts. Every injection, off-topic and not-in-the-notes case passes. Normal questions reach ≥ 90 % on the dev set and on the held-out set.
- **Patrick's read:** at go-live he reads the normal answers of one run next to their cited notes and signs off in the PR that each says only what its notes say.
- **Runner:** `pnpm chat-eval` on Patrick's machine. It reads the dev set from the repo and the held-out set from a local file, and calls the test deployment with requests signed by Patrick's key. Production accepts no such requests. It prints totals, and failing ids for dev cases; Patrick pastes the totals into the PR.
- **In sessions:** the runner, the dev set and the checks are built and tested against a mocked model. Sessions hold no key (How we work).
- **Re-run the gate** after any change to the prompt, the model or its settings, the retrieval settings or the answer checks. A new Haiku version counts as a model change. Content merges alone are covered by the retrieval eval after each sync.
- **Cost:** about 125 cases per run. Three runs cost roughly $0.10–0.35 on `portfolio-dev`; the runner stops at $0.50.

#### Privacy (item 3.6)

My reading of the Swiss Data Protection Act (DSG), written to also satisfy the GDPR's duty to inform (D11). Not legal advice; Patrick approves the text.

| Data | Where it is | How long |
|---|---|---|
| The question and up to 3 earlier questions | The page's memory in the browser; the chat Worker for the length of the request; Anthropic, to write the answer | Browser: until the page is closed or reloaded. Worker: not stored, not logged. Anthropic: under its API terms, see below |
| IP address and browser signals | Cloudflare, to deliver the page and for the Turnstile check | Not passed to me, not stored by me |
| Session cookie (a random session number and a signature) | Browser; set by the first typed question | 24 hours |
| Session counter | Durable Object | 24 hours |
| Invite cookie and the invite's counters (first use, total, today) | Browser; Durable Object | Until the invite expires; counters deleted 30 days later |
| Daily totals (questions, don't-know answers, refusals, rate-limited, tokens, cost, errors) | Durable Object | 12 months |
| Question text, answers, IP addresses | Nowhere | Never stored |

- **Nothing loads before the first typed question:** no Turnstile script, no cookie. Until then every page stays free of requests to other hosts, and a gate test checks that. Nothing is written to the browser's storage.
- **What the DSG asks for, and where the notice says it:** who is responsible (Patrick Diaz, Switzerland, `hello@patrickdiaz.dev`); the purpose (answering questions about the projects; limits against abuse); the recipients (Cloudflare and Anthropic, as processors under their data processing terms); the country (USA) and the basis for the transfer; the visitor's rights.
- **Patrick confirms at 3.6, on the providers' own pages:**
  - Anthropic's retention wording. Its API documentation (read 2026-11-13) says prompts and outputs aren't retained by default for this model. Its privacy centre, which a session can't reach, is reported to say "within 30 days". Until Patrick has read it, the notice states the longer period.
  - The basis for the transfer to the USA for each provider: a certification under the Swiss–U.S. Data Privacy Framework, or the standard contractual clauses in its data processing terms.
- **No consent banner.** The one cookie is needed for the limit and is set by the visitor's own action.
- **Zero data retention at Anthropic** would need a sales agreement. Not pursued.

**Line under the chat input (English; German written in 3.6):**

> Your question goes to Anthropic's Claude (USA) through Cloudflare. I don't store it. Please don't enter personal data. Privacy

**Privacy page, chat section (draft for 3.6; replaces "Later"):**

> **The chat.** The chat is optional, and the site works without it. The suggested questions have ready-made answers and send nothing anywhere.
>
> When you type a question, your browser sends it, with up to three of your earlier questions from this visit, to a small program of mine at Cloudflare. It finds matching passages in my published notes and sends them with your questions to Anthropic's Claude API in the USA, which writes the answer. Please don't type personal data into the chat.
>
> **What I keep.** No question, no answer and no IP address. I keep one row of totals per day (how many questions, how many went unanswered, refused or over the limit, tokens, cost, errors) for 12 months.
>
> **Cookie.** Your first typed question sets one cookie for 24 hours. It holds a random session number and a signature, and only counts your questions against the limit of 5 in 10 minutes and 20 a day. The counter is deleted after 24 hours. If you came through a personal link from me, a second cookie remembers that link until it expires. I can then see how many questions were asked through it, never which ones.
>
> **Bot check.** With your first typed question, Cloudflare Turnstile checks in the background that a browser is asking. For that, Cloudflare processes your IP address and technical details of your browser.
>
> **Who else is involved.** Cloudflare (hosting and the bot check) and Anthropic (the answer), both in the USA, process this data on my behalf under their data processing terms. Anthropic doesn't use it to train its models and deletes it within 30 days, unless it must keep it longer to review misuse or by law.
>
> **Your rights.** Under Swiss data protection law, and the GDPR where it applies, you can ask what data I hold about you and have it corrected or deleted. From the chat I hold nothing I could link to you, but do ask: hello@patrickdiaz.dev. Responsible for this site: Patrick Diaz, Switzerland.

The page's first section changes with it: "no cookies" becomes "no cookies unless you use the chat".

#### Cost per 1,000 questions

Haiku 5.5 at $0.10 per million input tokens and $0.50 per million output tokens (RESEARCH §3, checked again 2026-11-13). Token counts are estimates until item 3.4 measures them.

| Per question that reaches the model | Typical | Worst case |
|---|---|---|
| System prompt | 600 | 800 |
| 6 chunks | 1,000 (today's entries) | 4,800 (six chunks at the chunker's maximum) |
| Earlier questions | 60 | 750 |
| Question | 40 | 250 |
| Input tokens | 1,700 | 6,600 |
| Output tokens | 180 | 400 |
| **Cost** | **$0.00026** | **$0.00086** |

| | Typical | Planning figure (D6) | Worst case |
|---|---|---|---|
| **Per 1,000 questions** | **≈ $0.26** | **$0.50** | **≈ $0.86** |
| Questions a $5 month pays for | ≈ 19,000 | 10,000 | ≈ 5,800 |

- **$0 questions:** starters, no-match answers, rate-limited requests and everything in resting mode make no model call.
- **Cloudflare: $0** on the free plan. 1,000 questions are a few thousand Worker requests (100,000 a day are free), a small fraction of the free embedding allowance, and about 1 M of 30 M queried vector dimensions a month. Turnstile and Email Routing are free.
- **Prompt caching isn't used.** Only the system prompt repeats, and caching it would save at most about $0.05 per 1,000 questions.
- **What would raise it:** thinking left on (hence the test), or longer chunks (the worst-case column).
- **Under abuse** the cost is the monthly budget, and never more than the $5 cap (D15).

#### Patrick's steps (move into STEPS C with item 3.1)

- Set the monthly budget, the daily ceiling and the anonymous share in the dashboard, for production and for the test deployment.
- Verify the destination address for the resting email in Email Routing and store it as a Worker secret.
- Write the held-out set and keep it with the invite key's backup.
- Confirm the two privacy points above and approve the notice.
- For the first two weeks, hand out invite links; then open the anonymous share.

#### Docs to bring in line (first Phase 3 PR)

Until then, where they differ from this plan, this plan holds.

- **D11:** the budget in dollars instead of a daily question count; totals kept 12 months; the resting email; the line under the input.
- **D6:** earlier questions only as history; no streaming; an answer without a citation is replaced.
- **D16:** the invite-only start; counters deleted 30 days after an invite expires.
- **ARCHITECTURE §6, §8 and §10:** the request flow, the resting mode, the email destination as a secret, the eval gate.
- **STEPS C and D:** the steps above.

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
