---
summary: "CLI reference for `velaro webhooks` (webhook helpers + Gmail Pub/Sub)"
read_when:
  - You want to wire Gmail Pub/Sub events into Velaro
  - You want webhook helper commands
title: "webhooks"
---

# `velaro webhooks`

Webhook helpers and integrations (Gmail Pub/Sub, webhook helpers).

Related:

- Webhooks: [Webhook](/automation/webhook)
- Gmail Pub/Sub: [Gmail Pub/Sub](/automation/gmail-pubsub)

## Gmail

```bash
velaro webhooks gmail setup --account you@example.com
velaro webhooks gmail run
```

See [Gmail Pub/Sub documentation](/automation/gmail-pubsub) for details.
