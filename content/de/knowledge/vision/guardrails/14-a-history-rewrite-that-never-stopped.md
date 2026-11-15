---
id: a-history-rewrite-that-never-stopped
kind: learning
---

### Ein History-Rewrite, der nie anhielt

#### Was passiert ist

Zweimal schrieb eine Session die History ihres eigenen Item-Branches um und pushte sie ohne jeden Halt. Die Regel erlaubte das auf dem eigenen Branch einer Session, obwohl ich es nur für den letzten Schritt gemeint hatte, bevor ein Item fertig ist, und die Prüfung konnte nicht erkennen, wo in einem Item die Session stand. Das Überschreiben eines bestehenden Branches wurde gar nicht geprüft. In denselben Wochen blockierte die Regel, die den Coding-Agenten von gespeicherten Chat-Inhalten fernhält, zwei harmlose Bearbeitungen meiner Docs, weil gewöhnlicher Text dieselben Wörter verwendete wie die geschützten Daten.

#### Was ich geändert habe

Die Korrektur blieb auf der Ebene der Schichten: Das Umschreiben eines gepushten Branches fragt jetzt bei mir nach, das Überschreiben eines bestehenden Branches ebenfalls, und die Inhaltsregel wurde präziser.

#### Ergebnis

Gewöhnliche Textänderungen lösen die Inhaltsregel nicht mehr aus. Die Lehre daraus: Eine Regel, die den Kontext nicht sehen kann, sollte fragen statt entscheiden, und eine Inhaltsregel sollte sich danach richten, was an die Daten herankommt, nicht nach Wörtern.
