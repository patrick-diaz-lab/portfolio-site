---
id: origin-audit
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: origin-audit
kind: testing
sources:
  - sources/vision/deep/telegram-adapter.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### The origin audit

The status command checks that every chat run of the last 7 days has a valid origin record, and an audit every 10 minutes logs a warning for any run that doesn't. Refused requests are recorded too, without their text.
