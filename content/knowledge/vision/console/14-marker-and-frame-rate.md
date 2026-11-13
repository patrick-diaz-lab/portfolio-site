---
id: marker-and-frame-rate
piece: vision
part: console
page: /vision/console/
anchor: marker-and-frame-rate
kind: testing
sources:
  - sources/vision/deep/console.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Nothing leaks into live events, and the trace stays smooth

A marker placed in a step's input and output never reaches a live event; it comes back only when that step is opened on purpose. The trace view holds 58 to 60 frames per second on a 60-step run, and its test requires at least 55.
