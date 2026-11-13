---
id: counts-here-content-expires
piece: vision
part: run-records
page: /vision/run-records/
anchor: counts-here-content-expires
kind: decision
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Counts in the record, content in a store that expires

The run records hold names, counts, costs and timings. The full content, meaning the question, each step's input and output and the answer, lives in a separate trace store for the console, and is deleted 30 days after the run unless I flag it; a flagged run stays until I mark it handled. The question in the run itself is cleared after the same 30 days, and only a hash of it stays for checking where requests came from. Error text in a record is cut short, and the full error expires with the trace. Tool calls and eval runs keep the tool's name and settings, never the query, because in an eval the query is a held-out question.
