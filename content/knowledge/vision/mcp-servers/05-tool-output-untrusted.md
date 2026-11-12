---
id: tool-output-untrusted
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: tool-output-untrusted
kind: decision
sources:
  - sources/vision/deep/mcp-servers.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Tool output is untrusted

Every result reaches the model inside a fixed block marked as untrusted data, and a run that has read untrusted content gets no write tools. A note written by a run that read one of my documents is marked as tainted, and that mark comes from the run's record, never from the model. My notes can't load remote images when I open them, so an injected instruction can't use one to send data out.
