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

### Retrieval, measured three ways

Docs retrieval reached a hit@5 of 0.967 on the dev set and 0.875 on my held-out set of 16 questions. As the corpus grew, the held-out score fell to 0.75; a ranking fix brought dev back to 1.0, and no held-out set got worse. Files retrieval scored 1.0 on both. On my vault set, searching chunks scored 0.909 and searching notes by title and summary only 0.591, so agents now search chunks first and use note search for an overview.
