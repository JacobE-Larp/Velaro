---
summary: "Integrated browser control service + action commands"
read_when:
  - Adding agent-controlled browser automation
  - Debugging why vilaro is interfering with your own Chrome
  - Implementing browser settings + lifecycle in the macOS app
title: "Browser (Vilaro-managed)"
---

# Browser (vilaro-managed)

Vilaro can run a **dedicated Chrome/Brave/Edge/Chromium profile** that the agent controls.
It is isolated from your personal browser and is managed through a small local
control service inside the Gateway (loopback only).

Beginner view:

- Think of it as a **separate, agent-only browser**.
- The `vilaro` profile does **not** touch your personal browser profile.
- The agent can **open tabs, read pages, click, and type** in a safe lane.
- The built-in `user` profile attaches to your real signed-in Chrome session via Chrome MCP.

## What you get

- A separate browser profile named **vilaro** (orange accent by default).
- Deterministic tab control (list/open/focus/close).
- Agent actions (click/type/drag/select), snapshots, screenshots, PDFs.
- Optional multi-profile support (`vilaro`, `work`, `remote`, ...).

This browser is **not** your daily driver. It is a safe, isolated surface for
agent automation and verification.

## Quick start

```bash
vilaro browser --browser-profile vilaro status
vilaro browser --browser-profile vilaro start
vilaro browser --browser-profile vilaro open https://example.com
vilaro browser --browser-profile vilaro snapshot
```

If you get “Browser disabled”, enable it in config (see below) and restart the
Gateway.

## Profiles: `vilaro` vs `user`

- `vilaro`: managed, isolated browser (no extension required).
- `user`: built-in Chrome MCP attach profile for your **real signed-in Chrome**
  session.

For agent browser tool calls:

- Default: use the isolated `vilaro` browser.
- Prefer `profile="user"` when existing logged-in sessions matter and the user
  is at the computer to click/approve any attach prompt.
- `profile` is the explicit override when you want a specific browser mode.

Set `browser.defaultProfile: "vilaro"` if you want managed mode by default.

## Configuration

Browser settings live in `~/.vilaro/vilaro.json`.

```json5
{
  browser: {
    enabled: true, // default: true
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: true, // default trusted-network mode
      // allowPrivateNetwork: true, // legacy alias
      // hostnameAllowlist: ["*.example.com", "example.com"],
      // allowedHostnames: ["localhost"],
    },
    // cdpUrl: "http://127.0.0.1:18792", // legacy single-profile override
    remoteCdpTimeoutMs: 1500, // remote CDP HTTP timeout (ms)
    remoteCdpHandshakeTimeoutMs: 3000, // remote CDP WebSocket handshake timeout (ms)
    defaultProfile: "vilaro",
    color: "#FF4500",
    headless: false,
    noSandbox: false,
    attachOnly: false,
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    profiles: {
      vilaro: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      user: {
        driver: "existing-session",
        attachOnly: true,
        color: "#00AA00",
      },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" },
    },
  },
}
```

Notes:

- The browser control service binds to loopback on a port derived from `gateway.port`
  (default: `18791`, which is gateway + 2).
- If you override the Gateway port (`gateway.port` or `VILARO_GATEWAY_PORT`),
  the derived browser ports shift to stay in the same “family”.
- `cdpUrl` defaults to the managed local CDP port when unset.
- `remoteCdpTimeoutMs` applies to remote (non-loopback) CDP reachability checks.
- `remoteCdpHandshakeTimeoutMs` applies to remote CDP WebSocket reachability checks.
- Browser navigation/open-tab is SSRF-guarded before navigation and best-effort re-checked on final `http(s)` URL after navigation.
- In strict SSRF mode, remote CDP endpoint discovery/probes (`cdpUrl`, including `/json/version` lookups) are checked too.
- `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork` defaults to `true` (trusted-network model). Set it to `false` for strict public-only browsing.
- `browser.ssrfPolicy.allowPrivateNetwork` remains supported as a legacy alias for compatibility.
- `attachOnly: true` means “never launch a local browser; only attach if it is already running.”
- `color` + per-profile `color` tint the browser UI so you can see which profile is active.
- Default profile is `vilaro` (Vilaro-managed standalone browser). Use `defaultProfile: "user"` to opt into the signed-in user browser.
- Auto-detect order: system default browser if Chromium-based; otherwise Chrome → Brave → Edge → Chromium → Chrome Canary.
- Local `vilaro` profiles auto-assign `cdpPort`/`cdpUrl` — set those only for remote CDP.
- `driver: "existing-session"` uses Chrome DevTools MCP instead of raw CDP. Do
  not set `cdpUrl` for that driver.

