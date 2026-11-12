---
id: tests-that-missed-the-change
piece: vision
part: console
page: /vision/console/
anchor: tests-that-missed-the-change
kind: learning
sources:
  - sources/vision/deep/console.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Tests that didn't test the change

The first streaming build passed all its browser tests, but they ran on the demo build with recorded data, which never touches the live path. My review caught it. A second test mode now runs the real build against scripted live events, and three deliberate breaks of the streaming code each make it fail. A test proves something only if breaking the thing breaks the test.
