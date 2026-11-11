---
id: latency
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: latency
kind: testing
sources:
  - sources/vision/deep/agent-core-routing.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### How long it takes

A question averages about 3 tool calls. The median answer takes 6 seconds and the 95th percentile 11.6. A cold start of the local model took 46 to 70 seconds, which is why the deadline above is short and the fallback strong.
