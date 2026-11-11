---
id: read-only-wrapped-tools
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: read-only-wrapped-tools
kind: decision
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Tools only for `smart` and the worker, read-only and wrapped

Only `smart` and my subscription worker get tools, and every tool only searches or reads: my docs, notes, files and homelab status. A message may use at most 6 tool calls. Each result reaches the model inside a fixed block marked as untrusted data, and anything in the result that could close that block early is neutralised. Every client does the wrapping itself, and the worker also watches the stream: a result that arrives unwrapped ends the call.
