---
id: safe-after-outage
kind: decision
---

### Sicheres Verhalten nach einem Ausfall

Nachrichten aus einem Chat werden nacheinander verarbeitet, damit das Gespräch in der Reihenfolge bleibt, während Befehle die Warteschlange überspringen, damit ein Stopp nicht hinter einem langsamen Start hängt. Eine Nachricht, die älter als 15 Minuten ist, wird gar nicht ausgeführt, auch kein Befehl; ich bekomme einen Hinweis, dass sie ankam, während der Bot offline war, und erneut gesendet werden sollte. Ein Rückstau bezahlter Nachrichten läuft nach einem Ausfall nie unbemerkt ab.
