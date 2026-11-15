---
id: stopwords
kind: learning
---

### Die Keyword-Suche verlor gegen Stoppwörter

#### Was passiert ist

Als der Korpus wuchs, fiel Docs-hit@5 von 0.967 auf 0.933. Die Scores pro Chunk zeigten den Grund: Die richtigen Dokumente lagen bei den Vektoren auf Platz eins bis drei, bei den Keywords aber so weit unten, dass sie aus den Kandidaten fielen. Die Keyword-Anfrage verband jedes Wort mit OR, auch «why», «the» und «to», sodass lange Chunks gewannen, und sie zerlegte Namen, die der Index ganz behält, sodass diese nie passten.

#### Was ich geändert habe

Ich hatte vermutet, dass Dokumente mit vielen Chunks kurze verdrängen, aber in einer Simulation machte eine Obergrenze pro Dokument die Ergebnisse 7 bis 37 Punkte schlechter. Die Korrektur nutzt den eigenen Parser des Index und lässt englische, deutsche und spanische Stoppwörter weg.

#### Ergebnis

Dev-hit@5 ging zurück auf 1.0, und kein Held-out-Set wurde schlechter.
