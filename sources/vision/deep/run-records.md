# Run records

Every service that does work writes the same records: a run for each piece of work, with one step per model call, tool call or command. They answer what happened, what it cost and why it failed, without private content in logs.

## Decisions

### 1. One shared library, one contract

A small shared library opens a run, appends steps and closes it with totals. The chat agent, the indexer, the MCP servers, the eval harness and the cleanup jobs all use it, so one query answers "what ran yesterday and what did it cost" across everything. A tool call made through the gateway becomes a child run of the run that made it.

### 2. One step per model request, tagged so it joins the gateway's log

Each request to the gateway is one step, tagged with the run and the step number. My records and the gateway's spend log join exactly, also inside tool loops where one message makes several model calls. A step records tokens, prompt-cache tokens and cost. The subscription worker's steps keep the cost the CLI reports in a column of its own, so it never counts toward API spend.

**Rejected:** the gateway's spend log on its own. It can't see commands, tool calls, or which message caused a call.

### 3. Refused is not failed

A run blocked by the kill switch or a session budget closes as "cancelled" with the reason, not as "failed". A switched-off flow writes no run at all. The weekly failure counts then show real failures only. A request from an unverified sender is different: it is recorded as failed, with the reason.

### 4. Counts in the record, content in a separate store that expires

The run records hold names, counts, costs and timings. Full content (the question, each step's input and output, the answer) lives in a separate trace store for the console. It is deleted 30 days after the run, unless I flag the run. A flag keeps it until I mark it handled. The question text in the run itself is cleared after the same 30 days, and a hash of it stays for the origin audit. Error text in a record is cut to the exception type plus 200 characters. The full error lives in the trace and expires with it. MCP calls and eval runs store tool names and parameters, never the query text, because in an eval the query is a held-out question.

**Rejected:** keeping chat history with no expiry, which was the original plan.

### 5. The database enforces it, not the code

Each service writes with its own database role and only the grants it needs. The deletion runs through one fixed database function, which the chat agent can call but which gives it no other right to delete or change content. Roles that read records for the console or the evals can't see the question text at all.

## Numbers

- Model steps match the gateway's spend log: tokens exactly, cost within the rounding of the stored precision. After streaming went live, all 158 paid steps matched within $0.00001. One eval step was $0.00001 off, because the stream's floating-point cost sat just above a rounding midpoint.
- Prompt caching made the records show cache reads and writes per step. The cache read share became an eval metric, so a silent cache breaker shows up as a falling number.
- The expiry is tested with a fake clock: a 31-day-old run is purged, a flagged one kept, a handled one purged, other flows untouched.
- Database tests run against the real role grants on a test database. For example, a run's question text can't be changed after it is written.

## What went wrong and how I fixed it

### A cancelled step lost its row

When a classifier call was cancelled after its deadline, the cancellation also hit the cleanup's own database write, so the step's trace row was cut off mid-query. The diagnosis of an unrelated failure found it. Trace writes are now shielded from cancellation, and a failed trace write never fails the run; it is counted in the status command.

### My day ended at 1 a.m.

The worker's daily cap and "today" in the cost command counted days in UTC, on a database that runs in UTC. My day therefore ended at 1 a.m. local time (2 a.m. in summer). Both now count days in my time zone.
