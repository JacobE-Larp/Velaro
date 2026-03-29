# Multi-Agent Setup

Velaro supports multiple agents natively via the `agents.list` config key. This page explains how
agents are configured, how the multi-agent plugin adds role-based coordination, and how to use the
enriched `velaro.agents.list` API.

---

## How `agents.list` works

Every agent is defined in your config under `agents.list`. Each entry has at minimum an `id`:

```json
{
  "agents": {
    "list": [
      { "id": "manager", "name": "Manager", "default": true },
      { "id": "coder",   "name": "Coder" },
      { "id": "researcher", "name": "Researcher" },
      { "id": "support", "name": "Support" }
    ]
  }
}
```

The agent marked `"default": true` handles messages that don't target a specific agent. Users
can address any agent directly using `--agent <id>`.

If no `agents.list` is configured during onboarding, Velaro automatically creates a single default
agent `{ id: "main", name: "Velaro", default: true }`.

---

## Roles: head vs sub-agents

Roles are **not** part of core `agents.list`. They are added by the `multi-agent` plugin via its
own config block inside `plugins.entries.multi-agent.config.agents`.

| Role | Behavior |
|------|----------|
| `head` | Receives a `delegate_to_agent` tool; knows about its sub-agents via system prompt injection. |
| `specialist` | Receives delegated tasks; has no delegation tool (one-hop only). |
| `standalone` | Default when no role is set; acts as a normal single agent. |

---

## How to add agents

1. Add entries to `agents.list` in your config file (or via `velaro config set`).
2. If using role-based coordination, also add the `multi-agent` plugin config.

See `presets/multi-agent.json` for a complete example.

---

## The `multi-agent` plugin

Install by adding to your config:

```json
{
  "plugins": {
    "entries": {
      "multi-agent": {
        "enabled": true,
        "config": {
          "agents": {
            "manager": {
              "role": "head",
              "delegatesTo": ["coder", "researcher", "support"]
            },
            "coder":      { "role": "specialist" },
            "researcher": { "role": "specialist" },
            "support":    { "role": "specialist" }
          }
        }
      }
    }
  }
}
```

### What the plugin does

**`before_prompt_build` hook (head agents only)**

When the head agent starts a run, the plugin injects a system context block listing available
sub-agents and how to delegate to them.

**`delegate_to_agent` tool (head agents only)**

The tool is registered only for agents with `role: "head"`. Sub-agents do not receive it, which
prevents recursion.

Schema:
```json
{
  "agentId": "string — ID of the sub-agent to delegate to",
  "task":    "string — task description or message"
}
```

Guardrails:
- Rejects self-delegation (`agentId === current agent`)
- Rejects agents not in the `delegatesTo` list
- Times out after 60 seconds (configurable via plugin source)
- Runs the sub-agent via `velaro agent --agent <id> --message <task>` (one-hop)

---

## Delegation flow

```
User → Manager (head)
         │
         ├─ delegate_to_agent("coder", "Fix the bug in auth.ts")
         │      └─ vilaro agent --agent coder --message "Fix the bug in auth.ts"
         │              └─ Coder (specialist) runs, returns output
         │
         └─ delegate_to_agent("researcher", "Summarize RFC 9110")
                └─ vilaro agent --agent researcher --message "Summarize RFC 9110"
                        └─ Researcher (specialist) runs, returns output
```

Sub-agents do **not** have the `delegate_to_agent` tool, so delegation is always one-hop.

---

## API usage: `velaro.agents.list`

The gateway exposes an enriched agents endpoint that includes role and delegation metadata.

**Method:** `velaro.agents.list`
**Params:** `{}` (none)

**Example response:**

```json
{
  "agents": [
    {
      "id": "manager",
      "name": "Manager",
      "role": "head",
      "isHead": true,
      "default": true,
      "status": "available",
      "delegatesTo": ["coder", "researcher", "support"],
      "canDelegate": true
    },
    {
      "id": "coder",
      "name": "Coder",
      "role": "specialist",
      "isHead": false,
      "default": false,
      "status": "available",
      "canDelegate": false
    }
  ],
  "summary": {
    "total": 4,
    "configured": 4,
    "available": 4,
    "active": 0,
    "head": 1,
    "subAgents": 3,
    "defaultAgentId": "manager"
  }
}
```

**Status values:**

| Value | Meaning |
|-------|---------|
| `configured` | Agent is in `cfg.agents.list`. |
| `available` | Gateway is running and agent is configured (always true for configured agents). |
| `active` | Agent is currently processing a run (not yet tracked per-agent). |

> **Note:** This endpoint does **not** modify the upstream `agents.list` method. Both coexist
> independently. The upstream method returns the raw agent list; `velaro.agents.list` returns
> enriched data including roles from the `multi-agent` plugin.

---

## Testing locally

1. Copy `presets/multi-agent.json` into your Velaro config.
2. Start the gateway: `vilaro gateway run`.
3. List agents (upstream): `velaro gateway call agents.list`
4. List agents (enriched): `velaro gateway call velaro.agents.list`
5. Send a message to the head agent: `vilaro agent --agent manager --message "Research and summarize Node.js streams"`

The head agent will receive the `delegate_to_agent` tool and the sub-agent context, and can
delegate work to the researcher or coder as appropriate.
