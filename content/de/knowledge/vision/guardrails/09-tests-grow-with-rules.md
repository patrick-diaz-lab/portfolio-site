---
id: tests-grow-with-rules
kind: testing
---

### Jede Regel hat Tests, und ein neuer Test muss zuerst scheitern

Die Prüfung hatte zu Beginn 106 Unit-Tests und hat heute 1412, mit jeder Regel mehr. Ein neues Deny zählt erst, wenn sein Test gegen die vorherige Version der Prüfung fehlschlägt. Das beweist, dass der Test erfasst, wofür die Regel da ist.
