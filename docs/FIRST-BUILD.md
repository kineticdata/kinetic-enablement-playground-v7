# Your First Build

Three small steps, in order. Each one should take a few minutes. By the end
you'll have run the portal against your own space, changed it by hand, and
used an AI assistant to create a real form and workflow on your space.

This assumes you've already finished the Core track in
[`ONBOARDING.md`](../ONBOARDING.md) — the portal is cloned, `yarn install`
has run, and you have a space URL to point it at.

---

## Step 1 — Run it

Start the dev server and confirm it's talking to your space.

```bash
cd portal
yarn start
```

The first run prompts you for your Kinetic Platform space URL — enter it,
then open the URL Vite prints in the terminal (usually
`http://localhost:3000`; if 3000 is already taken on your machine, Vite
picks the next free port and prints that instead).

**Confirm it worked:**

- Log in with credentials for the space you entered.
- You land on the portal home page with your name in the header
  ("Hello, `<your name>`") and a **Submit a Request** button.

If login fails, see the Troubleshooting section of `ONBOARDING.md` — it's
almost always either a typo in the space URL or a credentials problem for
that specific space.

---

## Step 2 — Change it by hand

No tools beyond your editor for this step. The goal is to see your own edit
show up in the running portal without restarting anything.

Open:

```
portal/src/pages/home/Home.jsx
```

Find line 41 — inside the primary button on the home page:

```jsx
<button
  type="button"
  className="kbtn kbtn-primary kbtn-xl flex-1"
  onClick={() => openSearch()}
>
  Submit a Request
</button>
```

Change the button's text, `Submit a Request`, to anything you like — e.g.
`Start a Request`. Save the file.

**Confirm it worked:** switch back to the browser tab with the portal open.
You should see the button's label change within a second or two, with no
manual page reload — that's Vite's hot reload picking up your edit.

(That button only appears at desktop widths. If your browser window is
narrow enough to trigger the mobile layout, widen it before looking for the
button.)

---

## Step 3 — Build with AI

This step uses whatever AI coding assistant you set up in the Optional AI
track of `ONBOARDING.md` — Claude Code, Cursor, Copilot, or another MCP
client. The instructions below are plain intent, not a slash command, so
they work the same way regardless of which tool you're using.

Open a chat with your assistant in this repo and paste:

> Create a new Kinetic form on my space for a simple time off request. It
> should collect the employee's name, start date, end date, and reason.
> Add an approval step so that after someone submits the form, it's routed
> to a manager for approval, and the request isn't considered approved
> until the manager approves it.

Your assistant will use the Kinetic MCP server's tools to build the form
and its approval workflow directly on your space (in Claude Code, likely
tools like `create_form` and `create_form_workflow` directly; in Cursor,
where only 11 tools are enabled, the same result via `execute_api` against
the platform's REST API) — this isn't a mockup or a code sample, it is
**incremental seeding**: real platform artifacts (a form, a workflow)
created from a plain-English description. Expect it to ask clarifying
questions along the way (who approves, what happens on denial) — answer
those the same way you'd brief a teammate.

**Confirm it worked:** ask your assistant to show you the new form (or run
`get_context` / `list_forms` yourself if you're driving the MCP tools
directly) and confirm it exists on the space you expect — not a different
one. Then submit a test request through it and confirm the approval step
appears in the approver's queue.

That's the full arc: run it, hand-edit it, and build on it with AI. From
here, `ONBOARDING.md`'s Orientation section points at the READMEs worth
reading next.
