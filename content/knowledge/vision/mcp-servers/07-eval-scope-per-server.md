---
id: eval-scope-per-server
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: eval-scope-per-server
kind: decision
sources:
  - sources/vision/deep/mcp-servers.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Every server has a scope for evals

Each server has a second, separate scope that serves test data only: repo docs, a seed vault of made-up notes, test PDFs, recorded homelab answers, and a throwaway folder for written notes. Evals run the real server code but can't see or touch my real notes, files or machines.
