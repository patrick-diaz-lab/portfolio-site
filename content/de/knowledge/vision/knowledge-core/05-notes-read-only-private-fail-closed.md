---
id: notes-read-only-private-fail-closed
kind: decision
---

### Meine Notizen sind nur lesbar, und bei privaten gilt: im Zweifel gesperrt

Meine Notizen erreichen den Server über ein Sync-Werkzeug, in einem Modus, in dem nichts, was auf dem Server geändert wird, je an meine Geräte zurückgeschickt wird, und jeder andere Dienst sieht sie nur lesend. Mein privater Ordner wird nie mit dem Server geteilt, sodass der Server nicht einmal erfährt, dass eine private Datei existiert. Eine als privat markierte Notiz oder eine, deren Kopf sich nicht lesen lässt, wird nur als ID und Hash gespeichert: kein Titel, kein Text, keine Links. Agenten können nur in ihren eigenen Inbox-Ordner schreiben, und nur, indem sie über ein schmales Werkzeug neue Notizen anlegen.
