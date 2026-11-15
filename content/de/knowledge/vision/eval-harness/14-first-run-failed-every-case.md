---
id: first-run-failed-every-case
kind: learning
---

### Der erste Vergleichslauf scheiterte an jedem Fall

#### Was passiert ist

Mein erster Lauf auf `cheap` gab für alle 40 Fälle einen Fehler zurück: Der Anbieter lehnt für diese Modelle eine Einstellung für `temperature` ab.

#### Was ich geändert habe

Der Harness lässt `temperature` jetzt nur für `cheap` und `smart` weg, und jede Ergebnisdatei hält diese Abweichung fest.

#### Ergebnis

Die Ausgabe zeigt, wann die Abweichung galt, und lokale Läufe bleiben identisch mit der Produktion.
