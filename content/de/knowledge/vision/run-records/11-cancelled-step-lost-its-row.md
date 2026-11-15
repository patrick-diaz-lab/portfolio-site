---
id: cancelled-step-lost-its-row
kind: learning
---

### Ein abgebrochener Schritt verlor seine Zeile

#### Was passiert ist

Ein Klassifikator-Aufruf wurde nach seiner Frist abgebrochen, und der Abbruch traf auch den Datenbankeintrag des Aufräumens selbst, sodass der Trace-Eintrag des Schritts mittendrin abriss. Ich fand das, während ich einen anderen Fehler untersuchte.

#### Was ich geändert habe

Trace-Einträge sind jetzt gegen Abbruch geschützt, und ein gescheiterter Trace-Eintrag lässt nie den Lauf scheitern; stattdessen zählt ihn der Status-Befehl.

#### Ergebnis

Ein abgebrochener Schritt behält seinen Eintrag, und ein Problem mit dem Trace-Store zeigt sich als Zahl statt als kaputter Lauf.
