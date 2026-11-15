---
id: server-name-took-gateway-down
kind: learning
---

### Ein Servername legte das Gateway lahm

Als ich einen Eval-Bereich für den knowledge-Server hinzufügte, wollte das Gateway nicht mehr starten: Es akzeptiert keinen Bindestrich in einem Servernamen. Der Fehler war mit einem früheren Item hereingekommen und blieb unbemerkt, weil das Gateway damals nicht neu gestartet wurde. Jeder Chat fiel für ein paar Minuten aus. Die Lehre floss in mein Deployment ein: Eine Konfigurationsänderung gilt erst als getestet, wenn der Dienst damit neu gestartet ist.
