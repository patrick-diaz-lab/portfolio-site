---
id: classifier-evals
kind: testing
---

### Der Klassifikator gegen Dev- und Held-out-Sets

Der Eval-Harness führt den Klassifikator genau so aus, wie der Agent-Core ihn aufruft. Auf dem Dev-Set mit 40 Fällen ordnete das lokale Modell 38 richtig ein: Keine einfache Nachricht ging hoch an `smart`, zwei komplexe gingen hinunter an `cheap`. Auf dem Held-out-Set mit 27 Fällen ordnete es alle 27 richtig ein, `cheap` 26. Dieses Set wurde von Claude entworfen, von mir geprüft und gesperrt. Held-out-Fälle dienen nie zum Optimieren, und ihre Ergebnisse werden nur als Summen aufbewahrt.
