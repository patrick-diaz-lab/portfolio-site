---
id: private-network-several-layers
piece: vision
part: console
page: /vision/console/
anchor: private-network-several-layers
kind: decision
sources:
  - sources/vision/deep/console.md
  - sources/vision/notes.md
as_of: 2026-11-12
source_commit: 8b2a08b580419fd5f06330fce3b7e25a982b0150
---

### Private network only, and several layers behind it

The console has no open port; it is reachable only inside my private network. It takes my identity from the network itself, in a way that a local process can't fake. The console's server, not the browser, signs every request it passes on to agent core, which trusts only signed senders, and it uses its own credential, separate from the chat's. The coding agent that builds Vision can't use the console's data or its message endpoint at all. The threat model is written down: access rests on my own devices being locked and current, not on the app.
