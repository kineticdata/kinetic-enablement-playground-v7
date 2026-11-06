# Onboarding

Welcome to the Kinetic Enablement Playground. This repo is a working portal
you can run against your own Kinetic Platform space, plus an entirely
optional AI layer on top of it.

There are **two independent tracks**:

- **Core track** — clone, run the setup script, start the portal, log in.
  Nothing here touches AI. If you only want to hand-write code against a
  running portal, finish this track and stop.
- **Optional AI track** — connects your AI assistant (Claude Code, Cursor,
  VS Code / Copilot, Codex, Gemini CLI, or any other MCP client) to the MCP
  server built into your v7 space, and adds a skills library that gives it
  working knowledge of the Kinetic Platform. Skip it entirely if you don't use
  an AI assistant.

This playground targets **Kinetic Platform v7**. The portal and the built-in
MCP server both need a v7 space.

Do the Core track first either way — the AI track assumes the portal already
runs.

---

## Prerequisites

Exactly three things, and only three:

1. **git**
2. **Node.js 20 or newer, with yarn** (`corepack enable` will give you yarn
   on a modern Node install, or `npm install -g yarn`).
3. **A text editor**

That's the whole list. You do **not** need Ruby, and you do **not** need
Playwright — nothing in the Core track or the Optional AI track depends on
either. If something you've read elsewhere about Kinetic Platform tooling
mentions them, it doesn't apply here.

---

## Core track

### Step 1 — Clone the repo

```bash
git clone https://github.com/kineticdata/kinetic-enablement-playground-v7.git
cd kinetic-enablement-playground-v7
```

**You should see:** a directory containing, among other things, `setup.sh`,
`setup.cmd`, `portal/`, and this file.

### Step 2 — Run the setup script

macOS / Linux:

```bash
./setup.sh
```

Windows (PowerShell or `cmd.exe`):

```powershell
.\setup.cmd
```

The leading `.\` matters: PowerShell — the default shell in Windows Terminal —
will not run a script from the current directory without it. It is harmless in
`cmd.exe`, so the same command works in either shell.

Both scripts do the same thing, in this order:

1. Check that `git`, `node` and `yarn` are present and Node is version 20
   or newer.
2. Ask its two questions — **both up front**, so you can walk away during
   the slow part:
   - **Your Kinetic space URL** (e.g. `https://your-space.kinops.io`). This
     is the only time you're asked. It's saved to
     `portal/.env.development.local`, which the portal and the AI setup both
     read, so nothing asks for it again — not `yarn start`, and not a re-run
     of setup.
   - **Set up AI tools? [y/N]** For the Core track, answer **N** (or just
     press Enter). The portal doesn't need it. The Optional AI track below
     covers what "y" does.
3. Install the portal's dependencies with `yarn install`. This can take a
   few minutes the first time.

**You should see:** `OK` lines for git, node and yarn, an `OK` line naming
your space, then `Installing portal dependencies`, ending in
`portal dependencies installed`.

You can re-run `./setup.sh` / `.\setup.cmd` at any time — for example to say
"y" to AI tools later. It's safe to repeat: it reuses your saved space URL and
leaves anything already set up alone.

**You should see:** the script finish with `Setup complete.` and a `Next:`
section listing `cd portal` and `yarn start` as two separate commands — run
them one after the other (see Step 3).

### Step 3 — Start the portal

```bash
cd portal
yarn start
```

It connects to the space you gave the setup script — no questions asked.
(If you skipped the setup script, `yarn start` asks for the space URL itself
the first time.)

**You should see:** a `Connecting to Kinetic Platform server:` line naming
your space, then Vite starting up and printing that it's serving at
`http://localhost:3000`.

If port 3000 is already in use on your machine, Vite silently starts on
`3001` (or the next free port) instead — it prints the actual URL it's
using, so read that from the terminal rather than assuming 3000.

To switch to a different space later, delete `portal/.env.development.local`
and re-run the setup script — it will ask for the URL again and set up the
portal and your AI tools for the new space together.

### Step 4 — Log in

Open the URL Vite printed in Step 3 (`http://localhost:3000` unless it had
to fall back to another port) in a browser and log in with credentials for
the space you configured in Step 3.

**You should see:** the Momentum Portal home page, with your username
visible in the header.

That's the Core track. The portal is now running against your space and
you can start editing code in `portal/src`.

**Next: [`docs/FIRST-BUILD.md`](docs/FIRST-BUILD.md)** walks the three-step arc
this playground is built around — run it, change it by hand, then build on it
with an AI assistant. Steps 1 and 2 need no AI tooling at all; only Step 3 uses
the Optional AI track below.

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

