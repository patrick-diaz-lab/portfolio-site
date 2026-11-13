---
id: benchmark
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: benchmark
kind: testing
sources:
  - sources/vision/deep/claude-worker.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### The same recipe against Vision's own harness

On 46 read-only cases, run twice each, both on the API through the gateway and with the same model, the Claude Code recipe and Vision's own harness each solved 92 of 92. Claude Code cost $0.0235 per solved case and Vision $0.0131. The gap came from Claude Code's larger prompt, about 7,000 more tokens per solved case, and its lower share of cache reads. With no quality difference on these cases, there was nothing to adopt yet.
