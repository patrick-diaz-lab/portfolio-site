---
id: spend-in-numbers
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: spend-in-numbers
kind: testing
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### What it costs

The first 31 real chat runs cost $0.05 together. A complex question with six tool calls on `smart` cost $0.107, and a homelab status question $0.018. On top of its key's budget, the eval harness stops any single run at $2.

There is no with-and-without number for the gateway itself: what it buys is control, not speed.
