---
id: no-second-model-fallback
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: no-second-model-fallback
kind: rejected
lost_to: hybrid-search-one-model
sources:
  - sources/vision/deep/knowledge-core.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

#### Rejected: a different model on the CPU as the fallback

Vectors from two models can't be compared, so results would quietly get worse.
