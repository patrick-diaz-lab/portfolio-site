---
id: smart-default-worker-command
kind: decision
---

### Das starke Modell ist der Standard, der Worker ein Befehl

Mein erster Entwurf schickte jede komplexe Nachricht an den Worker. Sobald ich vorausbezahltes API-Guthaben hatte, drehte ich das um: Komplexe Nachrichten gehen über das Gateway an smart, das starke Modell, wo Budgets, Chat-Verlauf und Evals gelten. Der Worker beantwortet nur einen Befehl, den ich in meinem privaten Chat tippe. Er bekommt die Nachricht als Aufgabe, ohne Chat-Verlauf, und macht höchstens 30 Aufrufe pro Tag. Ist er aus, an seiner Grenze, in einer Abkühlpause oder scheitert er, antwortet smart, und die Antwort sagt das.
