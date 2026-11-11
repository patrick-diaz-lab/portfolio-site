---
id: chat-context-hygiene
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: chat-context-hygiene
kind: decision
sources:
  - sources/vision/deep/agent-core-routing.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Keeping an endless chat honest

My Telegram chat never ends, so three things keep old messages from steering new answers. Only turns from the last 6 hours count as context. A prompt rule says earlier messages are context, never a source. And code, not the model, decides the reply language: it counts common German, English and Spanish words in the question and adds the result as the very last instruction.
