# Decisions

Each decision lists the options that were rejected and why. Decided in the planning session on 2026-11-04 (grilling, Patrick's answers).

## D1 — A separate repository

- **Decision:** the portfolio lives in its own repository `portfolio-site`, separate from the intelligence-center (IC) repository.
- **Rejected:** `docs/portfolio/` inside the IC repo. A shared history makes one wrong push publish hostnames, ADRs and canary words. The IC docs build, STATUS and phase rules would also collide with this project's own docs.
- **Consequences:** the IC guardrails don't carry over. This repo brings its own secret scan and redaction scan before any content lands (PLAN item 0.2).

## D2 — Outside the IC phase order; content from merged master only

- **Decision:** this is a separate project. Vision's own plan and rules apply to Vision itself. Patrick decides when the build starts. Vision content comes only from docs merged to IC `master`, which reach this repo as `sources/vision/` (D21): never from run records, traces or the vault.
- **Refinements:**
  - Each part page records `as_of` and the commit it describes: since D21, the commit on this repo's `main` that last changed `sources/vision/`.
  - The MVP covers parts that are settled. Moving parts appear as "in progress" nodes with no detail page.

## D3 — The Vision machine holds no hosting or chatbot credentials

- **Decision:** deploys come from the host's Git integration (Patrick merges, the host builds). The chatbot key and its spend limit exist only at the provider and in the host's secret store.
- **Refinements:**
  - Branch preview deploys are off or behind access protection.
  - The CI build fails on any redaction-scan finding, so the gate holds even when a local hook was skipped.
  - The first draft had a separate small-limit embedding key for build-time embeddings. D6 drops it: embedding runs through Cloudflare bindings, which need no key.
- **Correction (research, 2026-11-04):** Cloudflare's Git builds create an API token for the account automatically (Workers Scripts edit, among others) and use it to deploy. So a deploy credential does exist, but only inside Cloudflare's build environment, never on the Vision machine or in a cloud session. Code that runs during the build (dependencies, Astro integrations) could misuse it. The cap on that risk is the Anthropic workspace spend limit, plus key rotation (open point, item 0.4).

## D4 — Build in Claude Code cloud sessions, not on the Vision machine

- **Decision:** the site is built in Claude Code cloud sessions on the `portfolio-site` GitHub repository. Vision content is read from the IC GitHub repository (`master`), read-only.
- **Rejected:**
  - Building on the Vision machine with three layers of local hardening (user-level deny rules, a project allow-list, Claude Code's bubblewrap sandbox). It would have worked, but Patrick judged it too complicated, and every `npm install` would run third-party code on a machine that holds private credentials.
  - A separate Linux user `portfolio` on the Vision machine. It needs sudo and a copy step for the docs.
- **Why:** the cloud VM has no path to the Vision machine, no private credentials and no local network access. Builds run on the subscription, at a predictable cost. Chrome and pnpm are already installed there.
- **Consequences (from research, details in [RESEARCH](RESEARCH.md#4-building-it-with-claude-code)):**
  - **Vision docs come in through a clone, not as a second attached repo.** A cloud session with several repositories doesn't load any repo's `.claude/settings.json` hooks or permissions, so sessions stay single-repo. Since D21 the notes arrive in this repo (`sources/vision/`), so nothing is cloned.
  - The GitHub proxy doesn't limit which branches a push can update, so every repo the Claude GitHub App can reach is pushable from a session. The app is installed on `portfolio-site` only (D10).
  - **Seen in item 0.3 (2026-11-09):** the session's git proxy refuses every repo outside the session's own set, before GitHub is asked (T3, and the IC read in D21). It also refused deleting a branch on `portfolio-site` (`HTTP 403`), so Patrick deletes test branches in the browser.
  - These planning docs were committed in a local clone. Patrick creates the GitHub repo and pushes them.

## D5 — Secret denies on the Vision machine are IC hardening, outside this project

- **Decision:** the user-level Claude Code deny rules for secret files from planning Q4 stay as general hardening for every Claude session on the Vision machine. They're handled in the IC repo and aren't part of the portfolio plan.
- **Known limit:** such rules cover Claude's file tools and the shell commands Claude Code recognizes, not scripts that open files themselves or MCP servers (Claude Code permissions docs, read 2026-11-04).

## D6 — One shared public knowledge index for every chatbot on the site

Decided 2026-11-04 (planning Q11a–d). This replaces the first draft, which sent the whole corpus in a cached prompt.

- **Corpus (Q11a):**
  - Approved Markdown in `content/knowledge/<piece>/<slug>.md`: one entry per decision, rejected option, testing note or lesson, written from ADRs and Vision's portfolio notes.
  - Frontmatter: `id, piece, part, page, anchor, kind, sources, as_of, source_commit`, plus the approval state (D7, next round).
  - Detail pages render their own entries, so every citation lands on visible text at `page#anchor`.
  - The build fails on a missing `page`/`anchor` or a missing field.
  - The corpus build reads only `content/knowledge/**`. There is no import path from Vision's database.
- **Index (Q11b):**
  - Chunked at build time the way Vision does it (ADR 0022 in the IC repo: by heading, 500–800 tokens, ~10 % overlap). Output: `chunks.json` with a corpus hash, plus a keyword index.
  - Embedded with `@cf/baai/bge-m3` on Workers AI and stored in Vectorize, both through Cloudflare bindings inside the deployed knowledge Worker. A cron trigger diffs chunk hashes, upserts and deletes.
  - Metadata indexes `piece` and `kind` are created before the first insert. Each vector stores `embed_model = workers-ai:@cf/baai/bge-m3`.
  - Hybrid retrieval: vector plus keyword, fused by reciprocal rank (k = 60).
  - While the index lags the deploy, retrieval uses keyword only and says so.
  - Spend control is the Workers Free plan's allowance. Item 0 checks that it fails closed instead of billing.
- **API (Q11c):**
  - The `knowledge` Worker exposes `retrieve({query, pieces?, kinds?, k})`. Chatbots call it over a Service Binding and filter by their `piece` tag.
  - A public read-only MCP endpoint (`search_portfolio`, `get_page`) comes in a later phase. It has no LLM behind it, per-surface daily counters in a Durable Object, and a kill switch.
- **Chat (Q11d):**
  - Input ≤ 500 characters; the last 3 turns stay in the browser.
  - `retrieve` k = 6. Below the score threshold with no keyword hit: a fixed answer, with no model call.
  - Otherwise Haiku 5.5 with the chunks as document blocks, citations on, thinking off, `max_tokens` 400.
  - Plain-text output with links to our own domain only. A leak marker in the system prompt, and a fixed refusal message.
  - Cost ≈ $0.0005 per question (≈ $0.05 / $0.50 / $5.10 per month at 100 / 1,000 / 10,000).
  - Quality gate: public `evals/retrieval.yaml`, hit@5 ≥ 0.8, run inside the Worker after each sync. `/_status` shows only the index version, the chunk count and hit@5.
- **Rejected:**
  - The whole corpus in a cached prompt: doesn't scale to several pieces, and can't be shared between chatbots.
  - A copy of Vision's knowledge database: it holds vault notes, paths and private metadata.
  - Build-time embedding with a Cloudflare API token in the build environment: third-party build code could empty or poison the index with it.
- **Known difference:** Workers AI's `bge-m3` isn't the pinned Ollama digest Vision uses. Retrieval behaves similarly, not identically. The portfolio's own eval is the gate.

## D7 — Stack: Astro 7 static, hand-drawn SVG map, Cloudflare Workers

Decided 2026-11-04 (planning Q8–Q10).

- **Framework:** Astro 7, fully static (pin candidates `astro` 7.4.1, `@astrojs/mdx` 8.1.0). Typed content collections in MDX; islands only for the map and the chat; no server rendering. Node `>=22.23.4` (astro 7.4.2's minimum, since item 0.4) is checked in the cloud VM. pnpm is pinned through `packageManager`, with `minimumReleaseAge` 14 days and dependency build scripts off except an allowlist.
  - Rejected: Next.js 16 (a React runtime the site doesn't need); SvelteKit 3 (no built-in typed collections).
- **Map:**
  - An SVG illustration whose parts carry ids, plus `map.yaml` (id, label, one-line description, page, status), plus ~3 KB of own TypeScript for the hover/focus cards.
  - Every part is a real `<a>`. On touch screens the first tap opens a card with an "Open" button. No pan or zoom. A plain list of all parts works without JS.
  - Build check: every `map.yaml` part has its SVG element and a page or `status: in-progress`.
  - CSS-only motion, off under `prefers-reduced-motion`. Gates: axe-core in CI, mobile Lighthouse ≥ 95.
  - Rejected: React/Svelte Flow (an editor we don't need; 59 KB gzip plus React for React Flow; generic look), D3 (built for data charts), Lottie/Rive (~70 KB each; canvas is invisible to screen readers).
- **Hosting:** Cloudflare Workers with static assets, free plan. Cloudflare's own Git builds deploy on merges to `main`; builds for other branches are off. Build command `pnpm check && pnpm build`. Worker logs are off on the chat route.
  - Rejected: Vercel Hobby (its terms allow non-commercial personal use only); Netlify (sites pause when the free credits run out).
  - Lock-in: only the Workers are Cloudflare-specific.

## D8 — Approval = Patrick's merge, enforced by GitHub rulesets

Decided 2026-11-04 (planning Q12, replaced by Patrick's design). **D20 (2026-11-09) replaces the paid plan:** the repo is public in `patrick-diaz-lab` on GitHub Free, where rulesets are enforced. The ruleset itself stays as below.

- **Decision:**
  - Patrick takes GitHub's paid plan so rulesets are enforced on private repos. GitHub Team, $4 per user per month (github.com/pricing, 2026-11-04), covers organization repos. GitHub Pro only covers repos in a personal account. So `portfolio-site` is created in the same organization as `intelligence-center`, and one Team seat covers both.
  - `portfolio-site` `main` gets: pull request required, only Patrick merges, no force push, no direct push (`Restrict updates` with bypass only for the admin role, in "pull requests only" mode if the plan offers it; `Block force pushes`; `Restrict deletions`).
  - Approval of content is Patrick's merge of a PR he reviewed. Everything on `main` counts as approved. Drafts live only on branches.
- **Rejected:**
  - A `review.status` frontmatter field: a cloud session can write it.
  - A signed approval manifest (SSH signature checked in the build): it works without GitHub, but Patrick judged it too complex.
- **Open, verified in item 0.3:** whether GitHub can tell Patrick's own merge from a cloud session acting for him through the Claude GitHub App. Rulesets grant bypass to roles, teams and apps, not to single users; the docs don't say how an app acting for a user is evaluated. Done-when: a test PR merge and a direct push to `main`, both from a cloud session, fail. If they succeed, the fallback goes to Patrick: a second GitHub account that alone holds the admin (bypass) role and is never connected to Claude.
- **Fallback chosen 2026-11-09 (Patrick), before the test:** the roles are split the other way round. Patrick's own account `patrick-diaz-dev` keeps admin; Claude's GitHub connection is switched to a separate bot account `patrick-diaz-bot`.
  - The bot is an outside collaborator with **Write** on `portfolio-site` only: no admin, no org membership, no other repo. 2FA on, credentials in Patrick's password manager, email private (steps in [STEPS](STEPS.md) B.9).
  - The `main` ruleset's bypass list holds only the Repository admin role, in "pull requests only" mode, so the bot has no bypass.
  - **Item 0.3 tests, 2026-11-09, all as `patrick-diaz-bot`: all refused.**
    - **T3, push of a test branch to `patrick-diaz-lab/.github` from a cloud session:** refused by the session's git proxy, before GitHub was asked: `access denied by the git proxy: patrick-diaz-lab/.github is not in this session's authorized repository set, so the proxy will not inject a credential for it.` and `The requested URL returned error: 403`. This proves the session can't push there; the bot's own GitHub permissions weren't reached.
    - **T4, merge of a PR by the bot:** proven by the API state and the UI.
      - API, test PR #4 (green `check`): GitHub answered the bot with `mergeable_state: "blocked"`, and `main` stayed at `4bf3a02` (Patrick's merge of PR #3). The session's own merge attempt never ran: Claude Code's auto mode refused to lift the deny rule.
      - UI, PR #5 with all checks green: Patrick, signed in as the bot, saw "Merging is blocked — Cannot update this protected ref." (PR #4's merge box wasn't captured before it was closed.)
    - **T5, direct commit to `main`:** proven by the UI refusal. Patrick, signed in as the bot, edited `README.md` on `main` in the browser; GitHub showed "You can't commit to main because it is a protected branch" and offered only "Create a new branch for this commit and start a pull request".
    - So the bot can't change `main` except through a PR that Patrick merges. D8 stands with the bot account.
- **IC side:** protection of the IC repo is handled in the IC repo.

## D9 — Redaction scan

Decided 2026-11-04 (planning Q13, simplified by Patrick).

- **Where:**
  - A pre-commit/pre-push hook in sessions (`--no-verify` denied).
  - A check before Patrick merges: the PR checklist, plus `pnpm scan` on his machine.
  - Cloudflare's build, over the sources, the built output (`dist/**`) and `chunks.json`. This run is authoritative.
- **Rules:**
  - Generic patterns: IP addresses, MAC addresses, private network names, ports, absolute and home paths, env-file paths, VM IDs, emails other than the public contact, phone numbers, UUIDs, the IC guardrail's secret patterns, and pinned gitleaks.
  - The private deny-list (hostnames, LAN names, canary words, employer name, other people's names) is a **secret Cloudflare build variable**, never in the repo. Patrick keeps a local copy for `pnpm scan` on his own machine.
- **Exceptions:** only in `redaction/exceptions.yaml`. It changes only through a reviewed merge, like everything else on `main`.
- **No hostnames in the repo (2026-11-10):** machine names, hostnames and LAN names never appear in anything committed, docs included. Write a role instead ("the home server", "the Vision machine", "the GPU PC"). The deny-list catches them, but only in the Cloudflare build, after the branch is already public.
- **Logs:** a deny-list hit reports the rule and `file:line`, never the matched word. The summary line reports the number of deny-list entries (never the entries), so a list that doesn't parse is visible.
- **Found in item 0.4 (2026-11-10):** Cloudflare's secret field is single-line, so a list entered one entry per line became one long entry that never matched: the canary test passed the scan, and the production builds before it ran with an ineffective list. Fix: `|` and `;` also separate entries, and the entry count is printed.
- **Item 0.4 test result (2026-11-10):** the deny-list works in the production build.
  - After the separator fix (PR #10), the production build's scan reported `(deny-list: 18 entries)`, found **2 real deny-list hits** (a hostname in `docs/DECISIONS.md:321`, removed in PR #11) and **stopped before deploy**. The log named only the rule and `file:line`.
  - The planted canary was proven locally: `scan.ts` with a test list holding the canary mid-list reported `deny-list  docs/test-0.4-planted.md:3` and exited 1, without printing the word.
  - After the canary was removed and PR #11 merged, the production build passed with the full entry count.
  - **Preview builds can't be used for this test:** three fresh preview builds of the canary branch all reported `(deny-list: 1 entry)` although the Previews secret had been re-entered with `|` separators. Cloudflare apparently doesn't pass that secret as entered. Not debugged: preview builds stay off, and the Previews secret was deleted.
- **Gap:** session-side hooks don't have the deny-list, so they catch only the generic patterns. The build blocks the deploy. **Since D20 the repo is public,** so pushed text is public before the build runs. So a pre-push scan with the deny-list is required before item 1.4 (D20).
- **Also:** EXIF and other metadata are stripped from images in the build. Eval numbers are published only as aggregates (never case contents, never the held-out split). A check in `pnpm check` warns on 40 or more consecutive words copied verbatim from `sources/vision/` (D21).

## D10 — How cloud sessions read Vision docs

Decided 2026-11-04 (planning Q14). **Replaced by D21 (2026-11-09): cloud sessions never get any access to the IC repo.** Kept below for the record.

- The Claude GitHub App is installed on `portfolio-site` only (selected repositories).
- A fine-grained token (`Contents: read`, `intelligence-center` only, 30-day expiry) sits as an environment variable in a dedicated cloud environment `portfolio`. A setup step sparse-clones `docs/` at a pinned `master` commit into the git-ignored `.cache/vision-src`, with pushing disabled.
- Done-when (item 0.3): the clone works and a push to the IC repo fails.
- Patrick renews the token, with a reminder date.
- Residual risk: a leaked token exposes the text of Vision's private docs, which hold no secrets.
- The Claude GitHub App is never installed on the IC repo.

## D11 — Chat rate limits, logging and privacy

Decided 2026-11-04 (planning Q15).

- Turnstile (free, managed) before the first question. Then a signed session cookie: HMAC, 24 h, HttpOnly, SameSite=Strict. No IP is stored.
- Limits: 5 questions per 10 minutes and 20 per day per session, counted in a Durable Object, with the rate-limit binding as a first cheap layer. A global daily circuit breaker sits below the Anthropic workspace spend limit. Its value is a Worker setting, not in the repo.
- Logging: daily totals only (questions, no-match answers, refusals, rate-limited, tokens in/out, cost in USD, errors). No question text, no IP; session counters expire after 24 h; Worker logs off.
- A privacy notice states what's sent (question + last 3 turns), to whom (Cloudflare, Anthropic), what's kept and which cookies are set. Anthropic's API retention terms are checked and quoted in the chatbot phase. Drafted for Swiss data protection law and the GDPR.
- Rejected: IP-based limits (shared IPs; personal data).

## D12 — The source repo is private

Decided 2026-11-04 by Patrick (planning Q16). **Replaced by D20 (2026-11-09): the repo is public.**

- **Decision:** `portfolio-site` is a private repo in the same organization as `intelligence-center`; only the built site is public. Drafts and work branches stay private, so the redaction scan has to protect only what gets deployed.
- **Rejected for now:** a public repo. Every pushed branch, drafts included, would be public before the build's deny-list check runs.
- **Later option:** a public `portfolio-site-code` mirror with code only (no `content/`, no `.cache/`), each export through Patrick's merge. Not part of the MVP.

## D13 — Art direction: annotated schematic

Decided 2026-11-04 by Patrick (planning Q17).

- **Decision:**
  - The map is a precise line drawing like an engineer's sheet: modules as labelled blocks, wires between them, hand-lettered side notes that link to decisions, small dimension marks, and a signal dot along a wire on hover/focus.
  - On phones it becomes a vertical wire with the modules along it (the line-network logic).
  - Patrick brings the inspiration for the signature twist (palette, lettering, texture).
- **Rules:**
  - The palette meets at least WCAG AA, checked by axe in item 1.
  - Hand lettering is decoration only; labels are real SVG `<text>` or HTML.
  - Motion is CSS only, on hover/focus, never autoplay, and off under `prefers-reduced-motion`.
- **Rejected for the MVP:**
  - A line network as the main style: common among developer portfolios, and close to well-known city diagrams.
  - An isometric machine room: the most drawing work.
- **Later:** the isometric machine room stays a possible **hero image** after the MVP (it may need Patrick's own assets or an illustrator, which is a separate decision).

## D14 — Domain `patrickdiaz.dev` at Cloudflare Registrar

Decided 2026-11-04 by Patrick (planning Q18).

- **Decision:**
  - `patrickdiaz.dev`, bought at Cloudflare Registrar (`.dev` is supported; registry: Google Registry). It was unregistered in an RDAP lookup on 2026-11-04; the price is checked at purchase.
  - The public contact is an alias on this domain, forwarded to Patrick's inbox by Cloudflare Email Routing. It's the only email address the redaction scan allows.
  - The site title and meta description say "AI/LLM engineer", to tell this site apart from other people with the same name.
- This domain's MX records belong only to Email Routing.
- **No `.ch` for now** (Q18b, Patrick): revisit if the job search focuses on Switzerland. Cloudflare Registrar doesn't offer `.ch` (TLD policies page, 2026-11-04), so it would need a Swiss registrar, plus a free Cloudflare DNS zone with one redirect rule.
- **Rejected:** `patrickdiazalvarez.dev` (long to type and say); `patrickdiaz.ch` as the main domain (says nothing about engineering).

## D15 — Chat spend cap $5 per month

Decided 2026-11-04 by Patrick (planning Q19).

- **Decision:**
  - A dedicated Anthropic Console workspace `portfolio-chat` with a $5/month spend limit; the chat key exists only there.
  - Prepaid credits with auto-reload off form a second hard ceiling.
  - A second workspace `portfolio-dev`, with its own small cap, carries the test deployment and the prompt-injection tests (< $0.10 per run).
  - Neither key lives in the Default workspace, which can't be capped separately.
- **Why $5:** the global daily breaker (D11) is set so that a full month of it stays below $5 at ≈ $0.0005 per question. The breaker stops the chat before the money runs out, and a stolen key (D3 risk) costs at most $5 a month.
- **To check at setup:** that workspace limits can be set in the Console UI (a third-party guide says yes; the Admin API for them is early access).

## D16 — No login for visitors: invisible Turnstile and signed invite links

Decided 2026-11-04 by Patrick (planning Q19 addition, Q20).

- **Turnstile in Invisible mode** for everyone. Managed mode can ask risky-looking visitors to tick a checkbox (Cloudflare widget docs, 2026-11-04), so it's rejected: recruiters must never hit a login or a challenge. If the check fails, the chat says "couldn't verify, retry"; the starter chips and the site keep working.
- **Anonymous limits:** 5 questions per 10 minutes and 20 per day per session (D11). Anonymous traffic gets only part of the global daily breaker, so invited visitors keep capacity.
- **Invite links:**
  - `pnpm invite create --days N --label <company> [--limit 50]` runs on Patrick's machine and signs `{v, id: "inv_<random>", exp, limit}` with an **Ed25519 private key only Patrick holds**. The Worker has only the public key (`INVITE_PUBKEY`), so it can verify invites but never mint them.
  - The company label stays in a local id → label file next to the key, never in the token, repo or Worker.
  - The Worker swaps the link token for an HttpOnly invite cookie and redirects to the URL without the token.
  - Per invite id, the Durable Object keeps only `first_used`, `count_total` and `count_today`, never question text. Each invite has its own daily limit (default 50), outside the anonymous counters, inside the global breaker and the $5 cap.
  - `pnpm invite stats` (a timestamped request signed with the same key, to `/admin/invites`, returning only ids and counts) and `pnpm invite revoke <id>` (a revoke list in the Worker's settings).
- **Key backup and rotation (Patrick's step list):**
  - Back up the invite private key in the password manager.
  - Rotation: create a new key pair → set the new `INVITE_PUBKEY` in the Worker → all old invites become invalid → send new links where still needed.
- **Rejected:**
  - A shared HMAC secret: anything that can read the Worker's secrets could mint invites.
  - Readable company labels in the link: they would leak where Patrick applies.
  - Cloudflare Access for the stats: another service and a login.

## D17 — Starter questions with pre-written answers

Decided 2026-11-04 by Patrick (planning Q21).

- Eight chips for the Vision piece, with pre-written answers and citations, built in at build time. No model call and no limit; a typed question that matches a starter (case and spacing normalised) gets the same answer.
- The questions:
  1. What is Vision, in one minute?
  2. Why does every model call go through a gateway?
  3. How do you keep agent costs under control?
  4. How do you test an agent? What does the eval harness measure?
  5. What stops the agent from doing something dangerous?
  6. Why self-host instead of using a hosted agent platform?
  7. Which design option did you reject, and why?
  8. How was this chatbot built?

  Patrick adjusts the wording when the answers get written (chatbot phase).
- Answers live in `content/starters/<piece>/*.md` and are written from approved knowledge entries. They go through the redaction scan and Patrick's merge. The build fails on a missing cited entry or anchor, and warns when a cited entry changed after the answer's `as_of`.
- #5 names the layers (guardrails, sandbox, approvals, budgets), never rule details, patterns or paths. #6 makes no claims about other vendors.

## D18 — What the site says about Patrick

Decided 2026-11-04 by Patrick (planning Q22).

- **Published:**
  - "Patrick Diaz — AI/LLM engineer", with a short bio Patrick writes himself. It may describe his background generically ("IT operations in the Swiss public sector") but never names the employer.
  - Location: country only.
  - Education: "BSc Computer Science (FFHS), focus on machine learning and data engineering, expected 2027".
  - Links: GitHub profile, LinkedIn, and `hello@patrickdiaz.dev` (D14).
- **Not published:** employer names (they're on the deny-list, D9), a CV PDF (metadata, hard to scan; sent on request), phone, address, city or region.
- **Later option:** a portrait, with metadata stripped by the build.
- **Merge-review checklist:** photos show no labels, readable device IDs or views out of the window. The deny-list must not contain the generic words of the bio ("public sector").

## D19 — MVP scope, piece template and phase order

Decided 2026-11-04 by Patrick (planning Q23–Q25).

- **MVP pages (Q23):** the Vision overview plus four detail pages, all on parts that are merged on IC `master`:
  1. LiteLLM gateway, aliases and budgets (ADR 0006, 0014, 0020).
  2. Agent core: routing and tool use (ADR 0010, 0011, 0024).
  3. Eval harness (ADR 0021, 0022), with aggregate numbers and with/without pairs only where measured.
  4. Guardrails for the coding agent (ADR 0019, 0025, 0030, guardrails runbook): layers and reasons, never rules, patterns or paths.

  Map nodes without a page: MCP servers, knowledge core, Claude worker tier, Telegram adapter (`built`); console (`in-progress`); job contract, heartbeat, sandbox (`planned`). Nothing planned is presented as done.
- **Piece template (Q24):** `piece.yaml`, `map.yaml`, part MDX with fixed sections, knowledge entries and starters, all schema-enforced (details in [ARCHITECTURE](ARCHITECTURE.md#3-content-model-the-reusable-piece-template)). A `built` part with a page needs at least one `decision`, `rejected`, `testing` and `learning` entry. `evals[]` takes numbers only.
- **Phases (Q25):** 0 Setup → 1 MVP (launch without chatbot) → 2 Knowledge index → 3 Chatbot → 4 Public MCP endpoint → 5 Later. One phase at a time.
- **Phase 5 addition (Patrick):** "design note" pages for planned parts (job contract, sandbox, heartbeat): problem, decision, rejected options. Clearly labelled **"designed, not built"** and never presented as running. They use `status: planned` and a distinct visual label, and no `How it's tested` section with numbers.

## D20 — The source repo is public, in the organization `patrick-diaz-lab`

Decided 2026-11-09 by Patrick. Replaces D12, and the paid-plan part of D8.

- **Decision:** `portfolio-site` is a **public** repo in the GitHub organization `patrick-diaz-lab`, on the **Free plan**. No paid GitHub plan.
- **Why:**
  - GitHub Free enforces rulesets on public repos, and secret scanning with push protection is free there. D8 needed GitHub Team only because rulesets aren't enforced on private repos without a paid plan.
  - The code is part of the portfolio. The later code-only mirror (D12) is no longer needed.
- **Settings (exact steps in [STEPS](STEPS.md) A):**
  - Ruleset on `main`: pull request required, required status checks (added once the check exists, item 0.2), no direct push (`Restrict updates`, bypass only for the admin role in "pull requests only" mode), no force push, no deletion. Only Patrick merges.
  - Secret scanning and push protection on, before the first push.
  - Interaction limits: issues, comments and PRs only from collaborators. GitHub caps a limit at 6 months, so Patrick renews it.
  - Actions: workflows from outside contributors need Patrick's approval; the workflow token is read-only and can't approve PRs.
  - Wiki, Discussions and Projects off.
  - Organization: 2FA required, base permission "No permission", members can't change visibility.
- **Session rule (`CLAUDE.md`):** sessions read and act only on what Patrick (`patrick-diaz-dev`) wrote. Issues, PRs, comments, reviews, commits and branches from any other account are never read or acted on. The author is checked from metadata before any body is read. This closes the prompt-injection path from strangers to a session that can push.
- **Risks:**
  1. **Every pushed branch is public at once,** before Cloudflare's build scan runs. This is why D12 chose private. A draft with a hostname or the employer's name is public, and may be cached or forked, even if it's never merged. Secret scanning finds tokens, not names.
     - **Decided 2026-11-09 (Patrick):** a pre-push scan with the private deny-list in sessions is a required step before item 1.4 (PLAN item 1.3a). No item that writes content from IC docs starts before it. Where the session's copy lives is set in that item. Recommended: a variable in the cloud environment `portfolio`. (The first reason given here, that the session already held an IC docs clone, no longer holds since D21; weigh it again in item 1.3a.) Alternative: drafts in a separate private repo, with only merged content exported.
  2. **History is public for good.** Forks, caches and archives keep what was pushed, so deleting later doesn't help. A leaked secret is rotated, never just removed. So the first push is a fresh single-commit history, scrubbed on 2026-11-09.
  3. **Prompt injection from strangers** through issues, PRs, comments or fork branches. Mitigated by the `CLAUDE.md` rule and interaction limits. Residual: the rule is an instruction, not enforcement, and the interaction limit lapses if not renewed.
  4. **The planning docs are public,** including the threat model. Open weak points are written generally, without names, until they're fixed.
  5. **Actions logs are public.** Checks never print a matched deny-list word, a secret or an environment value (D9 rule).
  6. **"Only Patrick merges"** was tested in item 0.3 with the bot account (D8): the bot's merge was blocked (API state and UI) and its direct commit to `main` refused (UI).
- **Consequences:**
  - The redaction scan covers every file in the repo on every branch, `docs/` included (D9).
  - STEPS A drops GitHub Team.
  - Protection of the IC repo is handled in the IC repo.
- **Rejected:**
  - Private on GitHub Team ($4 per user per month): Patrick doesn't want a paid plan.
  - Private on the Free plan: rulesets aren't enforced, so "only Patrick merges" would rest on settings alone.

## D21 — Vision source notes arrive in this repo, in `sources/vision/`

Decided 2026-11-09 by Patrick (export repo), changed 2026-11-10 by Patrick (notes in this repo). Replaces D10.

- **Why D10 failed (item 0.3, 2026-11-09):** the cloud session's network proxy sends every request to GitHub through the session's own GitHub access, which covers only the attached repos. A token in an environment variable can't get past it: `git ls-remote` to the IC repo got a 403 from the proxy with the token in the request. The only way in would have been attaching the IC repo to the session, which D10 forbids.
- **Decision:**
  - Vision's portfolio notes (its `docs/portfolio/`, already written for publication) arrive **in this repo** under `sources/vision/`. The Vision side's export script pushes a `vision-sync/<date>` branch and opens a PR, authored by `patrick-diaz-dev`, whose commit carries a `Source-Tree:` trailer (the IC tree id; no IC commit hash in public). Patrick merges it. The first sync is PR #6 (2026-11-10).
  - **The cloud never gets any access to the IC repo:** no token, no GitHub App, no attached repo. Sessions read `sources/vision/` on `main` like any other file. Nothing external is pinned or fetched.
  - `sources/vision/` is a mirror: sessions never edit it (denied in `.claude/settings.json`); the next sync overwrites it. A session's PR that touches it is wrong.
  - A sync PR is trusted only if its author is `patrick-diaz-dev`, its branch is `vision-sync/*`, its commit has the `Source-Tree:` trailer, and it touches only `sources/vision/`. Until Patrick merges it, a session treats it as unreviewed data.
  - `VISION_DOCS_TOKEN` and the session-start clone hook are dropped; Patrick revoked the token.
- **Consequences:**
  - **What a page describes** (D2): `source_commit` is the commit on this repo's `main` that last changed `sources/vision/` (`git log -1 --format=%H -- sources/vision`), not an IC commit.
  - **ADRs are not read.** Anything a page needs goes into `docs/portfolio/` on the IC side first. Knowledge entries cite files under `sources/vision/`, not ADR numbers.
  - **The notes are public** once the sync branch is pushed, before any portfolio check runs. Their redaction is the IC side's job; the `check` workflow's scan (without the deny-list) runs on the sync PR, and the authoritative build scan covers them too, because they're in the repo.
  - **Verbatim copies:** `pnpm check` warns when a file outside `sources/vision/` repeats 40 or more consecutive words from it (D9). The check prints `file:line` and the source file, never the text.
  - The sync PR is the one kind of PR not written by a session; it lands only through Patrick's merge, like everything else (D8).
  - **Residual risk, accepted by Patrick 2026-11-10:** the deploy key the home server uses to push sync branches can push *any* branch to `portfolio-site`, not only `vision-sync/*`. Accepted because the key lives only on the home server behind its guardrail, `main` is protected by the ruleset, and any other branch it pushed would be public and visible.
- **Rejected:**
  - The D10 token clone: blocked by the proxy (above).
  - Attaching the IC repo to the session: gives the cloud access to the whole IC repo.
  - A public export repo `vision-portfolio-notes` (the first version of this decision): a second repo to protect, and a pin to keep in step. Notes in this repo get the ruleset, the checks and Patrick's merge for free.
