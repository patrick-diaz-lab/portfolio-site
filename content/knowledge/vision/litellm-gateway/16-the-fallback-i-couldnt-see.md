---
id: the-fallback-i-couldnt-see
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: the-fallback-i-couldnt-see
kind: learning
sources:
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A fallback I couldn't see

The gateway can switch from one role to another on its own. For the classifier that meant `local` could time out in agent-core while the gateway quietly retried on `cheap`: money was spent that the run never recorded, and the run no longer matched the spend log. I turned the gateway's fallback off for that call, so only agent-core decides when to fall back. Since then every call has to appear in both the run record and the gateway's log, joined by run and step number.
