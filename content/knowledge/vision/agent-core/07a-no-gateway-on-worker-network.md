---
id: no-gateway-on-worker-network
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: no-gateway-on-worker-network
kind: rejected
lost_to: read-only-wrapped-tools
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

#### Rejected: putting the gateway on the worker's network

It would leave every gateway endpoint one step away from the worker. The worker stays on its own network instead, with a filtering proxy as its only way out.
