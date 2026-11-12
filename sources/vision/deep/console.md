# Console

The console is my own web app for Vision: chat sessions with streamed answers, a live trace of every model and tool call, a run explorer and a review queue. Telegram showed only answers; the console shows what happened on the way. It is meant to replace Telegram in the long run, and it is also a portfolio piece, so it had to look good.

The first version is built: sessions, streamed answers with their sources, the live trace, the explorer and flags. Push notifications and the switch-off of Telegram are next. This page describes the access layers and why each exists; the exact mechanisms stay private.

## Decisions

### 1. Private network only, identity from the network, several layers

- The console has no open port. It is reachable only inside my private Tailscale network.
- It takes my identity from the network layer, and only on a path that a local process can't fake.
- The console server, not the browser, signs each request it passes to agent-core. agent-core trusts only signed senders.
- The console has its own credential for agent-core, separate from the chat adapter's.
- The coding agent that builds the system can't use the console's data or message endpoints. The guardrail hook blocks it.

The threat model is written down: anyone holding one of my unlocked, signed-in devices has the console. Device lock and key expiry protect it, not the app.

**Rejected:** trusting the identity from any local connection. Any process on the machine, the coding agent included, could forge it.

### 2. Full traces, kept 30 days

Every step of a chat run stores its input and output: the messages a model saw, a tool's arguments and the result exactly as the model got it. That's what makes the trace useful. Traces and chat history are deleted 30 days after the run, except for runs I flag. A flag keeps the run until I mark it handled, and then it expires like any other. A daily job does the deleting and writes its own run record, and a retention check turns the console header red if anything is older than 31 days. Logs carry IDs, names and counts only, never content, so the logs can't get around the expiry.

**Rejected:** a separate database for traces. It couldn't join with the run records.

### 3. Budgets per session, counted by agent-core

Each session has its own budget, from $0.10 to $2, raised in $1 steps by a button only I can press. A daily cap of $2 covers the console and Telegram together, and at most 3 runs work at once. agent-core checks the budget before every model call, so lowering a budget stops a running run at its next call. The gateway's global cap stays as the last backstop.

**Rejected:** one gateway key per session. Too much key handling for something agent-core can count from its own records.

### 4. Untrusted content renders as text

Tool results carry content from my documents and, later, the web. The console renders every payload as plain text. Links in answers are inert text showing the full URL, with no allowed domains, because an allowed domain can carry data out in a query just as well.

**Rejected:** rendering Markdown with images or live links. Opening a trace would load whatever a document told the model to write.

### 5. Build my own instead of adopting a tracing tool

A small Python backend that reads the database and relays agent-core's events, and a React frontend. The trace view is my own waterfall: indented rows on a shared time axis.

**Rejected:**

- Langfuse: too heavy for my 12 GB VM.
- Open WebUI: it can't see agent-core's internal steps.
- A graph view of the trace (React Flow) in the first version. A graph view can come later as its own item.
- A chat app (Matrix) as the next channel. The console replaces Telegram instead.

## Numbers

- Live test from my phone: two sessions in parallel, a budget stop at $0.10, the +$1 button, stop all and resume, all as designed.
- Streamed answers: the cost of all 158 paid steps after the streaming deploy matched the gateway's spend log within $0.00001.
- Regression evals with streaming on: the same quality as before, at $0.015 and $0.012 per case for the two halves.
- The trace view holds 58–60 frames per second on a 60-step running fixture. The test requires at least 55.
- A marker string placed in a step's input and output reaches no live event. It comes back only from the guarded read of the clicked step.

## What went wrong and how I fixed it

### The first phone test after the trace work failed

My first message after the trace storage went live failed. The GPU PC had cold-loaded the classifier, two search embeddings waited behind it, and the gateway's tool timeout and agent-core's own read timeout were both 60 seconds. The timeout came out of the tool session's cleanup after `smart` had already answered, and it failed the run. The trace changes weren't the cause, but the diagnosis found a real bug of theirs: a cancelled step could lose its trace row, because the cancellation also cut the cleanup's database write. agent-core now waits longer than the gateway, a failed cleanup after the answer is a failed step instead of a failed run, and trace writes are shielded from cancellation.

### UI tests that didn't test the change

The first streaming build passed all its browser tests, but those ran on the demo build with recorded fixtures, which never runs the live path. My review caught that. A second test mode now runs the production build against scripted live events. Three deliberate breaks of the streaming code each make it fail.

### A long answer appeared all at once

With streaming deployed, a long answer still arrived in one piece. I measured layer by layer: agent-core passed text on as it came, and so did the console relay. The gateway's own log showed 870 tokens arriving 1.18 seconds after the first token, far faster than the model writes. With a tool result in the conversation, the stream reached agent-core in one piece, first frame included. Without one, it streamed normally. I accepted it as a known limitation and wrote it down.
