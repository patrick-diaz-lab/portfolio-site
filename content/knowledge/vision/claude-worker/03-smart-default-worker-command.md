---
id: smart-default-worker-command
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: smart-default-worker-command
kind: decision
sources:
  - sources/vision/deep/claude-worker.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### The strong model is the default; the worker is a command

My first design sent every complex message to the worker. Once I had prepaid API credits I turned that around: complex messages go to smart through the gateway, where budgets, chat history and evals apply. The worker answers only a command I type in my private chat. It gets the message as a task, without the chat history, and makes at most 30 calls a day. If it is off, at its cap, cooling down or failing, smart answers, and the reply says so.
