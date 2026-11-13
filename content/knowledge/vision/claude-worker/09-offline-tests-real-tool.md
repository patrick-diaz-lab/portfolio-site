---
id: offline-tests-real-tool
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: offline-tests-real-tool
kind: testing
sources:
  - sources/vision/deep/claude-worker.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Tests with the real tool, offline

The tests run the real tool against a fake model API, a fake gateway and the real proxy, so they cost nothing. With the safety hooks removed, the call is refused; with an extra tool on the gateway, the startup check catches it. The proxy's rules have 39 test cases of their own.
