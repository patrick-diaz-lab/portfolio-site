---
id: out-of-funds-replies-tested
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: out-of-funds-replies-tested
kind: testing
sources:
  - sources/vision/notes.md
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Each way of running out gets its own reply

Tests cover both cases, used-up credits and an exceeded budget, and check that each produces its own outcome and its own reply instead of a generic failure.
