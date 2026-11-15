---
id: a-bound-that-wasnt-there
kind: learning
---

### Eine Grenze, die es nicht gab

#### Was passiert ist

Ich wollte jeden Aufruf über eine Einstellung des Werkzeugs begrenzen, aber die fixierte Version bot sie nicht an.

#### Was ich geändert habe

Ich nutze nur, was die fixierte Version dokumentiert; also wurde die Grenze zu drei Dingen, die ich kontrolliere: dem Hook, der Werkzeugaufrufe zählt, der Prüfung des Streams und einem Timeout.

#### Ergebnis

Jeder Aufruf ist begrenzt, durch Schichten, die ich testen kann, nicht durch eine Einstellung, auf die ich gehofft hatte.
