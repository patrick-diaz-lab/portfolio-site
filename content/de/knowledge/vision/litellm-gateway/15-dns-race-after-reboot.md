---
id: dns-race-after-reboot
kind: learning
---

### Nach einem Neustart scheiterte jeder Chat

#### Was passiert ist

Eines Morgens kam keine Nachricht durch: Das Gateway konnte die Adresse des Anbieters nicht auflösen. Docker gibt jedem Container beim Start seine Nameserver mit, und beim Hochfahren starteten einige Container, bevor der Host seine eigenen Einstellungen hatte, und bekamen keine.

#### Was ich geändert habe

Ein Neustart behob es bis zum nächsten Hochfahren, und eine andere Reihenfolge der Dienste hätte das Rennen nur seltener gemacht. Docker nutzt jetzt feste vorgelagerte Nameserver.

#### Ergebnis

Ein Prüfskript testet die Namensauflösung in jedem Container, und die Korrektur zählte erst nach einem Kaltstart ohne manuelle Neustarts.
