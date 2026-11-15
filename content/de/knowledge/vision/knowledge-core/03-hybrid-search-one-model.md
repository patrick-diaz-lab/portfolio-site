---
id: hybrid-search-one-model
kind: decision
---

### Hybride Suche und ein Embedding-Modell überall

Jede Suche führt ein Vektor- und ein Keyword-Ranking aus und vereint die beiden per Reciprocal Rank Fusion. Dokumente werden nach Überschriften in Chunks von 500 bis 800 Tokens geteilt. Überall wird ein einziges Embedding-Modell verwendet, und jeder Chunk hält die genaue Modellversion fest, die ihn eingebettet hat. Der GPU-PC bettet zuerst ein; eine CPU-Instanz übernimmt nur, wenn sie genau dieselbe Version ausführt. Sonst wartet die Arbeit in einer Warteschlange, und die Suche fällt auf Keywords zurück und sagt das.
