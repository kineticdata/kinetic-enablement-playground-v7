# Onboarding

Welcome to the Kinetic Enablement Playground. This repo is a working portal
you can run against your own Kinetic Platform space, plus an entirely
optional AI layer on top of it.

There are **two independent tracks**:

- **Core track** — clone, run the setup script, start the portal, log in.
  Nothing here touches AI. If you only want to hand-write code against a
  running portal, finish this track and stop.
- **Optional AI track** — a skills library, plus an MCP server you clone and
  build locally, that together give an AI coding assistant (Claude Code,
  Cursor, etc.) working knowledge of your Kinetic space. Skip it entirely if
  you don't use one.

Do the Core track first either way — the AI track assumes the portal already
runs.

---

## Prerequisites

Exactly three things, and only three:

1. **git**
2. **Node.js 20 or newer, with yarn** (`corepack enable` will give you yarn
   on a modern Node install, or `npm install -g yarn`). The Optional AI
   track's MCP server needs **20.6.0** or newer — see that section. The Core
   track does not.
3. **A text editor**

That's the whole list. You do **not** need Ruby, and you do **not** need
Playwright — nothing in the Core track or the Optional AI track depends on
either. If something you've read elsewhere about Kinetic Platform tooling
mentions them, it doesn't apply here.

---

## Core track

### Step 1 — Clone the repo

