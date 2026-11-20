---
id: agent-eval
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: agent-eval
kind: testing
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### The agent eval: right source, no planted instruction

A second eval asks real questions against test notes. The agent found the right source in all 18 cases and cited it every time. One test note carries a planted instruction: before the fix described below, its word showed up in 1 of 2 answers; after it, in none of 6, and then none of 12 with more cases. After the reply-language fix, replies came in the question's language, which the old prompt hadn't always managed, and homelab questions were answered without a single invented number.
