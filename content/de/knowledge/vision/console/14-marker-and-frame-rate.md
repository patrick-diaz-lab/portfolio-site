---
id: marker-and-frame-rate
kind: testing
---

### Nichts sickert in Live-Ereignisse, und der Trace bleibt flüssig

Eine Markierung in Ein- und Ausgabe eines Schritts erreicht nie ein Live-Ereignis; sie kommt nur zurück, wenn dieser Schritt bewusst geöffnet wird. Die Trace-Ansicht hält bei einem Lauf mit 60 Schritten 58 bis 60 Bilder pro Sekunde, und ihr Test verlangt mindestens 55.
