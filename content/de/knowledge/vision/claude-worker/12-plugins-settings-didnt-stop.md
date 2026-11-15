---
id: plugins-settings-didnt-stop
kind: learning
---

### Plugins, die die Einstellungen nicht aufhielten

#### Was passiert ist

Ein Probelauf der fixierten Werkzeugversion zeigte in ihrer Startmeldung zwei eingebaute Plugins, geladen trotz der Einstellungen, die sie fernhalten sollten, und eines davon hätte Anweisungsdateien aus den Ordnern rund um den Workspace gelesen. Als ich später Skills einschaltete, erschienen 15 mitgelieferte Skills neben meinen.

#### Was ich geändert habe

Beides ist jetzt ausdrücklich ausgeschaltet, und die Startprüfung verlangt genau das erwartete Plugin und die erwarteten Skills.

#### Ergebnis

Der Worker führt nur aus, was ich vorgesehen habe, und die Lehre blieb hängen: prüfen, was ein Werkzeug geladen hat, nicht, was man es laden liess.
