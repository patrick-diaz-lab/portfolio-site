---
id: read-only-wrapped-tools
kind: decision
---

### Werkzeuge nur für `smart` und den Worker, nur lesend und eingepackt

Nur `smart` und mein Subscription-Worker bekommen Werkzeuge, und jedes Werkzeug sucht oder liest nur: in meinen Docs, Notizen, Dateien und im Homelab-Status. Eine Nachricht darf höchstens 6 Werkzeugaufrufe nutzen. Jedes Ergebnis erreicht das Modell in einem festen Block, der als nicht vertrauenswürdige Daten markiert ist, und alles im Ergebnis, was diesen Block vorzeitig schliessen könnte, wird entschärft. Jeder Client packt selbst ein, und der Worker überwacht zusätzlich den Stream: Ein Ergebnis, das uneingepackt ankommt, beendet den Aufruf.