It has two independent parts. Answering "y" to **Set up AI tools?** in the
setup script does both for you:

1. **The MCP server** — lets your AI assistant work directly on your space
   (read and create forms, workflows, submissions and so on). It is built
   into every v7 space, so there is nothing to install or run: you point your
   assistant at a URL and sign in.
2. **The skills library** — background knowledge about the Kinetic Platform
   (the API, form engine, workflow XML, integrations, React portal patterns,
   step-by-step recipes) that your assistant reads from files.

### The MCP server

Every v7 space serves an MCP server at:

```
https://<your-space>/app/platform-ai/mcp
```

For example, `https://acme-dev.kinops.io/app/platform-ai/mcp`. It speaks
standard MCP over HTTP and signs you in with OAuth — the same login you use
for the space, in your browser. **No password is stored anywhere in this
repo or in any config file.** Any AI tool that supports remote (HTTP) MCP
servers with OAuth can use it.

#### What setup does for you

When you answer "y", setup:

1. Checks that your space actually offers the server (it needs v7). If it
   doesn't, setup says so and skips the rest — the portal is unaffected.
2. Registers the server in **Claude Code** (if the `claude` CLI is installed),
   by running `claude mcp add` for you.
3. Adds the server to **`.cursor/mcp.json`** (Cursor) and
   **`.vscode/mcp.json`** (VS Code / GitHub Copilot) in this repo. If either
   file already exists, setup adds its one entry and leaves everything else in
   the file alone.

For any other tool, use the instructions below — they only need the URL.

