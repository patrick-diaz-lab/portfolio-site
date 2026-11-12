---
id: server-name-took-gateway-down
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: server-name-took-gateway-down
kind: learning
sources:
  - sources/vision/deep/mcp-servers.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A server name took the gateway down

When I added an eval scope for the knowledge server, the gateway refused to start: it doesn't accept a hyphen in a server name. The mistake had come in with an earlier item and went unnoticed because the gateway wasn't restarted then. Every chat was down for a few minutes. The lesson went into how I deploy: a config change counts as tested only once the service has restarted on it.
