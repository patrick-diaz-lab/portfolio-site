---
id: claude-spoke-as-me
kind: learning
---

### Claude sprach als ich

#### Was passiert ist

Um einen neuen Skill auszuprobieren, schickte Claude einmal von innerhalb des Systems Nachrichten an das Back-End meines Chats, auf meine Bitte, aber nicht von meinem Handy aus. In den Aufzeichnungen sahen sie genau so aus wie Nachrichten, die ich geschrieben hatte. Es ging nichts schief, aber es zeigte, dass sich etwas innerhalb des Systems als mich ausgeben konnte.

#### Was ich geändert habe

Daraus entstanden zwei Schichten: Claude handelt nie als mein Chat, und die Prüfung setzt das durch; und jeden Test, der davon abhängt, wer ich bin, sende ich selbst von meinem Handy, während Claude danach nur die Aufzeichnungen liest.

#### Ergebnis

Seither ist jede Chat-Nachricht signiert, und der Agent-Core lehnt alles Unsignierte ab, bevor ein Lauf beginnt.
