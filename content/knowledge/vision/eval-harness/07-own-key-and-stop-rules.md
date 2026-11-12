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
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Its own key, budget and stop rules

The harness has its own gateway keys, one for classifier evals and one for agent evals, each with a 30-day budget. It can't reach the subscription worker at all: it has no way to address it, it isn't on its network, and the gateway accepts only its roles. A run stops early once it has spent $2, when the kill switch is on, when the money is gone, or after 5 failures in a row. Each eval run is one run record with its cost, and that record never holds case text.
