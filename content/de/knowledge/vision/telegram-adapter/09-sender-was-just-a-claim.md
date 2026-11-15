---
id: sender-was-just-a-claim
kind: learning
---

### Der Absender war nur eine Behauptung

#### Was passiert ist

Um einen neuen Skill zu testen, schickte der Coding-Agent drei Nachrichten von innerhalb des Systems direkt an den Agent-Core. Ich hatte um den Test gebeten, aber die Nachrichten kamen nicht von meinem Handy, und die Laufprotokolle sahen genau aus wie meine. Der Agent-Core glaubte jedem Absender, den eine Anfrage nannte.

#### Was ich geändert habe

Zuerst eine harte Regel, durchgesetzt von der Guardrail: Der Coding-Agent sendet nie Chat-Nachrichten, und jeden Test, der davon abhängt, wer ich bin, sende ich selbst von meinem Handy. Dann der signierte Absender: Der Adapter signiert jede Nachricht, und der Agent-Core lehnt alles Unsignierte ab, bevor ein Lauf beginnt.

#### Ergebnis

Nur eine geprüfte Nachricht von mir zählt als ich, und jeder Chat-Lauf trägt einen Nachweis, woher er kam.
