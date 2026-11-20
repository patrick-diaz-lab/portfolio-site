---
id: probe-and-fall-back
kind: decision
---

### Erst prüfen, kurze Frist, Rückfall auf das starke Modell

Vor dem Klassifizieren prüft der Agent-Core innert 2 Sekunden, ob der GPU-PC überhaupt antwortet. Tut er das nicht oder dauert die Klassifizierung länger als 20 Sekunden, geht die Nachricht direkt an `smart`, mit Werkzeugen. `cheap` beantwortet nur Nachrichten, die der Klassifikator tatsächlich als einfach markiert hat.
