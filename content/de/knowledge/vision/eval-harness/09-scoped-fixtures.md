---
id: scoped-fixtures
kind: decision
---

### Nur Testdaten, und ein Stopp vor dem Optimieren

Agent-Evals nutzen ein zweites Server-Token, das nur die Docs des Repos sieht, einen Seed-Vault mit erfundenen Notizen und Test-PDFs, nie meine echten Notizen. Liegt ein Dev-Score unter 0.8, hält der Build an und meldet sich bei mir, bevor jemand mit dem Optimieren beginnt.
