---
summary: "CLI reference for `vilaro voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `vilaro voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
vilaro voicecall status --call-id <id>
vilaro voicecall call --to "+15555550123" --message "Hello" --mode notify
vilaro voicecall continue --call-id <id> --message "Any questions?"
vilaro voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
vilaro voicecall expose --mode serve
vilaro voicecall expose --mode funnel
vilaro voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
