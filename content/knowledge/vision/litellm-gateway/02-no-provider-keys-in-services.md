---
id: no-provider-keys-in-services
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: no-provider-keys-in-services
kind: rejected
lost_to: aliases-only
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

#### Rejected: a provider SDK and key in every service

Each service would carry a key that can spend money, nothing would add their spending up, and every provider switch would touch code in several places.
