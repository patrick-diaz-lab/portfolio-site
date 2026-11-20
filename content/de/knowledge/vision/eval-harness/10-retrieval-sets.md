---
id: retrieval-sets
kind: testing
---

### Retrieval über Docs und Notizen

Das Retrieval wird als hit@5 gewertet: Das richtige Dokument ist unter den ersten fünf Treffern. Auf meinem Held-out-Set mit 16 Fragen gelang das dem Docs-Retrieval bei 14. Als der Korpus wuchs, fiel es auf 12 von 16; eine Korrektur am Ranking holte das Dev-Set zurück, während das Held-out-Set bei 12 von 16 blieb. Auf meinem Notizen-Set schnitt die Suche über Chunks besser ab als die Suche über Notizen nach Titel und Zusammenfassung. Agenten suchen deshalb zuerst in Chunks und nutzen die Notiz-Suche für den Überblick.
