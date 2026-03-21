---
summary: "CLI reference for `velaro voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `velaro voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
velaro voicecall status --call-id <id>
velaro voicecall call --to "+15555550123" --message "Hello" --mode notify
velaro voicecall continue --call-id <id> --message "Any questions?"
velaro voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
velaro voicecall expose --mode serve
velaro voicecall expose --mode funnel
velaro voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
