# Claude worker tier

One tier of Vision runs the official Claude Code CLI on my Claude subscription instead of the API. It answers only when I ask for it with an explicit command, and it is the one exception to "every model call goes through the gateway". This page describes the isolation layers and why each exists; the exact configuration stays private.

## Decisions

### 1. Read the terms first, then set limits

Before building, I read the consumer terms, the usage policy, the CLI's authentication and headless docs and the support articles, and wrote down the passages that apply. They didn't settle whether a personal assistant routing its owner's own requests counts as "ordinary, individual use". So I took the narrow reading:

- the worker runs only for requests I send myself, never on a schedule or in the background;
- it uses the official CLI with a token the CLI itself creates, never an extracted or proxied credential;
- it stops at the first warning or throttling beyond the normal limit resets, and then I decide how to go on.

**Rejected:** scheduled runs on the subscription, such as a weekly research digest. Those use the API through the gateway.

### 2. `smart` is the default, the worker is a command

My first design sent every complex message to the subscription, with the API as the overflow. Once I had prepaid API credits, I turned that around: complex messages go to `smart` through the gateway, which has budgets, chat history and evals. The worker answers only `/claude <message>` in my private chat. It gets the message as a task, without the chat history, and has a daily cap of 30 calls. If it is off, capped, cooling down or fails, `smart` answers, and the reply says so.

**Rejected:** the worker as the default for complex messages. It would spend the subscription limit I share with my own coding sessions, outside every budget.

### 3. Isolated by layers

- **Network:** the worker sits on its own network. It can't reach the database, the gateway's model endpoints, my LAN or the internet. A filtering proxy is the only way out, and it lets through only the provider's API and the gateway's tool endpoint.
- **Workspace:** every call starts in a fresh, empty directory that is deleted afterwards. No project files, hooks or settings are ever mounted, and no session is kept.
- **Credentials:** only the subscription token. The worker refuses to start if a provider API key or another way to reach a model is set.
- **Tools:** read-only knowledge, files and homelab tools through the gateway, under the same rules as `smart`: at most 6 calls, every result wrapped as untrusted data. Tools that run code, write files or fetch from the web are refused outright.

**Rejected:** putting the gateway on the worker's network. Every gateway endpoint would then be one hop from the worker.

### 4. Check what actually loaded, on every call

The CLI reports at startup what it loaded: how it authenticated, its tools, servers, plugins, skills and memory files. The worker compares that report with the exact expected set on every call. Anything extra, or authentication other than the subscription token, discards the call. It also checks the stream: a tool result that isn't wrapped ends the call too.

The flags alone weren't enough: the pinned version loaded things they should have kept out (below).

### 5. Fall back, or switch off and say so

A plain failure (off, cap, busy, timeout, unusable output) falls back to `smart` in the same run. A usage limit adds a cool-down. An authentication problem, a refusal, an unexpected load or any unknown error switches the worker off until restart, the reply says so in one sentence, and the switch-off is its own step in the run record.

## Numbers

- Daily cap: 30 calls, failed calls included; every reply shows the day's count.
- Only signed messages from my private chat can reach the worker. Since the signed sender identity, the IDs in a request body alone aren't enough.
- Tests that run the real CLI offline, against a fake model API, a fake gateway and the real proxy, cost $0:
  - with the hooks removed, the call is refused;
  - an extra tool on the gateway is caught.
- Proxy rules: 39 test cases.
- Canary files in the workspace's parent directory (instructions, server config, a hook) are never loaded, in a test.
- Benchmark of the same CLI recipe against Vision's own harness, both on the API through the gateway, same model, 46 cases twice each:
  - both solved 92 of 92;
  - Claude Code cost $0.0235 per solved case, Vision $0.0131;
  - the gap came from Claude Code's larger prompt (about 7,000 more tokens per solved case) and its lower cache read share;
  - no quality difference on these read-only cases, so nothing to adopt yet.

## What went wrong and how I fixed it

### Plugins the flags didn't stop

A dry run of the pinned CLI with a dummy token showed two built-in plugins in its startup report, loaded despite the flags meant to keep settings out. One of them would read instruction files from the directory tree. When I later enabled skills, 15 bundled skills appeared next to mine. Both are now switched off explicitly, and the startup check requires exactly the expected plugin and skills. Lesson: verify what a tool loaded, not what you asked it to load.

### A flag that wasn't there

I planned to bound each call with the CLI's turn limit, but the pinned version doesn't list that flag in its help. I only use listed flags, so the bound became the tool-call hook, the stream check and the timeout.

### The terms didn't answer the question

The pages I read left the key question open. I recorded both readings, and the arguments for and against each, then chose the narrow scope: my own requests, a command I type, no automation. The terms page names a contact for such questions; I decided not to ask and to stay inside the narrow reading instead.
