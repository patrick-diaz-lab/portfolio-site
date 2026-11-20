---
id: own-servers-behind-gateway
kind: decision
---

### Zuerst eigene Server, alle hinter dem Gateway

Keiner der Server hat einen veröffentlichten Port. Clients erreichen sie nur über das Gateway, das auch jeden Modellaufruf trägt, sodass Berechtigungen und Logs an einem Ort liegen. Jeder Client-Schlüssel listet die Server und Werkzeuge auf, die er nutzen darf, und ein Werkzeug, das mit einem Upgrade dazukommt, ist nicht von selbst freigeschaltet. Öffentliche Server kommen vielleicht später, unter festgeschriebenen Regeln: festgelegte Versionen, eine Prüfung des Quellcodes vor der Übernahme und bei jedem Upgrade, und nichts Gehostetes für irgendetwas Privates.
