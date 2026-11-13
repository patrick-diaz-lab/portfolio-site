---
id: budget-per-session
piece: vision
part: console
page: /vision/console/
anchor: budget-per-session
kind: decision
sources:
  - sources/vision/deep/console.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A budget for every session, counted by agent core

Each session has its own budget, from $0.10 to $2, raised in $1 steps by a button only I can press. A daily cap of $2 covers the console and the chat together, and at most 3 runs work at once. Agent core checks the budget before every model call, so lowering a budget stops a running run at its next call. The gateway's global cap stays behind all of it.
