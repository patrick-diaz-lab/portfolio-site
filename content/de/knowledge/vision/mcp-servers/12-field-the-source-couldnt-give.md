---
id: field-the-source-couldnt-give
kind: learning
---

### Ein Vertragsfeld, das die Quelle nicht liefern konnte

#### Was passiert ist

Der Homelab-Vertrag versprach pro Container ein Detail mehr, als der gefilterte Status liefern kann.

#### Was ich geändert habe

Statt den Filter zu erweitern, habe ich das Feld gestrichen und führe eine Liste der Container, die ich auf jedem Host erwarte.

#### Ergebnis

Ein fehlender oder gestoppter Container ist nur ein Befund, wenn er auf dieser Liste steht.
