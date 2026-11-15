---
id: isolated-by-layers
kind: decision
---

### Durch Schichten abgeschirmt

Der Worker sitzt in seinem eigenen Netz, ohne Weg zur Datenbank, zu den Modell-Endpunkten des Gateways, in mein Heimnetz oder ins Internet. Ein filternder Proxy ist sein einziger Weg nach aussen, und er lässt nur die API des Anbieters und den Tool-Endpunkt des Gateways durch. Jeder Aufruf beginnt in einem frischen, leeren Workspace, der danach gelöscht wird, ohne mitgebrachte Projektdateien oder Einstellungen und ohne aufbewahrte Session. Seine einzige Anmeldung ist die des Abos, und er startet nicht, wenn irgendein anderer Weg zu einem Modell vorhanden ist. Seine Werkzeuge sind dieselben lesenden Wissens-, Datei- und Homelab-Werkzeuge wie bei smart, unter denselben Regeln: höchstens 6 Aufrufe, jedes Ergebnis als nicht vertrauenswürdige Daten markiert, und alles, was Code ausführt, Dateien schreibt oder aus dem Web lädt, wird von vornherein abgelehnt.
