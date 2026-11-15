---
id: own-key-and-stop-rules
kind: decision
---

### Eigene Schlüssel, eigenes Budget, feste Stoppregeln

Der Harness hat eigene Gateway-Schlüssel, einen für Klassifikator-Evals und einen für Agent-Evals, jeweils mit einem Budget über 30 Tage. Den Subscription-Worker erreicht er überhaupt nicht: Er hat keine Adresse dafür, ist nicht in dessen Netz, und das Gateway lässt für ihn nur seine eigenen Rollen zu. Ein Lauf stoppt vorzeitig, sobald er $2 ausgegeben hat, wenn der Kill-Switch aktiv ist, wenn das Geld aufgebraucht ist oder nach 5 Fehlern in Folge. Jeder Eval-Lauf ist ein Laufprotokoll mit seinen Kosten, und dieses Protokoll enthält nie Falltext.
