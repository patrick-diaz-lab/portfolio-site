---
id: what-evals-cost
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: what-evals-cost
kind: testing
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### What it costs to measure

A full agent eval, including the injection repeats, cost between $0.59 and $1.50 at first. With prompt caching the cost per case fell from $0.040 to $0.014 at the same scores, and a full dev pass of 58 to 63 cases now costs $0.77 to $1.03. Building and running the whole first harness item cost $0.004.
