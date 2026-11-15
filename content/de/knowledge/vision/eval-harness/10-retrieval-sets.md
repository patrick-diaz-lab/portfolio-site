---
id: retrieval-sets
kind: testing
---

### Retrieval, auf drei Arten gemessen

Das Docs-Retrieval erreichte ein hit@5 von 0.967 auf dem Dev-Set und 0.875 auf meinem Held-out-Set mit 16 Fragen. Als der Korpus wuchs, fiel der Held-out-Wert auf 0.75; eine Korrektur am Ranking brachte Dev zurück auf 1.0, und kein Held-out-Set wurde schlechter. Das Files-Retrieval erreichte auf beiden Sets 1.0. Auf meinem Vault-Set kam die Suche über Chunks auf 0.909, die Suche über Notizen nach Titel und Zusammenfassung nur auf 0.591. Agenten suchen deshalb zuerst in Chunks und nutzen die Notiz-Suche für den Überblick.
