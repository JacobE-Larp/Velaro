---
summary: "CLI reference for `velaro browser` (profiles, tabs, actions, Chrome MCP, and CDP)"
read_when:
  - You use `velaro browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to attach to your local signed-in Chrome via Chrome MCP
title: "browser"
---

# `velaro browser`

Manage Velaro’s browser control server and run browser actions (tabs, snapshots, screenshots, navigation, clicks, typing).

Related:

- Browser tool + API: [Browser tool](/tools/browser)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout (ms).
- `--browser-profile <name>`: choose a browser profile (default from config).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
velaro browser profiles
velaro browser --browser-profile velaro start
velaro browser --browser-profile velaro open https://example.com
velaro browser --browser-profile velaro snapshot
```

## Profiles

Profiles are named browser routing configs. In practice:

- `velaro`: launches or attaches to a dedicated Velaro-managed Chrome instance (isolated user data dir).
- `user`: controls your existing signed-in Chrome session via Chrome DevTools MCP.
- custom CDP profiles: point at a local or remote CDP endpoint.

```bash
velaro browser profiles
velaro browser create-profile --name work --color "#FF5A36"
velaro browser create-profile --name chrome-live --driver existing-session
velaro browser delete-profile --name work
```

Use a specific profile:

```bash
velaro browser --browser-profile work tabs
```

## Tabs

```bash
velaro browser tabs
velaro browser open https://docs.vilaro.ai
velaro browser focus <targetId>
velaro browser close <targetId>
```

## Snapshot / screenshot / actions

Snapshot:

```bash
velaro browser snapshot
```

Screenshot:

```bash
velaro browser screenshot
```

Navigate/click/type (ref-based UI automation):

```bash
velaro browser navigate https://example.com
velaro browser click <ref>
velaro browser type <ref> "hello"
```

## Existing Chrome via MCP

Use the built-in `user` profile, or create your own `existing-session` profile:

```bash
velaro browser --browser-profile user tabs
velaro browser create-profile --name chrome-live --driver existing-session
velaro browser --browser-profile chrome-live tabs
```

This path is host-only. For Docker, headless servers, Browserless, or other remote setups, use a CDP profile instead.

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway will proxy browser actions to that node (no separate browser control server required).

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)
