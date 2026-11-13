---
id: step-per-model-request
piece: vision
part: run-records
page: /vision/run-records/
anchor: step-per-model-request
kind: decision
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### One step per model request, tagged so it joins the gateway's log

Each request to the gateway is one step, tagged with its run and step number. My records and the gateway's spend log then join exactly, even inside a tool loop where one message makes several model calls. A step records its tokens, its prompt-cache tokens and its cost. The subscription worker's steps keep the cost its tool reports in a column of their own, so it never counts as API spend.
