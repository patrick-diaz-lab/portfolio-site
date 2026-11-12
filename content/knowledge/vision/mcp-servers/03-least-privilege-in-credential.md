---
id: least-privilege-in-credential
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: least-privilege-in-credential
kind: decision
sources:
  - sources/vision/deep/mcp-servers.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Least privilege in the credential, not in the code

Each layer holds only the rights it needs, so a bug in the code above it can't do more. The files server never sees a folder; it reads views of content that was indexed and isn't private, so it has no path to get wrong. The keys of my home media server never leave that machine: a small service there answers one read-only question, from a fixed list of fields, and only counts and states come out. Status from my virtualization host comes through a token that can read status and nothing else, and container status through a filter that answers the list and nothing more. The one write tool can only add a new note to the agents' inbox, and the server picks its name.
