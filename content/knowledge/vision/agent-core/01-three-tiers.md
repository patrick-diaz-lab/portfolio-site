---
id: three-tiers
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: three-tiers
kind: decision
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Three tiers, cheapest first

Commands such as status, cost, stop and resume run without any model and cost nothing. Everything else goes to a small local model on my GPU PC, which reads the single message, without history, and returns its intent and a verdict, simple or complex, as JSON at temperature 0. Simple messages go to `cheap`, complex ones to `smart`.
