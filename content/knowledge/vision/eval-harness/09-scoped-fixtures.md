---
id: scoped-fixtures
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: scoped-fixtures
kind: decision
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Test data only, and a stop before tuning

Agent evals use a second server token that sees only the repo's docs, a seed vault of made-up notes and test PDFs, never my real notes. If a dev score comes in under 0.8, the build stops and reports to me before anyone starts tuning.
