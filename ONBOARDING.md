# Onboarding

Welcome to the Kinetic Enablement Playground. This repo is a working portal
you can run against your own Kinetic Platform space, plus an entirely
optional AI layer on top of it.

There are **two independent tracks**:

- **Core track** — clone, run the setup script, start the portal, log in.
  Nothing here touches AI. If you only want to hand-write code against a
  running portal, finish this track and stop.
- **Optional AI track** — a skills library and an MCP server that give an AI
  coding assistant (Claude Code, Cursor, etc.) working knowledge of the
  Kinetic Platform. Skip it entirely if you don't use one.

Do the Core track first either way — the AI track assumes the portal already
runs.

---

## Prerequisites

Exactly three things, and only three:

1. **git**
2. **Node.js 20 or newer, with yarn** (`corepack enable` will give you yarn
   on a modern Node install, or `npm install -g yarn`)
3. **A text editor**

That's the whole list. You do **not** need Ruby, and you do **not** need
Playwright — nothing in the Core track or the Optional AI track depends on
either. If something you've read elsewhere about Kinetic Platform tooling
mentions them, it doesn't apply here.

---

## Core track

### Step 1 — Clone the repo

```bash
git clone <this-repo-url>
cd <repo-directory>
```

**You should see:** a directory containing, among other things, `setup.sh`,
`setup.cmd`, `portal/`, and this file.

### Step 2 — Run the setup script

macOS / Linux:

```bash
./setup.sh
```

Windows:

```cmd
setup.cmd
```

Both scripts do the same thing: they check that `git`, `node`, and `yarn`
are present and that Node meets the version 20 floor, then install the
portal's dependencies with `yarn install`. That install step can take a
few minutes the first time.

**You should see:** a `Checking prerequisites` section with `OK` lines for
git, node, and yarn, followed by `Installing portal dependencies`, ending
in `portal dependencies installed`.

After that, the script asks two yes/no questions about optional AI
features (installing the skills library, connecting the MCP server). For
the Core track, answer **N** (or just press Enter) to both — the portal
does not need either. The Optional AI track below covers what those
questions do if you want to come back and say yes later; you can also just
re-run `./setup.sh` / `setup.cmd` at any time, since it's idempotent.

**You should see:** the script finish with `Setup complete.` and a `Next:`
section telling you to run `cd portal && yarn start`.

### Step 3 — Start the portal

```bash
cd portal
yarn start
```

The first time you run this, it prompts you for the URL of the Kinetic
Platform space you want the portal to connect to (e.g.
`https://your-space.kinopsdev.io`). This happens automatically via
`portal/src/setupEnv.cjs` — you never hand-edit an env file yourself.

**You should see:** a prompt asking for your Kinetic Platform server URL,
then Vite starting up and printing that it's serving at
`http://localhost:3000`.

If port 3000 is already in use on your machine, Vite silently starts on
`3001` (or the next free port) instead — it prints the actual URL it's
using, so read that from the terminal rather than assuming 3000.

If you need to change the space later, delete
`portal/.env.development.local` and run `yarn start` again to be re-prompted.

### Step 4 — Log in

Open the URL Vite printed in Step 3 (`http://localhost:3000` unless it had
to fall back to another port) in a browser and log in with credentials for
the space you configured in Step 3.

**You should see:** the Momentum Portal home page, with your username
visible in the header.

That's the Core track. The portal is now running against your space and
you can start editing code in `portal/src`.

---

## Orientation

A few README files worth reading before you dig into the portal code:

- [`portal/README.md`](portal/README.md) — the portal's own quick start,
  included libraries, and project structure.
- [`portal/src/atoms/README.md`](portal/src/atoms/README.md) — the atom
  component layer (styled building blocks like `Menu`, `Modal`, `Button`).
- [`portal/src/components/kinetic-form/widgets/README.md`](portal/src/components/kinetic-form/widgets/README.md) —
  how to use and build widgets embedded inside Kinetic forms.

If you're only doing the Core track, you're done — everything past this
point is optional AI tooling.

---

## Optional AI track

This track is additive. Nothing in it changes how the portal runs, and
nothing in the Core track depends on it.

### Two ways to get the skills library — pick at most one

The skills library ([`kineticdata/kinetic-platform-ai-skills`][skills-repo],
public, 63 skills covering the API, form engine, workflow XML,
integrations, security policies, React portal patterns, and step-by-step
recipes) is available two ways. Use whichever fits your tool, or neither:

**A. Git submodule (`ai-skills/`)**

Already wired into this repo as a submodule at `ai-skills/`, tracking the
`main` branch over HTTPS (no SSH keys needed). It ships alongside the repo
but starts uninitialized — clone doesn't pull it in.

```bash
git submodule update --init ai-skills
```

This is what `./setup.sh` / `setup.cmd` does for you if you answer "y" to
the skills-library question in Step 2. This route works for any tool that
reads files from the filesystem (Cursor, Copilot, plain file search), and
it's what the root pointer files below (`CLAUDE.md`, `AGENTS.md`,
`.cursor/rules/kinetic.mdc`, `.github/copilot-instructions.md`) point at.

