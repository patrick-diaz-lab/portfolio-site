---
id: budgets-that-never-fired
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: budgets-that-never-fired
kind: learning
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A budget is only as good as its price table

#### What happened

When I first wired things up, the pinned gateway didn't know the prices of the models I used. Every call would have been logged at $0, and no budget would ever have stopped anything.

#### What I changed

All prices now live in the config, copied by hand from the providers' pages, and LiteLLM's own price list is turned off.

#### Result

The budgets rest on prices I set myself, and those are re-checked on every upgrade.