## Use Brave (or another Chromium-based browser)

If your **system default** browser is Chromium-based (Chrome/Brave/Edge/etc),
Vilaro uses it automatically. Set `browser.executablePath` to override
auto-detection:

CLI example:

```bash
vilaro config set browser.executablePath "/usr/bin/google-chrome"
```

```json5
// macOS
{
  browser: {
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  }
}

// Windows
{
  browser: {
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
  }
}

// Linux
{
  browser: {
    executablePath: "/usr/bin/brave-browser"
  }
}
```

## Local vs remote control

- **Local control (default):** the Gateway starts the loopback control service and can launch a local browser.
- **Remote control (node host):** run a node host on the machine that has the browser; the Gateway proxies browser actions to it.
- **Remote CDP:** set `browser.profiles.<name>.cdpUrl` (or `browser.cdpUrl`) to
  attach to a remote Chromium-based browser. In this case, Vilaro will not launch a local browser.

Remote CDP URLs can include auth:

- Query tokens (e.g., `https://provider.example?token=<token>`)
- HTTP Basic auth (e.g., `https://user:pass@provider.example`)

Vilaro preserves the auth when calling `/json/*` endpoints and when connecting
to the CDP WebSocket. Prefer environment variables or secrets managers for
tokens instead of committing them to config files.

## Node browser proxy (zero-config default)

If you run a **node host** on the machine that has your browser, Vilaro can
auto-route browser tool calls to that node without any extra browser config.
This is the default path for remote gateways.

Notes:

- The node host exposes its local browser control server via a **proxy command**.
- Profiles come from the node’s own `browser.profiles` config (same as local).
- Disable if you don’t want it:
  - On the node: `nodeHost.browserProxy.enabled=false`
  - On the gateway: `gateway.nodes.browser.mode="off"`

## Browserless (hosted remote CDP)

[Browserless](https://browserless.io) is a hosted Chromium service that exposes
CDP endpoints over HTTPS. You can point a Vilaro browser profile at a
Browserless region endpoint and authenticate with your API key.

Example:

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserless",
    remoteCdpTimeoutMs: 2000,
    remoteCdpHandshakeTimeoutMs: 4000,
    profiles: {
      browserless: {
        cdpUrl: "https://production-sfo.browserless.io?token=<BROWSERLESS_API_KEY>",
        color: "#00AA00",
      },
    },
  },
}
```

Notes:

- Replace `<BROWSERLESS_API_KEY>` with your real Browserless token.
- Choose the region endpoint that matches your Browserless account (see their docs).

## Direct WebSocket CDP providers

Some hosted browser services expose a **direct WebSocket** endpoint rather than
the standard HTTP-based CDP discovery (`/json/version`). Vilaro supports both:

- **HTTP(S) endpoints** (e.g. Browserless) — Vilaro calls `/json/version` to
  discover the WebSocket debugger URL, then connects.
- **WebSocket endpoints** (`ws://` / `wss://`) — Vilaro connects directly,
  skipping `/json/version`. Use this for services like
  [Browserbase](https://www.browserbase.com) or any provider that hands you a
  WebSocket URL.

### Browserbase

[Browserbase](https://www.browserbase.com) is a cloud platform for running
headless browsers with built-in CAPTCHA solving, stealth mode, and residential
proxies.

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserbase",
    remoteCdpTimeoutMs: 3000,
    remoteCdpHandshakeTimeoutMs: 5000,
    profiles: {
      browserbase: {
        cdpUrl: "wss://connect.browserbase.com?apiKey=<BROWSERBASE_API_KEY>",
        color: "#F97316",
      },
    },
  },
}
```

Notes:

- [Sign up](https://www.browserbase.com/sign-up) and copy your **API Key**
  from the [Overview dashboard](https://www.browserbase.com/overview).
- Replace `<BROWSERBASE_API_KEY>` with your real Browserbase API key.
- Browserbase auto-creates a browser session on WebSocket connect, so no
  manual session creation step is needed.
- The free tier allows one concurrent session and one browser hour per month.
  See [pricing](https://www.browserbase.com/pricing) for paid plan limits.
- See the [Browserbase docs](https://docs.browserbase.com) for full API
  reference, SDK guides, and integration examples.

## Security

Key ideas:

- Browser control is loopback-only; access flows through the Gateway’s auth or node pairing.
- If browser control is enabled and no auth is configured, Vilaro auto-generates `gateway.auth.token` on startup and persists it to config.
- Keep the Gateway and any node hosts on a private network (Tailscale); avoid public exposure.
- Treat remote CDP URLs/tokens as secrets; prefer env vars or a secrets manager.

Remote CDP tips:

- Prefer encrypted endpoints (HTTPS or WSS) and short-lived tokens where possible.
- Avoid embedding long-lived tokens directly in config files.

## Profiles (multi-browser)

Vilaro supports multiple named profiles (routing configs). Profiles can be:

- **vilaro-managed**: a dedicated Chromium-based browser instance with its own user data directory + CDP port
- **remote**: an explicit CDP URL (Chromium-based browser running elsewhere)
- **existing session**: your existing Chrome profile via Chrome DevTools MCP auto-connect

Defaults:

- The `vilaro` profile is auto-created if missing.
- The `user` profile is built-in for Chrome MCP existing-session attach.
- Existing-session profiles are opt-in beyond `user`; create them with `--driver existing-session`.
- Local CDP ports allocate from **18800–18899** by default.
- Deleting a profile moves its local data directory to Trash.

All control endpoints accept `?profile=<name>`; the CLI uses `--browser-profile`.

## Chrome existing-session via MCP

Vilaro can also attach to a running Chrome profile through the official
Chrome DevTools MCP server. This reuses the tabs and login state already open in
that Chrome profile.

Official background and setup references:

- [Chrome for Developers: Use Chrome DevTools MCP with your browser session](https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session)
- [Chrome DevTools MCP README](https://github.com/ChromeDevTools/chrome-devtools-mcp)

Built-in profile:

- `user`

Optional: create your own custom existing-session profile if you want a
different name or color.

Then in Chrome:

1. Open `chrome://inspect/#remote-debugging`
2. Enable remote debugging
3. Keep Chrome running and approve the connection prompt when Vilaro attaches

