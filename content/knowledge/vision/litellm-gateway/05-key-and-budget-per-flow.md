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
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A key and a budget per flow, under one global cap

The chat agent, the eval harness and the indexer each get their own virtual key, a 30-day budget, and only the roles they need. A global cap sits above all of them.

The cap has to survive a calendar mismatch: LiteLLM resets budgets on the 1st, while my provider's billing cycle starts on another day, so one billing cycle can see two full LiteLLM budgets. Against my monthly API credits I first set the cap at $45, so even the doubled worst case of $90 stayed inside them. Since 2026-11-05 a $30 monthly spend limit at the provider is the hard backstop, and since 2026-11-06 the global cap is $24 and the key budgets add up to $22.
