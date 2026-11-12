---
id: nothing-leaks-narrow-keys
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: nothing-leaks-narrow-keys
kind: testing
sources:
  - sources/vision/deep/mcp-servers.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Nothing planted leaks, and a narrow key stays narrow

Tests plant a title, a path and a fake key in the homelab fixtures, and none of them ever reaches tool output. In a live check, a key narrowed to one tool was offered only that tool, and the gateway refused the others; the eval key sees only the eval scope. Every tool call is its own run record, without the query text, because in an eval the query is a held-out question. Homelab questions scored 1.0 with tools and 1.0 without them, with no invented numbers either way.