Live attach smoke test:

```bash
vilaro browser --browser-profile user start
vilaro browser --browser-profile user status
vilaro browser --browser-profile user tabs
vilaro browser --browser-profile user snapshot --format ai
```

What success looks like:

- `status` shows `driver: existing-session`
- `status` shows `transport: chrome-mcp`
- `status` shows `running: true`
- `tabs` lists your already-open Chrome tabs
- `snapshot` returns refs from the selected live tab

What to check if attach does not work:

- Chrome is version `144+`
- remote debugging is enabled at `chrome://inspect/#remote-debugging`
- Chrome showed and you accepted the attach consent prompt
- `vilaro doctor` migrates old extension-based browser config and checks that
  Chrome is installed locally with a compatible version, but it cannot enable
  Chrome-side remote debugging for you

Agent use:

- Use `profile="user"` when you need the user’s logged-in browser state.
- If you use a custom existing-session profile, pass that explicit profile name.
- Only choose this mode when the user is at the computer to approve the attach
  prompt.
- the Gateway or node host can spawn `npx chrome-devtools-mcp@latest --autoConnect`

Notes:

- This path is higher-risk than the isolated `vilaro` profile because it can
  act inside your signed-in browser session.
- Vilaro does not launch Chrome for this driver; it attaches to an existing
  session only.
- Vilaro uses the official Chrome DevTools MCP `--autoConnect` flow here, not
  the legacy default-profile remote debugging port workflow.
- Existing-session screenshots support page captures and `--ref` element
  captures from snapshots, but not CSS `--element` selectors.
- Existing-session `wait --url` supports exact, substring, and glob patterns
  like other browser drivers. `wait --load networkidle` is not supported yet.
- Some features still require the managed browser path, such as PDF export and
  download interception.
- Existing-session is host-local. If Chrome lives on a different machine or a
  different network namespace, use remote CDP or a node host instead.

## Isolation guarantees

- **Dedicated user data dir**: never touches your personal browser profile.
- **Dedicated ports**: avoids `9222` to prevent collisions with dev workflows.
- **Deterministic tab control**: target tabs by `targetId`, not “last tab”.

## Browser selection

When launching locally, Vilaro picks the first available:

1. Chrome
2. Brave
3. Edge
4. Chromium
5. Chrome Canary

You can override with `browser.executablePath`.

Platforms:

