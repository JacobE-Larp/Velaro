# HEARTBEAT.md

<!-- ============================================================
OPTIONAL — edit, pre-fill, or delete this file.

This file controls what the agent does on a recurring heartbeat tick
and optionally on startup. Leave it empty (or delete it) to disable
heartbeats entirely. Add task lines to enable recurring behavior.

Velaro checks this file on each heartbeat interval. The default
heartbeat interval is set in your gateway config under:
  agents.defaults.heartbeat.every

Startup message example (uncomment to enable):
  Add a line like the one below to have the agent send a message
  when it first comes online after setup.

FIRST-CONTACT EXAMPLE:
  On the first heartbeat after startup, if no previous session exists,
  send a message to the default channel:
  "I'm online and ready. Here's what I can help you with today."

RECURRING TASK EXAMPLE:
  - Every morning: check for urgent messages and summarize overnight activity.
  - Every week: review memory files and prune anything outdated.

See docs/automation/cron-jobs.md for full heartbeat configuration.
============================================================ -->

# Keep this file empty (or with only comments) to skip heartbeat tasks.
# Add tasks below when you want the agent to check something periodically.
