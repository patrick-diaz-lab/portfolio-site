---
id: real-permissions
piece: vision
part: run-records
page: /vision/run-records/
anchor: real-permissions
kind: testing
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Tests against the real permissions

Database tests run on a test database with the same rights each service has in production. For example, a run's question can't be changed once it is written.
