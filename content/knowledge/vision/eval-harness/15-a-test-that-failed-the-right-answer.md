---
id: a-test-that-failed-the-right-answer
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: a-test-that-failed-the-right-answer
kind: learning
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Test the test

#### What happened

One homelab case had a list of phrases that count as a false all-clear, and one of them was "all 7". The correct answer contained it, because seven containers really were running, so the case failed a right answer.

#### What I changed

I cut the list down to real all-clear phrases.

#### Result

The rerun passed. Word lists in tests need testing too.
