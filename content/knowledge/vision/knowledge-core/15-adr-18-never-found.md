---
id: adr-18-never-found
piece: vision
part: knowledge-core
page: /vision/knowledge-core/
anchor: adr-18-never-found
kind: learning
sources:
  - sources/vision/deep/knowledge-core.md
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### "ADR 18" was never found

#### What happened

My decision records carry four-digit numbers in their titles. New dev cases asked for "ADR 18" and "ADR 11", and the baseline failed both: no search returned the right record, and a guessed ID came back as not found. In an earlier real run, the model had the right document's ID in hand and still didn't read it.

#### What I changed

The reading rule now says: search once, with the number written as the title writes it, read the headings, then read the text.

#### Result

The agent eval found the right source in 23 of 23 named-document cases, and the read tool was used in all 5 new ones. The eval caught the mismatch before a phone test would have.
