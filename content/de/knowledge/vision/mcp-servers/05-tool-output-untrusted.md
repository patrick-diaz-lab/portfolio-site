---
id: tool-output-untrusted
kind: decision
---

### Werkzeugausgaben sind nicht vertrauenswürdig

Jedes Ergebnis erreicht das Modell in einem festen Block, der als nicht vertrauenswürdige Daten markiert ist, und ein Lauf, der nicht vertrauenswürdige Inhalte gelesen hat, bekommt keine schreibenden Werkzeuge. Eine Notiz, die ein Lauf geschrieben hat, der eines meiner Dokumente gelesen hat, wird als belastet markiert, und diese Markierung kommt aus dem Laufprotokoll, nie vom Modell. Meine Notizen können beim Öffnen keine externen Bilder laden, sodass eine eingeschleuste Anweisung damit keine Daten nach aussen schicken kann.
