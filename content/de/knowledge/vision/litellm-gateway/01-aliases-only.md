---
id: aliases-only
kind: decision
---

### Ein Gateway, Aliase statt Modellnamen

Ein Dienst fragt das Gateway nach `smart`, `cheap`, `local` oder `embed`, nie nach dem Modell eines Anbieters. Eine Konfigurationsdatei ordnet jedem Alias genau ein Modell zu. Den Anbieter zu wechseln heisst, diese Datei zu ändern; kein Dienst ändert sich, und kein Dienst braucht einen eigenen Schlüssel.
