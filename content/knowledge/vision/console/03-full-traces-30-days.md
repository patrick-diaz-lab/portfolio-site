---
id: full-traces-30-days
piece: vision
part: console
page: /vision/console/
anchor: full-traces-30-days
kind: decision
sources:
  - sources/vision/deep/console.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Full traces, kept for 30 days

Every step of a chat run stores what went in and what came out: the messages a model saw, a tool's arguments, and the result exactly as the model got it. That is what makes the trace worth reading. Traces and chat history are deleted 30 days after the run, unless I flag it; a flagged run stays until I mark it handled and then expires like any other. A daily job does the deleting and records its own run, and the console's header turns red if anything is older than 31 days. Logs carry IDs, names and counts only, never content, so they can't outlive the expiry.
