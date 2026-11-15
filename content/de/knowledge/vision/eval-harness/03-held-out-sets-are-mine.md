---
id: held-out-sets-are-mine
kind: decision
---

### Held-out-Sets gehören mir

Jede Art von Eval hat zwei Sets. Claude entwirft die Dev-Sets, ich prüfe sie wie Code, und Modelle dürfen sie sehen. Die Held-out-Sets gehören mir: Agenten können in ihrem Ordner nichts schreiben, verschieben oder löschen, und ein Held-out-Lauf gibt nur Summen aus und speichert nur Summen, ohne Fall-IDs, Texte oder Ausgaben pro Fall.

Der nächste Schritt geht weiter: Claude darf die Held-out-Sets weder lesen noch ausführen, und eine Baseline ändert sich nie im selben Pull Request wie die Änderung, die sie misst.
