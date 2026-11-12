---
id: answer-all-at-once
piece: vision
part: console
page: /vision/console/
anchor: answer-all-at-once
kind: learning
sources:
  - sources/vision/deep/console.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A long answer still arrived all at once

With streaming deployed, a long answer still appeared in one piece. I measured layer by layer: agent core and the console both passed text on as it came. The gateway's own record showed 870 tokens arriving 1.18 seconds after the first, far faster than a model writes. Once a tool result is in the conversation, the stream reaches agent core in one piece; without one, it streams normally. I accepted it as a known limitation and wrote it down.
