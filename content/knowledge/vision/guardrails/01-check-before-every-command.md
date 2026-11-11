---
id: check-before-every-command
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: check-before-every-command
kind: decision
sources:
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A check before every command, and every rule says why

Before a command or a file access runs, a check looks at it and answers deny, ask or allow. Each hard rule in the project's instructions also says what to do instead and which check stands behind it. A refusal names its rule, so a refused step is never a mystery, and when the step was right after all, I run it myself.
