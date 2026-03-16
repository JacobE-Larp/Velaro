---
summary: "CLI reference for `vilaro reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `vilaro reset`

Reset local config/state (keeps the CLI installed).

```bash
vilaro backup create
vilaro reset
vilaro reset --dry-run
vilaro reset --scope config+creds+sessions --yes --non-interactive
```

Run `vilaro backup create` first if you want a restorable snapshot before removing local state.
