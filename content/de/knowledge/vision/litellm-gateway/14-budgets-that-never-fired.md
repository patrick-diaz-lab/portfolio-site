---
id: budgets-that-never-fired
kind: learning
---

### Ein Budget ist nur so gut wie seine Preistabelle

#### Was passiert ist

Als ich alles zum ersten Mal verbunden hatte, kannte das Gateway in seiner festgelegten Version die Preise der Modelle nicht, die ich nutzte. Jeder Aufruf wäre mit $0 erfasst worden, und kein Budget hätte je etwas gestoppt.

#### Was ich geändert habe

Alle Preise stehen jetzt in der Konfiguration, von Hand von den Seiten der Anbieter übernommen, und die Preisliste von LiteLLM ist ausgeschaltet.

#### Ergebnis

Die Budgets stützen sich auf Preise, die ich selbst festlege, und diese werden bei jedem Upgrade erneut geprüft.