- macOS: checks `/Applications` and `~/Applications`.
- Linux: looks for `google-chrome`, `brave`, `microsoft-edge`, `chromium`, etc.
- Windows: checks common install locations.

## Control API (optional)

For local integrations only, the Gateway exposes a small loopback HTTP API:

- Status/start/stop: `GET /`, `POST /start`, `POST /stop`
- Tabs: `GET /tabs`, `POST /tabs/open`, `POST /tabs/focus`, `DELETE /tabs/:targetId`
- Snapshot/screenshot: `GET /snapshot`, `POST /screenshot`
- Actions: `POST /navigate`, `POST /act`
- Hooks: `POST /hooks/file-chooser`, `POST /hooks/dialog`
- Downloads: `POST /download`, `POST /wait/download`
- Debugging: `GET /console`, `POST /pdf`
- Debugging: `GET /errors`, `GET /requests`, `POST /trace/start`, `POST /trace/stop`, `POST /highlight`
- Network: `POST /response/body`
- State: `GET /cookies`, `POST /cookies/set`, `POST /cookies/clear`
- State: `GET /storage/:kind`, `POST /storage/:kind/set`, `POST /storage/:kind/clear`
- Settings: `POST /set/offline`, `POST /set/headers`, `POST /set/credentials`, `POST /set/geolocation`, `POST /set/media`, `POST /set/timezone`, `POST /set/locale`, `POST /set/device`

All endpoints accept `?profile=<name>`.

If gateway auth is configured, browser HTTP routes require auth too:

- `Authorization: Bearer <gateway token>`
- `x-vilaro-password: <gateway password>` or HTTP Basic auth with that password

### Playwright requirement

Some features (navigate/act/AI snapshot/role snapshot, element screenshots, PDF) require
Playwright. If Playwright isn’t installed, those endpoints return a clear 501
error. ARIA snapshots and basic screenshots still work for vilaro-managed Chrome.

If you see `Playwright is not available in this gateway build`, install the full
Playwright package (not `playwright-core`) and restart the gateway, or reinstall
Vilaro with browser support.

#### Docker Playwright install

If your Gateway runs in Docker, avoid `npx playwright` (npm override conflicts).
Use the bundled CLI instead:

```bash
docker compose run --rm vilaro-cli \
  node /app/node_modules/playwright-core/cli.js install chromium
```

To persist browser downloads, set `PLAYWRIGHT_BROWSERS_PATH` (for example,
`/home/node/.cache/ms-playwright`) and make sure `/home/node` is persisted via
`VILARO_HOME_VOLUME` or a bind mount. See [Docker](/install/docker).

## How it works (internal)

High-level flow:

- A small **control server** accepts HTTP requests.
- It connects to Chromium-based browsers (Chrome/Brave/Edge/Chromium) via **CDP**.
- For advanced actions (click/type/snapshot/PDF), it uses **Playwright** on top
  of CDP.
- When Playwright is missing, only non-Playwright operations are available.

This design keeps the agent on a stable, deterministic interface while letting
you swap local/remote browsers and profiles.

## CLI quick reference

All commands accept `--browser-profile <name>` to target a specific profile.
All commands also accept `--json` for machine-readable output (stable payloads).

Basics:

- `vilaro browser status`
- `vilaro browser start`
- `vilaro browser stop`
- `vilaro browser tabs`
- `vilaro browser tab`
- `vilaro browser tab new`
- `vilaro browser tab select 2`
- `vilaro browser tab close 2`
- `vilaro browser open https://example.com`
- `vilaro browser focus abcd1234`
- `vilaro browser close abcd1234`

Inspection:

- `vilaro browser screenshot`
- `vilaro browser screenshot --full-page`
- `vilaro browser screenshot --ref 12`
- `vilaro browser screenshot --ref e12`
- `vilaro browser snapshot`
- `vilaro browser snapshot --format aria --limit 200`
- `vilaro browser snapshot --interactive --compact --depth 6`
- `vilaro browser snapshot --efficient`
- `vilaro browser snapshot --labels`
- `vilaro browser snapshot --selector "#main" --interactive`
- `vilaro browser snapshot --frame "iframe#main" --interactive`
- `vilaro browser console --level error`
- `vilaro browser errors --clear`
- `vilaro browser requests --filter api --clear`
- `vilaro browser pdf`
- `vilaro browser responsebody "**/api" --max-chars 5000`

Actions:

