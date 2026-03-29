# Workspace Templates

These are **starter files** for a Velaro agent workspace.

They give the agent a working identity, operating guidelines, and a curated
skill reference from day one. They are not required, not enforced, and not
locked. Every file here is optional, editable, and removable.

---

## What these files are

| File | Purpose | Required? |
|------|---------|-----------|
| `AGENTS.md` | Operating instructions + skills reference | No |
| `SOUL.md` | Persona, tone, and values | No |
| `IDENTITY.md` | Agent name, emoji, and self-description | No |
| `USER.md` | Profile of the person the agent works with | No |
| `BOOTSTRAP.md` | First-run ritual (deleted after first use) | No |
| `HEARTBEAT.md` | Recurring tasks and startup behavior | No |

All six files are injected into the agent's context on every session when
present. Missing files are handled gracefully — Velaro seeds minimal defaults
for required bootstrap files and skips optional ones.

---

## How to apply these to an installed Velaro instance

Copy any or all files into your agent workspace (default: `~/.vilaro/workspace/`):

```bash
cp workspace-templates/* ~/.vilaro/workspace/
```

Or copy selectively:

```bash
cp workspace-templates/SOUL.md ~/.vilaro/workspace/SOUL.md
cp workspace-templates/AGENTS.md ~/.vilaro/workspace/AGENTS.md
```

Then run `velaro setup` to seed any files that are still missing.

---

## What you can change

Everything. Edit any file directly in `~/.vilaro/workspace/`. Changes take
effect on the next agent session — no restart needed.

To reset a file to the starter template:

```bash
cp workspace-templates/SOUL.md ~/.vilaro/workspace/SOUL.md
```

To remove a file entirely (returns to Velaro default behavior):

```bash
rm ~/.vilaro/workspace/SOUL.md
```

---

## For operators deploying to clients

Before handing an instance to a client:

1. Edit `SOUL.md` — fill in the persona placeholder with your brand identity
2. Edit `IDENTITY.md` — optionally pre-fill the agent name and emoji
3. Edit `AGENTS.md` — update the skills reference to match what's actually
   installed on the deployment machine
4. Optionally edit `BOOTSTRAP.md` — if identity is pre-configured, the
   first-run ritual can focus on learning about the user rather than the agent

Clients can edit any of these files at any time. The workspace is theirs.

---

## Standard Velaro behavior without these files

If you skip workspace-templates entirely, Velaro behaves exactly as it does
in any standard installation: the first agent run triggers a bootstrapping
ritual, the agent negotiates its own identity, and workspace files are
created from Velaro's built-in defaults.

These templates are a starting point, not a replacement for that system.
