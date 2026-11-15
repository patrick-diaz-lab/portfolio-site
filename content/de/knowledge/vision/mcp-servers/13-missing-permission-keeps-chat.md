---
id: missing-permission-keeps-chat
kind: learning
---

### Eine fehlende Berechtigung soll den Chat nicht kaputtmachen

#### Was passiert ist

Eine meiner Nachrichten kam einen Moment, bevor der Schlüssel des Chats Werkzeuge nutzen durfte, und die Verbindung zum Werkzeug scheiterte.

#### Was ich geändert habe

Jeder Client ist so gebaut, dass eine Verweigerung zu einer Antwort ohne Werkzeuge führt, und der gescheiterte Schritt wird erfasst.

#### Ergebnis

Die Antwort kam trotzdem, von `smart` ohne Werkzeuge. Eine Berechtigung, die zu spät kam, kostete ein Werkzeug, nicht das Gespräch.
