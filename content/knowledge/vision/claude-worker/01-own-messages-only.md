---
id: own-messages-only
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: own-messages-only
kind: decision
sources:
  - sources/vision/deep/claude-worker.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Only for messages I send myself

The worker runs only for messages I send myself, with an explicit command. It never runs on a schedule or in the background: everything automated runs on the API, through the gateway.
