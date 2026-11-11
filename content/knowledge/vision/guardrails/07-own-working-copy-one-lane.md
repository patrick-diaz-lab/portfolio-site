---
id: own-working-copy-one-lane
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: own-working-copy-one-lane
kind: decision
sources:
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Each session in its own working copy, one lane for anything live

Every session works in its own working copy, on its own branch. Only one place, the deploy lane, holds secrets and may build and restart services, and only one session at a time can hold it.
