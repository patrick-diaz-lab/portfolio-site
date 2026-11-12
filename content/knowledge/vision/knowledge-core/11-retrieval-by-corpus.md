---
id: retrieval-by-corpus
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: retrieval-by-corpus
kind: testing
sources:
  - sources/vision/deep/knowledge-core.md
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Retrieval on three kinds of material

Each corpus has a dev set and a held-out set of my own questions. For the project docs, hit@5 started at 0.967 on dev and 0.875 held-out. As the corpus grew it fell to 0.933 and 0.75; a ranking fix brought dev back to 1.0, while the held-out set stayed at 0.75. For my notes, searching the pieces went from 0.81 to 1.0 on dev and 0.91 to 0.95 held-out with the same fix, and searching whole notes by title and summary from 0.88 to 1.0 and 0.59 to 0.68. The test PDFs scored 1.0 on both.
