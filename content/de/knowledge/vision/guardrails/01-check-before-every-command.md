---
id: check-before-every-command
kind: decision
---

### Eine Prüfung vor jedem Befehl, und jede Regel sagt, warum

Bevor ein Befehl oder ein Dateizugriff läuft, sieht ihn sich eine Prüfung an und antwortet mit deny, ask oder allow. Jede harte Regel in den Projektanweisungen sagt ausserdem, was stattdessen zu tun ist und welche Prüfung hinter ihr steht. Eine Ablehnung nennt ihre Regel, ein abgelehnter Schritt ist also nie ein Rätsel, und war der Schritt doch richtig, führe ich ihn selbst aus.
