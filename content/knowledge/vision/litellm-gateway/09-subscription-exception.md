---
id: subscription-exception
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: subscription-exception
kind: decision
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### One exception: my subscription, for my own messages

A Claude Code worker runs on my Claude subscription instead of the API. After reading the terms I limited it to requests I send myself with an explicit command. It never runs unattended, makes at most 30 calls a day and starts every run in a clean workspace. It is kept off the gateway's network: a filtering proxy is its only way out, to the provider's API and the gateway's tool endpoint. It is the only model traffic that doesn't pass the gateway.
