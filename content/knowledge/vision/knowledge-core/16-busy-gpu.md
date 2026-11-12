---
id: busy-gpu
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: busy-gpu
kind: learning
sources:
  - sources/vision/deep/knowledge-core.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A busy GPU made search fail

The GPU PC holds one model at a time. Once, a cold load of the chat's classifier took over two minutes, and two search embeddings waited behind it until the gateway gave up. My health probe answered quickly during the load, so it saw nothing wrong. A query embedding now tries the GPU for 10 seconds, then the CPU with the same model, then keywords only, and each attempt is its own step in the run record, so I can see which path served a search.
