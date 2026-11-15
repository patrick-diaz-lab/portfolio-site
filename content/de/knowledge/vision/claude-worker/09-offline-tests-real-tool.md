---
id: offline-tests-real-tool
kind: testing
---

### Tests mit dem echten Werkzeug, offline

Die Tests führen das echte Werkzeug gegen eine nachgebildete Modell-API, ein nachgebildetes Gateway und den echten Proxy aus, also kosten sie nichts. Ohne die Sicherheits-Hooks wird der Aufruf abgelehnt; mit einem zusätzlichen Werkzeug am Gateway erkennt es die Startprüfung. Die Regeln des Proxys haben 39 eigene Testfälle.
