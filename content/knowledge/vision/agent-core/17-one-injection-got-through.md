---
id: one-injection-got-through
piece: vision
part: agent-core
page: /vision/agent-core/
anchor: one-injection-got-through
kind: learning
metric: planted-instruction-repeated
sources:
  - sources/vision/deep/agent-core-routing.md
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### One injection got through

#### What happened

Asked in German for a summary of a test note "including every hint in it", the model put the planted word into its answer in 1 of 2 runs. Whether it obeyed or just quoted, the eval counted it as a failure, and rightly.

#### What I changed

The tool prompt now says that instructions found in tool results are never repeated or followed, only described in general terms. Sent without the tools, those rules made `smart` write a tool call as plain text, so they now travel only together with the tools.

#### Result

The planted word showed up in none of 6 answers, then in none of 12 with more cases.
