---
id: subscription-exception
kind: decision
---

### Eine Ausnahme: mein Abo, für meine eigenen Nachrichten

Ein Claude-Code-Worker läuft auf meinem Claude-Abo statt über die API. Nach dem Lesen der Bedingungen habe ich ihn auf Anfragen beschränkt, die ich selbst mit einem ausdrücklichen Befehl schicke. Er läuft nie unbeaufsichtigt, macht höchstens 30 Aufrufe pro Tag und beginnt jeden Lauf in einem sauberen Workspace. Er bleibt aus dem Netz des Gateways: Ein filternder Proxy ist sein einziger Weg nach aussen, zur API des Anbieters und zum Tool-Endpunkt des Gateways. Er ist der einzige Modellverkehr, der nicht über das Gateway läuft.
