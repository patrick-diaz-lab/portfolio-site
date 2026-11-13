# Architecture

How the portfolio site is built and why. The reasons and rejected options are in [DECISIONS](DECISIONS.md) (D1–D21); sources in [RESEARCH](RESEARCH.md). State: planned 2026-11-04, nothing built.

## 1. Overview and trust boundaries

```
 Patrick's machine            GitHub (org, Free plan)          Cloudflare (free plan)                 Anthropic
 ─────────────────            ───────────────────────          ──────────────────────                 ─────────
 review + merge PRs  ───────► portfolio-site (public, D20)     Git build: pnpm check && pnpm build
 pnpm scan (deny-list copy)    main: ruleset, only Patrick ───► (scan over src, dist/, chunks.json)
 pnpm invite (Ed25519 key)     merges (D8)                      │
                                    ▲                           ▼
                                    │ branches + PRs          static site (Workers static assets)
 Claude Code cloud session ─────────┤                         knowledge Worker ── AI binding (bge-m3)
  (isolated VM, subscription)       │                          │                └─ Vectorize binding
  reads sources/vision/ in the repo │                          │ Service Binding
  (D21); no access to the IC repo   │ sync PR to               chat Worker ─────────────────────────► Haiku 5.5
 Vision side (export script) ───────┘ sources/vision/ (D21)    Durable Object: counters only          (workspace
 Vision machine: no connection at runtime or build time; its only link is the sync PR.     portfolio-chat, $5)
```

Rules that hold everywhere:
- **No path from the public site to the Vision machine:** no tunnel, port, database, vector store, vault or key of Vision is reachable. The chatbot has its own corpus, built only from Patrick-approved text in this repo (D6).
- **The Vision machine holds no hosting or chat credentials** (D3). The only deploy credential is the token Cloudflare's own build creates, and it exists only there.
- **Cloud sessions have no access to the IC repo** (D21): the Claude GitHub App is on `portfolio-site` only, and Vision's notes arrive in this repo as a sync PR Patrick merges.
- **Content on `main` = approved by Patrick's merge** (D8). The redaction scan in Cloudflare's build is the last gate (D9).

## 2. Stack and hosting

| Layer | Choice | Pin candidate (2026-11-04) |
|---|---|---|
| Framework | Astro 7, fully static, MDX content collections, islands for map and chat (D7) | `astro` **7.4.2 pinned** (0.4); `@astrojs/mdx` 8.1.0 |
| Runtime / package manager | Node ≥ 22.23.4 (`.node-version`, astro 7.4.2); pnpm via `packageManager`, `minimumReleaseAge` 14 days, build scripts off except an allowlist | `pnpm` **12.15.0 pinned**; build-script allowlist `esbuild`, `workerd` (0.4) |
| Hosting | Cloudflare Workers with static assets, free plan; Cloudflare Git builds on `main` only | `wrangler` **4.153.0 pinned** (0.4) |
| Map | Hand-drawn annotated-schematic SVG + `map.yaml` + ~3 KB TypeScript (D7, D13) | no library |
| Tests | Browser gates in CI and sessions: axe-core, focus, no-JS, reduced motion, map, Lighthouse with a size budget (PLAN 1.8) | `playwright` **1.64.1 pinned**; `lighthouse` **13.6.0 pinned** |
| Search on the site (optional) | Pagefind, static | `pagefind` 1.5.2 |
| Knowledge index | Workers AI `@cf/baai/bge-m3` + Vectorize, through bindings (D6) | — |
| Chat model | Claude Haiku 5.5 (`claude-haiku-5-5`), Anthropic SDK | `@anthropic-ai/sdk` 0.137.0 (check again in Phase 3) |
| Domain / mail | `patrickdiaz.dev` at Cloudflare Registrar; `hello@` via Email Routing (D14) | — |

Lock-in: the static site moves to any host. The Workers (knowledge, chat, later MCP) use Cloudflare bindings and need rewriting elsewhere. They're small by design.

## 3. Content model: the reusable piece template

A piece is a folder plus an SVG. A second piece needs no code change (D19).

```
pieces/<piece>/piece.yaml        id, title, tagline, summary, status, as_of, source_commit,
                                 order, map_svg, chat_enabled, starters
pieces/<piece>/map.yaml          parts: id, label, hover (≤140 chars), page?, status, line
pieces/<piece>/map.svg           annotated schematic; element ids = map.yaml ids
pieces/<piece>/figures/*.svg     part page figures in the map's style (FIG. <part>.<n>)
content/parts/<piece>/<part>.mdx frontmatter + fixed sections (below)
content/knowledge/<piece>/*.md   one entry per decision / rejected option / testing note / lesson
content/starters/<piece>/*.md    pre-written answers to the starter chips
redaction/exceptions.yaml        the only place for scan exceptions (changes via reviewed merge)
evals/retrieval.yaml             public retrieval eval (questions → expected entry ids)
```

