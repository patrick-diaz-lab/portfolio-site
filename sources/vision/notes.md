# What I decided and why

Short notes on the main parts of my home intelligence center ("Vision"): the problem, what I chose, what I rejected, how I test it, and one thing I learned. Written up on 2026-11-04 from my architecture decision records, the planning docs for the open gaps, and the status log.

Each entry says whether the part is **built** or **decided, not built yet**. For parts that aren't built, "Tested" describes the planned test.

Deep dives on the four MVP parts: [LiteLLM gateway and budgets](deep/litellm-gateway.md), [agent-core routing and tool use](deep/agent-core-routing.md), [eval harness](deep/eval-harness.md), [guardrails for the coding agent](deep/guardrails.md).

## LiteLLM gateway and budgets

**Built.**

- **Problem:** several services call language models. I want one place for keys, costs and caps, and a provider switch without code changes.
- **Decision:** every model call goes through a self-hosted LiteLLM gateway. Code uses aliases only (`smart`, `cheap`, `local`, `embed`). Each flow gets its own virtual key and 30-day budget. The global cap stays under my $30 monthly spend limit at the provider ($24 cap, $22 in key budgets since 2026-11-06; before, under half my monthly API credits), because LiteLLM resets budgets on the 1st and my billing cycle doesn't. Prices are pinned in config. One exception: a Claude Code worker on my subscription, only for messages I send myself.
- **Rejected:** provider keys in each service. No shared budget, and every switch touches code.
- **Tested:** out-of-credit and over-budget get their own outcome and reply. The first 31 real runs cost $0.05.
- **Learned:** the pinned LiteLLM had no prices for the newest models. Those calls would have cost "$0", and no budget would ever have fired.

## agent-core routing and tool use

**Built.**

- **Problem:** most messages are simple. Using the best model for everything wastes money; using the cheapest loses quality.
- **Decision:** commands run without a model. A local model on my GPU PC classifies the rest as simple (to `cheap`) or complex (to `smart`). Only `smart` and the worker get tools, all read-only, at most 6 calls per message, with every result wrapped as untrusted data. If the classifier is slow or the PC is off, the message goes to `smart` with its tools.
- **Rejected:** a tool-free worker where agent-core searches first. Safest, but the model wouldn't pick its own queries.
- **Tested:** classifier accuracy 0.95 on dev (38/40) and 1.0 on my held-out set (27/27). Agent eval: right source found 1.0; planted injection words in 0 of 12 answers.
- **Learned:** a fallback has to keep capability, not just save money. My first fallback went to `cheap`, which couldn't read the file the question was about.

## MCP servers

**Built.**

- **Problem:** models need my docs, notes, files and homelab state. They must not get write access, and the servers shouldn't hold broad rights.
- **Decision:** I run my own read-only servers (knowledge, files, homelab), reachable only through LiteLLM's MCP gateway with per-key tool allowlists. The files server reads database views of non-private content, never a folder. Media status is reduced at the source: only counts and states leave the media machine. The Proxmox token can read status only. Every server has an eval scope that serves test data only.
- **Rejected:** full media app keys behind "GET-only" code. The key itself could still write.
- **Tested:** planted titles, paths and fake keys in fixtures never reach tool output. A key limited to one tool gets the others refused.
- **Learned:** least privilege belongs in the credential, not in the code that holds it.

## Eval harness and held-out sets

**Built.**

- **Problem:** I want numbers before and after every prompt or model change, from a test the improving agent can't tune against.
- **Decision:** a small harness runs the production code itself (the classifier request is byte-identical, and a test checks that). It has its own key, a $5 budget and a $2 guard per run. Claude drafts the dev sets. I own the held-out sets, agents can't write to them, and held-out results show totals only. Metrics are code-checked (accuracy, hit@5, "was the injection word repeated") rather than judged by an LLM.
- **Rejected:** an LLM judge first, which amounts to a model grading itself.
- **Tested:** docs retrieval hit@5 0.967 on dev and 0.875 held-out. On my vault set, chunk search scored 0.909 and note search 0.591. Files held-out scored 1.0.
- **Learned:** I let Claude draft my first held-out set, which made it less independent. Later sets I wrote myself from headings alone.

## Guardrail hooks

**Built.**

- **Problem:** Claude Code builds this system on its own. It follows the written rules most of the time, not always.
- **Decision:** a hook checks every command before it runs. It denies reading secret files, irreversible deletes, pushes other than item branches, Proxmox calls and acting as my chat. It asks before `sudo`, production migrations and rebases. A pre-push hook and a secret scan add a second layer.
- **Rejected:** GitHub branch protection as the backstop. GitHub doesn't enforce it on my plan, so protection stays local.
- **Tested:** every rule has unit tests (106 at the start, 768 now), and a new deny must fail on the previous hook version.
- **Learned:** Claude once tested a skill by sending messages as me through the container's token, and the records looked like mine. The hook now blocks that. The hook is still a seatbelt, not a wall: it can't see inside scripts.

