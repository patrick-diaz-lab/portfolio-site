---
id: first-phone-test-failed
piece: vision
part: console
page: /vision/console/
anchor: first-phone-test-failed
kind: learning
sources:
  - sources/vision/deep/console.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### The first phone test after the trace work failed

My first message after trace storage went live failed. The GPU PC had cold-loaded the classifier, two search lookups waited behind it, and two timeouts on the way were both 60 seconds. The timeout landed in a cleanup step after the strong model had already answered, and it failed the whole run. The trace work wasn't the cause, but the search for it found a real bug of its own: a cancelled step could lose its trace record. Agent core now waits longer than the gateway, a failed cleanup after an answer fails only that step, and trace writes are shielded from cancellation.
