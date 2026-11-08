# Research

Findings for the portfolio site plan, collected on **2026-11-04**. Prices, limits and versions change. Re-check each one at the start of the item that depends on it.

"Pin candidate" means the newest stable release that is at least two weeks old today (released on or before 2026-10-21).

## 1. Frameworks

| | Astro | Next.js | SvelteKit |
|---|---|---|---|
| Pin candidate | `astro` 7.4.1 (2026-10-19); latest 7.4.5 (2026-11-02) | `next` 16.4.2 (2026-10-15) | `@sveltejs/kit` 3.1.0 (2026-10-14), `svelte` 5.57.2 |
| Content pages | Built-in content collections: `src/content.config.ts`, `glob()` / `file()` loaders, Zod schemas, `reference()` between collections, MDX through `@astrojs/mdx` 8.1.0 | MDX through plugins; no built-in typed collections | mdsvex or a custom loader; no built-in typed collections |
| Interactive parts | Islands: static HTML by default, JS only for components that need it (`client:visible`, `client:idle`) | React on every page; server components reduce but don't remove client JS | Svelte compiles small, but the whole page hydrates unless you opt out |
| Output | Static by default; adapters for Cloudflare (`@astrojs/cloudflare` 14.4.1), Vercel, Netlify | Best on Vercel; static export loses features | Static adapter or platform adapters |
| Node requirement | `astro` 7.4.1 requires Node `>=22.22.0` | | |

Fit with Claude Code: all three are well known. Astro makes a content site the least code, and its schemas turn missing or wrong frontmatter into a build error, which is the check that matters when Claude writes pages. Next.js brings a React server runtime this site doesn't need.

