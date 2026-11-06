# Kinetic Platform instructions

This repo is a Kinetic Platform portal (`portal/`) plus an **optional** AI
skills library at `ai-skills/` (an optional git submodule — see
[ONBOARDING.md](../ONBOARDING.md)). The portal runs fine with or without
it.

When working on anything involving the Kinetic Platform — forms,
workflows, connections/operations, security policies, or the platform REST
API — read the relevant skill file(s) under `ai-skills/skills/` first, if
that directory is present and populated. If it's empty or missing, the
submodule simply hasn't been initialized; that's expected, not an error.

## Which space

The Kinetic space this repo targets is `REACT_APP_PROXY_HOST` in
`portal/.env.development.local`. If a Kinetic MCP server is connected, it is
named `<space-slug>-kinetic` and serves that same space at
`/app/platform-ai/mcp`. Before any create, update or delete through it,
confirm which space you are on — say it back to the user if there is any doubt.
