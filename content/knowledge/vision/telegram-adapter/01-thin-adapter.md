---
id: thin-adapter
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: thin-adapter
kind: decision
sources:
  - sources/vision/deep/telegram-adapter.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A thin adapter

The adapter has no model access, no database and no run records. It passes my messages to agent core and sends the answers back; agent core does everything else and records every message. Replacing Telegram later means replacing only this one small service.
