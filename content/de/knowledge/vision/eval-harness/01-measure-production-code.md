---
id: measure-production-code
kind: decision
---

### Den Code messen, den ich ausführe, nicht eine Kopie davon

Klassifikator und Router liegen im Agent-Core, und der Harness importiert sie unverändert. Ein Test prüft, dass die Klassifikator-Anfrage des Harness Byte für Byte jener des Routers entspricht. Der Harness ändert eine einzige Einstellung: Er umgeht den Antwort-Cache des Gateways, damit jeder Fall wirklich beim Modell ankommt.
