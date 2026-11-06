# Kinetic Enablement Playground

A working Kinetic Platform v7 portal for partners to clone, run against their
own space, and learn from — with an optional AI layer on top of it: your
space's built-in MCP server, connected to the AI assistant of your choice, and
a skills library.

Start here: **[ONBOARDING.md](ONBOARDING.md)** — prerequisites, setup, and the
two independent tracks (Core, plus an optional AI layer).

Then: **[docs/FIRST-BUILD.md](docs/FIRST-BUILD.md)** — the three-step arc this
playground is built around: run the portal, change it by hand, then build on it
with an AI assistant. Steps 1 and 2 need no AI tooling.

## Running the tests

The setup script's pure logic has unit tests, with no framework to install:

```bash
node --test lib/setup-core.test.mjs
```

## Provenance

Seeded from [`kineticdata/momentum-portal`](https://github.com/kineticdata/momentum-portal)
at commit `08a26ca`, with the sign-in changes from its `v7.0.0-rc5` tag
ported in.

This is a teaching sandbox, not a fork we intend to keep in sync with
momentum-portal. Expect it to diverge over time as it's shaped around
onboarding rather than production use.
