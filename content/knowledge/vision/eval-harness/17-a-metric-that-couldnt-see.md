---
id: a-metric-that-couldnt-see
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: a-metric-that-couldnt-see
kind: learning
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A metric that couldn't see the problem

My "right source" metric passed whenever the expected document came back from any tool. In a real run the model found the document I had named, never read it, and answered from search snippets, and the metric would have passed that too. Source cases can now also name the tools that must be called, and the summary reports how often that held. The new cases exposed a second problem right away, in the knowledge core's search: a document I named by its short number was never found at all.
