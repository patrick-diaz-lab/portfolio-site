---
id: probe-and-fall-back
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: probe-and-fall-back
kind: decision
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Probe first, short deadline, fall back to `smart`

Before classifying, agent core checks within 2 seconds whether the GPU PC answers at all. If it doesn't, or if classification takes longer than 20 seconds, the message goes straight to `smart` with its tools. `cheap` only ever answers messages the classifier has actually marked simple.
