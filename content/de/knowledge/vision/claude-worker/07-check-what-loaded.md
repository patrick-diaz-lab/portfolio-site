---
id: check-what-loaded
kind: decision
---

### Bei jedem Aufruf prüfen, was tatsächlich geladen wurde

Beim Start meldet das Werkzeug, was es geladen hat: wie es angemeldet ist, dazu seine Werkzeuge, Server, Plugins, Skills und sein Gedächtnis. Der Worker vergleicht diese Meldung bei jedem Aufruf mit genau dem erwarteten Satz, und alles Zusätzliche oder jede andere Anmeldung als die des Abos verwirft den Aufruf. Er überwacht ausserdem den Stream: Ein Werkzeugergebnis, das ohne seine Markierung als nicht vertrauenswürdige Daten ankommt, beendet den Aufruf. Die eigenen Einstellungen des Werkzeugs allein reichten nicht, wie die erste Erkenntnis unten zeigt.
