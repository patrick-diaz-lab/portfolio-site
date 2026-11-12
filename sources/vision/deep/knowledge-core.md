# Knowledge core: index and retrieval

The knowledge core makes my project docs, my Obsidian notes and my PDFs searchable for the models, without any of them being able to change a note.

## Decisions

### 1. Prove the path on content that is safe to get wrong

The first corpus was the project's own docs, which hold nothing private. The whole path (indexer, vector store, read-only server, gateway, client) ran on it before my vault was connected. The indexer reads the reviewed copy of the main branch, never a working tree, so only merged text becomes searchable, within about 15 minutes of a merge.

**Rejected:** starting with the vault. A bug in the first version would have met my private notes first.

### 2. Hybrid search, one embedding model

Each search runs a vector ranking and a keyword ranking and fuses them by reciprocal rank. Documents are split by heading into chunks of 500–800 tokens. One embedding model (bge-m3) is used everywhere, and each chunk records the exact model version that embedded it. The GPU PC embeds first; a CPU instance takes over only when it runs exactly the same model version. Otherwise the indexer queues the work and search falls back to keywords, and says so.

**Rejected:** a different CPU model as the fallback. Vectors from two models can't be compared, so results would quietly get worse.

### 3. My notes are read-only, private notes fail closed

My vault reaches the server through a sync tool, in a mode where nothing changed on the server is ever sent back to my devices. Every service except the sync mounts the vault read-only. My private folder is never shared with the server at all, so the server doesn't even learn that a private file exists. A note marked private, or a note whose header can't be parsed, is stored as an ID and a hash only: no title, text or links. The only folder agents can write to is their own `AI/` folder, and only by creating new notes through one narrow tool.

**Rejected:** ignoring the private folder only on the server side. My devices would still announce the private file names to it.

### 4. No model in the indexer

Note summaries come from the note's own header or its first paragraph, not from a model. Links between documents are extracted by code, with the same patterns my doc checks use.

**Rejected:** summaries written by the local model. That would mean a model call per changed note, GPU load next to the chat classifier, and a first index that waits for the model. The vault eval shows whether model summaries are ever needed.

### 5. Read a named document instead of searching around it

When I name a document ("ADR 18", "the guardrails runbook") and want its content, the model searches once to find it, then reads it section by section with a read tool, instead of answering from search snippets.

**Rejected:** raising the limit of 6 tool calls per message to 8, which I had planned as the last resort. It would have raised the cost of every tool message, and the rule alone was enough.

## Numbers

| Retrieval eval | Dev | Held-out (my questions) |
|---|---|---|
| Docs, hit@5 at the first baseline | 0.967 | 0.875 |
| Docs, hit@5 as the corpus grew, before the ranking fix | 0.933 | 0.75 |
| Docs, hit@5 after the ranking fix | 1.0 (hit@1 0.50 → 0.70) | 0.75 (hit@1 0.50 → 0.63) |
| Vault, chunk search hit@5, before → after the fix | 0.81 → 1.0 | 0.91 → 0.95 |
| Vault, note search hit@5, before → after the fix | 0.88 → 1.0 | 0.59 → 0.68 |
| Files (test PDFs), hit@5 | 1.0 | 1.0 |

- The ranking fix cost $0: retrieval evals use only the local embedding model.
- A merged doc was searchable 14 min 47 s after the merge.
- Named-document questions after the reading rule: the right source in 23 of 23 cases, and the read tool used in all 5 new cases (agent eval on `smart`, $0.64 and $0.39 for the two halves).

## What went wrong and how I fixed it

### Keyword search lost to stopwords

As the corpus grew, docs hit@5 fell from 0.967 to 0.933. Chunk-level scores showed why: the answering documents were ranked first to third by vectors but far down by keywords, outside the candidates. The keyword query joined every word with OR, including "why", "the" and "to", so long chunks won. It also split hostnames and addresses that the index keeps whole, so those never matched. I had suspected that documents with many chunks crowd out short ones, but in simulation a per-document cap made things 7–37 points worse. The fix uses the index's own parser and removes English, German and Spanish stopwords. Dev hit@5 went back to 1.0, and no held-out set got worse.

### "ADR 18" was never found

My architecture decision records have four-digit numbers in their titles ("0018 — …"). The new dev cases asked for "ADR 18" and "ADR 11", and the baseline failed both: no search returned the right ADR, and a guessed ID came back "not found". In an earlier real run, the model had the right document's ID in hand and still didn't read it. The reading rule now says: search once for the document (with the zero-padded number for an ADR), read its headings, then read the text. The eval caught the number mismatch before my phone test would have.

### A busy GPU made search fail

The GPU PC loads one model at a time. Once, a cold load of the chat classifier took over two minutes, and two search embeddings waited behind it until the gateway's timeout. My health probe answered fast during the load, so it didn't notice. Query embeddings now try the GPU with a 10-second deadline, then the CPU with the same model, then keywords only. Each attempt is its own step in the run record, so the path that served a search is visible.

### One open limit

A very long document (one runbook is about 33,000 characters) can't be read whole within the 6 tool calls a message gets. I kept the limit at 6.
