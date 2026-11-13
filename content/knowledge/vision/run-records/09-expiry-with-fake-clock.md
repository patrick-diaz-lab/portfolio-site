---
id: expiry-with-fake-clock
piece: vision
part: run-records
page: /vision/run-records/
anchor: expiry-with-fake-clock
kind: testing
sources:
  - sources/vision/deep/run-records.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Expiry, tested with a fake clock

A 31-day-old run is purged, a flagged one is kept, a handled one is purged, and the records of other flows are left alone.
