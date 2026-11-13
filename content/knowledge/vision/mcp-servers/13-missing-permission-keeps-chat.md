---
id: missing-permission-keeps-chat
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: missing-permission-keeps-chat
kind: learning
sources:
  - sources/vision/deep/mcp-servers.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A missing permission shouldn't break the chat

#### What happened

One of my messages came in a moment before the chat's key was allowed tools, so the tool connection failed.

#### What I changed

Every client is built so that a refusal degrades to an answer without tools, and the failed step is recorded.

#### Result

The reply still came, from `smart` without tools. A permission that arrived too late cost a tool, not the conversation.
