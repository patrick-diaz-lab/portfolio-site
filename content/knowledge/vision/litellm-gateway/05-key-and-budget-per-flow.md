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

### A key and a hard monthly budget per flow, under one global cap

Each flow, meaning each workflow that calls a model, has its own virtual key with a hard monthly budget (a 30-day budget, in LiteLLM's terms) and only the aliases it needs: the chat agent, the eval harness, the indexer. A flow that has spent its budget is stopped, and a global cap sits above all of them.

The cap has to survive a calendar mismatch: LiteLLM resets budgets on the 1st, while my provider's billing cycle starts on another day, so one billing cycle can see two full LiteLLM budgets. So the cap stays under the limit at the provider: since 2026-11-05 a $30 monthly spend limit there is the hard backstop, and since 2026-11-06 the global cap is $24 and the key budgets add up to $22.
