# Telegram adapter and signed sender identity

Telegram was Vision's first chat channel and is still the one on my phone. The adapter is deliberately thin. It became the place where Vision learns who is talking to it: every message is signed, and agent-core trusts nothing else. This page describes the identity layers and why each exists; the exact format and key handling stay private.

## Decisions

### 1. A thin adapter

The adapter has no model access, no database and no run records. It passes my messages to agent-core and sends the answers back. agent-core does everything else and writes the run record for every message. Replacing Telegram later means replacing only this service.

### 2. One user, one chat, everything else dropped

A message counts only if it comes from my user ID, in my private chat with the bot. Everything else gets no reply and no agent call, and leaves one log line without sender, chat or text. Only text is accepted for now. Voice notes, photos and files get a short "text only" reply and never reach agent-core.

### 3. Safe behaviour after an outage

Messages from one chat are handled one at a time, so the history stays in order. Commands skip the queue, so a stop isn't stuck behind a slow cold start. A message older than 15 minutes isn't executed, commands included. I get "sent while the bot was offline, please resend", so a backlog of paid messages never runs unseen after an outage.

### 4. Plain text, a cost footer, no error details

Replies are plain text, so a model's Markdown can't make the send fail. Each reply ends with a footer showing the cost, the route (for example `local→cheap`) and a short run reference. Errors are one fixed sentence, never agent-core's details. The bot token never appears in a log: the library puts it into every request URL, so URL logging is turned down and a filter redacts it everywhere else.

### 5. Every message signed, unsigned ones refused

At first, agent-core believed the sender named in the request. Anything holding the shared service token could act as me: use the worker, write into my conversation, or engage the kill switch. Now the layers are:

- **Signing:** the adapter signs every message it forwards, commands included, with a key only it holds. The key is mounted read-only, and the adapter refuses to start if the key file isn't locked down.
- **Verifying:** agent-core rebuilds the signed content from what it knows itself, not from what the request claims. Only a verified message from my user ID in my private chat counts as me.
- **Refusing:** everything else is refused before a run starts or any model is called. That includes unsigned messages, unknown keys, replays, messages too old or from the future, and unexpected fields.
- **Trust in review:** the trusted public keys are part of the reviewed config, so a change of trust shows up in a diff. Several keys can be trusted at once, so a rotation can overlap.
- **Audit:** every accepted run gets an origin record that agent-core can only add to and read. The status command checks that every chat run of the last 7 days has a valid one, and an audit every 10 minutes logs a warning for any that doesn't.

**Rejected:** treating unsigned requests as an untrusted sender in a separate conversation, which had been my own first idea. An untrusted sender that still reached `smart` would get my knowledge, files and homelab tools. No legitimate caller sends unsigned requests, so they are refused.

## Numbers

- Probe after the cutover: an unsigned request got a refusal and a refused-run record without its text; my phone tests (a message, the status line with the origin count, stop and resume) passed.
- Refusals are recorded in full for the first 20 an hour. After that one summary record notes that the cap was reached, and the rest are only counted.
- Context: the chat never ends, so only turns from the last 6 hours count as context, and the reply language is detected in code. Reply-language score 0.8 → 1.0 on the eval.

## What went wrong and how I fixed it

### Claude spoke as me

To test a new skill, the coding agent sent three messages straight into agent-core from inside a container, with the service token and my user ID. I had asked for the test, but the messages didn't come from my phone, and the run records looked exactly like mine. Nothing bad happened. It showed that a token was all it took to be me. Two fixes followed. First, a hard rule, enforced by the guardrail hook: the coding agent never sends chat messages and never opens a shell in the chat containers; I send every identity test myself, and it reads the records afterwards. Then the signed identity above.

### Signing has a limit, and I wrote it down

A signature stops anyone who can't read the key, but the coding agent's user can run Docker, and with that it could read any key on the machine. Against the coding agent, the controls are still the guardrail and the hard rule. The real fix, a user without Docker rights, is an open item.
