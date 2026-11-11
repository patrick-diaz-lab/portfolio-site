---
id: out-of-funds-outcome
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: out-of-funds-outcome
kind: decision
sources:
  - sources/vision/deep/litellm-gateway.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Running out of money is its own outcome

Used-up provider credits and an exceeded LiteLLM budget look the same to someone chatting, but they have different fixes. agent-core tells them apart: the run fails with a named reason, the reply says what ran out and what still works, and the status command keeps showing it until a call succeeds again. Nothing retries and nothing switches provider. `local` keeps answering, because it isn't paid from the credits.
