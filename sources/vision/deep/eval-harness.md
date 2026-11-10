# Eval harness and held-out sets

Every prompt, model or tool change should come with a number before and after, measured on cases the thing being improved has never seen.

## Decisions

### 1. Measure the production code, not a copy

The classifier and the router live in agent-core, and the harness imports them unchanged. A test checks that the harness's classifier request is byte-identical to the one the router sends. The harness changes one setting: it skips the gateway's response cache, so every case reaches the model.

**Rejected:** a copy of the prompt inside the harness. It would drift, and I would end up measuring something I no longer run.

### 2. Held-out sets belong to me

Each eval kind has a dev set and a held-out set:

- **Dev sets:** Claude drafts them, I review them like code, and models may see them.
- **Held-out sets:** mine. Agents can't write, move or delete anything in their folder, and held-out runs print and store totals only: no case IDs, no texts, no per-case outputs.

The planned next step goes further: Claude may neither read nor run held-out sets, and a baseline never changes in the same PR as the change it measures.

**Rejected:** one shared set. A proposer that has seen the test can tune to it, and the published research on self-improving agents shows exactly that failure.

### 3. Code-checked metrics first

The metrics are checked by code: classifier accuracy with a confusion matrix, over- and under-routing, hit@5 and MRR for retrieval, "was the planted word in the answer", "did the answer invent numbers", "is the first and last paragraph in the question's language".

**Rejected:** an LLM judge as the default. That is a model grading a model, and its prompt becomes one more thing to tune.

### 4. Its own key, budget and stop rules

The harness runs on its own gateway key: $5 per 30 days and three aliases. It stops early when the run has spent $2, when the kill switch is on, when the funds are out, or after 5 failures in a row. It can't reach the subscription worker in three independent ways: no address or token for it, not on its network, and only gateway aliases accepted. Each eval run is one run record with its cost, and the record never holds case text.

**Rejected:** running evals on the chat key. Eval spend would then look like chat spend, and a bad loop could drain the chat budget.

### 5. Scoped fixture data, and a stop rule before tuning

Agent evals use a second server token that sees only repo docs, a seed vault with synthetic notes, and test PDFs, never my real notes. If a dev score is below 0.8, the build stops and reports to me before any tuning.

## Numbers

| Eval | Dev | Held-out |
|---|---|---|
| Classifier, `local` | 0.95 (38/40) | 0.95 (19/20); v2: 1.0 (27/27) |
| Classifier, `cheap` | 1.0 (40/40), $0.0023 | 1.0 (20/20); v2: 0.963 |
| Docs retrieval hit@5 | 0.967 | 0.875 (16 questions by me) |
| Vault retrieval hit@5, chunk search vs note search | — | 0.909 vs 0.591 |
| Files retrieval hit@5 | 1.0 | 1.0 |

With and without:

- **Note search vs chunk search:** note search sees only a title and a short summary. On my vault set, chunk search was 0.909 and note search 0.591, so agents search chunks first and use note search as an overview.
- **Injection rule:** before it, the planted word appeared in 1 of 2 answers. After it, 0 of 6, then 0 of 12.
- **Reply language:** a "red" run on the old prompt scored 0.8; after the fix, 1.0.
- **Homelab tools:** with tools, 1.0. Without them (a deliberate run), still 1.0 with 0 invented numbers: the model said it couldn't know instead of guessing.

A full agent eval with injection repeats costs $0.59–$1.50. The whole first harness item cost $0.004.

## What went wrong and how I fixed it

### Result files leaked note names

Before one merge, I noticed that a committed docs-retrieval result listed real paths of my vault notes. The docs set searches the full knowledge scope, and only the vault set's output was redacted. No note text leaked, but the names did, in files headed for a public repo. The fix: every retrieval set is redacted the same way, so any result outside the eval scope shows as `other`. A test covers it. I redacted the two affected result files in place and scanned all 23 result files: none had a result outside the scope.

### The first comparison run failed on every case

My first `cheap` run returned an error for all 40 cases: the provider rejects `temperature` for these models. I decided to leave `temperature` out for `cheap` and `smart` in the harness only. Each result file records that override, and the output says so. The local runs stay identical to production.

### A test that failed the right answer

One homelab case had a list of phrases that count as a false all-clear. One of them was "all 7", and the correct answer contained it, because seven containers really were running. The case failed the right answer. I cut the list down to real all-clear phrases, and the rerun passed. Lesson: test the test, especially word lists.

### Held-out that wasn't independent

To save time, I let Claude draft my first held-out classifier set, with different topics and shapes from the dev set. I reviewed it and copied it in myself. That still made it less independent than it should be. For the retrieval sets I wrote the questions myself, from a list of file names and headings alone, never from the builder's cases.
