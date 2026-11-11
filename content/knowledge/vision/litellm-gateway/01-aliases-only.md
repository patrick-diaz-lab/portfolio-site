---
id: aliases-only
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: aliases-only
kind: decision
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### One gateway, roles instead of model names

A service asks the gateway for `smart`, `cheap`, `local` or `embed`, never for a provider's model. One config file maps each role to exactly one model. Changing provider means editing that file; no service changes, and no service needs a key of its own.
