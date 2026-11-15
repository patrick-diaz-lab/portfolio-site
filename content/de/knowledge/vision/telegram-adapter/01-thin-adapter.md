---
id: thin-adapter
kind: decision
---

### Ein dünner Adapter

Der Adapter hat keinen Zugang zu Modellen, keine Datenbank und keine Laufprotokolle. Er gibt meine Nachrichten an den Agent-Core weiter und schickt die Antworten zurück; alles andere erledigt der Agent-Core, und er protokolliert jede Nachricht. Telegram später zu ersetzen heisst, nur diesen einen kleinen Dienst zu ersetzen.
