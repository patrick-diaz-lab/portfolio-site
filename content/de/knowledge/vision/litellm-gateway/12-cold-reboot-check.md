---
id: cold-reboot-check
kind: testing
---

### Eine Korrektur zählt erst nach einem Kaltstart

Für das Startproblem unten prüft ein Skript die Namensauflösung in jedem Container. Die Korrektur galt erst nach einem Kaltstart ohne manuelle Neustarts als angenommen, weil ein warmer Neustart das Problem zuvor verdeckt hatte.
