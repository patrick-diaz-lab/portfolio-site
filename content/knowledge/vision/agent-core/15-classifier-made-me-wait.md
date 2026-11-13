---
id: classifier-made-me-wait
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: classifier-made-me-wait
kind: learning
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### A fallback has to keep capability, not just save money

#### What happened

The first time the GPU PC was unreachable, every message waited more than 150 seconds: the gateway gave `local` a long timeout plus a retry, and my client gave up first. Later, with the PC on but cold, a question about one of my files waited the full 90 seconds of my first fix and then fell back to `cheap`, which has no tools and couldn't open the file.

#### What I changed

The pinned gateway couldn't tell a short connect timeout from a long read timeout, so agent core got its own 2-second probe and a deadline. After the second case the deadline went from 90 to 20 seconds, and the fallback from `cheap` to `smart` with its tools.

#### Result

A failed classification costs one `smart` answer, usually for the first message after a pause.
