---
id: key-and-budget-per-flow
kind: decision
---

### Ein Schlüssel und ein hartes Monatsbudget pro Ablauf, unter einem Gesamtlimit

Jeder Ablauf, also jeder Arbeitsablauf, der ein Modell aufruft, hat seinen eigenen virtuellen Schlüssel mit einem harten Monatsbudget (bei LiteLLM ein 30-Tage-Budget) und nur den Aliasen, die er braucht: der Chat-Agent, der Eval-Harness, der Indexer. Ein Ablauf, der sein Budget ausgegeben hat, wird gestoppt, und über allen liegt ein Gesamtlimit.

Das Limit muss einen Versatz im Kalender überstehen: LiteLLM setzt Budgets am 1. zurück, während der Abrechnungszyklus meines Anbieters an einem anderen Tag beginnt, sodass ein Zyklus zwei volle LiteLLM-Budgets sehen kann. Deshalb bleibt das Gesamtlimit unter dem Limit beim Anbieter: Seit dem 5. November 2026 ist dort ein Ausgabenlimit von $30 pro Monat die harte Grenze, und seit dem 6. November 2026 liegt das Gesamtlimit bei $24, die Budgets der Schlüssel ergeben zusammen $22.
