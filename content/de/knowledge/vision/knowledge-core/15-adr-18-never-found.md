---
id: adr-18-never-found
kind: learning
---

### «ADR 18» wurde nie gefunden

#### Was passiert ist

Meine Entscheidungsprotokolle tragen vierstellige Nummern im Titel. Neue Dev-Fälle fragten nach «ADR 18» und «ADR 11», und die Baseline scheiterte an beiden: Keine Suche lieferte das richtige Protokoll, und eine geratene ID kam als nicht gefunden zurück. In einem früheren echten Lauf hatte das Modell die ID des richtigen Dokuments in der Hand und las es trotzdem nicht.

#### Was ich geändert habe

Die Leseregel sagt jetzt: einmal suchen, mit der Nummer so geschrieben, wie der Titel sie schreibt, die Überschriften lesen, dann den Text lesen.

#### Ergebnis

Das Agent-Eval fand in 23 von 23 Fällen mit benannten Dokumenten die richtige Quelle, und in allen 5 neuen wurde das Lesewerkzeug genutzt. Das Eval fand die Abweichung, bevor es ein Test auf dem Handy getan hätte.
