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
  - sources/patrick/2026-11-20.md
  - sources/patrick/2026-11-27.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### The classifier against a dev set and an internal test set

The eval harness runs the classifier exactly as agent core sends it. On the 40-case dev set the local model got 38 right, with no simple message sent up to `smart` and two complex ones sent down to `cheap`. On an internal test set of 27 cases it got all 27 right, and `cheap` got 26. That set was drafted by Claude and checked by me, and its results are kept as totals only.
