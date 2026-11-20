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

Each corpus has a dev set and a held-out set of my own questions, scored as hit@5: the right document is among the first five results. For the project docs, the held-out set of 16 questions started at 14 right. As the corpus grew it fell to 12 of 16; a ranking fix recovered the dev set, while the held-out set stayed at 12 of 16. For my notes, the same fix improved chunk search and note search alike, on dev and on held-out. The third corpus, test PDFs, has its own two sets.