**B. Claude Code plugin**

The same library ships a `.claude-plugin/plugin.json` (plugin name
`kinetic-platform`) and marketplace manifest, so if you use Claude Code you
can install it as a plugin instead of the submodule — no clone step, no
`ai-skills/` directory in your working tree:

```
/plugin marketplace add kineticdata/kinetic-platform-ai-skills
/plugin install kinetic-platform@kinetic-data
```

Neither route is required. If you skip both, the AI assistant just won't
have Kinetic-specific skills loaded — everything else in this track still
works.

### Connecting the MCP server

The Kinetic Platform exposes an MCP server directly from your space —
nothing to install, nothing to run locally. The server lives at:

```
<your-space-url>/app/platform-ai/mcp
```

That URL is the entire configuration. Authentication is OAuth 2.0 with
dynamic client registration and PKCE — the first time you use it, your
client opens a browser for you to sign in; there's no API key or secret to
copy anywhere.

If you answered "y" to the MCP question in Step 2, `./setup.sh` /
`setup.cmd` already registered it for you:

- **Claude Code:** ran `claude mcp add --transport http kinetic-<your-space-slug> <endpoint>` directly.
- **Cursor:** wrote `.cursor/mcp.json`.
- **VS Code / Copilot:** wrote `.vscode/mcp.json`.

(It never overwrites an existing config for these files — if one was
already there, you'll see a `WARN` telling you to wire it up by hand.)

The server is registered under the name **`kinetic-<space-slug>`** — e.g.
`kinetic-acme-dev` for `https://acme-dev.kinopsdev.io` — never a generic
name like `kinetic`. This matters once you're working across more than one
environment (dev, staging, a partner's space): every tool call your AI
assistant makes visibly names which environment it hit, so you can't
mistake a dev-space result for a prod-space one.

In Claude Code, run `/mcp` to trigger the browser sign-in for a server
that's configured but not yet authenticated.

### The 11-tool allowlist

The server exposes **79 tools** in total. That's fine for Claude Code, but
**Cursor errors above roughly 40 enabled tools** — so for Cursor, enabling
only a subset isn't a nice-to-have, it's required for the server to work
at all.

Enable only these 11:

```
get_context, get_api_spec, execute_api, list_kapps, list_forms, get_form,
search_submissions, get_submission, list_trees, get_tree, list_errors
```

and disable the other 68 in your client's MCP tool settings. You lose
nothing by doing this: `execute_api` combined with `get_api_spec` can reach
every endpoint the platform exposes, so the remaining 68 tools are
convenience wrappers around calls those two can already make.

### Before you create, update, or delete anything

OAuth for this server grants **`full` scope** — there is no read-only
scope on offer. Once you're connected, your AI assistant has write access
to your space, including destructive calls like `update_form` and
`delete_tree`.

Combined with the multi-environment naming above: **run `get_context`
first** in any session, before any create/update/delete call, to confirm
which space you're actually talking to. This is cheap insurance against an
AI assistant mutating the wrong environment.

[skills-repo]: https://github.com/kineticdata/kinetic-platform-ai-skills

---

## Provenance

This playground was seeded from
[`kineticdata/momentum-portal`](https://github.com/kineticdata/momentum-portal)
at commit `08a26ca`, which carries a public-space 401 auth fix required by
current platform versions.

---

## Troubleshooting

**"Node.js is required but was not found" / setup fails on the Node check**
You need Node 20 or newer. Check with `node --version`. If it's below 20,
install a newer version from https://nodejs.org/ (or via a version manager
like `nvm`/`fnm`) and re-run `./setup.sh` or `setup.cmd`.

**`yarn: command not found`**
Run `corepack enable` (bundled with Node 20+) or `npm install -g yarn`,
then re-run the setup script.

**I'm on Windows and `./setup.sh` doesn't work**
That's expected — `./setup.sh` is the macOS/Linux entry point. On Windows,
run `setup.cmd` instead (double-click it in Explorer, or run it from
`cmd.exe` or PowerShell).

**Login fails after `yarn start`**
First check the space URL you entered — a typo there (wrong slug, wrong
environment) will make the portal unable to reach your space at all,
which looks like a login failure. If the URL is right, it's a credentials
problem for that specific space, not a portal problem. Delete
`portal/.env.development.local` and run `yarn start` again if you need to
re-enter the URL.

**The portal isn't at `http://localhost:3000`**
If port 3000 was already in use on your machine, Vite falls back to 3001
(or the next free port) without asking — it prints the URL it actually
picked in the terminal after `yarn start`. Read that line rather than
assuming 3000.

**`claude` command not found when connecting MCP**
That's fine — the Claude Code CLI is only needed if you use Claude Code.
`./setup.sh` / `setup.cmd` will detect it's missing and print the
`claude mcp add …` command for you to run later if you install it; Cursor
and VS Code/Copilot configs are written either way.
