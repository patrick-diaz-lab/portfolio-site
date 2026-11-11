---
id: classifier-evals
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: classifier-evals
kind: testing
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### The classifier against dev and held-out sets

The eval harness runs the classifier exactly as agent core sends it. On the 40-case dev set the local model scored 0.95, with no simple message sent up to `smart` and two complex ones sent down to `cheap`. On my own held-out set of 27 cases it scored 1.0, and `cheap` 0.963. Held-out results are kept as totals only.
