---
id: retrieval-by-corpus
kind: testing
---

### Retrieval auf drei Arten von Material

Jeder Korpus hat ein Dev-Set und ein Held-out-Set mit meinen eigenen Fragen. Für die Docs des Projekts begann hit@5 bei 0.967 auf Dev und 0.875 held-out. Als der Korpus wuchs, fiel es auf 0.933 und 0.75; eine Korrektur am Ranking brachte Dev zurück auf 1.0, während das Held-out-Set bei 0.75 blieb. Für meine Notizen stieg die Suche über Chunks mit derselben Korrektur von 0.81 auf 1.0 auf Dev und von 0.91 auf 0.95 held-out, die Suche über ganze Notizen nach Titel und Zusammenfassung von 0.88 auf 1.0 und von 0.59 auf 0.68. Die Test-PDFs erreichten auf beiden 1.0.
