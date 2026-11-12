---
id: prompt-caching
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: prompt-caching
kind: decision
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Prompt caching on the stable part of every request

For `smart` and `cheap`, each request marks its stable start, the instructions and tool definitions, and its growing end. Every call in a tool loop then reads the previous call's prompt from the provider's cache instead of paying for it again. Cache reads and writes are recorded per step, and every cached step's cost matched its tokens times the cache prices I pinned in the config.