The server is always named **`<space-slug>-kinetic`** — e.g.
`acme-dev-kinetic` for `https://acme-dev.kinops.io`. Naming it after the space
matters once you work with more than one (dev, staging, a customer's space):
every tool call your assistant makes visibly names which space it hit.

#### Connect your AI assistant

Replace `acme-dev` and the URL with your own space in every example below.

**Claude Code**

```bash
claude mcp add --transport http acme-dev-kinetic https://acme-dev.kinops.io/app/platform-ai/mcp
```

Run it from this repo's folder: Claude Code remembers the server for this
project only.

**Cursor** — `.cursor/mcp.json` in this repo:

```json
{
  "mcpServers": {
    "acme-dev-kinetic": {
      "url": "https://acme-dev.kinops.io/app/platform-ai/mcp"
    }
  }
}
```

**VS Code / GitHub Copilot** — `.vscode/mcp.json` in this repo:

```json
{
  "servers": {
    "acme-dev-kinetic": {
      "type": "http",
      "url": "https://acme-dev.kinops.io/app/platform-ai/mcp"
    }
  }
}
```

**Claude Desktop and claude.ai** — Settings → Connectors → **Add custom
connector**, and paste the server URL.

**OpenAI Codex CLI**

```bash
codex mcp add acme-dev-kinetic --url https://acme-dev.kinops.io/app/platform-ai/mcp
codex mcp login acme-dev-kinetic
```

**Gemini CLI**

```bash
gemini mcp add --transport http acme-dev-kinetic https://acme-dev.kinops.io/app/platform-ai/mcp
```

**Windsurf** — add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "acme-dev-kinetic": {
      "serverUrl": "https://acme-dev.kinops.io/app/platform-ai/mcp"
    }
  }
}
```

**Any other MCP client** — if it supports remote HTTP servers, give it the
URL. If it only supports local (stdio) servers, use the `mcp-remote` bridge,
which runs locally, forwards to the URL and handles the browser sign-in:

```json
{
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://acme-dev.kinops.io/app/platform-ai/mcp"]
}
```

These tools change quickly. If a command or setting name above has moved, your
tool's own MCP documentation will have the current one — the URL is the only
Kinetic-specific part.

#### Sign in

The first time your assistant uses the server, it has to sign in. This opens
your browser on your space's login page; sign in as yourself and approve the
access request. You do it once per assistant.

- **Claude Code:** start `claude` in this repo, run `/mcp`, choose
  `<space-slug>-kinetic`, then **Authenticate**.
- **Cursor:** open Settings → MCP; the server shows a sign-in (or "Needs
  login") button.
- **VS Code / Copilot:** open `.vscode/mcp.json` and choose **Start** above
  the server, or just use it from Copilot Chat — VS Code asks you to allow the
  sign-in.
- **Codex:** `codex mcp login <space-slug>-kinetic` (shown above).
- **Gemini CLI:** run `/mcp auth <space-slug>-kinetic` inside Gemini CLI.
- **Others:** most tools start the sign-in on their own the first time they
  connect.

#### Verify it

Ask your assistant something read-only that names the space, for example:

> Using the Kinetic MCP server, list the kapps on my space and tell me which
> space URL you're connected to.

**You should see:** your kapps listed, and your space URL in the answer.

#### Before you create, update, or delete anything

Your assistant signs in **as you**, so it has exactly the access you do —
including deleting things. Before any create, update or delete, confirm which
space it is pointed at: the server name (`<space-slug>-kinetic`) tells you, or
ask it, as in "Verify it" above. This is cheap insurance against changing the
wrong environment.

#### Help improve it

The built-in MCP server is new, and its tool descriptions — what tells your
assistant which tool to use and how — are still being tuned. The more it is
used, the better they get. When your assistant picks the wrong tool,
misunderstands one, or can't find a way to do something you'd expect it to,
please tell the Kinetic team what you asked and what it did.

### The skills library

The skills library ([`kineticdata/kinetic-platform-ai-skills`][skills-repo],
public) works with any AI tool. Get it one of two ways — pick at most one:

**A. Git submodule (`ai-skills/`) — any tool**

```bash
git submodule update --init ai-skills
```

This is what setup does when you answer "y". The skills land in `ai-skills/`,
and the pointer files at the root of this repo lead each tool to them:
`CLAUDE.md` (Claude Code), `AGENTS.md` (Codex and other tools that read it),
`GEMINI.md` (Gemini CLI), `.cursor/rules/kinetic.mdc` (Cursor) and
`.github/copilot-instructions.md` (Copilot).

To get newer skills later, pull this repo and run the command above again.

**B. Claude Code plugin — Claude Code only**

```
/plugin marketplace add kineticdata/kinetic-platform-ai-skills
/plugin install kinetic-platform@kinetic-data
```

No `ai-skills/` folder needed. If you skip both, the MCP server still works —
your assistant just has less Kinetic background knowledge.

[skills-repo]: https://github.com/kineticdata/kinetic-platform-ai-skills

---

## Provenance

This playground was seeded from
[`kineticdata/momentum-portal`](https://github.com/kineticdata/momentum-portal)
at commit `08a26ca`, with the v7 sign-in changes from momentum-portal's
`v7.0.0-rc5` tag ported in (external sign-ins, login banner, forced password
change, password policy, environment banner, and sign-out through the
identity provider).

---

## Troubleshooting

**"Node.js is required but was not found" / setup fails on the Node check**
You need Node 20 or newer. Check with `node --version`. If it's below 20,
install a newer version from https://nodejs.org/ (or via a version manager
like `nvm`/`fnm`) and re-run `./setup.sh` or `.\setup.cmd`.

**`yarn: command not found`**
Run `corepack enable` (bundled with Node 20+) or `npm install -g yarn`,
then re-run the setup script.

**I'm on Windows and `./setup.sh` doesn't work**
That's expected — `./setup.sh` is the macOS/Linux entry point. On Windows, run
`.\setup.cmd` instead, from either PowerShell or `cmd.exe`. The leading `.\` is
required in PowerShell, which does not run scripts from the current directory
without it; if you type bare `setup.cmd` there you'll get "the term 'setup.cmd'
is not recognized". You can also double-click `setup.cmd` in Explorer — the
window stays open at the end so you can read the output.

**Login fails after `yarn start`**
First check the space URL you entered — a typo there (wrong slug, wrong
environment) will make the portal unable to reach your space at all,
which looks like a login failure. If the URL is right, it's a credentials
problem for that specific space, not a portal problem. To re-enter the URL,
delete `portal/.env.development.local` and re-run the setup script.

**The portal isn't at `http://localhost:3000`**
If port 3000 was already in use on your machine, Vite falls back to 3001
(or the next free port) without asking — it prints the URL it actually
picked in the terminal after `yarn start`. Read that line rather than
assuming 3000.

**Setup says the space "does not offer the Platform AI MCP server"**
The space isn't on Kinetic Platform v7 yet, or the URL points somewhere other
than a space. Check the URL in `portal/.env.development.local`. Once the space
is on v7, re-run setup.

**My assistant lists the server but every call fails, or it says "needs
authentication"**
You haven't signed it in yet — see "Sign in" in the Optional AI track. In
Claude Code that's `/mcp`, then choose the server and **Authenticate**.

**`claude` command not found**
That's fine — the Claude Code CLI is only needed if you use Claude Code. Setup
prints the `claude mcp add …` command for you to run later if you install it.
Cursor and VS Code / Copilot are set up either way.
