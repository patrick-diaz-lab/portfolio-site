---
id: the-fallback-i-couldnt-see
kind: learning
---

### Ein Rückfall, den ich nicht sehen konnte

#### Was passiert ist

Das Gateway kann von sich aus von einem Alias auf einen anderen wechseln. Für den Klassifikator hiess das: `local` konnte im Agent-Core in einen Timeout laufen, während das Gateway still auf `cheap` wiederholte. Es wurde Geld ausgegeben, das der Lauf nie erfasste, und der Lauf passte nicht mehr zum Kostenlog.

#### Was ich geändert habe

Ich habe den Rückfall des Gateways für diesen Aufruf ausgeschaltet, sodass nur der Agent-Core entscheidet, wann zurückgefallen wird.

#### Ergebnis

Jeder Aufruf muss jetzt sowohl im Laufprotokoll als auch im Protokoll des Gateways erscheinen, verbunden über Lauf- und Schrittnummer.
