---
id: least-privilege-in-credential
kind: decision
---

### Minimale Rechte in den Zugangsdaten, nicht im Code

Jede Schicht hat nur die Rechte, die sie braucht, sodass ein Fehler im Code darüber nicht mehr anrichten kann. Der files-Server sieht nie einen Ordner; er liest Sichten auf Inhalte, die indexiert und nicht privat sind, und hat so keinen Pfad, den er falsch setzen könnte. Die Schlüssel meines Medienservers zu Hause verlassen diese Maschine nie: Ein kleiner Dienst dort beantwortet eine einzige lesende Frage, aus einer festen Liste von Feldern, und heraus kommen nur Zahlen und Zustände. Der Status meines Virtualisierungs-Hosts kommt über ein Token, das Status lesen kann und sonst nichts, der Container-Status über einen Filter, der die Liste beantwortet und nicht mehr. Das eine schreibende Werkzeug kann nur eine neue Notiz in die Inbox der Agenten legen, und den Namen wählt der Server.
