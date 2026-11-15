---
id: a-memory-that-never-happened
kind: learning
---

### Eine Erinnerung, die es nie gab

#### Was passiert ist

In einem Test auf dem Handy behauptete eine Antwort, ich hätte schon einmal nach einem bestimmten Fehlercode gefragt. Hatte ich nicht: Eine fünf Tage alte Nachricht, noch unter den letzten 10 Zügen, begann mit denselben zwei Buchstaben in einem längeren Wort, und das Modell verband die beiden. Dieselbe Antwort begann und endete ausserdem auf Deutsch, obwohl ich auf Englisch gefragt hatte.

#### Was ich geändert habe

Daraus entstanden drei Regeln: Nur Züge aus den letzten 6 Stunden zählen als Kontext, frühere Nachrichten sind Kontext und nie eine Quelle, und Code, nicht das Modell, wählt die Antwortsprache.

#### Ergebnis

Ich habe zuerst das alte Verhalten gemessen, und die Sprache ging von 0.8 auf 1.0. Mein synthetischer Verlauf hat die falsche Erinnerung selbst nie nachgestellt; die Korrektur stützt sich also auf den echten Fall, und das sage ich auch so.