Sources: [npm registry](https://registry.npmjs.org/astro) (release dates via the registry API, 2026-11-04); [Astro content collections docs](https://docs.astro.build/en/guides/content-collections/) (read 2026-11-04, documents v7).

## 2. The interactive map

| Option | Weight (min / gzip) | Notes |
|---|---|---|
| Hand-drawn SVG + small TypeScript | ~0 library; a few KB of own code | Each part is a real `<a>` in the SVG: keyboard focus, screen-reader names and no-JS links work by default. The art style is fully ours. |
| React Flow (`@xyflow/react` 12.12.0) | 183 KB / 59 KB, plus React | A node-graph editor: pan, zoom, drag. Its accessibility work targets editing (select, delete, move nodes). Generic look unless restyled heavily. |
| Svelte Flow (`@xyflow/svelte` 1.7.0) | not measured (bundlephobia n/a) | Same model as React Flow; `ariaLabelConfig` since 1.1.0 (2025-06). |
| D3 (`d3` 7.9.0) | 273 KB / 90 KB (full) | For data-driven charts and layouts; the map is a fixed illustration. |
| Motion (`motion` 14.4.0) | 162 KB / 55 KB (full bundle; tree-shaken imports are much smaller) | Optional for transitions; CSS covers hover and focus states. |
| Lottie (`lottie-web` 5.13.0) | 299 KB / 75 KB | Last release 2025-05-21. Needs After Effects or a Lottie editor. |
| Rive (`@rive-app/canvas` 2.45.0) | 269 KB / 68 KB, plus a WASM runtime | Rive editor needed; canvas content is invisible to screen readers without a parallel DOM. |

Accessibility, whatever the tech: hover-only is not enough. Every hotspot needs keyboard focus, a visible focus ring and a tap action on touch screens. A list of all parts must exist as an alternative to the picture. Animation must stop under `prefers-reduced-motion: reduce`.

Sources: [bundlephobia API](https://bundlephobia.com/) (2026-11-04); [npm registry](https://registry.npmjs.org/); [Svelte Flow `ariaLabelConfig`](https://svelteflow.dev/api-reference/types/aria-label-config), [Svelte Flow 1.1 notes](https://svelteflow.dev/whats-new/2025-06-11).

## 3. Hosting and the chatbot backend

### Hosting

| | Cloudflare Workers (static assets) | Vercel Hobby | Netlify Free |
|---|---|---|---|
| Price | Free plan; Paid $5/month | Free; Pro $20/user/month | Free (300 credits/month); Personal $9, Pro $20 |
| Static requests | Free and unlimited | 100 GB bandwidth (third-party figures conflict) | Counted in credits |
| Functions | 100,000 requests/day, 10 ms CPU per request (time waiting on the network doesn't count), no wall-time limit while the client stays connected | Function limits per plan | Functions draw credits (5 or 10 per GB-hour, sources conflict) |
| Terms | | Hobby is for **non-commercial personal use only** | Free credits are a hard limit; sites pause when they run out |
| Notes | Cloudflare points new projects to Workers with static assets instead of Pages. Static file limits (free): 20,000 files, 25 MiB each. | | Billing switched to credits on 2026-04-14 (third-party source) |

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers vs Pages compatibility matrix](https://developers.cloudflare.com/workers/static-assets/compatibility-matrix), [migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/), [Vercel Hobby plan](https://vercel.com/docs/plans/hobby-plan), [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines), [netli.fyi on Netlify credits](https://netli.fyi/blog/netlify-free-plan-limits-2026), [Netlify pricing summary (activepieces)](https://www.activepieces.com/blog/netlify-pricing-plans-limits-and-costs-2026.md), [Cloudflare Pages vs Workers (flaviocopes)](https://flaviocopes.com/cloudflare-pages-vs-workers/). All read 2026-11-04; the Netlify and Vercel numbers are from third parties and need checking on the vendors' pages.

### Abuse controls on Cloudflare

- **Rate limiting binding:** `limit` per `period` of 10 or 60 seconds, per key. It counts per Cloudflare location and is eventually consistent, so it can overshoot. For a strict global limit, Cloudflare recommends a Durable Object. The docs page doesn't say whether the binding is on the Free plan. Requires Wrangler 4.36.0+ ([docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)).
- **Turnstile:** free; up to 20 widgets and unlimited challenges ([plans](https://developers.cloudflare.com/turnstile/plans/)).

### Vector store and embeddings

- **Vectorize** works on Workers Free: 30 M queried and 5 M stored dimensions per month, 100 indexes ([pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)).
- **Workers AI** gives 10,000 free neurons/day. Embeddings: `bge-m3` $0.012, `bge-small-en-v1.5` $0.020 per M input tokens. Small LLMs: Llama 3.1 8B $0.282 in / $0.827 out per M tokens ([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).
- **No vector store at all:** at portfolio size (one piece is roughly 10–20k tokens of approved text), the whole corpus fits in a cached prompt. Retrieval only pays off once the corpus is much larger.

### Model

Claude Haiku 5.5 (`claude-haiku-5-5`), prompts up to 100,000 tokens: **$0.10 / M input, $0.50 / M output**. Cache writes cost $0.125 (5 min) or $0.20 (1 h) / M; cache reads $0.01 / M. Prompts over 100k tokens pay $0.50 / $2.50. That's cheaper than Workers AI's Llama 3.1 8B, and the model is stronger. Thinking is on by default; it can be disabled at effort `high` or below. The citations feature returns the cited passage and its document index. Anthropic doesn't offer an embeddings model.

Sources: [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) (read 2026-11-04); Claude API skill model table (cached 2026-10-06, matches the pricing page).

### Spend limits at Anthropic

A Claude Console organization has monthly **organization** and **workspace** spend limits. Setting them through the Admin API is an early-access preview ([spend limits API](https://platform.claude.com/docs/en/api/beta/organization/spend_limits.md)). A third-party guide describes setting workspace limits in the Console UI (Workspace → Spend limits → Change limit; not for the Default workspace) ([xray.tech](https://www.xray.tech/post/how-to-set-spend-limits-in-claude-console)). No per-key dollar limit is documented, so a dedicated workspace with its own limit is how to cap one key. Check the Console UI at setup.

### Cost estimate for the chatbot

Assumptions: Haiku 5.5, thinking off, 16k-token cached prefix (system prompt + approved corpus of one piece), ~300 new input tokens and ≤350 output tokens per question.

- Cache hit: 16k × $0.01/M + 300 × $0.10/M + 350 × $0.50/M ≈ **$0.0004**
- Cache miss (5-minute write): 16k × $0.125/M + the rest ≈ **$0.0022**

| Questions / month | Whole corpus in cached prompt | Retrieval (6 chunks, ~3k tokens, not cached) |
|---|---|---|
| 100 (nearly all misses) | ≈ $0.22 | ≈ $0.05 |
| 1,000 (≈50 % hits) | ≈ $1.30 | ≈ $0.50 |
| 10,000 (≈90 % hits) | ≈ $5.50 | ≈ $5.10 |

Cloudflare stays at $0 on the free plan at these volumes (10,000 questions/month is far below 100,000 requests/day). The domain costs extra each year. The worst case under abuse equals the provider spend limit.

## 4. Building it with Claude Code

- **Cloud sessions** run in an isolated VM. They count toward the subscription's usage limits, with no separate VM charge, so the cost is predictable ([cloud sessions](https://code.claude.com/docs/en/claude-code-on-the-web)). API billing for design work is open-ended, because screenshots are image tokens and loops repeat.
- **Installed in the VM:** Node 20/21/22 (22 on `PATH`), npm, pnpm, Chrome for Testing at `/usr/bin/google-chrome` (`CHROME_PATH`), git, gh ([cloud environments](https://code.claude.com/docs/en/cloud-environments)). Check the exact Node 22 minor against Astro's `>=22.22.0` with `check-tools`.
- **Network:** "Trusted" access allows package registries (incl. `registry.npmjs.org`) and GitHub. "Custom" sets an own allowlist.
- **Secrets:** environment variables are readable by the session. A network secret is attached by Anthropic's proxy outside the VM, so the session never sees it.
- **Repo settings load only in single-repository sessions.** With several repositories, a session doesn't load hooks or permission rules from any repository's `.claude/settings.json`. Vision docs must therefore come in through a clone inside a single-repo session, not as a second attached repo.
- **GitHub proxy:** rejects branch deletions and tag pushes, but "doesn't limit which branches a push can update". Use branch protection or rulesets on GitHub for that ([cloud environments, GitHub proxy](https://code.claude.com/docs/en/cloud-environments)). Every repo the Claude GitHub App can reach is pushable from any cloud session.
- **Screenshot loop:** a Playwright script (`@playwright/test` 1.64.1, 2026-10-14) against `astro preview` saves PNGs; Claude reads them with the Read tool and compares them with the design notes. Community plugins exist (design-loop, playwright-skill), plus a frontend-design skill from Anthropic. The third-party ones are unpinned and unreviewed ([design-loop](https://design-loop.vercel.app), [playwright-skill](https://github.com/im47cn/playwright-skill)).
- **Accessibility checks:** axe-core through Playwright, plus a Lighthouse run, both in CI.

## 5. Supply chain

- **pnpm** blocks dependency lifecycle scripts by default since 10.x (allowlist for the exceptions). `minimumReleaseAge` (minutes) refuses versions newer than the set age; pnpm 11 reportedly defaults it to one day, and the allowlist key reportedly changed (`allowBuilds`). Check the key names for the pinned major. Pin candidate `pnpm` 12.14.0 (2026-10-15). Sources: [lilting.ch on pnpm 11](https://lilting.ch/en/articles/pnpm-11-minimum-release-age-default-shai-hulud-defense), [Rush Stack pnpm options](https://api.rushstack.io/pages/rush-lib.pnpmoptionsconfiguration), [healsecurity](https://healsecurity.com/pnpm-11-turns-on-minimum-release-age-by-default-to-reduce-npm-supply-chain-risk/).
- Other pin candidates (2026-11-04): `wrangler` 4.151.3, `@anthropic-ai/sdk` 0.137.0 (1.x first released after the cutoff; check again at the chatbot phase), `pagefind` 1.5.2.

## 6. Reference portfolios (structure only)

- **rye.dev "Ask"**: a RAG chatbot on every page of a personal site, built on Cloudflare (AI Search with a Vectorize fallback, Workers AI, AI Gateway logging). Useful for the chat placement and the edge setup ([post](https://rye.dev/blog/building-ask-rag-portfolio-chatbot/)).
- **gaddieldev/portfolio**: a serverless function embeds the question, retrieves the top chunks from precomputed embeddings and streams a Claude answer with inline `[N]` citations. Closest to our citation model ([repo](https://github.com/gaddieldev/portfolio)).
- **Brendan Bycroft's LLM Visualization**: not a portfolio, but the strongest example of an explorable system view. One overview with every component hoverable, plus a guided walkthrough. Desktop-first, which is a lesson for our mobile view ([Hackaday on bbycroft.net/llm](https://hackaday.com/2024/11/20/an-animated-walkthrough-of-how-large-language-models-work)).

Others looked at: [timoajayi/ai-portfolio-assistant](https://github.com/timoajayi/ai-portfolio-assistant) (query router between broad and specific questions), [Transformer Explainer](https://arxiv.org/html/2601.04213v1) (context in the AnimatedLLM paper).
