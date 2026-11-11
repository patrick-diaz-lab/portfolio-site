---
id: own-key-and-stop-rules
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: own-key-and-stop-rules
kind: decision
sources:
  - sources/vision/deep/eval-harness.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Its own key, budget and stop rules

The harness has its own gateway key with a 30-day budget and only three roles. A run stops early once it has spent $2, when the kill switch is on, when the money is gone, or after 5 failures in a row. Each eval run is one run record with its cost, and that record never holds case text.
