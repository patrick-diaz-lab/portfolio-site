---
id: sender-was-just-a-claim
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: sender-was-just-a-claim
kind: learning
sources:
  - sources/vision/deep/telegram-adapter.md
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### The sender was just a claim

#### What happened

To test a new skill, the coding agent sent three messages straight into agent core from inside the system. I had asked for the test, but the messages didn't come from my phone, and the run records looked exactly like mine. Agent core believed whichever sender a request named.

#### What I changed

First a hard rule, enforced by the guardrail: the coding agent never sends chat messages, and every test that depends on who I am is sent by me from my phone. Then the signed sender: the adapter signs every message, and agent core refuses anything unsigned before a run starts.

#### Result

Only a verified message from me counts as me, and every chat run carries a record of where it came from.
