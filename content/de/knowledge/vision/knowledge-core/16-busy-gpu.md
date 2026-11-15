---
id: busy-gpu
kind: learning
---

### Eine beschäftigte GPU liess die Suche scheitern

#### Was passiert ist

Der GPU-PC hält jeweils ein Modell. Einmal dauerte ein Kaltstart des Chat-Klassifikators über zwei Minuten, und zwei Such-Embeddings warteten dahinter, bis das Gateway aufgab. Meine Health-Prüfung antwortete während des Ladens schnell und sah deshalb nichts Falsches.

#### Was ich geändert habe

Ein Embedding für eine Suchanfrage versucht jetzt 10 Sekunden lang die GPU, dann die CPU mit demselben Modell, dann nur Keywords.

#### Ergebnis

Jeder Versuch ist ein eigener Schritt im Laufprotokoll, sodass ich sehe, welcher Weg eine Suche bedient hat.
