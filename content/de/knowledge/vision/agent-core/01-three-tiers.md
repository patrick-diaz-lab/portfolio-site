---
id: three-tiers
kind: decision
---

### Drei Stufen, die günstigste zuerst

Befehle wie Status, Kosten, Stopp und Fortsetzen laufen ohne Modell und kosten nichts. Alles andere geht an ein kleines lokales Modell auf meinem GPU-PC. Es liest die einzelne Nachricht ohne Verlauf und gibt bei Temperatur 0 als JSON ihre Absicht und ein Urteil zurück, einfach oder komplex. Einfache Nachrichten gehen an `cheap`, komplexe an `smart`.
