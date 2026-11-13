---
id: my-day-ended-at-1am
piece: vision
part: run-records
page: /vision/run-records/
anchor: my-day-ended-at-1am
kind: learning
sources:
  - sources/vision/deep/run-records.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### My day ended at 1 a.m.

#### What happened

The worker's daily cap and "today" in the cost command counted days in UTC, on a database that runs in UTC. My day therefore ended at 1 a.m. local time, and at 2 a.m. in summer.

#### What I changed

Both now count days in my own time zone.

#### Result

A daily cap and a daily total mean the day I actually live in.
