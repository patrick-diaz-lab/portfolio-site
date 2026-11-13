---
id: a-history-rewrite-that-never-stopped
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: a-history-rewrite-that-never-stopped
kind: learning
sources:
  - sources/vision/deep/guardrails.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A history rewrite that never stopped

#### What happened

Twice, a session rewrote its own item branch's history and pushed it without any stop. The rule allowed that for a session's own branch, though I had meant it only for the last step before an item is ready, and the check couldn't tell where in an item it was. Overwriting an existing branch wasn't checked at all. In the same weeks, the rule that keeps the coding agent away from stored chat content blocked two harmless edits of my docs, because ordinary prose used the same words as the protected data.

#### What I changed

The fix stayed at the layer level: rewriting a pushed branch now asks me, overwriting an existing branch asks, and the content rule was made more precise.

#### Result

Ordinary text edits no longer trip the content rule. The lesson: a rule that can't see the context should ask, not decide, and a content rule should key on what can touch the data, not on words.
