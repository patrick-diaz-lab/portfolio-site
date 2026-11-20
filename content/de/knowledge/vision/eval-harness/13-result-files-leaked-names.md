---
id: result-files-leaked-names
kind: learning
---

### Ergebnisdateien verrieten die Namen meiner Notizen

#### Was passiert ist

Vor einem Merge bemerkte ich, dass eine Ergebnisdatei des Docs-Retrievals die echten Pfade meiner Notizen auflistete. Das Docs-Set durchsucht den ganzen Wissensbereich, und geschwärzt worden war nur die Ausgabe des Notizen-Sets. Es gelangte kein Notiztext nach aussen, aber die Namen standen in Dateien, die zur Veröffentlichung bestimmt waren.

#### Was ich geändert habe

Jedes Retrieval-Set wird jetzt gleich geschwärzt: Jedes Ergebnis ausserhalb des Bereichs eines Evals erscheint als `other`, und ein Test hält das fest.

#### Ergebnis

Ich korrigierte die zwei betroffenen Dateien und prüfte alle 23 Ergebnisdateien; keine enthielt etwas von ausserhalb des Bereichs.
