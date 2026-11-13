---
id: no-subscription-by-default
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: no-subscription-by-default
kind: rejected
lost_to: subscription-exception
sources:
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

#### Rejected: the subscription as the default for complex messages

That was my first design. Once I had prepaid API credits, complex messages went to `smart` through the gateway instead, where budgets, chat history and evals apply.
