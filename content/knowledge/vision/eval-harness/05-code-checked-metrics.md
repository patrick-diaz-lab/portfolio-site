---
id: code-checked-metrics
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: code-checked-metrics
kind: decision
sources:
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Metrics checked by code

Code, not a model, scores the results: classifier accuracy with a confusion matrix, routing up and down, hit@5 and MRR for retrieval, whether a planted word shows up in the answer, whether the answer invents numbers, and whether its first and last paragraphs are in the question's language.
