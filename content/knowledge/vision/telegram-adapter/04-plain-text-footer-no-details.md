---
id: plain-text-footer-no-details
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: plain-text-footer-no-details
kind: decision
sources:
  - sources/vision/deep/telegram-adapter.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Plain text, a cost footer, no error details

Replies are plain text, so a model's formatting can't make the send fail. Every reply ends with a footer showing its cost, its route, such as local to cheap, and a short run reference. An error is always one fixed sentence, never agent core's details, and the bot's token never appears in a log.
