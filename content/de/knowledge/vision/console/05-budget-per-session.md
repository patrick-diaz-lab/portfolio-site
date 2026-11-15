---
id: budget-per-session
kind: decision
---

### Ein Budget für jede Session, gezählt vom Agent-Core

Jede Session hat ihr eigenes Budget, von $0.10 bis $2, in Schritten von $1 erhöht über einen Knopf, den nur ich drücken kann. Eine Tagesgrenze von $2 gilt für Konsole und Chat zusammen, und höchstens 3 Läufe arbeiten gleichzeitig. Der Agent-Core prüft das Budget vor jedem Modellaufruf, sodass ein gesenktes Budget einen laufenden Lauf beim nächsten Aufruf stoppt. Das Gesamtlimit des Gateways bleibt hinter allem bestehen.
