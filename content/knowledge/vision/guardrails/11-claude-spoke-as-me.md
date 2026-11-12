---
id: claude-spoke-as-me
piece: vision
part: guardrails
page: /vision/guardrails/
anchor: claude-spoke-as-me
kind: learning
sources:
  - sources/vision/deep/guardrails.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Claude spoke as me

To try out a new skill, Claude once sent messages to my chat's back end from inside the system, at my request but not from my phone. In the records they looked exactly like messages I had written. Nothing went wrong, but it showed that something inside the system could pass as me. Two layers came out of it: Claude never acts as my chat, and the check enforces that; and any test that depends on who I am is sent by me, from my phone, while Claude only reads the records afterwards. Since then every chat message is signed, and agent core refuses anything unsigned before a run starts.