## Deploy lane and merge flow

**Built.**

- **Problem:** several Claude sessions shared one folder. Files landed on the wrong branch, one session ran another item's commands, and PRs from different bases wouldn't fast-forward.
- **Decision:** every session works in its own git worktree on an item branch. Only one folder, the deploy lane, has secrets, builds and restarts, and only the session holding its lock may use it. I approve one plan per item, with the risky commands listed by name. Each PR carries an automatic PASS/FAIL table. I review it and run one merge script myself; Claude never merges.
- **Rejected:** merging on GitHub. The token could write `master` through the API, and nothing on my plan stops it.
- **Tested:** guardrail tests with two session IDs (the second can't use the lane); pre-push hook tests 24/24.
- **Learned:** rebuilding an image under an existing tag pulled it out from under a running container. Builds now refuse to move a tag to different content.

## Remote Control and worktrees

**Built.**

- **Problem:** I want to start and steer build sessions from my phone, without an SSH terminal or an open port.
- **Decision:** Claude Code's Remote Control server runs as an always-on user service. It connects outbound only and puts each new session in its own worktree through the same hook. A home session only plans and reads. Capacity is 3, matching my work-in-progress limits. It requires two-factor login on my account, because anyone signed in can drive sessions.
- **Rejected:** creating sessions in the deploy lane, which would mix free editing with the folder that holds secrets.
- **Tested:** a check script FAILs if the server's first-start question appears in the journal, or if no status line appears within 60 s. Session names were checked live.
- **Learned:** under systemd, the server's one-time setup questions can't be answered, and it waited silently instead of failing. Archived sessions also left worktrees behind; a sweep command cleans them up.

## Run records

**Built.**

- **Problem:** I need to know what each service did, what it cost and why it failed, without private content in the logs.
- **Decision:** one shared library: each piece of work is a run with steps. Every model request is one step tagged with the run and step number, so my records join the gateway's spend log exactly, even inside tool loops. Refused runs are "cancelled", not failures. Records keep names, counts and costs, never queries or note text.
- **Rejected:** the gateway's spend log on its own. It can't see commands, tool calls, or which message caused a call.
- **Tested:** database tests run against the real role grants on a test database (for example, a request's text can't be changed afterwards). After every phone test, Claude checks the run records (names and counts only).
- **Learned:** a cancelled step could lose its row, because the cancellation hit the cleanup's own database write. Writes are now shielded.

## Job contract

**Decided, not built yet.**

- **Problem:** "give Vision a job and it does it start to finish" clashes with "every side effect needs approval". Vision would ask as often as Claude Code does.
- **Decision:** one approval per job. The contract holds the goal, done-when, allowed action types with their scope, budget (default $1, max $5), step cap and deadline. A fixed registry in code gives every tool a tier: low needs nothing, medium is covered by the contract, high (send, delete, spend) always asks. Unknown tools are denied. A step that read untrusted content gets no write tools.
- **Rejected:** a durable-execution framework (DBOS, Temporal): its own state beside my run records, and no idea of contracts or taint.
- **Tested:** an 11-case jobs eval, mostly on a scripted fake model at $0, including killing agent-core mid-job with no duplicate side effects.
- **Learned:** the hard question is which actions are irreversible. That answer is now data in code, never the model's call.

## Sandbox

**Decided, not built yet.**

- **Problem:** jobs need to run code (CSVs, charts, numbers from PDFs) that a model wrote after reading untrusted content. That code can't run on the main VM.
- **Decision:** a separate small VM runs one gVisor container per job. Containers have no network, a read-only root, and limits on CPU, memory, processes and disk. Only agent-core copies inputs in, from the contract's scope. Outputs are plain text or re-encoded PNGs. Each call needs a signed, per-step pass.
- **Rejected:** plain Docker on the main VM, which shares a kernel with everything valuable. MicroVMs are deferred: they need nested virtualization and beta software.
- **Tested:** a sandbox eval (≤ $2 per run) for computation and injection, plus an escape suite (setuid, `sudo`, Docker socket, `/proc`) on every image change.
- **Learned:** memory, not CPU, is the real limit. The VM waits for a 7-day RAM measurement and for another guest to shrink.

## Heartbeat

**Decided, not built yet.**

- **Problem:** Vision only answers. I want it to reach out on its own, but only when something is actually wrong: no daily "all good".
- **Decision:** deterministic watchers run on a schedule at $0. Findings are deduplicated, resolve after 2 clean checks, and can be snoozed or ignored. A local model writes two sentences of triage, only when a finding changes. Pushes carry an ID and a link, no content, at most 30 a day. Vision plans a job only when I click, and never acts by itself. An outside dead man's switch catches a dead heartbeat.
- **Rejected:** one run record per check: about 450 empty runs a day.
- **Tested:** a shadow week before go-live (findings recorded, only critical ones pushed), then 3 days for each new watcher.
- **Learned:** I built the media checks as plain functions with their thresholds as parameters. They answer questions today and can feed the heartbeat later.

## Web research

**Decided, not built yet.**

- **Problem:** jobs need to look things up. Web pages are the main injection risk, a fetcher on my LAN is a server-side request forgery (SSRF) risk, and every URL argument can carry data out.
- **Decision:** my own read-only server for search and fetch. Pages are parsed in a container that reaches nothing internal. All traffic leaves through Smokescreen, which checks the IP it actually connects to; a host firewall rule backs it up. A URL is fetched only if it came from my message or a search result, or sits at most 2 links from one; 20 fetches per run. Hidden text is stripped first.
- **Rejected:** Anthropic's server-side web tools: Claude-only, outside my SSRF rules, and only a summary reaches my records.
- **Tested:** an eval on recorded pages (< $0.20 per run) for planted instructions, hidden text and exfiltration URLs, plus SSRF tests that include DNS rebinding.
- **Learned:** asking where a URL came from closes holes a blocklist can't.

## Backups

**Decided, not built yet.**

- **Problem:** one VM snapshot was the only protection, and the plan put backups late.
- **Decision:** restic sends nightly encrypted backups to my NAS, with a thin dump step in front. A read-only database role dumps the data. It has no access to traces or chat history, so a forgotten exclusion fails the backup instead of leaking. Secrets files and sync config are in. Models, the vault and the repo are out; they have other copies. The NAS keeps read-only snapshots, and Claude can't prune the real repository.
- **Rejected:** my own dump-and-encrypt script. restic already does encryption, retention and integrity checks.
- **Tested:** a monthly restore into a throwaway database container with no network. It checks the table count, the schema version, a known row, that the excluded tables are absent, and file modes. Full VM restore once, then yearly.
- **Learned:** a missing permission makes a better safeguard than a flag someone can forget.

## Voice

**Decided, not built yet.**

- **Problem:** the plan had server-side Whisper on my gaming PC for voice notes. That PC is often off, its VRAM is for games, and the chat app it was built for is being replaced.
- **Decision:** on-device dictation with an offline Whisper keyboard on my phone. Audio never leaves the phone, and dictated text counts as typed text. Vision takes no audio uploads.
- **Rejected:** building server speech-to-text now. It would mean another service, VRAM taken from games and a fallback path, all for something the phone already does.
- **Tested:** about 30 phrases in English, German and Spanish, scored by word error rate against CPU Whisper. I build the server version only if dictation still annoys me after 2 weeks, or if the phone's error rate is over 15% in a language I use weekly and the server does at least 10 points better.
- **Learned:** sometimes "build vs. use" means building nothing.

## Personal integrations

**Decided, not built yet.**

- **Problem:** Vision should know my private schedule and mail I hand it. Calendars and mailboxes hold other people's data and injections, and are where work data slips in most easily.
- **Decision:** one private calendar's secret read-only feed, no OAuth. Vision gets its own mailbox and reads only what I forward by hand; it never holds credentials for mine. A deterministic check drops or quarantines anything matching my employer list before a model sees it. Mail never starts a run. Reader and sender are separate containers; the sender can mail only me.
- **Rejected:** Google's calendar and mail APIs. Their narrowest read scope still covers every calendar or the whole mailbox.
- **Tested:** a fixture eval (< $0.20 per run): work invites dropped, forwarded work mail quarantined, injections change nothing, a mail starts no run.
- **Learned:** the safest scope is often a different source, not a smaller permission.

## Verification without me

**Decided, not built yet.**

- **Problem:** most of my manual steps were mechanical checks and phone tests. Identity tests had to be mine, because agent-core trusts the sender a request names.
- **Decision:** a second signing identity, trusted only by a throwaway end-to-end test stack on the test database. Production refuses to start if it trusts the test key; the test stack refuses my real key or a production database. Claude can't read or run held-out sets, and never changes a baseline in the PR it measures. My smoke test counts only if a signed run hit the deployed version.
- **Rejected:** a restricted test key that production accepts: a signed path into real data for a key Claude holds.
- **Tested:** a hook-test suite for "Claude can't be my chat"; end-to-end runs with a $0.50 guard and code-checked asserts, no LLM judge.
- **Learned:** with Docker rights, Claude can still read every key. The real fix is a user without them.
