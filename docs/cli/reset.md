---
summary: "CLI reference for `velaro reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `velaro reset`

Reset local config/state (keeps the CLI installed).

```bash
velaro backup create
velaro reset
velaro reset --dry-run
velaro reset --scope config+creds+sessions --yes --non-interactive
```

Run `velaro backup create` first if you want a restorable snapshot before removing local state.