**Part page frontmatter:** `id, piece, title, summary, status (built | in-progress | planned), as_of, source_commit, sources[], evals[] {name, metric, value, n?, date, baseline?, baseline_n?, cost_usd?}, readouts[] {eval, label, note?}, figures[] {svg, svg_narrow?, alt, caption}, related[]`. `evals[]` is aggregates only (D19): `name` is a slug of at most 48 characters, `metric` one of `accuracy, hit_at_5, mrr, rate, count, cost_usd, seconds`, every other field a number or an ISO date, and no other keys. `n` is required for a count; `baseline_n` is the case count of the baseline where it differs. `readouts[]` (at most 5) picks evals for the top of the page, each with an optional short note that qualifies it; `figures[]` names SVGs in `pieces/<piece>/figures/`, with a narrow version for phones (layout 3, Patrick 2026-11-13).

**Fixed sections:** *What it does* (MDX body, then the figures) · *Why this way* (entries `decision` + `rejected`) · *How it's tested* (entries `testing` + `evals[]`) · *What I learned* (entries `learning`).

**Part page layout 3 (Patrick, 2026-11-13):** a compact "you are here" sheet drawn from the piece's map by `src/lib/map-svg.ts` (the part, and every part wired to it as a named terminal on its side of the map; a part wired to no other part shows where its wire leads), the readouts with before → after where an eval has a baseline, a table under *How it's tested* with only the values that aren't readouts, a sticky section rail (a strip on phones), each decision as a card with the options it beat beside it, lessons in case form as case cards, and previous / next part with a page in map order. All drawings share `src/styles/schematic.css`.

**Knowledge entry frontmatter:** `id, piece, part, page, anchor, kind (overview | decision | rejected | testing | learning), lost_to?, metric?, sources (files under sources/vision/), as_of, source_commit`. A `learning` entry in **case form** has, under its title, exactly the subheadings *What happened*, *What I changed* and *Result*, each one paragraph; its optional `metric` names an eval of its part, shown as the case's before → after. `lost_to` (rejected entries only) names the decision on the same part that the option lost to; the page renders it right under that decision (item 1.4). Entries render in the order of their file names (`NN-<id>.md`).

**Published URLs (D22):** `published-urls.txt` lists the paths that must keep resolving; `scripts/published-check.ts` runs at the end of `pnpm build` and fails if a listed path is neither a page nor a 301 in `_redirects` to one.

**Rules (`scripts/check-content.ts` in `pnpm check`, before the build; schemas in `src/content/schemas.ts`, shared with the Astro collections):**
- A missing, unknown or wrong field (every object is strict).
- An entry whose `page` isn't its part's page, whose part has no page, or whose `anchor` repeats on that page. Each part page renders its own entries under their anchors, so these checks are enough for the anchor to exist.
- A `related[]` part, a `sources` file or a `map.yaml` page that doesn't exist.
- A `lost_to` that doesn't name a decision on the same part, `lost_to` on an entry that isn't `rejected`, or two entries of a piece with the same id (rule `lost-to`, item 1.4).
- A `built` part with a page but without at least one `decision`, `rejected`, `testing` and `learning` entry.
- Free text in `evals[]`.
- A readout or a lesson `metric` that isn't an eval of its part; a `metric` on a lesson that isn't in case form; a case form with other subheadings or more than one paragraph per step (rules `readouts`, `case`).
- A figure file that doesn't exist, has no `viewBox` or the map's classes, or doesn't pass the figure safety check, which keeps a figure to a plain drawing; on a layers-only page also its texts, alt and caption (rules `figures`, `layers-only`).
- A `map.yaml` part without its `<g id class="part">` in the SVG, an SVG part missing from `map.yaml`, a part listed twice, or a part group with a nested `<g>` (rule `svg`, item 1.3).
- A starter citing a missing entry (Phase 3; starters and `evals/retrieval.yaml` get their schemas when first used).

A starter whose cited entry changed after the starter's `as_of` gives a warning.

**Status:** `status` stays in the data model and the content check, but **only `built` parts render** on the map and in its list, with no status labels (Patrick, 2026-11-11). Planned parts appear only as Phase 5 design notes, labelled "designed, not built" (D19).

