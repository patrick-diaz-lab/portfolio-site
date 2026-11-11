---
id: no-framework-logging
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: no-framework-logging
kind: rejected
lost_to: one-step-per-request
sources:
  - sources/vision/deep/agent-core-routing.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

#### Rejected: logging at the framework level

That works for one request per message, and breaks as soon as a tool loop makes several.
