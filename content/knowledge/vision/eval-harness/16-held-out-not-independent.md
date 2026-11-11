---
id: held-out-not-independent
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: held-out-not-independent
kind: learning
sources:
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A held-out set that wasn't independent

To save time I let Claude draft my first held-out classifier set, with topics and shapes unlike the dev set, and I reviewed it and copied it in myself. It was still less independent than a held-out set should be. I wrote the retrieval sets' questions myself, from nothing but a list of file names and headings, never from the builder's cases.
