---
id: read-only-wrapped-tools
kind: decision
---

### Werkzeuge nur für das starke Modell und den Worker, nur lesend und eingepackt

Nur `smart`, das starke Modell, und mein Subscription-Worker bekommen Werkzeuge. Die Werkzeuge sind nur lesend, ausser einem, das Notizen in den eigenen Inbox-Ordner der Agenten schreibt; meine eigenen Notizen bleiben nur lesbar. Sie suchen und lesen in meinen Docs, Notizen, Dateien und im Homelab-Status, und eine Nachricht darf höchstens 6 Werkzeugaufrufe nutzen. Jedes Ergebnis erreicht das Modell in einem festen Block, der als nicht vertrauenswürdige Daten markiert ist, und alles im Ergebnis, was diesen Block vorzeitig schliessen könnte, wird entschärft. Jeder Client packt selbst ein, und der Worker überwacht zusätzlich den Stream: Ein Ergebnis, das uneingepackt ankommt, beendet den Aufruf.
