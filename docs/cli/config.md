---
summary: "CLI reference for `vilaro config` (get/set/unset/file/validate)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `vilaro config`

Config helpers: get/set/unset/validate values by path and print the active
config file. Run without a subcommand to open
the configure wizard (same as `vilaro configure`).

## Examples

```bash
vilaro config file
vilaro config get browser.executablePath
vilaro config set browser.executablePath "/usr/bin/google-chrome"
vilaro config set agents.defaults.heartbeat.every "2h"
vilaro config set agents.list[0].tools.exec.node "node-id-or-name"
vilaro config unset tools.web.search.apiKey
vilaro config validate
vilaro config validate --json
```

## Paths

Paths use dot or bracket notation:

```bash
vilaro config get agents.defaults.workspace
vilaro config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
vilaro config get agents.list
vilaro config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--strict-json` to require JSON5 parsing. `--json` remains supported as a legacy alias.

```bash
vilaro config set agents.defaults.heartbeat.every "0m"
vilaro config set gateway.port 19001 --strict-json
vilaro config set channels.whatsapp.groups '["*"]' --strict-json
```

## Subcommands

- `config file`: Print the active config file path (resolved from `VILARO_CONFIG_PATH` or default location).

Restart the gateway after edits.

## Validate

Validate the current config against the active schema without starting the
gateway.

```bash
vilaro config validate
vilaro config validate --json
```