```bash
git clone https://github.com/kineticdata/kinetic-enablement-playground.git
cd kinetic-enablement-playground
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

Both scripts do the same thing: they check that `git`, `node`, and `yarn`
are present and that Node meets the version 20 floor, then install the
portal's dependencies with `yarn install`. That install step can take a
few minutes the first time.

**You should see:** a `Checking prerequisites` section with `OK` lines for
git, node, and yarn, followed by `Installing portal dependencies`, ending
in `portal dependencies installed`.

After that, the script asks two yes/no questions about optional AI
features (installing the skills library, setting up the MCP server). For
the Core track, answer **N** (or just press Enter) to both — the portal
does not need either. The Optional AI track below covers what those
questions do if you want to come back and say yes later; you can also just
re-run `./setup.sh` / `.\setup.cmd` at any time, since it's idempotent.

**You should see:** the script finish with `Setup complete.` and a `Next:`
section listing `cd portal` and `yarn start` as two separate commands — run
them one after the other (see Step 3).

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

This is what `./setup.sh` / `.\setup.cmd` does for you if you answer "y" to
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

### Setting up the MCP server

The MCP server is a small Node program you clone and build on your own
machine. It talks to your space over the platform's REST API and speaks MCP
over stdio to your AI assistant — nothing is hosted, and nothing runs unless
your assistant starts it.

If you answered "y" to the MCP question in Step 2, `./setup.sh` /
`.\setup.cmd` already did all of this for you. The steps are written out here
so you know what it did, and so you can do it by hand if you prefer.

**Node 20.6.0 or newer is required for this track only.** The server's
credentials are loaded with Node's built-in `--env-file`, which landed in
20.6.0. The Core track's floor stays at Node 20 — the portal needs nothing
newer, and this whole track is optional. Check with `node --version`.

#### 1. Clone and build it

Every command in this section starts from the root of this repo (the
directory holding `setup.sh` and `ONBOARDING.md`) and ends back there.

```bash
git clone https://github.com/kineticdata/kinetic-platform-mgnt-mcp-server.git mcp-server
cd mcp-server
npm install
npm run build
cd ..
```

The same five commands work verbatim in PowerShell and `cmd.exe`.

`mcp-server/` is gitignored. It is a per-partner local artifact — never
commit it.

#### 2. Give it credentials

The server reads your space URL, username and password from
`mcp-server/.env`. Create it from the template the server ships:

macOS / Linux:

```bash
cd mcp-server
cp .env.example .env
chmod 600 .env
cd ..
```

Windows (PowerShell or `cmd.exe`) — there is no `chmod`; NTFS file
permissions are inherited from the directory instead:

```powershell
cd mcp-server
copy .env.example .env
cd ..
```

Then edit `mcp-server/.env` so these three lines hold your real values:

```
KINETIC_SERVER_URL=https://your-space.kinopsdev.io
KINETIC_USERNAME=your-username
KINETIC_PASSWORD=your-password
```

Leave every other line commented out — the defaults are what you want.

The setup script writes this file for you (prompting for the username and
password, and not echoing the password back), with mode `0600` so only your
user account can read it. POSIX modes do not apply on Windows, so there the
file is only as protected as the directory it sits in.

> **Never commit this file, and never put credentials in an MCP client
> config.** `mcp-server/` as a whole is in this repo's `.gitignore`, and the
> server's own repo gitignores `.env`, so you are covered by default — but
> the rule matters if you ever move the file. Credentials belong in
> `mcp-server/.env` and nowhere else. Run `git status` after setup and
> confirm you see nothing about `mcp-server` or `.env`.

#### 3. Point your AI assistant at it

Every client runs the same command. **Both paths must be absolute:**

```
node --env-file=<abs-path>/mcp-server/.env <abs-path>/mcp-server/dist/index.js --stdio
```

where `<abs-path>` is the absolute path to this repo on your machine (`pwd`
prints it on macOS/Linux; `cd` with no arguments prints it in `cmd.exe`).

A **relative** `--env-file` path resolves against the *MCP client's* working
directory, not the server's, and silently loads nothing — you get a server
that starts, lists its tools, and then fails every call. Absolute paths only.

- **Claude Code:**

  ```bash
  claude mcp add kinetic-<your-space-slug> -- node --env-file=<abs-path>/mcp-server/.env <abs-path>/mcp-server/dist/index.js --stdio
  ```

- **Cursor:** `.cursor/mcp.json`

  ```json
  {
    "mcpServers": {
      "kinetic-<your-space-slug>": {
        "command": "node",
        "args": [
          "--env-file=<abs-path>/mcp-server/.env",
          "<abs-path>/mcp-server/dist/index.js",
          "--stdio"
        ]
      }
    }
  }
  ```

- **VS Code / Copilot:** `.vscode/mcp.json`, same shape but the top-level key
  is `servers` and each entry adds `"type": "stdio"`.

Notice that no credential appears in any of those — only a path to the file
that holds them.

(The setup script never overwrites an existing `.cursor/mcp.json` or
`.vscode/mcp.json` — if one was already there, you'll see a `WARN` naming the
file it left alone, followed by the command to add there yourself. Re-running
setup is safe either way: an existing `.env` and a Claude Code server that is
already registered are each reported and left untouched. `mcp-server/` itself
is the one exception — a re-run brings it up to date; see "Updating" below.)

The server is registered under the name **`kinetic-<space-slug>`** — e.g.
`kinetic-acme-dev` for `https://acme-dev.kinopsdev.io` — never a generic
name like `kinetic`. This matters once you're working across more than one
environment (dev, staging, a partner's space): every tool call your AI
assistant makes visibly names which environment it hit, so you can't
mistake a dev-space result for a prod-space one.

#### 4. Verify it

The server ships its own read-only smoke test. It must be run from inside
`mcp-server/`, and `--env-file` must still be absolute:

```bash
cd mcp-server
node --env-file=<abs-path>/mcp-server/.env scripts/smoke-test.js
cd ..
```

It performs a real MCP handshake, lists the tools, and makes a couple of
read-only calls against your space. It writes nothing and prints no
credentials.

**You should see:** a short list of `PASS` lines ending in `ALL PASSED`. The
setup script runs this for you at the end and reports the result. A `FAIL`
here is almost always a wrong space URL, username or password in
`mcp-server/.env`.

### Updating

The MCP server is under active development, so re-run `./setup.sh` (or
`.\setup.cmd`) any time to bring `mcp-server/` up to the latest commit on its
`main` branch. If it actually moved, setup rebuilds it for you (`npm
install`, then `npm run build`) and re-runs the smoke test; if nothing
changed upstream, it says so and does not reinstall or rebuild — a re-run
with nothing to do is fast.

**Local edits block the update, by design.** If you've poked at the server
code, the update is skipped rather than risking your work — you'll see a
`WARN` naming the reason:

- *Local edits* — `git status` inside `mcp-server/` found uncommitted
  changes. Commit or `git stash` them, then re-run setup from the repo root.
- *Diverged* — your local `mcp-server/` has commits `origin/main` doesn't
  (e.g. you committed locally). Setup only ever fast-forwards, never resets
  or force-checks-out; resolve by hand (rebase, or delete and re-clone if you
  don't need the local commits) and re-run.
- *Fetch failed* — offline, no GitHub auth, or GitHub is down. Setup warns
  and continues with the existing checkout rather than aborting; the rest of
  setup (and an already-working MCP server) is unaffected.

`mcp-server/.env` is never touched by any of this — it's gitignored inside
the server's own repo, so git fetch/merge leave it alone.

This is a **different mechanism from the AI skills library.** That's a
pinned git submodule (`ai-skills/`), so you get newer skills by pulling
*this* repo and re-running setup's submodule step — not through the MCP
server's update path above. See "Two ways to get the skills library" above;
don't confuse the two update paths.

### The tool surface

The default mode, `consolidated`, covers every platform API operation with
one tool per resource family — `forms`, `submissions`, `kapps`, `users`,
`teams`, `workflows`, `attribute_definitions`, and so on — and you choose the
operation with an `action` parameter, plus an `object` parameter for the
families that span several Kinetic objects:

```json
{ "action": "list" }                                          // forms
{ "action": "get", "identifier": "service-portal" }           // kapps
{ "object": "form", "action": "list", "kappSlug": "services" } // attribute_definitions
```

Three things worth knowing:

- **`identifier` is the canonical key.** Every tool that can address a single
  record accepts `identifier`, so you never have to remember whether this
  particular resource calls its key `formSlug`, `submissionId`, `slug` or
  `name`. A submission id, a kapp slug, a team name and a form slug all go in
  `identifier`.
- **`object` is optional when it's unambiguous.** If only one object supports
  the action you asked for, leave `object` out and the server infers it. When
  several could apply, the error names exactly which ones.
- **Scope is not identity.** A form is identified by its slug *within* a kapp,
  so fetching one needs `identifier` **and** `kappSlug`.

The default mode is deliberately well under **Cursor's ~40-tool ceiling**;
`contexts` and `full` are not, so they need trimming there. If you run
several MCP servers at once and are near the limit in aggregate, switch to
the smallest surface by adding this to `mcp-server/.env`:

```
KINETIC_MCP_MODE=slim
```

The four modes, all of which can reach every operation:

| Mode | Surface | Notes |
| --- | --- | --- |
| `consolidated` | Default | One tool per resource family, dispatched by `action`/`object`. |
| `slim` | Smallest | A small generic surface; everything reached through generic tools that fetch the API spec and execute arbitrary requests. |
| `contexts` | Granular | One tool per individual API operation. |
| `full` | Legacy | Every operation under both its historical names. **Do not use in Cursor** — it exceeds the tool limit. |

Exact tool counts are not listed here because they change as the server
evolves — restating them here is exactly the kind of drift this doc should
not own. Two places always have the current number:

- **The server itself**, at startup, to stderr: `kinetic-platform-mcp:
  mode=consolidated, N tools` (illustrative — `N` is whatever the running
  server reports). The verify step above runs the server's own smoke test,
  which surfaces this line for you.
- **The server's own README**, which carries the current mode table:
  https://github.com/kineticdata/kinetic-platform-mgnt-mcp-server#readme

### Before you create, update, or delete anything

The credentials in `mcp-server/.env` are your own, so your AI assistant has
exactly the access you do — including destructive calls. There is no
read-only mode.

Combined with the multi-environment naming above: **confirm which space you
are pointed at before any create/update/delete call.** The cheapest way is a
read-only call whose answer names the environment — e.g. the `kapps` tool
with `action: "list"` — or just re-read `KINETIC_SERVER_URL` in
`mcp-server/.env`. This is cheap insurance against an AI assistant mutating
the wrong environment.

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
problem for that specific space, not a portal problem. Delete
`portal/.env.development.local` and run `yarn start` again if you need to
re-enter the URL.

**The portal isn't at `http://localhost:3000`**
If port 3000 was already in use on your machine, Vite falls back to 3001
(or the next free port) without asking — it prints the URL it actually
picked in the terminal after `yarn start`. Read that line rather than
assuming 3000.

**`claude` command not found when setting up MCP**
That's fine — the Claude Code CLI is only needed if you use Claude Code.
`./setup.sh` / `.\setup.cmd` will detect it's missing and print the
`claude mcp add …` command for you to run later if you install it; Cursor
and VS Code/Copilot configs are written either way.

**The MCP step was skipped with a Node version warning**
`--env-file`, which loads `mcp-server/.env`, is native Node 20.6.0 and newer.
On older Node the process dies on an unknown flag before the server starts,
so setup skips the MCP track rather than leaving you a config that cannot
work. Install a newer Node and re-run — the portal is unaffected and keeps
working on Node 20.

**The MCP server starts but every call fails**
Almost always a relative `--env-file` path. It resolves against your MCP
client's working directory, not `mcp-server/`, so the file is never found and
no credentials are loaded — the server still starts and still lists its
tools, which is why this looks like an auth problem rather than a path
problem. Use absolute paths in the client config. Then confirm the
credentials themselves with the smoke test:
`node --env-file=<abs-path>/mcp-server/.env scripts/smoke-test.js` from
`mcp-server/`.

**Cursor complains about too many tools**
The default `consolidated` mode is deliberately well under Cursor's ~40-tool
ceiling, so this only happens if you run other MCP servers alongside it or
set `KINETIC_MCP_MODE=contexts`/`full`. Set `KINETIC_MCP_MODE=slim` in
`mcp-server/.env` for the smallest surface that still reaches every
operation.
