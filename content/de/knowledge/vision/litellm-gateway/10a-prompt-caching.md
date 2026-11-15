---
id: prompt-caching
kind: decision
---

### Prompt-Caching auf dem stabilen Teil jeder Anfrage

Für `smart` und `cheap` markiert jede Anfrage ihren stabilen Anfang, die Anweisungen und Werkzeugdefinitionen, und ihr wachsendes Ende. Jeder Aufruf in einer Werkzeugschleife liest dann den Prompt des vorherigen Aufrufs aus dem Cache des Anbieters, statt ihn noch einmal zu bezahlen. Lese- und Schreibzugriffe auf den Cache werden pro Schritt erfasst, und die Kosten jedes gecachten Schritts entsprachen seinen Tokens mal den Cache-Preisen, die ich in der Konfiguration festgelegt habe.
