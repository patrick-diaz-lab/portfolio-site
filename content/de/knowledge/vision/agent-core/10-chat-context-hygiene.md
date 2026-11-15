---
id: chat-context-hygiene
kind: decision
---

### Einen endlosen Chat ehrlich halten

Mein Telegram-Chat endet nie, also verhindern drei Dinge, dass alte Nachrichten neue Antworten lenken. Nur Züge aus den letzten 6 Stunden zählen als Kontext. Eine Regel im Prompt sagt, dass frühere Nachrichten Kontext sind, nie eine Quelle. Und Code, nicht das Modell, entscheidet über die Antwortsprache: Er zählt häufige deutsche, englische und spanische Wörter in der Frage und hängt das Ergebnis als allerletzte Anweisung an.