**Languages (PLAN 1.9a):**
- English at `/`, German at `/de/`, from the same components.
- Interface text is in `src/i18n/ui.ts`; a missing German key is a type error.
- A piece's German text is in `piece.de.yaml` and `map.de.yaml`, next to the English files; numbers, ids, pages and status stay in the English files.
- One schematic serves both languages: box labels come from the map data, and every other text has a `data-t` key.
- The homepage text is in `content/home/<locale>.yaml`.
- `pnpm check` (rule `i18n`) holds every German file to its English base.
- Pages that exist in both languages carry `hreflang` alternates and a language switch. Links from German pages to English-only part pages are marked.

## 4. Content and redaction pipeline

1. **Source import (Vision side):** Vision's export script opens a `vision-sync/<date>` PR that updates `sources/vision/` (authored by `patrick-diaz-dev`, `Source-Tree:` trailer); Patrick merges it (D21). Sessions never edit `sources/vision/`. Run records, traces, the vault and Vision's database are never sources (D2).
2. **Drafting (Claude, on a branch):** knowledge entries and part pages are rewritten from `sources/vision/`, never pasted. `pnpm check` warns on 40 or more consecutive words copied from it (D9, D21).
3. **Scan, first pass (session):** pre-commit/pre-push hooks run the generic rules and gitleaks. `--no-verify` is denied by the session settings.
4. **Review (Patrick):** the PR template carries the checklist below. Patrick runs `pnpm scan` with his local deny-list copy, then merges. The merge is the approval (D8).
5. **Scan, authoritative (Cloudflare build):** `pnpm check` runs the generic rules plus the **private deny-list from a secret build variable** over the sources, `dist/**` and `chunks.json`. A hit fails the build, reporting the rule and `file:line`, never the matched word. Images: metadata (EXIF) is stripped.

**Generic rules:**
- IPv4/IPv6 and MAC addresses.
- Private and internal network names (reserved local and internal domain suffixes).
- Port numbers in URLs.
- Absolute and home paths (including home directories) and env-file paths.
- VM IDs.
- Emails other than `hello@patrickdiaz.dev`; phone numbers; UUIDs.
- The IC guardrail's secret patterns; gitleaks.

**Scan scope:** every file in the repo, on every branch, `docs/` included, because the repo is public and a pushed branch is public at once (D20). The build also scans the built `dist/**` and `chunks.json`.

**Private deny-list (secret, never in git):** internal hostnames and LAN names, canary words, the employer's name and variants, other people's names. Not the generic bio words (D18).

**Exceptions:** only in `redaction/exceptions.yaml` (path, rule, exact snippet, reason), changed only through a reviewed merge.

**Patrick's review checklist (per PR):**
- No hostnames, IPs, VM IDs, LAN layout, internal paths, ports, canary words or secrets.
- No run-record contents, traces or vault text.
- No other people's data. Nothing from the employer, no work data at all.
- Eval numbers are aggregates; nothing from the held-out split.
- Security pages name layers and reasons, never rules, patterns or paths.
- Planned things aren't presented as running.
- Images show no labels, readable device IDs or views out of the window.

## 5. Knowledge index and corpus build (Phase 2)

