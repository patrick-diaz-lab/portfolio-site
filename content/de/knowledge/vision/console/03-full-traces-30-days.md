---
id: full-traces-30-days
kind: decision
---

### Vollständige Traces, 30 Tage lang aufbewahrt

Jeder Schritt eines Chat-Laufs speichert, was hineinging und was herauskam: die Nachrichten, die ein Modell sah, die Argumente eines Werkzeugs und das Ergebnis genau so, wie das Modell es bekam. Erst das macht den Trace lesenswert. Traces und Chat-Verlauf werden 30 Tage nach dem Lauf gelöscht, ausser ich markiere ihn; ein markierter Lauf bleibt, bis ich ihn als erledigt kennzeichne, und verfällt dann wie jeder andere. Ein täglicher Job übernimmt das Löschen und schreibt dabei einen eigenen Lauf, und der Kopf der Konsole wird rot, wenn etwas älter als 31 Tage ist. Logs enthalten nur IDs, Namen und Zahlen, nie Inhalte, sodass sie den Ablauf nicht überdauern können.
