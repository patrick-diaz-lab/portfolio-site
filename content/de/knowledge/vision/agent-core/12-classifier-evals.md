---
id: classifier-evals
kind: testing
---

### Der Klassifikator gegen ein Dev-Set und ein internes Testset

Der Eval-Harness führt den Klassifikator genau so aus, wie der Agent-Core ihn aufruft. Auf dem Dev-Set mit 40 Fällen ordnete das lokale Modell 38 richtig ein: Keine einfache Nachricht ging hoch an `smart`, zwei komplexe gingen hinunter an `cheap`. Auf einem internen Testset mit 27 Fällen ordnete es alle 27 richtig ein, `cheap` 26. Dieses Set wurde von Claude entworfen und von mir geprüft, und seine Ergebnisse werden nur als Summen aufbewahrt.
