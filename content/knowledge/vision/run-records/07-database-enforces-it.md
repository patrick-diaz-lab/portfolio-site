---
id: database-enforces-it
piece: vision
part: run-records
page: /vision/run-records/
anchor: database-enforces-it
kind: decision
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### The database enforces it, not the code

Each service writes with only the rights it needs. Deleting goes through one narrow, fixed path, and the chat agent can use that path without gaining any other right to delete or change content. The readers behind the console's overviews and the evals can't see the question text at all.
