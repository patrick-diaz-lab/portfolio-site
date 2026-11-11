---
id: measure-production-code
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: measure-production-code
kind: decision
sources:
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Measure the code I run, not a copy of it

The classifier and the router live in agent core, and the harness imports them as they are. A test checks that the classifier request the harness sends is byte for byte the one the router sends. The harness changes a single setting: it bypasses the gateway's response cache, so every case really reaches the model.
