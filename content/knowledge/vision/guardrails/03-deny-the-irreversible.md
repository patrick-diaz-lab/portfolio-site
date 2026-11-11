---
id: deny-the-irreversible
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: deny-the-irreversible
kind: decision
sources:
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Deny what can't be undone, ask what I should see

Two kinds of stop, for two reasons. Whatever can't be undone is denied outright: losing data for good, reading secrets, controlling my infrastructure, speaking as me in my chat. Whatever I should see before it happens is asked: privileged commands, changes to the production database, rewriting history, and changes to the guardrail itself. When I approve a plan, it names its risky steps up front, so I know what I'm agreeing to.
