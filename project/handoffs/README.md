# Handoffs

Session handoffs live here: `YYYY-MM-DD-<task>.md`, using `.agents/templates/handoff.md`.

Write one when:

- The session reaches ~60% of the context window.
- You stop mid-task and another session will continue.
- A parallel agent needs to take over.

A good handoff is five fields: state, decisions, next action, open questions, relevant files. No narrative.

Do not commit local scratch handoffs if they contain sensitive data; `.gitignore` excludes `*.local.md`.
