---
id: one-user-one-chat
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: one-user-one-chat
kind: decision
sources:
  - sources/vision/deep/telegram-adapter.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### One user, one chat, everything else dropped

A message counts only if it comes from me, in my private chat with the bot. Anything else gets no reply and no call to agent core, and leaves a single log line without sender, chat or text. Only text is accepted for now; voice notes, photos and files get a short "text only" reply and never reach agent core.
