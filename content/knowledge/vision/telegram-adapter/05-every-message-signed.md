---
id: every-message-signed
piece: vision
part: telegram-adapter
page: /vision/telegram-adapter/
anchor: every-message-signed
kind: decision
sources:
  - sources/vision/deep/telegram-adapter.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Every message signed, unsigned ones refused

The adapter signs every message it passes on, commands included, with a key that only it holds. Agent core checks the signature against what it knows itself, not against what the request claims, and only a verified message from me in my private chat counts as me. Anything that isn't a fresh, verified message from me is refused before a run starts or any model is called. The trusted keys are part of the reviewed configuration, so a change of trust shows up in review, and several can be trusted at once so a new key can overlap the old one. Every accepted run gets an origin record that agent core can only add to and read.
