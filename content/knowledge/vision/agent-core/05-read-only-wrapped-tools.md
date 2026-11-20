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
  - sources/patrick/2026-11-20.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Tools only for the strong model and the worker, read-only and wrapped

Only `smart`, the strong model, and my subscription worker get tools. The tools are read-only, except one that writes notes into the agents' own inbox folder; my own notes stay read-only. They search and read my docs, notes, files and homelab status, and a message may use at most 6 tool calls. Each result reaches the model inside a fixed block marked as untrusted data, and anything in the result that could close that block early is neutralised. Every client does the wrapping itself, and the worker also watches the stream: a result that arrives unwrapped ends the call.
