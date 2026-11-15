---
id: every-message-signed
kind: decision
---

### Jede Nachricht signiert, unsignierte abgelehnt

Der Adapter signiert jede Nachricht, die er weitergibt, auch Befehle, mit einem Schlüssel, den nur er hat. Der Agent-Core prüft die Signatur gegen das, was er selbst weiss, nicht gegen das, was die Anfrage behauptet, und nur eine geprüfte Nachricht von mir in meinem privaten Chat zählt als ich. Alles, was keine frische, geprüfte Nachricht von mir ist, wird abgelehnt, bevor ein Lauf beginnt oder ein Modell aufgerufen wird. Die vertrauenswürdigen Schlüssel sind Teil der geprüften Konfiguration, sodass eine Änderung des Vertrauens im Review sichtbar wird, und mehrere können gleichzeitig gelten, damit ein neuer Schlüssel den alten überlappen kann. Jeder angenommene Lauf bekommt einen Herkunftsnachweis, den der Agent-Core nur ergänzen und lesen kann.
