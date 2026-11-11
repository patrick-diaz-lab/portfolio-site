---
id: a-memory-that-never-happened
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: a-memory-that-never-happened
kind: learning
sources:
  - sources/vision/deep/agent-core-routing.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A memory that never happened

In a phone test, an answer claimed I had asked about a certain error code before. I hadn't: a five-day-old message, still among the last 10 turns, began with the same two letters inside a longer word, and the model joined them up. The same answer also opened and closed in German, though I'd asked in English. The age limit, the "context, never a source" rule and language detection in code came out of this. I measured the old behaviour first, and language went from 0.8 to 1.0. My synthetic history never reproduced the false recall itself, so the fix stands on the real case, and I say so.
