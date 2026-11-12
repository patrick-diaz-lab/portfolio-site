---
id: field-the-source-couldnt-give
piece: vision
part: mcp-servers
page: /vision/mcp-servers/
anchor: field-the-source-couldnt-give
kind: learning
sources:
  - sources/vision/deep/mcp-servers.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### A contract field the source couldn't give

The homelab contract promised one more detail per container than the filtered status can provide. Rather than widen the filter, I dropped the field. Instead I keep a list of the containers I expect on each host: a missing or stopped one is a finding only if it's on that list.
