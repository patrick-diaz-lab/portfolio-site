---
id: no-evals-on-production
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: no-evals-on-production
kind: rejected
lost_to: eval-scope-per-server
sources:
  - sources/vision/deep/mcp-servers.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

#### Rejected: running evals against the production scopes

The agent eval must never see my own notes, and a test write must never land in them.
