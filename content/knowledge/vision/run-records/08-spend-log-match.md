---
id: spend-log-match
piece: vision
part: run-records
page: /vision/run-records/
anchor: spend-log-match
kind: testing
sources:
  - sources/vision/deep/run-records.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Matched against the gateway's own log

Model steps match the gateway's spend log: tokens exactly, cost within the rounding of the stored precision. After answers started streaming, all 158 paid steps matched to within a thousandth of a cent; one eval step was off by exactly that much, because the stream's cost sat just above a rounding midpoint. With prompt caching, the records show cache reads and writes per step, and the share of cache reads became an eval metric, so anything that silently breaks the cache shows up as a falling number.
