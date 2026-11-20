---
id: subscription-exception
kind: decision
---

### Eine Ausnahme: mein Abo, für meine eigenen Nachrichten

Ein Claude-Code-Worker läuft auf meinem Claude-Abo statt über die API. Er läuft nur für Nachrichten, die ich selbst mit einem ausdrücklichen Befehl schicke; alles Automatisierte läuft über die API und das Gateway. Er macht höchstens 30 Aufrufe pro Tag und beginnt jeden Lauf in einem sauberen Workspace. Er bleibt aus dem Netz des Gateways: Ein filternder Proxy ist sein einziger Weg nach aussen, zur API des Anbieters und zum Tool-Endpunkt des Gateways. Er ist der einzige Modellverkehr, der nicht über das Gateway läuft.
