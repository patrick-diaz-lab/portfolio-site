---
id: notes-read-only-private-fail-closed
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: notes-read-only-private-fail-closed
kind: decision
sources:
  - sources/vision/deep/knowledge-core.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### My notes are read-only, and private notes fail closed

My notes reach the server through a sync tool, in a mode where nothing changed on the server is ever sent back to my devices, and every other service sees them read-only. My private folder is never shared with the server, so the server doesn't even learn that a private file exists. A note marked private, or one whose header can't be read, is stored as an ID and a hash only: no title, no text, no links. Agents can write only to their own inbox folder, and only by creating new notes through one narrow tool.
