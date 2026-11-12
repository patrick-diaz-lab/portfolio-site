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
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### What it costs

The first 31 real chat runs cost $0.05 together. A complex question with six tool calls on `smart` cost $0.107, and a homelab status question $0.018. On top of its key's budget, the eval harness stops any single run at $2.

Prompt caching cut the agent eval's cost per case by 65 %, from $0.040 to $0.014, with the same quality.

There is no with-and-without number for the gateway itself: what it buys is control, not speed.
