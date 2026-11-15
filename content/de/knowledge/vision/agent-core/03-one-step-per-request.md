---
id: one-step-per-request
kind: decision
---

### Ein Schritt im Lauf pro Modellanfrage

Eine dünne HTTP-Schicht unter dem Agent-Framework macht aus jeder Anfrage an das Gateway einen Schritt des aktuellen Laufs, nummeriert und mit dem Lauf verknüpft. Sie erfasst Tokens und Kosten, prüft vor jeder Anfrage den Kill-Switch und lehnt jede Anfrage ausserhalb eines Laufs ab. Von sich aus wiederholt sie nie etwas: Das tut schon das Gateway, und Wiederholungen auf Wiederholungen vervielfachen, was ein fehlschlagender Aufruf kostet.
