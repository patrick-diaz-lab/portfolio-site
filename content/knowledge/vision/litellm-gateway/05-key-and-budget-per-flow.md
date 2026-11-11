---
id: key-and-budget-per-flow
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: key-and-budget-per-flow
kind: decision
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A key and a budget per flow, under one global cap

The chat agent, the eval harness and the indexer each get their own virtual key, a 30-day budget, and only the roles they need. A global cap sits above all of them.

The cap has to survive a calendar mismatch: LiteLLM resets budgets on the 1st, while my provider's billing cycle starts on another day, so one billing cycle can see two full LiteLLM budgets. Against my monthly API credits I first set the cap at $45, so even the doubled worst case of $90 stayed inside them. Since 2026-11-06 a $30 monthly spend limit at the provider is the hard backstop, the global cap is $24 and the key budgets add up to $22.
