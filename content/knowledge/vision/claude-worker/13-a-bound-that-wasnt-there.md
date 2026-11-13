---
id: a-bound-that-wasnt-there
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: a-bound-that-wasnt-there
kind: learning
sources:
  - sources/vision/deep/claude-worker.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A bound that wasn't there

#### What happened

I planned to limit each call through a setting of the tool, but the pinned version didn't offer it.

#### What I changed

I use only what the pinned version documents, so the bound became three things I control: the hook that counts tool calls, the stream check, and a timeout.

#### Result

Every call is bounded, by layers I can test, not by a setting I hoped was there.
