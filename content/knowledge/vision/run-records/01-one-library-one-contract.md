---
id: one-library-one-contract
piece: vision
part: run-records
page: /vision/run-records/
anchor: one-library-one-contract
kind: decision
sources:
  - sources/vision/deep/run-records.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### One shared library, one contract

A small shared library opens a run, adds its steps and closes it with totals, and every service that does work uses it. A tool call made through the gateway becomes a child run of the run that made it, so a tool loop stays one tree.
