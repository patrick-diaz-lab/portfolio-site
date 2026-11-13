---
id: fall-back-or-switch-off
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: fall-back-or-switch-off
kind: decision
sources:
  - sources/vision/deep/claude-worker.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Fall back, or switch off and say so

An ordinary failure, such as the worker being off, at its cap, busy, too slow or returning something unusable, falls back to smart in the same run. Hitting a usage limit adds a cool-down. A sign-in problem, a refusal, an unexpected load or any unknown error switches the worker off until restart; the reply says so in one sentence, and the switch-off is its own step in the run record.
