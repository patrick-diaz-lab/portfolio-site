---
id: no-evals-on-chat-key
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: no-evals-on-chat-key
kind: rejected
lost_to: own-key-and-stop-rules
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

#### Rejected: running evals on the chat key

Eval spending would look like chat spending, and one bad loop could empty the chat's budget.
