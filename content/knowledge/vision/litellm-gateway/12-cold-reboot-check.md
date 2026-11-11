---
id: cold-reboot-check
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: cold-reboot-check
kind: testing
sources:
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A fix counts only after a cold reboot

For the start-up problem below, a check script tests name resolution in every container. The fix was accepted only after a cold reboot with no manual restarts, because a warm restart had hidden the problem before.
