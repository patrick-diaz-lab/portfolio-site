---
id: check-what-loaded
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: check-what-loaded
kind: decision
sources:
  - sources/vision/deep/claude-worker.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Check what actually loaded, on every call

At startup the tool reports what it loaded: how it signed in, and its tools, servers, plugins, skills and memory. The worker compares that report with the exact expected set on every call, and anything extra, or any sign-in other than the subscription, discards the call. It also watches the stream: a tool result that arrives without its untrusted-data marking ends the call. The tool's own settings alone weren't enough, as the first lesson below shows.
