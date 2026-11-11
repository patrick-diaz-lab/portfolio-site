---
id: dns-race-after-reboot
piece: vision
part: litellm-gateway
page: /vision/litellm-gateway/
anchor: dns-race-after-reboot
kind: learning
sources:
  - sources/vision/deep/litellm-gateway.md
as_of: 2026-11-10
source_commit: bb4fb3747aa6d7a80666b2d19dd718d1e4bedd98
---

### Every chat failed after a reboot

One morning no message got through: the gateway couldn't look up the provider's address. Docker hands each container its name servers when the container starts, and at boot some containers started before the host had its own settings, so they got none. A restart fixed it until the next boot, and reordering the services would only have made the race rarer. Docker now uses fixed upstream name servers, and the check script above proves it after every cold boot.
