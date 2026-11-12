---
id: safe-content-first
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: safe-content-first
kind: decision
sources:
  - sources/vision/deep/knowledge-core.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Prove the path on content that is safe to get wrong

The first corpus was the project's own docs, which hold nothing private. The whole path, from indexer through store, read-only server and gateway to the client, ran on them before my notes were connected. The indexer reads the reviewed copy of the main branch, never a working copy, so only merged text becomes searchable, and it is searchable about a quarter of an hour after the merge.
