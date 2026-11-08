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
6. **Claude GitHub App:** installed on `portfolio-site` only ("selected repositories"), never on the IC repo (D10).
7. **Cloudflare account** (free plan), with 2FA on.
8. **Register `patrickdiaz.dev`** at Cloudflare Registrar. Check it was still free and that registrant data is redacted (D14).

## B. Phase 0 setup (items 0.3, 0.4)

9. **Fine-grained GitHub token** for the IC docs: resource `intelligence-center` only, `Contents: read`, 30-day expiry. Put it as a variable in a new cloud environment `portfolio` (Trusted network) at claude.ai/code. Set a calendar reminder 3 days before expiry (D10).
10. **Connect Cloudflare's Git build** to `portfolio-site`: production branch `main`, builds for other branches **off**, build command `pnpm check && pnpm build` (D7).
11. **Deny-list:** write your private list (hostnames, LAN names, canary words, employer name and variants, other people's names) and store it as a **secret build variable** in Cloudflare. Keep a local copy for `pnpm scan` on your own machine, never on the Vision machine (D9). Before item 1.4, also give the sessions' pre-push scan its copy, where item 1.3a says (D20).
12. **Run the item 0.3 tests with Claude:** watch the cloud-session merge and push to `main` fail. If they succeed, decide on the fallback (a second GitHub account that alone holds admin, D8).
13. **Turn Worker logs/observability off** for the Workers (Claude will point to the setting) (D7).

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

### Docs token renewal (D10)

Create a new fine-grained token with the same scope, replace the variable in the cloud environment `portfolio`, and delete the old token on GitHub.

### Interaction limit renewal (D20)

Every 6 months, before the limit lapses: repo Settings → Moderation options → Interaction limits → "Limit to repository collaborators" → 6 months. Set the next calendar reminder.
