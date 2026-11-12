---
id: hybrid-search-one-model
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: hybrid-search-one-model
kind: decision
sources:
  - sources/vision/deep/knowledge-core.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Hybrid search, and one embedding model everywhere

Every search runs a vector ranking and a keyword ranking and fuses the two by reciprocal rank. Documents are split by heading into pieces of 500 to 800 tokens. One embedding model is used everywhere, and every piece records the exact model version that embedded it. The GPU PC embeds first; a CPU instance takes over only if it runs exactly the same version. Otherwise the work waits in a queue, and search falls back to keywords and says so.
