---
id: no-get-only-code
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: no-get-only-code
kind: rejected
lost_to: least-privilege-in-credential
sources:
  - sources/vision/deep/mcp-servers.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

#### Rejected: code that promises to only read, holding a key that can write

Whatever the code promises, the key could still write.
