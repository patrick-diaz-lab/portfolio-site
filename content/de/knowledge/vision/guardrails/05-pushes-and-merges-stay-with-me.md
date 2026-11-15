---
id: pushes-and-merges-stay-with-me
kind: decision
---

### Pushes und Merges bleiben bei mir

Claude darf nur auf den Branch des Items pushen, an dem es gerade arbeitet. Die Prüfung vor dem Befehl achtet darauf, eine zweite Prüfung sieht sich noch einmal an, was tatsächlich gepusht wird, und ein Secret-Scanner läuft bei jedem Commit und jedem Push. Claude eröffnet Pull Requests; ich reviewe sie und merge sie selbst.
