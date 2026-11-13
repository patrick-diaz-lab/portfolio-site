---
id: first-run-failed-every-case
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: first-run-failed-every-case
kind: learning
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### The first comparison run failed on every case

#### What happened

My first run on `cheap` returned an error for all 40 cases: the provider refuses a `temperature` setting for those models.

#### What I changed

The harness now leaves `temperature` out for `cheap` and `smart` only, and every result file records that override.

#### Result

The output says when the override applied, and local runs stay identical to production.
