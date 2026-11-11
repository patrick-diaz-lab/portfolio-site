---
id: tests-grow-with-rules
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: tests-grow-with-rules
kind: testing
sources:
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Every rule has tests, and a new one must fail first

The check had 106 unit tests at the start and has 768 now, growing with each rule. A new deny counts only once its test fails against the previous version of the check, which proves the test catches what the rule is for.
