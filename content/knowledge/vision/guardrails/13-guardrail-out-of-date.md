---
id: guardrail-out-of-date
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: guardrail-out-of-date
kind: learning
sources:
  - sources/vision/deep/guardrails.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A guardrail that was out of date

#### What happened

Merged guardrail changes turned out not to be in force in every session. My first explanation of where sessions read their guardrail from was an assumption, and a probe showed it was wrong: each session used its own copy, and a half-finished edit of that copy could lock a session out completely.

#### What I changed

Now every session runs the guardrail from one current copy that moves with each merge, and a merge that would block every session is refused.

#### Result

The lesson: measure where a control actually runs before trusting that it does.
