---
id: a-metric-that-couldnt-see
kind: learning
---

### Eine Metrik, die das Problem nicht sehen konnte

#### Was passiert ist

Meine Metrik «richtige Quelle» galt immer dann als bestanden, wenn das erwartete Dokument aus irgendeinem Werkzeug zurückkam. In einem echten Lauf fand das Modell das Dokument, das ich genannt hatte, las es nie und antwortete aus Suchausschnitten, und die Metrik hätte auch das als bestanden gewertet.

#### Was ich geändert habe

Quellenfälle können jetzt auch die Werkzeuge nennen, die aufgerufen werden müssen, und die Zusammenfassung zeigt, wie oft das zutraf.

#### Ergebnis

Die neuen Fälle deckten sofort ein zweites Problem auf, in der Suche des Wissenskerns: Ein Dokument, das ich mit seiner Kurznummer nannte, wurde überhaupt nie gefunden.