- `vilaro browser navigate https://example.com`
- `vilaro browser resize 1280 720`
- `vilaro browser click 12 --double`
- `vilaro browser click e12 --double`
- `vilaro browser type 23 "hello" --submit`
- `vilaro browser press Enter`
- `vilaro browser hover 44`
- `vilaro browser scrollintoview e12`
- `vilaro browser drag 10 11`
- `vilaro browser select 9 OptionA OptionB`
- `vilaro browser download e12 report.pdf`
- `vilaro browser waitfordownload report.pdf`
- `vilaro browser upload /tmp/vilaro/uploads/file.pdf`
- `vilaro browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'`
- `vilaro browser dialog --accept`
- `vilaro browser wait --text "Done"`
- `vilaro browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"`
- `vilaro browser evaluate --fn '(el) => el.textContent' --ref 7`
- `vilaro browser highlight e12`
- `vilaro browser trace start`
- `vilaro browser trace stop`

State:

- `vilaro browser cookies`
- `vilaro browser cookies set session abc123 --url "https://example.com"`
- `vilaro browser cookies clear`
- `vilaro browser storage local get`
- `vilaro browser storage local set theme dark`
- `vilaro browser storage session clear`
- `vilaro browser set offline on`
- `vilaro browser set headers --headers-json '{"X-Debug":"1"}'`
- `vilaro browser set credentials user pass`
- `vilaro browser set credentials --clear`
- `vilaro browser set geo 37.7749 -122.4194 --origin "https://example.com"`
- `vilaro browser set geo --clear`
- `vilaro browser set media dark`
- `vilaro browser set timezone America/New_York`
- `vilaro browser set locale en-US`
- `vilaro browser set device "iPhone 14"`

Notes:

- `upload` and `dialog` are **arming** calls; run them before the click/press
  that triggers the chooser/dialog.
- Download and trace output paths are constrained to Vilaro temp roots:
  - traces: `/tmp/vilaro` (fallback: `${os.tmpdir()}/vilaro`)
  - downloads: `/tmp/vilaro/downloads` (fallback: `${os.tmpdir()}/vilaro/downloads`)
- Upload paths are constrained to an Vilaro temp uploads root:
  - uploads: `/tmp/vilaro/uploads` (fallback: `${os.tmpdir()}/vilaro/uploads`)
