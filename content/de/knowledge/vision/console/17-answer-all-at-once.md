---
id: answer-all-at-once
kind: learning
---

### Eine lange Antwort kam trotzdem auf einmal

Nach dem Deployment des Streamings erschien eine lange Antwort trotzdem in einem Stück. Ich mass Schicht für Schicht: Agent-Core und Konsole gaben Text beide weiter, sobald er kam. Das eigene Protokoll des Gateways zeigte 870 Tokens, die 1.18 Sekunden nach dem ersten ankamen, viel schneller, als ein Modell schreibt. Sobald ein Werkzeugergebnis im Gespräch ist, erreicht der Stream den Agent-Core in einem Stück; ohne eines streamt er normal. Ich habe das als bekannte Einschränkung akzeptiert und festgehalten.
