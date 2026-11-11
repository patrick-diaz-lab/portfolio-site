---
id: one-step-per-request
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: one-step-per-request
kind: decision
sources:
  - sources/vision/deep/agent-core-routing.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### One run step per model request

A thin HTTP layer under the agent framework turns every request to the gateway into one step of the current run, numbered and tagged with the run. It records tokens and cost, checks the kill switch before each request, and refuses any request made outside a run. It never retries on its own: the gateway already does, and retries stacked on retries multiply what a failing call costs.
