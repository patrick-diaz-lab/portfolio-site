---
id: refused-tool-keeps-reply
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: refused-tool-keeps-reply
kind: testing
sources:
  - sources/vision/deep/mcp-servers.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A refused tool never costs the reply

One of my messages arrived just before the chat's key got its tool permission. The tool connection failed, but the answer still came back from `smart` without tools, and the run record showed the failed step. That case is now a test: a refused key or tool never costs me the reply.
