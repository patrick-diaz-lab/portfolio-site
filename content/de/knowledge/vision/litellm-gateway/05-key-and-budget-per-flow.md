---
id: key-and-budget-per-flow
kind: decision
---

### Ein Schlüssel und ein Budget pro Ablauf, unter einem Gesamtlimit

Der Chat-Agent, der Eval-Harness und der Indexer bekommen je einen eigenen virtuellen Schlüssel, ein 30-Tage-Budget und nur die Rollen, die sie brauchen. Über allen liegt ein Gesamtlimit.

Das Limit muss einen Versatz im Kalender überstehen: LiteLLM setzt Budgets am 1. zurück, während der Abrechnungszyklus meines Anbieters an einem anderen Tag beginnt, sodass ein Zyklus zwei volle LiteLLM-Budgets sehen kann. Gegen mein monatliches API-Guthaben setzte ich das Limit zuerst auf $45, damit selbst der doppelte schlimmste Fall von $90 darin blieb. Seit dem 2026-11-05 ist ein Ausgabenlimit von $30 pro Monat beim Anbieter die harte Grenze, und seit dem 2026-11-06 liegt das Gesamtlimit bei $24, die Budgets der Schlüssel ergeben zusammen $22.
