---
id: safe-content-first
kind: decision
---

### Den Weg an Inhalten beweisen, bei denen ein Fehler nichts kostet

Der erste Korpus waren die eigenen Docs des Projekts, die nichts Privates enthalten. Der ganze Weg, vom Indexer über den Speicher, den lesenden Server und das Gateway bis zum Client, lief darauf, bevor meine Notizen angeschlossen wurden. Der Indexer liest die geprüfte Kopie des Main-Branches, nie eine Arbeitskopie, sodass nur gemergter Text durchsuchbar wird, und das etwa eine Viertelstunde nach dem Merge.
