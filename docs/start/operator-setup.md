---
summary: "Pre-configure Velaro before handing off to a client or deploying for a team."
read_when:
  - Deploying Velaro for someone else
  - Setting up a team or client instance
  - Pre-configuring agent identity and workspace before first run
title: "Operator Setup"
sidebarTitle: "Operator Setup"
---

# Operator Setup

This guide is for **operators** — people deploying Velaro for someone else, or setting up a team or client instance. If you are setting up your own personal instance, see [Getting Started](/start/getting-started).

An operator pre-configures the system so the end user gets a ready-to-run setup with no wizard prompts and no blank slate.

## What operators control

- **Agent identity** — name, persona, and operating instructions in workspace files
- **Config** — which model, which channels, which provider, allowlists
- **Workspace bootstrap** — what the agent loads on every session
- **First-run behavior** — skip the self-introduction ritual and go straight to serving the user

## Pre-configuration checklist

<Steps>
  <Step title="Copy and edit a preset config">
    ```bash
    cp presets/standalone.json ~/.vilaro/velaro.json
    ```

    Edit `~/.vilaro/velaro.json`:
    - Set the agent name: `"name": "Velaro"`
    - Set the model: `"model": "anthropic/claude-opus-4-6"`
    - Set the channel allowlist: `"channels": { "whatsapp": { "allowFrom": ["+15555550123"] } }`

    Full config reference: [Gateway Configuration](/gateway/configuration).

  </Step>
  <Step title="Seed the workspace">
    Copy starter workspace files and customize them:

    ```bash
    cp workspace-templates/* ~/.vilaro/workspace/
    ```

    Key files to edit:

    - **`SOUL.md`** — agent persona and operating style. Remove or replace the operator placeholder block.
    - **`AGENTS.md`** — operating instructions. Update the skills reference to match what is installed.
    - **`IDENTITY.md`** — agent name and background. Fill in the identity section.
    - **`USER.md`** — user profile. Fill in or leave blank for the agent to discover.
    - **`BOOTSTRAP.md`** — first-run ritual. For pre-configured deployments, use PATH B (skip identity setup, focus on learning about the user).
    - **`HEARTBEAT.md`** — proactive task list. Leave blank to disable heartbeats until the user configures them.

    Or seed defaults with `velaro setup` (creates missing workspace files using built-in defaults without overwriting existing ones).

  </Step>
  <Step title="Disable bootstrap auto-creation (optional)">
    If you ship your own workspace files from a repo, you can disable automatic `BOOTSTRAP.md` creation:

    ```json
    {
      "agent": {
        "skipBootstrap": true
      }
    }
    ```

    This prevents Velaro from creating a generic `BOOTSTRAP.md` if one does not exist. Use this when your workspace files are managed externally and you do not want the default ritual.

  </Step>
  <Step title="Lock channels to the right sender">
    Never deploy without an allowlist. At minimum:

    ```json
    {
      "channels": {
        "whatsapp": {
          "allowFrom": ["+15555550123"]
        }
      }
    }
    ```

    Docs: [Pairing and safety](/channels/pairing).

  </Step>
  <Step title="Verify the setup">
    ```bash
    velaro gateway status
    velaro doctor
    ```

    The `doctor` command checks credentials, config, and channel connectivity. Docs: [velaro doctor](/gateway/doctor).

  </Step>
</Steps>

## Workspace files quick reference

| File | Purpose | Operator action |
|------|---------|----------------|
| `SOUL.md` | Agent persona and operating style | Customize or replace |
| `AGENTS.md` | Operating instructions + skills reference | Update skills list for your install |
| `IDENTITY.md` | Agent name and self-description | Fill in |
| `USER.md` | Who the agent is helping | Fill in or leave blank |
| `BOOTSTRAP.md` | First-run ritual | Use PATH B for pre-configured deployments |
| `HEARTBEAT.md` | Proactive task list | Leave blank or configure tasks |
| `MEMORY.md` | Long-term memory index | Auto-managed by the agent; do not seed manually |

Starter files are in `workspace-templates/`. See `workspace-templates/README.md` for full details on each file and the operator placeholder blocks.

## Multiple agents

To deploy manager + specialist agents, add both to your config:

```json
{
  "agents": {
    "list": [
      { "id": "manager", "name": "Manager", "default": true },
      { "id": "coder", "name": "Coder" }
    ]
  }
}
```

Docs: [Multi-agent](/concepts/multi-agent). Starter config: `presets/multi-agent.json`.

## Next steps

- [Gateway Configuration](/gateway/configuration) — full config reference
- [Channels](/channels) — connecting messaging platforms
- [Pairing and safety](/channels/pairing) — DM safety and allowlists
- [Bootstrapping](/start/bootstrapping) — how the agent initializes on first run
- [Setup Wizard](/start/wizard) — run the wizard yourself to see what gets configured
