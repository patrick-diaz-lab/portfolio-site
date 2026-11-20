---
id: retrieval-sets
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: retrieval-sets
kind: testing
sources:
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Retrieval on docs and notes

Retrieval is scored as hit@5: the right document is among the first five results. On my held-out set of 16 questions, docs retrieval managed that for 14. As the corpus grew, it fell to 12 of 16; a ranking fix recovered the dev set, while held-out stayed at 12 of 16. On my notes set, searching chunks did better than searching notes by title and summary, so agents now search chunks first and use note search for an overview.
