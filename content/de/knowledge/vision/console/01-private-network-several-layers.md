---
id: private-network-several-layers
kind: decision
---

### Nur im privaten Netz, und mehrere Schichten dahinter

Die Konsole hat keinen offenen Port; sie ist nur in meinem privaten Netz erreichbar. Meine Identität bekommt sie vom Netz selbst, auf eine Weise, die ein lokaler Prozess nicht fälschen kann. Der Server der Konsole, nicht der Browser, signiert jede Anfrage, die er an den Agent-Core weitergibt, der nur signierten Absendern vertraut, und er nutzt eigene Zugangsdaten, getrennt von denen des Chats. Der Coding-Agent, der Vision baut, kann weder die Daten der Konsole noch ihren Nachrichten-Endpunkt nutzen. Das Bedrohungsmodell ist festgehalten: Der Zugang stützt sich darauf, dass meine eigenen Geräte gesperrt und aktuell sind, nicht auf die App.
