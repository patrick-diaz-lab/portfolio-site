---
id: isolated-by-layers
piece: vision
part: claude-worker
page: /vision/claude-worker/
anchor: isolated-by-layers
kind: decision
sources:
  - sources/vision/deep/claude-worker.md
  - sources/vision/notes.md
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Isolated by layers

The worker sits on its own network, with no route to the database, the gateway's model endpoints, my home network or the internet. A filtering proxy is its only way out, and it lets through only the provider's API and the gateway's tool endpoint. Every call starts in a fresh, empty workspace that is deleted afterwards, with no project files or settings brought in and no session kept. Its only credential is the subscription sign-in, and it refuses to start if any other way to reach a model is present. Its tools are the same read-only knowledge, file and homelab tools as smart, under the same rules: at most 6 calls, every result marked as untrusted data, and anything that runs code, writes files or fetches from the web refused outright.
