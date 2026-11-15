---
id: tests-that-missed-the-change
kind: learning
---

### Tests, die die Änderung nicht testeten

#### Was passiert ist

Der erste Build mit Streaming bestand alle seine Browser-Tests, aber diese liefen auf dem Demo-Build mit aufgezeichneten Daten, der den Live-Weg nie berührt. Mein Review hat das bemerkt.

#### Was ich geändert habe

Ein zweiter Testmodus führt jetzt den echten Build gegen geskriptete Live-Ereignisse aus.

#### Ergebnis

Drei absichtliche Brüche im Streaming-Code lassen ihn jeweils scheitern. Ein Test beweist nur dann etwas, wenn ihn das Kaputtmachen der Sache auch kaputtmacht.
