---
id: spend-log-match
kind: testing
---

### Abgeglichen mit dem eigenen Log des Gateways

Modellschritte passen zum Kostenlog des Gateways: Tokens genau, Kosten innerhalb der Rundung der gespeicherten Genauigkeit. Nachdem die Antworten gestreamt wurden, stimmten alle 158 bezahlten Schritte auf ein Tausendstel Cent überein; ein Eval-Schritt lag genau so viel daneben, weil die Kosten des Streams knapp über einer Rundungsgrenze lagen. Mit Prompt-Caching zeigen die Protokolle Lese- und Schreibzugriffe auf den Cache pro Schritt, und der Anteil der Cache-Lesezugriffe wurde zu einer Eval-Metrik, sodass alles, was den Cache still kaputtmacht, als fallende Zahl sichtbar wird.
