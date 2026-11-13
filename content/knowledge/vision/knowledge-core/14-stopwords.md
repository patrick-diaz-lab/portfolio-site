---
id: stopwords
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: stopwords
kind: learning
metric: docs-hit-at-5-dev
sources:
  - sources/vision/deep/knowledge-core.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Keyword search lost to stopwords

#### What happened

As the corpus grew, docs hit@5 dropped from 0.967 to 0.933. Scores per piece showed why: the right documents ranked first to third by vectors, but so far down by keywords that they fell out of the candidates. The keyword query joined every word with OR, including "why", "the" and "to", so long pieces won, and it split names that the index keeps whole, so those never matched.

#### What I changed

I had suspected that documents with many pieces crowd out short ones, but in a simulation a cap per document made things 7 to 37 points worse. The fix uses the index's own parser and drops English, German and Spanish stopwords.

#### Result

Dev hit@5 went back to 1.0, and no held-out set got worse.
