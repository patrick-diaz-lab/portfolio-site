# MCP servers

The models reach my docs, notes, files and homelab state through my own MCP servers. Four servers, fifteen read tools and one write tool. This page describes the layers of access control and why each exists; the exact rules stay private.

## Decisions

### 1. My own servers first, all behind the gateway

I wrote the first servers myself: knowledge (docs and notes), files (my PDFs), homelab (VM, container and download status) and one for writing notes. None has a published port. Clients reach them only through the LiteLLM gateway, which is also where every model call goes, so permissions and logs live in one place. Each client key has a list of the servers and tools it may use, and tools added by an upgrade aren't enabled on their own. Public servers come later, under written rules: pinned images, a source review before adoption and on every upgrade, and no hosted server for anything private.

**Rejected:** direct connections from each client to each server. Every client would need its own credentials for every server, and there would be no single place to see who called what.

### 2. Least privilege in the credential, not in the code

Each layer holds only the rights it needs, so a bug in the code above it can't do more:

- **Files:** the server never sees a folder. It reads two database views of content that was indexed and is not private, so it has no path to get wrong.
- **Homelab:** the media apps only have full-access keys, so those keys stay on the media machine. A small service there answers one read-only question and builds its answer from a fixed list of fields. Only counts and states leave: no titles, paths or keys. The hypervisor token can read status, nothing else.
- **Container status on my main VM:** read through a filter that answers only the container list, because the detailed view would show every container's secrets.
- **Writes:** one tool can create a new note in the agents' inbox folder, nothing else. No overwrite, move or delete, and the server picks the file name.

**Rejected:** full media app keys behind "GET-only" code. The key itself could still write.

### 3. Tool output is untrusted

Every tool result reaches the model inside a fixed "untrusted data" block, and a run that has read untrusted content gets no write tools. A note written by a run that read one of my documents is marked as tainted. The marker comes from the run's record, never from the model. Notes can't load remote images when I open them, so an injected instruction can't use one to send data out.

**Rejected:** a taint flag the model passes as a tool argument. A prompt-injected model would simply leave it off.

### 4. Every server has an eval scope

Each server has a second, separate scope that serves only test data: repo docs, a seed vault with synthetic notes, test PDFs, recorded homelab responses, and a throwaway folder for written notes. Evals run the real server code, but can't see or touch my real notes, files or machines.

**Rejected:** evals on the production scopes. The agent eval must never see my own notes, and a test write must never land in my vault.

## Numbers

- 4 servers, 15 read tools, 1 write tool; `local` and `cheap` get no tools at all.
- Planted strings in the homelab fixtures (a title, a path, a fake key) never reach any tool output, in tests.
- Live check: a key narrowed to one tool was offered only that tool, and the others were refused by the gateway. The eval key sees only the eval scope of the files server.
- Every tool call is its own run record, without the query text: in an eval, the query is a held-out question.
- Homelab answers: 1.0 with tools and 1.0 without them, with 0 invented numbers in both (the model said it couldn't know rather than guessing).

## What went wrong and how I fixed it

### A server name took the gateway down

When I added an eval scope for the knowledge server, the gateway refused to start: it doesn't accept a hyphen in an MCP server name. The bug had come in with an earlier item and went unnoticed because the gateway wasn't restarted then. Every chat was down for a few minutes. I renamed the scope everywhere, and the lesson went into how I deploy: a config change counts as tested only after the service has restarted on it.

### A contract field the source couldn't give

The homelab contract had a restart-policy field for each container. During the build it turned out that only the detailed container view has it, and that view is exactly what the filter refuses on purpose. Rather than open the detailed view, I dropped the field and keep a list of the containers I expect per host: a missing or stopped one is a finding only if it's on that list.

### A missing permission shouldn't break the chat

One of my messages arrived just before the agent's key got its tool permission. The tool connection failed, but the answer still came back from `smart` without tools, and the run record showed the failed step. That is now tested: a refused key or tool never costs me the reply.
