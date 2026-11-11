# Patrick's steps

Everything only Patrick can do, in order. Claude does none of these: no accounts, no keys, no payments. Each step names the plan item that needs it ([PLAN](PLAN.md)).

## A. Before Phase 0 (item 0.1)

The repo is public in `patrick-diaz-lab` on GitHub Free (D20). Settings come **before** the first push, the ruleset right after it.

1. **Organization `patrick-diaz-lab`:** 2FA required; base permission "No permission"; members can't create public repos or change visibility; OAuth app access restricted.
2. **Create `portfolio-site`** in `patrick-diaz-lab`, **public**, empty (no README, license or `.gitignore`).
3. **Repo settings before the first push:**
   - Features: Wikis, Discussions and Projects off. "Allow auto-merge" off; "Automatically delete head branches" on.
   - Security: secret scanning on, **push protection on**; Dependabot alerts on; private vulnerability reporting on.
   - Actions: approval required for workflows from all outside contributors; workflow token read-only; Actions can't create or approve PRs.
   - Moderation: interaction limit "repository collaborators only" for 6 months; code review limited to users with explicit access. **Calendar reminder to renew before it expires.**
4. **Push the planning docs** from your local clone as a **fresh single-commit history** (D20). Claude prepares the branch `public-main` on your OK. Then: `git remote add origin <url> && git push -u origin public-main:main`. Push only this branch, never `--all`. Then `git checkout -B main origin/main`.
5. **Ruleset on `portfolio-site` `main`:** target the default branch; bypass only the Repository admin role, in "pull requests only" mode; Restrict updates, Restrict deletions, Block force pushes, Require a pull request (0 approvals, because you can't approve your own PR). **Require status checks** is added in item 0.2, once the `check` workflow has run once (D8, D20). Test: a direct `git push` to `main` from your local clone must be refused.
6. **Claude GitHub App:** installed on `portfolio-site` only ("selected repositories"), never on the IC repo (D21).
7. **Cloudflare account** (free plan), with 2FA on.
8. **Register `patrickdiaz.dev`** at Cloudflare Registrar. Check it was still free and that registrant data is redacted (D14).

## B. Phase 0 setup (items 0.3, 0.4)

9. **Bot account `patrick-diaz-bot`** for Claude's GitHub connection (D8, done 2026-11-09):
   - Create the GitHub account; turn on 2FA and keep its password and recovery codes in your password manager.
   - Settings → Emails: keep the email address private.
   - Add it to `portfolio-site` as an **outside collaborator with Write**, on no other repo and not as an org member.
   - Connect Claude's GitHub (claude.ai) to the bot account, not to `patrick-diaz-dev`. Check in a session that GitHub reports the bot and that only `portfolio-site` is listed.
   - Create the cloud environment `portfolio` at claude.ai/code. It holds no token or secret (D21): revoke the earlier IC docs token on GitHub and remove the `VISION_DOCS_TOKEN` variable from the environment.
10. **Connect Cloudflare's Git build** to `portfolio-site` (D7, item 0.4). Workers & Pages → Create → Import a repository:
    - `workers.dev` subdomain: keep the existing one (Patrick's public GitHub handle; decided 2026-11-10, nothing new revealed). The hello page lives there until item 1.9.
    - Worker name `portfolio-site` (must match `wrangler.jsonc`). Production branch `main`. **Builds for non-production branches: off.**
    - Build command `pnpm check && pnpm build`; deploy command `npx wrangler deploy` (uses the pinned wrangler).
    - Build variables (plain): `GO_VERSION` = `1.24.11` (the image's default Go is older than `tools/gitleaks/go.mod` needs), `PNPM_VERSION` = `12.15.0`, `WRANGLER_SEND_METRICS` = `false`. Node comes from `.node-version`.
11. **Deny-list:** write your private list (hostnames, LAN names, canary words, employer name and variants, other people's names) and store it as a **secret build variable `REDACTION_DENYLIST`** in the Worker's build settings. The secret field is single-line, so separate entries with `|` (or `;`), e.g. `entry one | entry two | entry three`; line breaks also work in a file. Matching is case-insensitive and whole-word (details in [README](../README.md#checks)). Check the next build log: the scan line must say `(deny-list: N entries)` with your number of entries. Keep a local copy for `pnpm scan` on your own machine, never on the Vision machine (D9). Before item 1.4, also give the sessions' pre-push scan its copy, where item 1.3a says (D20).
11a. **Hashed deny-list for sessions** (item 1.3a, D20). The plaintext list never goes into a session; sessions get salted hashes only.
    1. On your PC (or the home server) with Node 22.18 or newer: get `scripts/denylist-hash.ts`, either with `git pull` in your local clone or by downloading that one file from `main` on GitHub (the raw file view). It needs no `pnpm install`.
    2. Run `node denylist-hash.ts` in your own terminal (not in a Claude session; it refuses there). Paste the list, then press Ctrl+D (Windows: Ctrl+Z, then Enter). Nothing is written to disk.
    3. It prints the entry count, the longest entry in words, and a note about entries under 6 characters (expected; Cloudflare's plaintext gate stays authoritative). Then it prints one line starting with `v1;`.
    4. Set that line as `REDACTION_DENYLIST_HASHES` in the cloud environment `portfolio`, and set `REDACTION_REQUIRE_DENYLIST` = `1`. Both take effect at the next session start.
    5. In the next session, Claude runs `pnpm scan` and reports the line `(deny-list: N hashed entries, span K)`. Check that N matches your list.
    6. After every change to the list: run the script again (it makes a new salt) and replace the variable.
12. **Run the item 0.3 tests with Claude** (as the bot): a push of a test branch to `patrick-diaz-lab/.github`, a merge of a test PR on `portfolio-site` and a direct push to `main` must all fail. If any succeeds, D8 comes back to you.
12a. **Item 0.4 deny-list test** (done 2026-11-10; details in [DECISIONS](DECISIONS.md#d9--redaction-scan) D9):
    - The planned canary on a preview build didn't work: preview builds never received the Previews secret as entered (always 1 entry). Preview builds are off again, the Previews secret is deleted, the test branch is deleted and the canary is out of the list.
    - Evidence used instead: the production build after PR #10 (18 entries, 2 real hits, stopped before deploy), a local canary run of `scan.ts`, and production build `de27d6eb` after PR #11 (17 entries, passed and deployed).
    - **After every change to `REDACTION_DENYLIST`:** start a fresh production build (a merge, not a retry; a retry may reuse the old values) and check that the log shows the expected `(deny-list: N entries)`.
13. **Worker logs off:** `wrangler.jsonc` sets `observability.enabled: false`; check in the Worker's Settings → Observability that logs and traces show as off after the first deploy (D7).

## B2. Phase 1 reviews

1. **Item 1.3, Vision overview and map** (plan in [PLAN](PLAN.md#item-13-plan-patricks-decisions-2026-11-11)):
    1. Read the map texts in `pieces/vision/map.yaml`. Four nodes have no Vision note behind them (knowledge core, Claude worker tier, Telegram adapter, console), so their one-line texts are Claude's drafts from the other notes. Correct them, or add notes on the Vision side first.
    2. Check the wiring in `pieces/vision/map.svg`, especially where the console connects. A wire is a claim about the system.
    3. Look at the screenshots in the PR (desktop, phone, an open card) and the `pnpm map-check` and `pnpm lighthouse` results.
    4. Run `pnpm scan` with your local deny-list copy, then merge. After the merge, check that the Cloudflare build log shows `(deny-list: N entries)` and that `/vision/` is served.

## C. Before Phase 3 (item 3.1)

14. **Anthropic Console:** create workspaces `portfolio-chat` (limit **$5/month**) and `portfolio-dev` (a small limit). Not the Default workspace. Check that the UI allows workspace limits (D15).
15. **Prepaid credits, auto-reload off** as the second ceiling.
16. **Create one API key per workspace** and paste each only into its Cloudflare Worker secret. Never into chat, git or the cloud environment.
17. **Turnstile widget** in **Invisible** mode for `patrickdiaz.dev`; put its secret in the chat Worker (D16).
18. **Session HMAC key:** a random value as a Worker secret (Claude gives the exact command for you to run yourself).
19. **Invite key pair:** generate the Ed25519 key with `pnpm invite keygen` on your own machine (item 3.5).
    - Put the public key in the Worker as `INVITE_PUBKEY`.
    - **Back up the private key and the id → label file in your password manager.**
20. **Approve the privacy notice** text in its PR (item 3.6).

## D. Launch and running

21. **Email Routing:** `hello@patrickdiaz.dev` → your inbox (D14).
22. **Write your bio** (3–4 sentences; generic background, no employer name) for the About page (D18).
23. **Bring the visual inspiration** (palette, lettering, texture) before item 1.1 (D13).
24. **Review and merge every content PR** with the checklist in [ARCHITECTURE](ARCHITECTURE.md#4-content-and-redaction-pipeline). Your merge is the approval.
25. **Monthly:** glance at Anthropic spend (`portfolio-chat`), the chat's daily totals, `/_status`, and `pnpm invite stats`.

## Procedures

### Invite key rotation (D16)

1. `pnpm invite keygen` → a new key pair on your machine.
2. Replace `INVITE_PUBKEY` in the chat Worker with the new public key. From now on, **all old invites are invalid**.
3. Store the new private key in your password manager; delete the old one.
4. Re-issue invites still needed with `pnpm invite create`.

### Chat key rotation or suspected leak (D3, D15)

1. Anthropic Console → `portfolio-chat` → create a new key, put it in the Worker secret, delete the old key.
2. Check the workspace spend for the month. The cap limits a leak to $5.
3. Tell Claude in a new session so it can check the build logs and the dependency changes.

### Interaction limit renewal (D20)

Every 6 months, before the limit lapses: repo Settings → Moderation options → Interaction limits → "Limit to repository collaborators" → 6 months. Set the next calendar reminder.
