#!/usr/bin/env node
// Cross-platform setup for the Kinetic enablement playground (v7).
// Checks and reports; fixes only what is safe. Zero dependencies. Idempotent.
//
// The shape, top to bottom:
//   1. Check prerequisites (git, node, yarn).
//   2. Ask every question up front — the space URL (once, ever) and whether to
//      set up AI tools — so nobody has to babysit the slow steps for a prompt.
//   3. Do the work: install the portal, then the optional AI pieces.
//   4. Print what to do next.

import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  meetsFloor, normalizeSpaceUrl, mcpServerName, platformMcpUrl,
  cursorMcpEntry, vscodeMcpEntry, mergeMcpConfig, proxyHostFromEnv,
  portalEnvContents, isPlatformMcpMetadata,
} from './lib/setup-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const WIN = process.platform === 'win32';
const NODE_FLOOR = 20;

// The one place the space URL is stored. `yarn start` reads it too, and only
// prompts when it is missing — so the partner is asked exactly once.
const PORTAL_ENV = join(ROOT, 'portal', '.env.development.local');

const remedies = [];

const say = (m) => console.log(m);
const ok = (m) => say(`  OK    ${m}`);
const warn = (m) => say(`  WARN  ${m}`);
const bad = (m, fix) => { say(`  FAIL  ${m}`); remedies.push(fix); };

// `yarn`, `git` and `claude` are .cmd shims on Windows; spawning them without a
// shell fails. With `shell: true` Node does not quote args — it joins them
// into one `cmd.exe /d /s /c` string — so every argument goes through
// `shellArg`, and paths go in via `cwd` rather than as arguments.
function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args.map(shellArg), { encoding: 'utf8', shell: WIN, ...opts });
}

// Inside double quotes cmd.exe stops treating `&`, `^` and parentheses as
// metacharacters, so wrapping is both safe and sufficient. Identity elsewhere.
function shellArg(a) {
  const s = String(a);
  return WIN && /[\s&^()|<>]/.test(s) ? `"${s}"` : s;
}

const have = (cmd) => {
  const r = run(cmd, ['--version']);
  return r.status === 0 ? (r.stdout || '').trim() : null;
};

// ---- Questions: stdin handling -------------------------------------------
// Two very different stdin shapes reach this script:
//   - interactive (a real TTY): on EOF (ctrl-D) rl.question never settles on
//     its own — the interface just emits 'close' — so race the two and treat
//     EOF as '' ("no").
//   - piped (CI, `printf ... | ./setup.sh`): all input arrives as one chunk and
//     readline closes before later questions are asked, so read the whole
//     stream up front and serve answers from it in order ('' once exhausted).
const isTTY = Boolean(process.stdin.isTTY);
const rl = isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null;

let piped = null;
let pipedIndex = 0;

const askTTY = (q) => new Promise((resolve_) => {
  let settled = false;
  const finish = (v) => { if (!settled) { settled = true; resolve_(v); } };
  const onClose = () => finish('');
  rl.once('close', onClose);
  rl.question(q).then((a) => {
    rl.off('close', onClose);
    finish(String(a ?? '').trim());
  }).catch(() => finish(''));
});

const ask = async (q) => {
  if (piped) {
    say(q);
    return (piped[pipedIndex++] ?? '').trim();
  }
  return askTTY(q);
};

const yes = (answer) => answer.toLowerCase().startsWith('y');

say('\nKinetic Enablement Playground — setup\n');

// ---- 1. Prerequisites ------------------------------------------------------
say('Checking prerequisites');

const gitV = have('git');
gitV ? ok(`git ${gitV.replace('git version ', '')}`)
     : bad('git not found', 'Install git: https://git-scm.com/downloads');

const nodeV = process.version;
meetsFloor(nodeV, NODE_FLOOR)
  ? ok(`node ${nodeV}`)
  : bad(`node ${nodeV} is below the v${NODE_FLOOR} floor`,
        `Install Node ${NODE_FLOOR} or newer: https://nodejs.org/`);

const yarnV = have('yarn');
yarnV ? ok(`yarn ${yarnV}`)
      : bad('yarn not found',
            "Install yarn: 'corepack enable' (Node 20+) or 'npm install -g yarn'");

if (remedies.length) {
  say('\nCannot continue until these are resolved:\n');
  remedies.forEach((r, i) => say(`  ${i + 1}. ${r}`));
  process.exit(1);
}

if (!isTTY) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  piped = Buffer.concat(chunks.map((c) => (Buffer.isBuffer(c) ? c : Buffer.from(c))))
    .toString('utf8')
    .split(/\r?\n/);
}

// ---- 2. Questions ------------------------------------------------------------
say('\nYour Kinetic space');

// Asked once, ever: a re-run reuses the saved value instead of asking again.
let space = null;
const savedHost = existsSync(PORTAL_ENV) ? proxyHostFromEnv(readFileSync(PORTAL_ENV, 'utf8')) : null;
if (savedHost && normalizeSpaceUrl(savedHost)) {
  space = normalizeSpaceUrl(savedHost);
  ok(`${space.origin} (saved in portal/.env.development.local — delete that file to change it)`);
} else {
  for (let attempt = 1; !space && attempt <= 3; attempt += 1) {
    space = normalizeSpaceUrl(await ask('  Your Kinetic space URL (e.g. https://your-space.kinops.io): '));
    if (!space) say('  That does not look like a space URL. Try again.');
  }
  if (!space) {
    say('\nNo valid space URL after 3 attempts. Re-run setup when you have it.');
    process.exit(1);
  }
  writeFileSync(PORTAL_ENV, portalEnvContents(space.origin));
  ok(`${space.origin} saved — the portal and your AI tools will both use it`);
}

