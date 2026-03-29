# Runtime Handoff

Runtime handoff lets Velaro agents delegate execution tasks to configured CLI runtimes — such as Claude Code — and return the runtime's output.

Agents reason and route; runtimes execute. This separation keeps agent context clean while giving agents access to powerful execution backends.

## How it works

1. Configure one or more runtimes under `plugins.entries.runtime-handoff.config.runtimes`.
2. For each runtime, set `allowedAgents` to the agent IDs that may use it.
3. The `runtime-handoff` plugin injects the `handoff_to_runtime` tool into each allowed agent's tool list.
4. The agent calls `handoff_to_runtime` with a `runtimeId` and a `task` string.
5. The plugin runs the configured command with the task substituted into `argsTemplate`, captures stdout/stderr, and returns up to 100 KB to the agent.

No shell is involved — the command is executed directly via `execFile`. The `{{task}}` placeholder is replaced per-argument, with no shell interpolation.

## Config

```json
{
  "plugins": {
    "entries": {
      "runtime-handoff": {
        "enabled": true,
        "config": {
          "runtimes": {
            "claude-code": {
              "name": "Claude Code",
              "type": "cli",
              "enabled": true,
              "description": "Claude Code CLI for software engineering tasks.",
              "command": "claude",
              "argsTemplate": ["--print", "--dangerously-skip-permissions", "{{task}}"],
              "timeoutSeconds": 120,
              "allowedAgents": ["main"]
            }
          }
        }
      }
    }
  }
}
```

### Runtime fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Runtime ID (key in `runtimes` map) |
| `name` | string | Human-readable label |
| `type` | `"cli"` | Runtime type (only `cli` supported) |
| `enabled` | boolean | Set `false` to disable without removing |
| `description` | string | Shown to the agent in its system prompt |
| `command` | string | Executable name or path (e.g. `"claude"`) |
| `argsTemplate` | string[] | Argument list; `{{task}}` is replaced with the task string |
| `timeoutSeconds` | number | Subprocess kill timeout (default: 60) |
| `allowedAgents` | string[] | Agent IDs that may use this runtime; empty = nobody |

## API

### `velaro.runtimes.list`

Returns all configured runtimes from the `runtime-handoff` plugin config.

**Params:** `{}`

**Result:**
```json
{
  "runtimes": [
    {
      "id": "claude-code",
      "name": "Claude Code",
      "type": "cli",
      "enabled": true,
      "description": "Claude Code CLI for software engineering tasks.",
      "command": "claude",
      "allowedAgents": ["main"],
      "timeoutSeconds": 120
    }
  ],
  "summary": {
    "total": 1,
    "enabled": 1
  }
}
```

### `velaro.agents.list`

The `allowedRuntimes` field on each agent row lists the runtime IDs the agent is configured to access.

```json
{
  "agents": [
    {
      "id": "main",
      "role": "standalone",
      "isHead": false,
      "default": true,
      "status": "available",
      "canDelegate": false,
      "allowedRuntimes": ["claude-code"]
    }
  ]
}
```

## Access control

- `allowedAgents` on each runtime is the source of truth. An agent not listed there cannot invoke the runtime, even if the plugin is enabled.
- Set `enabled: false` on a runtime to disable it globally without removing its config.
- Set the plugin-level `enabled: false` to disable all runtime handoff.

## Example: Claude Code

See `presets/runtime-handoff.json` for a ready-to-use config that wires Claude Code to the `main` and `manager` agents.

After applying the config, the allowed agents will have access to the `handoff_to_runtime` tool. Call it with:

```json
{
  "runtimeId": "claude-code",
  "task": "Write a function that checks if a number is prime and add a test for it."
}
```

The runtime will execute `claude --print --dangerously-skip-permissions <task>` and return the output.
