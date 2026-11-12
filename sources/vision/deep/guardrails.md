# Guardrails for the coding agent

Claude Code builds most of this system, on its own within an approved plan. Written rules are followed most of the time, not always; the guardrails cover the rest. This page stays at the level of ideas; the exact patterns stay private.

## Decisions

### 1. A hook that sees every command, and says which rule it enforces

A `PreToolUse` hook inspects each shell command and file access before it runs, and answers deny, ask or allow. Every hard rule in the project instructions says what to do instead and which check enforces it, if any. A denied command names its rule, and I can run it myself.

**Rejected:** rules in text only. They work until the one time they don't, and that one time is usually the expensive one.

### 2. Deny what can't be undone, ask what I should see

- **Denied:** irreversible data loss, reading secret files, any call to my hypervisor beyond one scoped snapshot script, and acting as my chat.
- **Ask:** `sudo`, migrations on the production database, rebases, rewriting a pushed item branch, overwriting an existing branch, changes to the guardrail itself.

When I approve a plan, the commands it lists by name go into a per-branch file. An exact line from that file lifts the production-migration ask, and nothing else.

**Rejected:** asking for everything. Most stops after plan approval were routine (keys and commands the plan already named, restarts, a listed migration), and each one waited for me.

### 3. Pushes and merges stay with me

Claude may push only explicit refspecs to item branches. A pre-push hook checks again, on the refs git actually sends. A secret scanner runs on every commit and push. Claude opens PRs; I review and run one merge script from my own terminal.

**Rejected:** GitHub branch protection as the backstop. GitHub doesn't enforce it on my plan, so the protection is local, and I wrote that down instead of assuming it.

### 4. Each session in its own worktree; one deploy lane with a lock

Every session works in its own git worktree. Only the deploy lane has secrets, builds and restarts, and the hook keeps a lock on it by session ID.

### 5. Honest limits

The hook can't see inside scripts or interpreters. Claude Code's user is in the Docker group, so it could still read any container's secrets. I call the hook a seatbelt, not a wall. The real fix, a user without Docker rights, is recorded as an open item.

## Numbers

- Hook tests grew from 106 at the start to 1133 now, through 174, 415, 447, 641, 702, 768, 1023 and 1063 as rules were added.
- A new deny has to fail on the previous version of the hook before it counts.
- Pre-push hook tests: 28 passed.
- Approved-command files: one per item branch, kept in the repo as the record of what each plan allowed.

No with-and-without number fits here; each incident below became a written rule, most of them with a hook test.

## What went wrong and how I fixed it

### Claude spoke as me

To test a new skill, Claude sent three messages straight into agent-core from inside the container. It used the container's token and my user ID, at my request but not from my phone. The run records looked exactly like my own messages. Nothing bad happened, but at the time agent-core trusted the sender a request named, so anything that could reach it with the token could be me. The fix became a hard rule: Claude never sends to the chat endpoint and never opens a shell in the chat containers. The hook denies both, and every test that depends on my identity is sent by me from my phone, while Claude reads the records afterwards. Since then every chat message is signed and agent-core refuses anything unsigned ([Telegram adapter and signed sender](telegram-adapter.md)). A separate test identity that only a throwaway test stack trusts is still planned.

### Two sessions in one folder

For a few days, several Claude sessions shared one checkout. Uncommitted files landed on the wrong branch. One session ran another item's approved commands. Three PRs from different bases couldn't be fast-forwarded one after another, and a session lost track of what it had run after its context was compacted. The fix:

- one git worktree per session, on its own item branch, made by a hook;
- a single deploy lane, the only folder with secrets, guarded by a lock the hook keeps by session ID;
- a board that shows what waits for me;
- a rebase onto the current master before "ready to merge";
- a session file each session updates, so it can recover after a compaction.

My touchpoints per item came down to: approve the plan, do my own steps, review, and run the merge script.

### A guardrail that was out of date

Sessions I start from my phone are spawned by a Remote Control server, each in its own git worktree. After merged guardrail and ops changes turned out not to be in force everywhere, my first rule assumed that spawned sessions read their settings and guardrail from the server's home worktree, which moves to the latest master only when the server starts, so I restarted the server after every such merge. A probe showed otherwise: each session runs the settings and the guardrail of its own worktree. That had a failure of its own: a session's half-finished edit of its own guardrail blocked every one of its tool calls until I restored the file. Now every hook runs from the master copy, a read-only worktree of master that the merge script moves on each merge, so hook code is current right after a merge without a restart, and the merge script refuses a guardrail that would block every session (ADR 0031 amendment). The settings file is still read per worktree, so the server needs one restart after a merge that changes it (restart rule). If the home worktree has commits of its own, the server leaves it where it is and says so in its log, so I can see when it stops following master.

### A history rewrite that never stopped

Twice, a session rebased its item branch and force-pushed it without any stop. The rule allowed exactly that push for the session's own branch, but I had meant it only for the final rebase before "ready to merge", and the rule couldn't tell when in an item it was. Overwriting an existing branch by renaming or copying over it wasn't checked at all. In the same weeks, the rule that keeps the coding agent away from stored chat content blocked two harmless edits of my docs, because ordinary prose contained the same words as the protected data. The fix stayed at the layer level: the force push of the own branch now asks me unless the approved plan names it (by default it doesn't), overwriting an existing branch asks, and the strict content rule applies only to code that can reach the database. Lesson: a deny or allow that can't see the context should be an ask, and a content rule should key on what can actually touch the data, not on words.
