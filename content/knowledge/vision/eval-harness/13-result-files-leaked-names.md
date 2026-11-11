---
id: result-files-leaked-names
piece: vision
part: eval-harness
page: /vision/eval-harness/
anchor: result-files-leaked-names
kind: learning
sources:
  - sources/vision/deep/eval-harness.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Result files leaked the names of my notes

Before one merge I noticed that a docs-retrieval result file listed the real paths of notes in my vault. The docs set searches the whole knowledge scope, and only the vault set's output had been redacted. No note text got out, but the names were in files headed for publication. Now every retrieval set is redacted the same way: any result outside the eval's scope shows up as `other`, and a test holds it there. I fixed the two affected files and checked all 23 result files; none had anything from outside the scope.
