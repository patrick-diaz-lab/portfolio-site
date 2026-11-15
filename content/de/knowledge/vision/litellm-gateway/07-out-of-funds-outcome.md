---
id: out-of-funds-outcome
kind: decision
---

### Kein Geld mehr ist ein eigenes Ergebnis

Aufgebrauchtes Guthaben beim Anbieter und ein überschrittenes LiteLLM-Budget sehen im Chat gleich aus, haben aber verschiedene Lösungen. Der Agent-Core unterscheidet sie: Der Lauf scheitert mit einem benannten Grund, die Antwort sagt, was fehlt und was noch funktioniert, und der Status-Befehl zeigt es weiter an, bis ein Aufruf wieder gelingt. Nichts wird wiederholt, und kein Anbieter wird gewechselt. `local` antwortet weiter, weil es nicht aus dem Guthaben bezahlt wird.
