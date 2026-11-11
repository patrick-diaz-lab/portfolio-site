---
id: with-and-without
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: with-and-without
kind: testing
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Before and after, on purpose

Some runs exist only to compare. A planted instruction showed up in 1 of 2 answers before the tool-result rule and in none of 12 after it. The reply-language fix took a deliberately failing run on the old prompt from 0.8 to 1.0. Homelab questions scored 1.0 with tools, and still 1.0 without them in a deliberate run: the model said it couldn't know instead of inventing a single number.
