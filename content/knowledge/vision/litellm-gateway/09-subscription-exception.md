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
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### One exception: my subscription, for my own messages

A Claude Code worker runs on my Claude subscription instead of the API. After reading the terms I limited it to requests I send myself with an explicit command. It never runs unattended, makes at most 30 calls a day and starts every run in a clean workspace. It is the only model traffic that doesn't pass the gateway.
