---
id: refused-is-not-failed
kind: decision
---

### Verweigert ist nicht gescheitert

Ein Lauf, den der Kill-Switch oder das Budget einer Session gestoppt hat, endet als abgebrochen, mit dem Grund, nicht als gescheitert, und ein abgeschalteter Ablauf schreibt gar keinen Lauf. Die wöchentlichen Fehlerzahlen zeigen dann nur echte Fehler. Eine Anfrage von einem nicht verifizierten Absender ist die Ausnahme: Sie wird als gescheitert erfasst, mit dem Grund.