- **Build (Cloudflare Git build):** approved entries from `content/knowledge/**` only → chunked the way Vision does it (by heading, 500–800 tokens, ~10 % overlap) → `chunks.json` (`chunk_id` = content hash, `piece`, `kind`, `page_url`, `anchor`, `title`, `as_of`), a keyword index, and the corpus hash. The redaction scan covers `chunks.json`.
- **Sync (knowledge Worker, cron):** compares chunk hashes with the index and embeds new or changed chunks with `env.AI` (`@cf/baai/bge-m3`, 1024-d). It upserts them into Vectorize with metadata `piece`, `kind` and `embed_model = workers-ai:@cf/baai/bge-m3`, and deletes vanished ones. The metadata indexes `piece` and `kind` are created before the first insert. No API token exists; only bindings.
- **Retrieve:** `retrieve({query, pieces?, kinds?, k})` runs a vector query (with a `piece`/`kind` filter) and a keyword query, fused by reciprocal rank with k = 60. While the bundled corpus hash differs from the index hash, it falls back to keyword only, flagged in the result.
- **Quality:** after each sync the Worker runs `evals/retrieval.yaml`. Gate: hit@5 ≥ 0.8 (Vision's bar). Public `/_status`: index version, chunk count, hit@5. Nothing else.
- **Free-plan budget:** 500 chunks × 1024-d is ~0.5 M of 5 M stored dimensions. 10,000 queries a month is ~10.8 M of 30 M queried dimensions. Embedding the whole corpus takes a few hundred of the 10,000 free neurons a day.

## 6. Chatbot (Phase 3)

Request flow for one question:

1. The browser sends the question (≤ 500 characters) plus the last 3 turns, which live only in the browser.
2. **Starter match?** If the normalised question equals a starter chip's question, the pre-written answer comes back. $0, not counted (D17).
3. **Turnstile (Invisible)** on the first question → a signed session cookie (HMAC, 24 h, HttpOnly, SameSite=Strict). An invite cookie, if present (D16).
4. **Limits (Durable Object):**
   - Anonymous: 5 per 10 minutes and 20 per day per session; a capped share of the global breaker in total.
   - Invites: their own daily limit (default 50) per invite id.
   - Global breaker: a fixed daily total, set as a Worker setting, not in the repo.
   - The rate-limit binding acts as a cheap first layer.
5. **`retrieve`** with k = 6 and the piece filter, over the Service Binding.
6. **No chunk over the threshold and no keyword hit** → a fixed answer: "that isn't in my approved notes". No model call.
7. **Haiku 5.5**: the chunks go in as document blocks with citations on. Thinking off, `max_tokens` 400. The system prompt holds the scope, a polite refusal for off-topic questions, the rule to treat visitor input as data, and a unique **leak marker**. Nothing secret is in it; we assume it leaks.
8. **Response:** plain text plus a citation list mapped to `page_url#anchor` on `patrickdiaz.dev` only. No model-made HTML or Markdown links. A `refusal` stop reason gets a fixed polite message (Haiku has no server-side fallback).
9. **Daily totals** go to the Durable Object: questions, no-match answers, refusals, rate-limited, tokens in/out, cost in USD, errors. **No question text, no IP**; session counters expire after 24 h. Worker logs are off.

Cost ≈ $0.0005 per question → ≈ $0.05 / $0.50 / $5.10 per month at 100 / 1,000 / 10,000 questions. The workspace cap is $5/month, and prepaid credits with auto-reload off are a second ceiling (D15).

**Invites (D16):**
- **Token:** `base64url(payload).sig`, with payload `{v, id: "inv_<random>", exp, limit}`, signed with Ed25519 on Patrick's machine. The Worker verifies with `INVITE_PUBKEY`.
- **Labels:** id → company label lives only in Patrick's local file.
- **Revoking:** a revoke list in the Worker's settings.
- **Stats:** `/admin/invites` accepts only requests signed with the same key and returns ids and counts.

**Tests (Phase 3.4):** ≥ 30 attack prompts against the `portfolio-dev` deployment, < $0.10 per run. Pass means 0 leak-marker hits and 0 off-domain links, plus polite refusals off-topic.

**MCP (Phase 4):** `/mcp` exposes `search_portfolio` and `get_page` over the same `retrieve`, with no model behind it. Its own daily counter keeps it from using up the quota the chat needs, and a kill switch turns it off.

## 7. The map and accessibility

- **Each part is an `<a>`** in the inline SVG, with an accessible name (its label; the SVG itself has an `aria-label` and no `<title>`, which would show as a tooltip) and a visible focus ring. No pan or zoom. A part without a page links to its entry in the list (item 1.3). The page turns each `<g id class="part">` of the hand-drawn SVG into its link (`src/lib/map-svg.ts`), so the SVG holds no URLs.
- **Detail panel (layout A, Patrick 2026-11-13):** with JS, a panel next to the drawing shows one part at a time: its line and number, its ≤ 140-character text, "Read the page" when it has one, and previous/next. Hover (on the map or in the index) and keyboard focus show a part; a click or Enter follows its page; on touch the first tap shows it. A part without a page only shows in the panel. The first part shows on load, highlighted but without the signal dot. The panel replaced the floating hover card.
- **List fallback:** a list of all parts with their texts under the map, which works without JS. With JS on a wide screen it becomes a compact index of names by line; the texts are then in the panel.
- **Phone layout:** below 48rem the schematic is hidden and the list becomes the vertical wire with the modules along it.
- **Motion:** the signal dot along a wire runs on hover/focus only. CSS only, off under `prefers-reduced-motion`.
- **Labels and contrast:** labels are real text; hand lettering is decoration only. Palette at least WCAG AA.
- **Gates:** `pnpm gates`, the CI job `gates` (a required check on `main`), runs:
  - axe-core with 0 violations on every page;
  - visible focus at every Tab stop, with a self-test that a broken focus style fails;
  - no-JS, reduced-motion and map tests;
  - Lighthouse mobile ≥ 95 in every category, with a size budget.

  The Cloudflare build doesn't run them: it has no browser (PLAN 1.8).
- **The site works without the chatbot.** The chat is an island loaded on interaction, and a kill switch turns it off.

## 8. Secrets and where they live

| Secret | Where | Who sets it |
|---|---|---|
| Anthropic key `portfolio-chat` | Cloudflare Worker secret (chat Worker) | Patrick |
| Anthropic key `portfolio-dev` | Cloudflare Worker secret (test deployment) | Patrick |
| Turnstile secret | Cloudflare Worker secret | Patrick |
| Session HMAC key | Cloudflare Worker secret (random, generated in the dashboard or by Patrick) | Patrick |
| `INVITE_PUBKEY` | Cloudflare Worker variable (public key) | Patrick |
| Invite private key + id → label file | Patrick's machine, backup in his password manager | Patrick |
| Redaction deny-list | Cloudflare build secret variable; local copy on Patrick's machine | Patrick |
| Cloudflare deploy token | Created and held by Cloudflare's Git build | Cloudflare |

Nothing here is in git, on the Vision machine or in chat. The repo has `.env.example` placeholders only where a local dev run needs them.

## 9. Repository layout

```
docs/                      PLAN, ARCHITECTURE, DECISIONS, RESEARCH, STEPS
sources/vision/            Vision's portfolio notes, synced by PR from the Vision side (D21); never edited here
pieces/  content/  redaction/  evals/
src/                       Astro pages, layouts, components (Map, PartCard, Chat island)
src/styles/                tokens.css (design tokens, D13) and base.css; /styleguide/ renders them
workers/knowledge/         retrieve, sync cron, eval, /_status, (later) /mcp
workers/chat/              /api/ask, Turnstile, limits, invites, Durable Object
scripts/                   scan, chunk, invite (create/stats/revoke), check-*
CLAUDE.md                  session rules, incl. trust only Patrick's content (D20)
.claude/settings.json      session rules (deny --no-verify, gh pr merge, pushes outside origin)
.github/workflows/         check workflow (required status check on main, D20)
```

## 10. Threats and residual risks

| Threat | Mitigation | Residual |
|---|---|---|
| Unredacted detail reaches the site or the public repo | Session pre-push scan, Patrick's review + `pnpm scan`, authoritative build scan over `dist/` and `chunks.json` | A pushed branch is public before the build scan; a pre-push deny-list scan is required before item 1.4 (D20). A word missing from the deny-list; the review checklist is the backstop |
| Prompt injection from strangers through issues, PRs, comments or fork branches | `CLAUDE.md`: sessions read and act only on Patrick's (`patrick-diaz-dev`) content; interaction limits to collaborators; fork workflows need approval (D20) | The rule is an instruction, not enforcement; interaction limits lapse after 6 months unless renewed |
| A cloud session merges or pushes to `main` itself | Sessions act as the bot `patrick-diaz-bot` (Write only, no bypass); ruleset (PR required, only Patrick merges, no direct or force push); session settings deny merges and pushes to `main` | Tested in item 0.3: the bot's merge blocked, its direct commit refused (D8) |
| A cloud session reaches the IC repo | No access at all: no token, no GitHub App, not attached; the session proxy refuses repos outside the session (D21, D4) | None from the cloud side; the sync PR's content is the Vision side's responsibility |
| A sync PR carries unscrubbed detail | Vision side scrubs before pushing; `check` workflow scan on the PR; Patrick's review and merge; authoritative build scan | The sync branch is public before any portfolio check runs (D20 risk 1) |
| Malicious npm package | 14-day release age, build scripts blocked, lockfile, few dependencies; runs in a cloud VM or Cloudflare's build, never on the Vision machine | In Cloudflare's build it could misuse the deploy token (e.g. swap the chat Worker to steal the key) → capped by $5/month; rotate keys |
| Chat abuse / cost | Invisible Turnstile, session and invite limits, global daily breaker, $5 workspace cap, prepaid credits | Captcha farms can hit the caps → the chat pauses for the day, the site is unaffected |
| Prompt injection / system-prompt leak | Visitor input as data; no tools; plain-text output; own-domain links only; leak-marker tests | The system prompt may leak; it holds nothing secret |
| Retrieval quality drift | hit@5 gate after every sync; keyword fallback; `/_status` | Workers AI `bge-m3` ≠ Vision's pinned digest; similar, not identical |
| Shared quota starved by MCP | Per-surface counters, kill switch | — |
| Visitor privacy | No text or IP stored; daily totals only; logs off; privacy notice | Anthropic processes the question under its API terms (quoted in the notice) |
