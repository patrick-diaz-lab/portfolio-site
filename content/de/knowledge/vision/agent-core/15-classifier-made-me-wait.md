---
id: classifier-made-me-wait
kind: learning
---

### Ein Rückfall muss Fähigkeiten erhalten, nicht nur Geld sparen

#### Was passiert ist

Als der GPU-PC zum ersten Mal nicht erreichbar war, wartete jede Nachricht über 150 Sekunden: Das Gateway gab `local` einen langen Timeout plus eine Wiederholung, und mein Client gab vorher auf. Später, mit eingeschaltetem, aber kaltem PC, wartete eine Frage zu einer meiner Dateien die vollen 90 Sekunden meiner ersten Korrektur und fiel dann auf `cheap` zurück, das keine Werkzeuge hat und die Datei nicht öffnen konnte.

#### Was ich geändert habe

Das fixierte Gateway konnte einen kurzen Verbindungs-Timeout nicht von einem langen Lese-Timeout unterscheiden, also bekam der Agent-Core eine eigene Prüfung von 2 Sekunden und eine Frist. Nach dem zweiten Fall sank die Frist von 90 auf 20 Sekunden, und der Rückfall ging von `cheap` auf `smart` mit Werkzeugen.

#### Ergebnis

Eine gescheiterte Klassifizierung kostet eine Antwort von `smart`, meist für die erste Nachricht nach einer Pause.
