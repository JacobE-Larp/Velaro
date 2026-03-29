# Velaro — Developer Reference

This file is read by Claude Code when working in this repository.
It provides context about what Velaro is, how to extend it, and how to work in this codebase.

---

## What Is Velaro

Velaro is a fork of [OpenClaw / Vilaro](https://github.com/vilaro/vilaro) — a self-hosted,
multi-channel AI gateway. It lets a single AI agent receive and send messages across 20+
platforms (Telegram, WhatsApp, Discord, Slack, iMessage, Signal, and more), execute tools,
manage memory, and run scheduled tasks.

**Key concepts:**

- **Gateway** — the always-on server process that routes messages and runs the agent loop
- **Agents** — one or more AI identities configured in `~/.vilaro/velaro.json`
- **Extensions** — plugins loaded at startup from `extensions/*/` (channels, providers, tools)
- **Skills** — agent-readable instruction sets in `skills/*/SKILL.md`, auto-discovered
- **Workspace** — the agent's home directory (`~/.vilaro/workspace/`), contains identity and memory files

---

## Fork Notes (Read Before Making Changes)

**This is a Velaro fork.** The upstream project is Vilaro/OpenClaw. Keep these in mind:

- **Naming in this repo:** use `Velaro` / `velaro` in new files, docs, and user-facing strings.
  Internal code still says `vilaro` in many places (paths, variable names, env vars like
  `VILARO_HOME`). This rename is ongoing — do **not** mass-rename across the codebase.
  Only update naming in files you are explicitly editing.
- **Known TS errors:** ~334 pre-existing TypeScript errors exist in test files and some
  extensions — these are rename artifacts from the Vilaro→Velaro migration. They are not
  regressions. Run `pnpm tsgo` and treat errors in files you did not touch as pre-existing noise.
- **Config path:** user config still lives at `~/.vilaro/velaro.json`. The `~/.vilaro/` path
  is source-level and not changed in this fork.
- **Two AGENTS.md files exist with different purposes:**
  - `AGENTS.md` at the repo root — contributor and AI maintainer guidelines for this codebase
  - `~/.vilaro/workspace/AGENTS.md` — operating instructions injected into the agent's
    system prompt on every turn. These are completely separate files with different audiences.

---

## Repository Structure

```
velaro/
├── src/                    Core TypeScript source
│   ├── agents/             Agent session management, workspace, model config
│   ├── channels/           Built-in channel implementations
│   ├── cli/                CLI command wiring
│   ├── commands/           Command implementations
│   ├── config/             Config loading and validation
│   ├── gateway/            Gateway server, routing, RPC handlers
│   ├── infra/              File paths, state management, utilities
│   ├── memory/             Session memory and compaction
│   ├── plugin-sdk/         Public plugin API exports
│   ├── plugins/            Plugin loading and management
│   ├── providers/          Model provider integrations (OpenAI, Anthropic, etc.)
│   ├── sessions/           Session management
│   └── wizard/             Onboarding wizard
├── extensions/             76 plugins (channels, providers, specialized tools)
│   └── [name]/
│       ├── package.json
│       ├── vilaro.plugin.json   Plugin manifest
│       └── index.ts             Plugin entry point
├── skills/                 57 agent skills (auto-discovered)
│   └── [name]/
│       ├── SKILL.md             Agent-readable instructions
│       └── package.json
├── apps/                   Platform apps (macOS, iOS, Android)
├── docs/                   Documentation (Mintlify)
├── presets/                Starter config examples
├── workspace-templates/    Starter workspace files for agents
└── dist/                   Compiled output
```

**Key source entry points:**

- `src/entry.ts` — main CLI entry
- `src/gateway/server.ts` — gateway server
- `src/agents/` — agent loop and session lifecycle
- `src/plugin-sdk/` — the API surface available to extensions

---

## How to Add a Skill

Skills are the simplest way to extend what the agent knows how to do. No code required.

**1. Create the directory:**

```bash
mkdir skills/my-skill
```

**2. Create `skills/my-skill/SKILL.md`:**

```markdown
---
name: my-skill
description: "One-line description of when to use this skill."
metadata: { "vilaro": { "emoji": "🔧", "requires": { "bins": ["my-tool"] } } }
---

# My Skill

## When to Use

[Describe when the agent should activate this skill]

## How to Use

[Give the agent clear instructions for what to do]
```

**3. Create `skills/my-skill/package.json`:**

```json
{
  "name": "@velaro/skill-my-skill",
  "version": "1.0.0",
  "description": "My skill description",
  "private": true
}
```

That's it. Skills are auto-discovered from `skills/*/SKILL.md` at gateway startup.
No registration, no config change, no restart needed after adding to a running dev instance
(restart required for production).

**Metadata fields:**

- `requires.bins` — CLI tools that must be in PATH
- `requires.anyBins` — at least one of these must be present
- `requires.env` — environment variables that must be set
- `requires.config` — Velaro config keys that must be set
- `os` — array of supported platforms (`"darwin"`, `"linux"`, `"win32"`)
- `user-invocable: false` — hide from user-facing skill list (for internal/system skills)

Run `velaro skills list` to verify the skill is discovered and check dependency status.

---

## How to Add an Extension

Extensions (plugins) add new capabilities to the gateway: new channels, new AI providers,
new tools, new API handlers. They are TypeScript packages loaded via jiti at startup.

**1. Create the extension directory:**

```bash
mkdir extensions/my-extension
```

**2. Create `extensions/my-extension/vilaro.plugin.json`:**

```json
{
  "id": "my-extension",
  "name": "My Extension",
  "description": "What this extension does.",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "myOption": { "type": "string" }
    }
  }
}
```

**3. Create `extensions/my-extension/package.json`:**

```json
{
  "name": "@velaro/extension-my-extension",
  "version": "1.0.0",
  "type": "module",
  "main": "./index.ts",
  "dependencies": {},
  "devDependencies": {
    "vilaro": "*"
  }
}
```

**4. Create `extensions/my-extension/index.ts`:**

```typescript
import type { VilaroPluginApi } from "vilaro/plugin-sdk";
import { jsonResult } from "vilaro/plugin-sdk";
import { Type } from "@sinclair/typebox";

const plugin = {
  id: "my-extension",
  name: "My Extension",
  description: "What this extension does.",
  register(api: VilaroPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as { myOption?: string };

    // Inject context into agent system prompt
    api.on("before_prompt_build", (_event, ctx) => {
      return { prependSystemContext: "## My Extension\nI have access to my-extension." };
    });

    // Register a tool the agent can call
    api.registerTool(
      (toolCtx) => ({
        name: "my_tool",
        label: "My Tool",
        description: "Does something useful.",
        parameters: Type.Object({ input: Type.String() }),
        execute: async (_toolCallId, params) => {
          const result = `Processed: ${params.input}`;
          return jsonResult({ ok: true, result });
        },
      }),
      { names: ["my_tool"] },
    );
  },
};

export default plugin;
```

**Key plugin API methods:**

- `api.on("before_prompt_build", handler)` — inject context into the agent system prompt
- `api.registerTool(factory, opts)` — register a tool the agent can call
- `api.pluginConfig` — access this plugin's config from `velaro.json`
- `api.config` — access the full gateway config

**jiti / ESM-CJS note:** Extensions are loaded via jiti. If you import a CJS package that
sets `__esModule: true`, jiti will resolve the default import to `module.exports.default`
rather than the full namespace. Use `import * as Pkg from "pkg"` alongside the default
import as a fallback when needed (see `extensions/slack/src/monitor/provider.ts` for the
pattern).

**TypeBox schemas:** Use `@sinclair/typebox` for all tool parameter schemas. Avoid
`Type.Union` — use `Type.Unsafe` string enums and `Type.Optional(...)` instead of unions
with null. Do not use a raw `format` property name in schemas.

Enable the extension in `~/.vilaro/velaro.json`:

```json
{
  "plugins": {
    "entries": {
      "my-extension": {
        "enabled": true,
        "config": { "myOption": "value" }
      }
    }
  }
}
```

---

## How to Configure Agents

Agent configuration lives in `~/.vilaro/velaro.json`. The repo's `presets/` directory
has example configs to start from.

**Single agent (default — no config file needed):**
The gateway runs with a default `main` agent when no config file exists.

**Named single agent:**

```json
{
  "agents": {
    "list": [{ "id": "main", "name": "Velaro", "default": true }]
  }
}
```

**Multi-agent (manager + specialists):**

```json
{
  "agents": {
    "list": [
      { "id": "manager", "name": "Manager", "default": true },
      { "id": "coder", "name": "Coder" }
    ]
  },
  "plugins": {
    "entries": {
      "multi-agent": {
        "enabled": true,
        "config": {
          "agents": {
            "manager": { "role": "head", "delegatesTo": ["coder"] },
            "coder": { "role": "specialist" }
          }
        }
      }
    }
  }
}
```

**Agent workspace files** (in `~/.vilaro/workspace/`) are injected into the agent's context
on every turn. See `workspace-templates/` for starter files and `docs/concepts/system-prompt.md`
for the full list of injected files.

**Claude Code as AI backend (ACPX — optional):**
The ACPX plugin (`extensions/acpx/`) lets the gateway use Claude Code as the AI runtime
instead of calling the API directly. See `presets/acpx-claude.json` for config.

---

## Build, Test, and Development Commands

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# TypeScript type-check (no emit)
pnpm tsgo

# Lint and format check
pnpm check

# Format fix
pnpm format:fix

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run targeted test
pnpm test -- src/path/to/file.test.ts

# Run CLI in dev
pnpm velaro <command>

# Run the gateway
pnpm velaro gateway run --port 18789
```

- Runtime baseline: **Node 22+** (Node 24 recommended). Bun also supported for dev scripts.
- Pre-commit hooks: `prek install`
- If deps are missing, run `pnpm install` first, then retry.
- Live tests (real API keys): `VILARO_LIVE_TEST=1 pnpm test:live`
- Memory pressure on tests: `VILARO_TEST_PROFILE=low VILARO_TEST_SERIAL_GATEWAY=1 pnpm test`

---

## Coding Style & Naming Conventions

- **Language:** TypeScript (ESM). Prefer strict typing; avoid `any`.
- **Linting/formatting:** Oxlint + Oxfmt. Run `pnpm check` before commits. Never add `@ts-nocheck`.
- **Naming:** use `Velaro` / `velaro` in new files, docs, and user-facing strings. Internal
  code using `vilaro` is fine — the rename is in progress, change it only in files you edit.
- **File size:** aim for under ~700 LOC. Extract helpers rather than creating "V2" copies.
- **American English** in code, comments, docs, and UI strings.
- **Dynamic imports:** do not mix `await import("x")` and static `import ... from "x"` for
  the same module in production paths. Use a `*.runtime.ts` boundary for lazy loading.
- **Class behavior:** never share via prototype mutation. Use explicit inheritance or composition.
- **CLI progress:** use `src/cli/progress.ts` (`osc-progress` + `@clack/prompts`).
- **Status output:** use `src/terminal/table.ts` for tables; `status --all` = read-only,
  `status --deep` = probes.
- **CLI palette:** use `src/terminal/palette.ts` for colors; no hardcoded ANSI.

---

## Testing Guidelines

- **Framework:** Vitest with V8 coverage (70% threshold: lines/branches/functions/statements)
- **Naming:** colocate tests as `*.test.ts`; e2e as `*.e2e.test.ts`
- **Run targeted:** `pnpm test -- src/path/file.test.ts -t "test name"`
  (use the wrapper, not raw `pnpm vitest run`)
- **Test workers:** do not set above 16
- **Changelog:** user-facing changes only. Pure test additions do not need a changelog entry.
- **Mobile:** check for connected real devices before using simulators/emulators.

---

## Commit & Pull Request Guidelines

- Commit messages: concise, action-oriented (`Gateway: add runtime timeout config`)
- Group related changes; avoid bundling unrelated refactors
- PR template: `.github/pull_request_template.md`
- Issue templates: `.github/ISSUE_TEMPLATE/`
- For PR workflow details: see `.pi/prompts/land-pr.md` and `.pi/prompts/review-pr.md`
- GitHub comment heredoc: use `-F - <<'EOF'` for multi-line bodies with backticks or special chars;
  never embed `\\n` in comment strings
- GitHub linking: use plain `#123` (no backticks) for auto-linked issue/PR refs
- Never commit real phone numbers, API keys, or live credential values

---

## Multi-Agent Safety

When multiple agents may be working in the same repo simultaneously:

- Do **not** create/apply/drop `git stash` entries unless explicitly requested
- Do **not** create/remove/modify `git worktree` checkouts unless explicitly requested
- Do **not** switch branches unless explicitly requested
- When told to "push": may `git pull --rebase` to integrate latest; never discard other work
- When told to "commit": scope to your changes only; "commit all" = grouped chunks
- Focus reports on your edits; end with "other files present" only if relevant

---

## Tool Schema Guardrails (for Extension Development)

When writing tool parameter schemas with TypeBox:

- Avoid `Type.Union` in tool input schemas — no `anyOf`/`oneOf`/`allOf`
- For string enums: use `Type.Unsafe` enum pattern, not `Type.Union([Type.Literal(...)])`
- For optional fields: use `Type.Optional(...)` instead of `... | null`
- Keep top-level tool schema as `type: "object"` with `properties`
- Do not use a raw `format` property name — some validators reject it as reserved

---

## Security & Configuration Tips

- User config: `~/.vilaro/velaro.json`
- Credentials: `~/.vilaro/credentials/`
- Sessions: `~/.vilaro/agents/<agentId>/sessions/*.jsonl`
- Agent workspace: `~/.vilaro/workspace/` (default)
- Never commit real credentials, phone numbers, or live config values
- Security policy: `SECURITY.md`
- For config/service warnings: run `velaro doctor` (see `docs/gateway/doctor.md`)
- Any dependency in `pnpm.patchedDependencies` must use an exact version (no `^`/`~`)
- Patching dependencies requires explicit approval; do not do this by default
