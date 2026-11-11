---
id: pushes-and-merges-stay-with-me
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: pushes-and-merges-stay-with-me
kind: decision
sources:
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Pushes and merges stay with me

Claude may push only to the branch of the item it is working on. The check before the command looks at that, a second check looks again at what is actually being pushed, and a secret scanner runs on every commit and every push. Claude opens pull requests; I review them and merge them myself.
