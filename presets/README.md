# Presets

These are **starting-point configuration files** for common Velaro setups.

Pick one, copy it to `~/.vilaro/velaro.json`, and edit as needed.
Or ignore all of them — Velaro runs fine with no config file, using built-in defaults.

---

## Available presets

| File | What it sets up |
|------|----------------|
| `standalone.json` | Single agent, API-direct (default setup for most users) |
| `multi-agent.json` | Manager + specialist agents with role-based coordination |
| `runtime-handoff.json` | Agent that can delegate tasks to Claude Code CLI as a subprocess |
| `acpx-claude.json` | Agent backed by Claude Code via the ACPX ACP runtime (full session integration) |

---

## How to use

Copy a preset and apply it:

```bash
cp presets/standalone.json ~/.vilaro/velaro.json
```

Then edit `~/.vilaro/velaro.json` to add your API key, channels, and any
other settings. The full config reference is at `docs/gateway/`.

Or merge individual sections into an existing config — for example, take
just the `plugins` block from `acpx-claude.json` and add it to your current
config.

---

## These are examples, not requirements

- The system runs without any of these files
- You can extend any preset with additional config keys
- Mixing presets manually is supported — the full config schema accepts any
  valid combination
- See `docs/gateway/` for the complete config reference

---

## runtime-handoff vs acpx-claude

Both connect Velaro to Claude Code, but they work differently:

**runtime-handoff** runs `claude --print` as a one-shot subprocess. Simple,
no installation beyond the `claude` CLI, but each call is stateless.

**acpx-claude** uses the ACPX plugin to create a persistent ACP session backed
by Claude Code. Full tool streaming, resumable sessions, and session history.
Requires the ACPX plugin (bundled in `extensions/acpx/`) to be loaded by the
gateway. No additional install needed — acpx is bundled.
