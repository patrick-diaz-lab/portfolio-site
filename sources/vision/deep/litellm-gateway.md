# LiteLLM gateway and budgets

Every language-model call in my home intelligence center goes through one self-hosted LiteLLM gateway.

## Decisions

### 1. One gateway, aliases only

Services never name a provider model. They ask for an alias: `smart`, `cheap`, `local`, `embed`. The gateway's config maps each alias to one concrete model, so switching providers is a one-file change, and no service needs a provider key.

**Rejected:** a provider SDK and key in each service. Every service would hold a key that spends money, with no shared budget.

### 2. Candidates and prices I control

The config lists candidate models per provider and tier with stable names. Each alias points at exactly one candidate. I pin the prices in the config myself, with a "last checked" date, and LiteLLM's downloaded price map is switched off. Prices are re-checked against the providers' pricing pages whenever the gateway is upgraded or a candidate changes.

The long-term rule: for each kind of task, an alias maps to the **cheapest candidate that passes that task's eval set**. Today the mapping only reflects which provider key I created first, and I wrote it down as provisional.

**Rejected:** trusting LiteLLM's own price map. The version I pinned had no entry for the newest models, and newer releases disagreed with each other.

### 3. One key and budget per flow, a global cap under my spend limit

Each flow (the chat agent, the eval harness, the indexer, later the research flow) gets its own virtual key with a 30-day budget and only the aliases it needs. A global cap sits above them.

My plan includes $100 of API credits per billing cycle, with no rollover and auto-reload off. LiteLLM resets a 30-day budget on the 1st of each month, but my billing cycle starts on a different day, so a single billing cycle can overlap two LiteLLM months. In the worst case LiteLLM allows twice the cap within one cycle. I set the global cap at $45: worst case $90, with $10 of margin. On 2026-11-06 I added a spend limit of $30 a month on the provider's side as the hard backstop, and lowered the global cap to $24 and the sum of the key budgets to $22.

**Rejected:** a cap of about $90 to match the credits. That works only if the two windows line up, which they don't.

### 4. Out of funds is its own outcome

Two failures look alike to a user but aren't: the provider credits are used up, or a LiteLLM budget is exceeded. agent-core recognises both. The run fails with a clear reason, the reply says what is used up and what still works, and the status command shows it until the next successful call. There is no retry and no fallback to another provider. With the credits gone, `local` keeps working because it isn't paid from them.

**Rejected:** a generic "Sorry, that failed", which hides a problem I can fix in a minute.

### 5. One documented exception: my subscription, for my own messages

A Claude Code worker runs on my Claude subscription, not on the API. After checking the terms, I limited it to requests I send myself with an explicit command. It never runs unattended, has a daily cap of 30 calls, starts each run in a clean workspace, and sits on a network that can reach only the provider's API. It is the one exception to "all LLM traffic through the gateway".

**Rejected:** sending every complex message to the subscription by default, which was my first design. Once I had prepaid API credits, the default moved to `smart` through the gateway, which has budgets, chat history and evals. Routine traffic also stopped eating the subscription limit I share with my own coding sessions.

## Numbers

| What | Value |
|---|---|
| First 31 real chat runs | $0.05 in total |
| Global cap / sum of per-key budgets | $24 / $22 (since 2026-11-06; was $45 / $43) |
| Chat agent key | $5 per 30 days (since 2026-11-06; was $30) |
| Eval harness key | $1 per 30 days (since 2026-11-06; was $5), plus a $2 guard per run |
| 40 classifier cases on `cheap` | $0.0023 |
| A complex question with 6 tool calls on `smart` | $0.107 |
| A homelab status question | $0.018 |

I have no with-and-without measurement for the gateway itself; its value is control, not speed. The with-and-without numbers for routing are on the [agent-core page](agent-core-routing.md).

## What went wrong and how I fixed it

### Budgets that would never fire

When I first wired things up, the pinned gateway didn't know the prices of the models I used. Every call would have been logged at $0, and no budget would ever have stopped anything. I moved all prices into the config, set by hand from the official pages, and added the rule to re-check them on every upgrade. Lesson: a budget is only as good as the price table underneath it.

### Every chat failed after a reboot

One morning every message failed: the gateway couldn't resolve the provider's name. Docker gives each container its DNS servers at the moment it starts. At boot, some containers started before the host's DNS settings were written, so they got none. A restart fixed it until the next boot. Starting Docker after the VPN would only have narrowed the race. Instead I gave Docker fixed upstream DNS servers (my router first, a public resolver as fallback), added a check script that tests every container, and accepted the fix only after a cold reboot with no manual restarts.

### A fallback I couldn't see

The gateway can fall back from one alias to another by itself. For the classifier, that meant `local` could time out in agent-core while the gateway quietly retried on `cheap`. Money was spent outside the run's records, and the run no longer matched the spend log. I switched off the gateway's fallback for that call, so agent-core alone decides when to fall back. The rule I took from it: every call has to be visible in both the run record and the gateway's log, joined by run and step number.
