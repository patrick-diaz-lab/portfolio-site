---
id: guardrail-out-of-date
kind: learning
---

### Eine Guardrail, die veraltet war

#### Was passiert ist

Gemergte Änderungen an der Guardrail waren, wie sich zeigte, nicht in jeder Session in Kraft. Meine erste Erklärung, woher Sessions ihre Guardrail lesen, war eine Annahme, und eine Überprüfung zeigte, dass sie falsch war: Jede Session nutzte ihre eigene Kopie, und eine halb fertige Bearbeitung dieser Kopie konnte eine Session ganz aussperren.

#### Was ich geändert habe

Jetzt führt jede Session die Guardrail aus einer einzigen aktuellen Kopie aus, die mit jedem Merge mitgeht, und ein Merge, der jede Session blockieren würde, wird abgelehnt.

#### Ergebnis

Die Lehre daraus: erst messen, wo eine Kontrolle tatsächlich läuft, bevor man darauf vertraut, dass sie läuft.
