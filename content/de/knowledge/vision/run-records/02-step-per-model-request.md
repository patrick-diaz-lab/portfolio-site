---
id: step-per-model-request
kind: decision
---

### Ein Schritt pro Modellanfrage, so markiert, dass er zum Log des Gateways passt

Jede Anfrage an das Gateway ist ein Schritt, markiert mit Lauf- und Schrittnummer. Meine Protokolle und das Kostenlog des Gateways passen dann genau zusammen, selbst in einer Werkzeugschleife, in der eine Nachricht mehrere Modellaufrufe macht. Ein Schritt erfasst seine Tokens, seine Prompt-Cache-Tokens und seine Kosten. Die Schritte des Subscription-Workers halten die Kosten, die sein Werkzeug meldet, in einer eigenen Spalte fest, damit sie nie als API-Ausgaben zählen.
