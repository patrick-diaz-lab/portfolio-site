---
id: classifier-evals
kind: testing
---

### Der Klassifikator gegen Dev- und Held-out-Sets

Der Eval-Harness führt den Klassifikator genau so aus, wie der Agent-Core ihn aufruft. Auf dem Dev-Set mit 40 Fällen erreichte das lokale Modell 0.95: Keine einfache Nachricht ging hoch an `smart`, zwei komplexe gingen hinunter an `cheap`. Auf meinem eigenen Held-out-Set mit 27 Fällen erreichte es 1.0, `cheap` 0.963. Held-out-Ergebnisse werden nur als Summen aufbewahrt.
