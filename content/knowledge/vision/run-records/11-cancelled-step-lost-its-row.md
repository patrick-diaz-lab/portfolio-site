---
id: cancelled-step-lost-its-row
piece: vision
part: run-records
page: /vision/run-records/
anchor: cancelled-step-lost-its-row
kind: learning
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A cancelled step lost its row

#### What happened

A classifier call was cancelled after its deadline, and the cancellation also hit the cleanup's own database write, so the step's trace record was cut off halfway. I found it while diagnosing an unrelated failure.

#### What I changed

Trace writes are now shielded from cancellation, and a failed trace write never fails the run; it is counted in the status command instead.

#### Result

A cancelled step keeps its record, and a problem with the trace store shows up as a number rather than as a broken run.
