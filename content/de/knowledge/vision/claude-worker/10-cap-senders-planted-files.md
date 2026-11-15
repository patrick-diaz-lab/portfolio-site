---
id: cap-senders-planted-files
kind: testing
---

### Die Grenze, der Absender und Dateien, die nie gelesen werden

Die Tagesgrenze zählt auch gescheiterte Aufrufe, und jede Antwort zeigt den Stand des Tages. Nur signierte Nachrichten aus meinem privaten Chat erreichen den Worker; seit dem signierten Absender reichen die IDs in einer Anfrage allein nicht mehr. Anweisungs- und Konfigurationsdateien, die neben dem Workspace platziert wurden, werden in einem Test nie geladen.
