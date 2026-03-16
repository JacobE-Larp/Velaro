---
summary: "CLI reference for `vilaro logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `vilaro logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
vilaro logs
vilaro logs --follow
vilaro logs --json
vilaro logs --limit 500
vilaro logs --local-time
vilaro logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
