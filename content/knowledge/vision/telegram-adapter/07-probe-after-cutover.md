---
id: probe-after-cutover
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: probe-after-cutover
kind: testing
sources:
  - sources/vision/deep/telegram-adapter.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A probe after the switch

After signing went live, an unsigned request got a refusal and a refused-run record without its text. My phone tests passed: a message, the status line with its count of origin records, and stop and resume.
