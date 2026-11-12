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
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Every rule has tests, and a new one must fail first

The check had 106 unit tests at the start and has 1133 now, growing with each rule. A new deny counts only once its test fails against the previous version of the check, which proves the test catches what the rule is for.