- `upload` can also set file inputs directly via `--input-ref` or `--element`.
- `snapshot`:
  - `--format ai` (default when Playwright is installed): returns an AI snapshot with numeric refs (`aria-ref="<n>"`).
  - `--format aria`: returns the accessibility tree (no refs; inspection only).
  - `--efficient` (or `--mode efficient`): compact role snapshot preset (interactive + compact + depth + lower maxChars).
  - Config default (tool/CLI only): set `browser.snapshotDefaults.mode: "efficient"` to use efficient snapshots when the caller does not pass a mode (see [Gateway configuration](/gateway/configuration#browser-vilaro-managed-browser)).
  - Role snapshot options (`--interactive`, `--compact`, `--depth`, `--selector`) force a role-based snapshot with refs like `ref=e12`.
  - `--frame "<iframe selector>"` scopes role snapshots to an iframe (pairs with role refs like `e12`).
  - `--interactive` outputs a flat, easy-to-pick list of interactive elements (best for driving actions).
  - `--labels` adds a viewport-only screenshot with overlayed ref labels (prints `MEDIA:<path>`).
- `click`/`type`/etc require a `ref` from `snapshot` (either numeric `12` or role ref `e12`).
  CSS selectors are intentionally not supported for actions.

## Snapshots and refs

Vilaro supports two “snapshot” styles:

- **AI snapshot (numeric refs)**: `vilaro browser snapshot` (default; `--format ai`)
  - Output: a text snapshot that includes numeric refs.
  - Actions: `vilaro browser click 12`, `vilaro browser type 23 "hello"`.
  - Internally, the ref is resolved via Playwright’s `aria-ref`.

- **Role snapshot (role refs like `e12`)**: `vilaro browser snapshot --interactive` (or `--compact`, `--depth`, `--selector`, `--frame`)
  - Output: a role-based list/tree with `[ref=e12]` (and optional `[nth=1]`).
  - Actions: `vilaro browser click e12`, `vilaro browser highlight e12`.
  - Internally, the ref is resolved via `getByRole(...)` (plus `nth()` for duplicates).
  - Add `--labels` to include a viewport screenshot with overlayed `e12` labels.

Ref behavior:

- Refs are **not stable across navigations**; if something fails, re-run `snapshot` and use a fresh ref.
- If the role snapshot was taken with `--frame`, role refs are scoped to that iframe until the next role snapshot.

## Wait power-ups

You can wait on more than just time/text:

- Wait for URL (globs supported by Playwright):
  - `vilaro browser wait --url "**/dash"`
- Wait for load state:
  - `vilaro browser wait --load networkidle`
- Wait for a JS predicate:
  - `vilaro browser wait --fn "window.ready===true"`
- Wait for a selector to become visible:
  - `vilaro browser wait "#main"`

These can be combined:

```bash
vilaro browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

## Debug workflows

When an action fails (e.g. “not visible”, “strict mode violation”, “covered”):

1. `vilaro browser snapshot --interactive`
2. Use `click <ref>` / `type <ref>` (prefer role refs in interactive mode)
3. If it still fails: `vilaro browser highlight <ref>` to see what Playwright is targeting
4. If the page behaves oddly:
   - `vilaro browser errors --clear`
   - `vilaro browser requests --filter api --clear`
5. For deep debugging: record a trace:
   - `vilaro browser trace start`
   - reproduce the issue
   - `vilaro browser trace stop` (prints `TRACE:<path>`)

## JSON output

`--json` is for scripting and structured tooling.

Examples:

```bash
vilaro browser status --json
vilaro browser snapshot --interactive --json
vilaro browser requests --filter api --json
vilaro browser cookies --json
```

Role snapshots in JSON include `refs` plus a small `stats` block (lines/chars/refs/interactive) so tools can reason about payload size and density.

## State and environment knobs

These are useful for “make the site behave like X” workflows:

- Cookies: `cookies`, `cookies set`, `cookies clear`
- Storage: `storage local|session get|set|clear`
- Offline: `set offline on|off`
- Headers: `set headers --headers-json '{"X-Debug":"1"}'` (legacy `set headers --json '{"X-Debug":"1"}'` remains supported)
- HTTP basic auth: `set credentials user pass` (or `--clear`)
- Geolocation: `set geo <lat> <lon> --origin "https://example.com"` (or `--clear`)
- Media: `set media dark|light|no-preference|none`
- Timezone / locale: `set timezone ...`, `set locale ...`
- Device / viewport:
  - `set device "iPhone 14"` (Playwright device presets)
  - `set viewport 1280 720`

## Security & privacy

- The vilaro browser profile may contain logged-in sessions; treat it as sensitive.
- `browser act kind=evaluate` / `vilaro browser evaluate` and `wait --fn`
  execute arbitrary JavaScript in the page context. Prompt injection can steer
  this. Disable it with `browser.evaluateEnabled=false` if you do not need it.
- For logins and anti-bot notes (X/Twitter, etc.), see [Browser login + X/Twitter posting](/tools/browser-login).
- Keep the Gateway/node host private (loopback or tailnet-only).
- Remote CDP endpoints are powerful; tunnel and protect them.

Strict-mode example (block private/internal destinations by default):

```json5
{
  browser: {
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: false,
      hostnameAllowlist: ["*.example.com", "example.com"],
      allowedHostnames: ["localhost"], // optional exact allow
    },
  },
}
```

## Troubleshooting

For Linux-specific issues (especially snap Chromium), see
[Browser troubleshooting](/tools/browser-linux-troubleshooting).

For WSL2 Gateway + Windows Chrome split-host setups, see
[WSL2 + Windows + remote Chrome CDP troubleshooting](/tools/browser-wsl2-windows-remote-cdp-troubleshooting).

## Agent tools + how control works

The agent gets **one tool** for browser automation:

- `browser` — status/start/stop/tabs/open/focus/close/snapshot/screenshot/navigate/act

How it maps:

- `browser snapshot` returns a stable UI tree (AI or ARIA).
- `browser act` uses the snapshot `ref` IDs to click/type/drag/select.
- `browser screenshot` captures pixels (full page or element).
- `browser` accepts:
  - `profile` to choose a named browser profile (vilaro, chrome, or remote CDP).
  - `target` (`sandbox` | `host` | `node`) to select where the browser lives.
  - In sandboxed sessions, `target: "host"` requires `agents.defaults.sandbox.browser.allowHostControl=true`.
  - If `target` is omitted: sandboxed sessions default to `sandbox`, non-sandbox sessions default to `host`.
  - If a browser-capable node is connected, the tool may auto-route to it unless you pin `target="host"` or `target="node"`.

This keeps the agent deterministic and avoids brittle selectors.
