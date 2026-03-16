# ClawDock <!-- omit in toc -->

Stop typing `docker-compose` commands. Just type `vilaroock-start`.

Inspired by Simon Willison's [Running Vilaro in Docker](https://til.simonwillison.net/llms/vilaro-docker).

- [Quickstart](#quickstart)
- [Available Commands](#available-commands)
  - [Basic Operations](#basic-operations)
  - [Container Access](#container-access)
  - [Web UI \& Devices](#web-ui--devices)
  - [Setup \& Configuration](#setup--configuration)
  - [Maintenance](#maintenance)
  - [Utilities](#utilities)
- [Common Workflows](#common-workflows)
  - [Check Status and Logs](#check-status-and-logs)
  - [Set Up WhatsApp Bot](#set-up-whatsapp-bot)
  - [Troubleshooting Device Pairing](#troubleshooting-device-pairing)
  - [Fix Token Mismatch Issues](#fix-token-mismatch-issues)
  - [Permission Denied](#permission-denied)
- [Requirements](#requirements)

## Quickstart

**Install:**

```bash
mkdir -p ~/.vilaroock && curl -sL https://raw.githubusercontent.com/vilaro/vilaro/main/scripts/shell-helpers/vilaroock-helpers.sh -o ~/.vilaroock/vilaroock-helpers.sh
```

```bash
echo 'source ~/.vilaroock/vilaroock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

**See what you get:**

```bash
vilaroock-help
```

On first command, ClawDock auto-detects your Vilaro directory:

- Checks common paths (`~/vilaro`, `~/workspace/vilaro`, etc.)
- If found, asks you to confirm
- Saves to `~/.vilaroock/config`

**First time setup:**

```bash
vilaroock-start
```

```bash
vilaroock-fix-token
```

```bash
vilaroock-dashboard
```

If you see "pairing required":

```bash
vilaroock-devices
```

And approve the request for the specific device:

```bash
vilaroock-approve <request-id>
```

## Available Commands

### Basic Operations

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `vilaroock-start`   | Start the gateway               |
| `vilaroock-stop`    | Stop the gateway                |
| `vilaroock-restart` | Restart the gateway             |
| `vilaroock-status`  | Check container status          |
| `vilaroock-logs`    | View live logs (follows output) |

### Container Access

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `vilaroock-shell`          | Interactive shell inside the gateway container |
| `vilaroock-cli <command>`  | Run Vilaro CLI commands                        |
| `vilaroock-exec <command>` | Execute arbitrary commands in the container    |

### Web UI & Devices

| Command                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `vilaroock-dashboard`    | Open web UI in browser with authentication |
| `vilaroock-devices`      | List device pairing requests               |
| `vilaroock-approve <id>` | Approve a device pairing request           |

### Setup & Configuration

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `vilaroock-fix-token` | Configure gateway authentication token (run once) |

### Maintenance

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `vilaroock-rebuild` | Rebuild the Docker image                         |
| `vilaroock-clean`   | Remove all containers and volumes (destructive!) |

### Utilities

| Command               | Description                               |
| --------------------- | ----------------------------------------- |
| `vilaroock-health`    | Run gateway health check                  |
| `vilaroock-token`     | Display the gateway authentication token  |
| `vilaroock-cd`        | Jump to the Vilaro project directory      |
| `vilaroock-config`    | Open the Vilaro config directory          |
| `vilaroock-workspace` | Open the workspace directory              |
| `vilaroock-help`      | Show all available commands with examples |

## Common Workflows

### Check Status and Logs

**Restart the gateway:**

```bash
vilaroock-restart
```

**Check container status:**

```bash
vilaroock-status
```

**View live logs:**

```bash
vilaroock-logs
```

### Set Up WhatsApp Bot

**Shell into the container:**

```bash
vilaroock-shell
```

**Inside the container, login to WhatsApp:**

```bash
vilaro channels login --channel whatsapp --verbose
```

Scan the QR code with WhatsApp on your phone.

**Verify connection:**

```bash
vilaro status
```

### Troubleshooting Device Pairing

**Check for pending pairing requests:**

```bash
vilaroock-devices
```

**Copy the Request ID from the "Pending" table, then approve:**

```bash
vilaroock-approve <request-id>
```

Then refresh your browser.

### Fix Token Mismatch Issues

If you see "gateway token mismatch" errors:

```bash
vilaroock-fix-token
```

This will:

1. Read the token from your `.env` file
2. Configure it in the Vilaro config
3. Restart the gateway
4. Verify the configuration

### Permission Denied

**Ensure Docker is running and you have permission:**

```bash
docker ps
```

## Requirements

- Docker and Docker Compose installed
- Bash or Zsh shell
- Vilaro project (from `docker-setup.sh`)

## Development

**Test with fresh config (mimics first-time install):**

```bash
unset CLAWDOCK_DIR && rm -f ~/.vilaroock/config && source scripts/shell-helpers/vilaroock-helpers.sh
```

Then run any command to trigger auto-detect:

```bash
vilaroock-start
```
