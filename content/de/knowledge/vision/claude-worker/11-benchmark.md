---
id: benchmark
kind: testing
---

### Dasselbe Rezept gegen den eigenen Harness von Vision

Auf 46 lesenden Fällen, je zweimal ausgeführt, beide über die API und das Gateway und mit demselben Modell, lösten das Rezept von Claude Code und der eigene Harness von Vision je 92 von 92. Claude Code kostete $0.0235 pro gelöstem Fall, Vision $0.0131. Der Unterschied kam vom grösseren Prompt von Claude Code, etwa 7'000 Tokens mehr pro gelöstem Fall, und seinem kleineren Anteil an Cache-Lesezugriffen. Ohne Qualitätsunterschied auf diesen Fällen gab es noch nichts zu übernehmen.
