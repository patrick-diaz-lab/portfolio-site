---
id: aliases-only
kind: decision
---

### Ein Gateway, Rollen statt Modellnamen

Ein Dienst fragt das Gateway nach `smart`, `cheap`, `local` oder `embed`, nie nach dem Modell eines Anbieters. Eine Konfigurationsdatei ordnet jeder Rolle genau ein Modell zu. Den Anbieter zu wechseln heisst, diese Datei zu ändern; kein Dienst ändert sich, und kein Dienst braucht einen eigenen Schlüssel.
