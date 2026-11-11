---
id: held-out-sets-are-mine
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: held-out-sets-are-mine
kind: decision
sources:
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Held-out sets belong to me

Every kind of eval has two sets. Claude drafts the dev sets, I review them like code, and models may see them. The held-out sets are mine: agents can't write, move or delete anything in their folder, and a held-out run prints and stores totals only, with no case IDs, texts or per-case outputs.

The next step goes further: Claude may neither read nor run the held-out sets, and a baseline never changes in the same pull request as the change it measures.
