---
summary: "Get Velaro installed and run your first chat in minutes."
read_when:
  - First time setup from zero
  - You want the fastest path to a working chat
title: "Getting Started"
---

# Getting Started

Goal: go from zero to a first working chat with minimal setup.

<Info>
Fastest chat: open the Control UI (no channel setup needed). Run `velaro dashboard`
and chat in the browser, or open `http://127.0.0.1:18789/` on the
<Tooltip headline="Gateway host" tip="The machine running the Velaro gateway service.">gateway host</Tooltip>.
Docs: [Dashboard](/web/dashboard) and [Control UI](/web/control-ui).
</Info>

## Prereqs

- Node 24 recommended (Node 22 LTS, currently `22.16+`, still supported for compatibility)

<Tip>
Check your Node version with `node --version` if you are unsure.
</Tip>

## Setup paths

- **CLI wizard** — this doc. Works on macOS, Linux, and Windows (WSL2).
- **macOS app** — guided first-run on Apple silicon or Intel Macs: [Onboarding (macOS App)](/start/onboarding-macos).
- **Operator deployment** — pre-configure for a client or team before handoff: [Operator Setup](/start/operator-setup).

## Quick setup (CLI)

<Steps>
  <Step title="Install Velaro (recommended)">
    <Tabs>
      <Tab title="macOS/Linux">
        ```bash
        curl -fsSL https://vilaro.ai/install.sh | bash
        ```
        <img
  src="/assets/install-script.svg"
  alt="Install Script Process"
  className="rounded-lg"
/>
      </Tab>
      <Tab title="Windows (PowerShell)">
        ```powershell
        iwr -useb https://vilaro.ai/install.ps1 | iex
        ```
      </Tab>
    </Tabs>

    <Note>
    Other install methods and requirements: [Install](/install).
    </Note>

  </Step>
  <Step title="Run the setup wizard">
    ```bash
    velaro onboard --install-daemon
    ```

    The wizard configures auth, gateway settings, and optional channels.
    See [Setup Wizard](/start/wizard) for details.

  </Step>
  <Step title="Check the Gateway">
    If you installed the service, it should already be running:

    ```bash
    velaro gateway status
    ```

  </Step>
  <Step title="Open the Control UI">
    ```bash
    velaro dashboard
    ```
  </Step>
</Steps>

<Check>
If the Control UI loads, your Gateway is ready for use.
</Check>

## Optional checks and extras

<AccordionGroup>
  <Accordion title="Run the Gateway in the foreground">
    Useful for quick tests or troubleshooting.

    ```bash
    velaro gateway --port 18789
    ```

  </Accordion>
  <Accordion title="Send a test message">
    Requires a configured channel.

    ```bash
    velaro message send --target +15555550123 --message "Hello from Velaro"
    ```

  </Accordion>
  <Accordion title="Use a custom provider endpoint">
    If your provider is not in the wizard's list, choose **Custom Provider** in `velaro onboard`.
    You will be asked to:

    - Pick OpenAI-compatible, Anthropic-compatible, or **Unknown** (auto-detect).
    - Enter a base URL and API key (if required by the provider).
    - Provide a model ID and optional alias.
    - Choose an Endpoint ID so multiple custom endpoints can coexist.

    Full steps: [Setup Wizard](/start/wizard).

  </Accordion>
  <Accordion title="Use Claude Code as the AI backend (optional — ACPX)">
    By default, Velaro calls a model provider API directly (Anthropic, OpenAI, etc.).
    If you want to use **Claude Code** as the AI runtime for your agent — with full ACP
    session integration, persistent tool streaming, and resumable sessions — enable the
    ACPX plugin.

    **Prerequisites:** the ACPX extension is bundled in `extensions/acpx/`. No extra install
    needed. acpx is bundled with the extension.

    **Enable in `~/.vilaro/velaro.json`:**

    ```json
    {
      "plugins": {
        "entries": {
          "acpx": {
            "enabled": true,
            "config": {
              "permissionMode": "approve-reads"
            }
          }
        }
      }
    }
    ```

    Or copy the starter preset: `cp presets/acpx-claude.json ~/.vilaro/velaro.json`

    **Permission modes:**
    - `approve-reads` (default) — auto-approves read operations, asks for writes
    - `approve-all` — approves everything without prompting (fully automated setups)
    - `deny-all` — denies all permission prompts (most restrictive)

    This path is entirely optional. The default API-direct setup works without it and
    is simpler for most users. Use ACPX when you specifically want Claude Code's
    session model, tool streaming, or MCP server injection.

  </Accordion>
</AccordionGroup>

## Useful environment variables

If you run Velaro as a service account or want custom config/state locations:

- `VILARO_HOME` sets the home directory used for internal path resolution.
- `VILARO_STATE_DIR` overrides the state directory.
- `VILARO_CONFIG_PATH` overrides the config file path.

Full environment variable reference: [Environment vars](/help/environment).

## Go deeper

<Columns>
  <Card title="Setup Wizard (details)" href="/start/wizard">
    Full CLI wizard reference and advanced options.
  </Card>
  <Card title="macOS app onboarding" href="/start/onboarding-macos">
    First run flow for the macOS app.
  </Card>
</Columns>

## What you will have

- A running Gateway
- Auth configured
- Control UI access or a connected channel

## Next steps

- DM safety and approvals: [Pairing](/channels/pairing)
- Connect more channels: [Channels](/channels)
- Advanced workflows and from source: [Setup](/start/setup)
