---
id: prices-pinned-in-config
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: prices-pinned-in-config
kind: decision
sources:
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Prices I set myself

The config lists candidate models per provider and tier under stable names, and every role points at one of them. I write each price into the config by hand, with the date I last checked it, and LiteLLM's downloaded price list is turned off. Prices are checked again whenever the gateway is upgraded or a candidate changes.

The rule I'm working towards: each role maps to the cheapest candidate that passes the evals for that kind of task. Today's mapping still reflects which provider key I set up first, and it is written down as provisional.
