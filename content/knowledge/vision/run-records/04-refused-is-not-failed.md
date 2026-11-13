---
id: refused-is-not-failed
piece: vision
part: run-records
page: /vision/run-records/
anchor: refused-is-not-failed
kind: decision
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Refused is not failed

A run stopped by the kill switch or by a session's budget closes as cancelled, with the reason, not as failed, and a flow that is switched off writes no run at all. The weekly failure counts then show real failures only. A request from an unverified sender is the exception: that one is recorded as failed, with the reason.
