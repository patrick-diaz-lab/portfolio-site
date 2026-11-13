---
id: safe-after-outage
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: safe-after-outage
kind: decision
sources:
  - sources/vision/deep/telegram-adapter.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Safe behaviour after an outage

Messages from one chat are handled one at a time, so the conversation stays in order, while commands skip the queue, so a stop isn't stuck behind a slow start. A message older than 15 minutes isn't run at all, commands included; I get a note that it arrived while the bot was offline and should be sent again. A backlog of paid messages never runs unseen after an outage.