say('\nOptional: AI tools');
say('  Connects your AI assistant (Claude Code, Cursor, VS Code / Copilot,');
say('  Codex, Gemini CLI, …) to your space and adds the Kinetic skills library.');
say('  The portal works the same either way.\n');
const wantAi = yes(await ask('  Set up AI tools? [y/N] '));

if (rl) await rl.close();

// ---- 3a. Portal --------------------------------------------------------------
say('\nInstalling portal dependencies (this can take a few minutes)');
const install = run('yarn', ['install'], { cwd: join(ROOT, 'portal'), stdio: 'inherit' });
if (install.status !== 0) {
  say('\nyarn install failed. Re-run after resolving the error above.');
  process.exit(1);
}
ok('portal dependencies installed');

// ---- 3b. AI tools (optional) ------------------------------------------------
// Every failure in here is a WARN, never an exit: AI is optional, and the
// portal must still be ready to run at the end.
const mcpUrl = platformMcpUrl(space.origin);
const name = mcpServerName(space.slug);
let mcpReady = false;

if (wantAi) {
  say('\nSetting up AI tools');

  // Skills library: a git submodule that any file-reading assistant can use.
  const skills = run('git', ['submodule', 'update', '--init', 'ai-skills'], { cwd: ROOT, stdio: 'inherit' });
  skills.status === 0
    ? ok('skills library ready (ai-skills/)')
    : warn('skills library download failed — see ONBOARDING.md to retry. The portal is unaffected.');

  // The MCP server is built into every v7 space. Confirm this space has it
  // before pointing any assistant at it: a v7 space names the endpoint in its
  // OAuth metadata; an older space returns 404 there.
  mcpReady = await checkPlatformMcp(space.origin, mcpUrl);

  if (mcpReady) {
    registerClaudeCode();
    writeProjectConfig('Cursor', join(ROOT, '.cursor', 'mcp.json'), 'mcpServers', cursorMcpEntry(mcpUrl));
    writeProjectConfig('VS Code / Copilot', join(ROOT, '.vscode', 'mcp.json'), 'servers', vscodeMcpEntry(mcpUrl));
  }
}

async function checkPlatformMcp(origin, url) {
  try {
    // RFC 9728 path form: the metadata for the MCP endpoint specifically.
    // (The root form, without the path, describes the space as a whole.)
    const res = await fetch(`${origin}/.well-known/oauth-protected-resource${new URL(url).pathname}`,
      { signal: AbortSignal.timeout(15000) });
    const body = res.ok ? await res.json().catch(() => null) : null;
    if (isPlatformMcpMetadata(body, url)) {
      ok(`Platform AI MCP found at ${url}`);
      return true;
    }
    warn(`${origin} does not offer the Platform AI MCP server (it needs a v7 space).`);
    say('        Skipped connecting AI assistants. Re-run setup once the space is on v7.');
  } catch (e) {
    warn(`Could not reach ${origin} to check for the MCP server (${e.cause?.code || e.name}).`);
    say('        Skipped connecting AI assistants. Check the URL and your network, then re-run.');
  }
  return false;
}

// Claude Code keeps its MCP servers in its own config, so run its CLI rather
// than writing a file. Re-running setup must leave a working entry alone.
function registerClaudeCode() {
  const addCmd = `claude mcp add --transport http ${name} ${mcpUrl}`;
  if (!have('claude')) {
    say(`  -     Claude Code not installed. If you install it later, run:\n          ${addCmd}`);
    return;
  }
  const existing = run('claude', ['mcp', 'get', name], { cwd: ROOT });
  if (existing.status === 0) {
    (existing.stdout || '').includes(mcpUrl)
      ? ok(`Claude Code: "${name}" already set up`)
      : warn(`Claude Code: a different server is already named "${name}" — left untouched.`);
    return;
  }
  const r = run('claude', ['mcp', 'add', '--transport', 'http', name, mcpUrl], { cwd: ROOT });
  r.status === 0
    ? ok(`Claude Code: "${name}" added`)
    : warn(`Claude Code: adding the server failed. Run it yourself:\n          ${addCmd}`);
}

// Cursor and VS Code read a per-project file. Add our one entry and keep
// everything else in the file exactly as it was.
function writeProjectConfig(label, file, rootKey, entry) {
  const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
  const result = mergeMcpConfig(current, rootKey, name, entry);
  const rel = file.slice(ROOT.length + 1);
  if (result.action === 'write') {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, result.text);
    ok(`${label}: "${name}" added to ${rel}`);
  } else if (result.action === 'same') {
    ok(`${label}: "${name}" already set up`);
  } else {
    const why = result.action === 'conflict'
      ? `a different server is already named "${name}"`
      : 'the file is not plain JSON';
    warn(`${label}: ${rel} left untouched — ${why}.`);
    say(`        Add this under "${rootKey}" yourself: "${name}": ${JSON.stringify(entry)}`);
  }
}

// ---- 4. Next steps -----------------------------------------------------------
say('\nSetup complete.\n');
say('  Start the portal:');
say('    cd portal');
say('    yarn start');
say(`  It opens at http://localhost:3000, connected to ${space.origin}.`);

if (mcpReady) {
  say('\n  Sign your AI assistant in to your space (once per assistant):');
  say('    Claude Code:        start `claude` here, run /mcp, pick');
  say(`                        "${name}" and choose Authenticate.`);
  say('    Cursor / VS Code:   open this folder; the editor asks you to sign in');
  say('                        the first time it starts the server.');
  say('    Anything else:      see "Other AI tools" in ONBOARDING.md.');
  say(`                        The server URL is ${mcpUrl}`);
}
say('');
