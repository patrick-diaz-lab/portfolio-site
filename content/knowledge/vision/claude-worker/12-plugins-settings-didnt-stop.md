---
id: plugins-settings-didnt-stop
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: plugins-settings-didnt-stop
kind: learning
sources:
  - sources/vision/deep/claude-worker.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Plugins the settings didn't stop

#### What happened

A dry run of the pinned tool showed two built-in plugins in its startup report, loaded despite the settings meant to keep them out, and one of them would have read instruction files from the folders around the workspace. When I later switched skills on, 15 bundled skills appeared next to mine.

#### What I changed

Both are now switched off explicitly, and the startup check requires exactly the expected plugin and skills.

#### Result

The worker runs only what I meant it to run, and the lesson stuck: verify what a tool loaded, not what you asked it to load.
