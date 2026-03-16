---
summary: "Run Vilaro in a rootless Podman container"
read_when:
  - You want a containerized gateway with Podman instead of Docker
title: "Podman"
---

# Podman

Run the Vilaro gateway in a **rootless** Podman container. Uses the same image as Docker (build from the repo [Dockerfile](https://github.com/vilaro/vilaro/blob/main/Dockerfile)).

## Requirements

- Podman (rootless)
- Sudo for one-time setup (create user, build image)

## Quick start

**1. One-time setup** (from repo root; creates user, builds image, installs launch script):

```bash
./setup-podman.sh
```

This also creates a minimal `~vilaro/.vilaro/vilaro.json` (sets `gateway.mode="local"`) so the gateway can start without running the wizard.

By default the container is **not** installed as a systemd service, you start it manually (see below). For a production-style setup with auto-start and restarts, install it as a systemd Quadlet user service instead:

```bash
./setup-podman.sh --quadlet
```

(Or set `VILARO_PODMAN_QUADLET=1`; use `--container` to install only the container and launch script.)

Optional build-time env vars (set before running `setup-podman.sh`):

- `VILARO_DOCKER_APT_PACKAGES` — install extra apt packages during image build
- `VILARO_EXTENSIONS` — pre-install extension dependencies (space-separated extension names, e.g. `diagnostics-otel matrix`)

**2. Start gateway** (manual, for quick smoke testing):

```bash
./scripts/run-vilaro-podman.sh launch
```

**3. Onboarding wizard** (e.g. to add channels or providers):

```bash
./scripts/run-vilaro-podman.sh launch setup
```

Then open `http://127.0.0.1:18789/` and use the token from `~vilaro/.vilaro/.env` (or the value printed by setup).

## Systemd (Quadlet, optional)

If you ran `./setup-podman.sh --quadlet` (or `VILARO_PODMAN_QUADLET=1`), a [Podman Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) unit is installed so the gateway runs as a systemd user service for the vilaro user. The service is enabled and started at the end of setup.

- **Start:** `sudo systemctl --machine vilaro@ --user start vilaro.service`
- **Stop:** `sudo systemctl --machine vilaro@ --user stop vilaro.service`
- **Status:** `sudo systemctl --machine vilaro@ --user status vilaro.service`
- **Logs:** `sudo journalctl --machine vilaro@ --user -u vilaro.service -f`

The quadlet file lives at `~vilaro/.config/containers/systemd/vilaro.container`. To change ports or env, edit that file (or the `.env` it sources), then `sudo systemctl --machine vilaro@ --user daemon-reload` and restart the service. On boot, the service starts automatically if lingering is enabled for vilaro (setup does this when loginctl is available).

To add quadlet **after** an initial setup that did not use it, re-run: `./setup-podman.sh --quadlet`.

## The vilaro user (non-login)

`setup-podman.sh` creates a dedicated system user `vilaro`:

- **Shell:** `nologin` — no interactive login; reduces attack surface.
- **Home:** e.g. `/home/vilaro` — holds `~/.vilaro` (config, workspace) and the launch script `run-vilaro-podman.sh`.
- **Rootless Podman:** The user must have a **subuid** and **subgid** range. Many distros assign these automatically when the user is created. If setup prints a warning, add lines to `/etc/subuid` and `/etc/subgid`:

  ```text
  vilaro:100000:65536
  ```

  Then start the gateway as that user (e.g. from cron or systemd):

  ```bash
  sudo -u vilaro /home/vilaro/run-vilaro-podman.sh
  sudo -u vilaro /home/vilaro/run-vilaro-podman.sh setup
  ```

- **Config:** Only `vilaro` and root can access `/home/vilaro/.vilaro`. To edit config: use the Control UI once the gateway is running, or `sudo -u vilaro $EDITOR /home/vilaro/.vilaro/vilaro.json`.

## Environment and config

- **Token:** Stored in `~vilaro/.vilaro/.env` as `VILARO_GATEWAY_TOKEN`. `setup-podman.sh` and `run-vilaro-podman.sh` generate it if missing (uses `openssl`, `python3`, or `od`).
- **Optional:** In that `.env` you can set provider keys (e.g. `GROQ_API_KEY`, `OLLAMA_API_KEY`) and other Vilaro env vars.
- **Host ports:** By default the script maps `18789` (gateway) and `18790` (bridge). Override the **host** port mapping with `VILARO_PODMAN_GATEWAY_HOST_PORT` and `VILARO_PODMAN_BRIDGE_HOST_PORT` when launching.
- **Gateway bind:** By default, `run-vilaro-podman.sh` starts the gateway with `--bind loopback` for safe local access. To expose on LAN, set `VILARO_GATEWAY_BIND=lan` and configure `gateway.controlUi.allowedOrigins` (or explicitly enable host-header fallback) in `vilaro.json`.
- **Paths:** Host config and workspace default to `~vilaro/.vilaro` and `~vilaro/.vilaro/workspace`. Override the host paths used by the launch script with `VILARO_CONFIG_DIR` and `VILARO_WORKSPACE_DIR`.

## Storage model

- **Persistent host data:** `VILARO_CONFIG_DIR` and `VILARO_WORKSPACE_DIR` are bind-mounted into the container and retain state on the host.
- **Ephemeral sandbox tmpfs:** if you enable `agents.defaults.sandbox`, the tool sandbox containers mount `tmpfs` at `/tmp`, `/var/tmp`, and `/run`. Those paths are memory-backed and disappear with the sandbox container; the top-level Podman container setup does not add its own tmpfs mounts.
- **Disk growth hotspots:** the main paths to watch are `media/`, `agents/<agentId>/sessions/sessions.json`, transcript JSONL files, `cron/runs/*.jsonl`, and rolling file logs under `/tmp/vilaro/` (or your configured `logging.file`).

`setup-podman.sh` now stages the image tar in a private temp directory and prints the chosen base dir during setup. For non-root runs it accepts `TMPDIR` only when that base is safe to use; otherwise it falls back to `/var/tmp`, then `/tmp`. The saved tar stays owner-only and is streamed into the target user’s `podman load`, so private caller temp dirs do not block setup.

## Useful commands

- **Logs:** With quadlet: `sudo journalctl --machine vilaro@ --user -u vilaro.service -f`. With script: `sudo -u vilaro podman logs -f vilaro`
- **Stop:** With quadlet: `sudo systemctl --machine vilaro@ --user stop vilaro.service`. With script: `sudo -u vilaro podman stop vilaro`
- **Start again:** With quadlet: `sudo systemctl --machine vilaro@ --user start vilaro.service`. With script: re-run the launch script or `podman start vilaro`
- **Remove container:** `sudo -u vilaro podman rm -f vilaro` — config and workspace on the host are kept

## Troubleshooting

- **Permission denied (EACCES) on config or auth-profiles:** The container defaults to `--userns=keep-id` and runs as the same uid/gid as the host user running the script. Ensure your host `VILARO_CONFIG_DIR` and `VILARO_WORKSPACE_DIR` are owned by that user.
- **Gateway start blocked (missing `gateway.mode=local`):** Ensure `~vilaro/.vilaro/vilaro.json` exists and sets `gateway.mode="local"`. `setup-podman.sh` creates this file if missing.
- **Rootless Podman fails for user vilaro:** Check `/etc/subuid` and `/etc/subgid` contain a line for `vilaro` (e.g. `vilaro:100000:65536`). Add it if missing and restart.
- **Container name in use:** The launch script uses `podman run --replace`, so the existing container is replaced when you start again. To clean up manually: `podman rm -f vilaro`.
- **Script not found when running as vilaro:** Ensure `setup-podman.sh` was run so that `run-vilaro-podman.sh` is copied to vilaro’s home (e.g. `/home/vilaro/run-vilaro-podman.sh`).
- **Quadlet service not found or fails to start:** Run `sudo systemctl --machine vilaro@ --user daemon-reload` after editing the `.container` file. Quadlet requires cgroups v2: `podman info --format '{{.Host.CgroupsVersion}}'` should show `2`.

## Optional: run as your own user

To run the gateway as your normal user (no dedicated vilaro user): build the image, create `~/.vilaro/.env` with `VILARO_GATEWAY_TOKEN`, and run the container with `--userns=keep-id` and mounts to your `~/.vilaro`. The launch script is designed for the vilaro-user flow; for a single-user setup you can instead run the `podman run` command from the script manually, pointing config and workspace to your home. Recommended for most users: use `setup-podman.sh` and run as the vilaro user so config and process are isolated.
