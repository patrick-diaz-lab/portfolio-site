---
id: first-phone-test-failed
kind: learning
---

### Der erste Handy-Test nach der Trace-Arbeit scheiterte

#### Was passiert ist

Meine erste Nachricht, nachdem die Trace-Speicherung live ging, scheiterte. Der GPU-PC hatte den Klassifikator kalt geladen, zwei Suchabfragen warteten dahinter, und zwei Timeouts auf dem Weg lagen beide bei 60 Sekunden. Der Timeout traf einen Aufräumschritt, nachdem das starke Modell schon geantwortet hatte, und liess den ganzen Lauf scheitern.

#### Was ich geändert habe

Der Agent-Core wartet jetzt länger als das Gateway, ein gescheitertes Aufräumen nach einer Antwort lässt nur diesen Schritt scheitern, und Trace-Einträge sind gegen Abbruch geschützt.

#### Ergebnis

Die Trace-Arbeit war nicht die Ursache, aber die Suche danach fand und schloss einen echten eigenen Fehler: Ein abgebrochener Schritt konnte seinen Trace-Eintrag verlieren.
