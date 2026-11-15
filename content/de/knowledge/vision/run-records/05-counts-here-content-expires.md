---
id: counts-here-content-expires
kind: decision
---

### Zahlen im Protokoll, Inhalte in einem Speicher, der verfällt

Die Laufprotokolle enthalten Namen, Zahlen, Kosten und Zeiten. Der volle Inhalt, also die Frage, Ein- und Ausgabe jedes Schritts und die Antwort, liegt in einem getrennten Trace-Store für die Konsole und wird 30 Tage nach dem Lauf gelöscht, ausser ich markiere ihn; ein markierter Lauf bleibt, bis ich ihn als erledigt kennzeichne. Die Frage im Lauf selbst wird nach denselben 30 Tagen geleert, und nur ein Hash davon bleibt, um die Herkunft von Anfragen zu prüfen. Fehlertext in einem Protokoll wird gekürzt, und der volle Fehler verfällt mit dem Trace. Werkzeugaufrufe und Eval-Läufe behalten den Namen und die Einstellungen des Werkzeugs, nie die Anfrage, weil die Anfrage in einem Eval eine Held-out-Frage ist.
