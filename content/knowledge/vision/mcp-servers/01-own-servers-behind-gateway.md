---
id: own-servers-behind-gateway
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: own-servers-behind-gateway
kind: decision
sources:
  - sources/vision/deep/mcp-servers.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### My own servers first, all behind the gateway

None of the servers has a published port. Clients reach them only through the gateway that also carries every model call, so permissions and logs live in one place. Each client key lists the servers and tools it may use, and a tool added by an upgrade isn't enabled by itself. Public servers may come later, under written rules: pinned versions, a source review before adoption and on every upgrade, and nothing hosted for anything private.
