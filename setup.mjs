#!/usr/bin/env node
// Cross-platform setup for the Kinetic enablement playground.
// Checks and reports; fixes only what is safe. Zero dependencies. Idempotent.

import { existsSync, writeFileSync, readFileSync, mkdirSync, chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  meetsFloor, meetsMinorFloor, normalizeSpaceUrl, mcpServerName, mcpCommandArgs,
  cursorMcpConfig, vscodeMcpConfig, envFileContents, proxyHostFromEnv,
  environmentsMatch, mcpUpdateResult,
} from './lib/setup-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const WIN = process.platform === 'win32';

// The Core track's Node floor. Deliberately major-only, and deliberately 20:
// the portal needs nothing newer, and AI is optional.
const NODE_FLOOR = 20;
// The optional MCP path additionally needs Node's native `--env-file`, which
// landed in 20.6.0. Checked only when the partner opts in, so a Node 20.0
// machine still completes the Core track.
const MCP_NODE_FLOOR = { major: 20, minor: 6 };

// The MCP server the partner clones and builds locally.
//
// MCP_REF is the single place the cloned ref is named, so pinning the partner
// build to a tag or a specific commit later is a one-line change here rather
// than an edit scattered through the code and the docs.
const MCP_REF = 'main';
const MCP_REPO = 'https://github.com/kineticdata/kinetic-platform-mgnt-mcp-server.git';
const MCP_DIRNAME = 'mcp-server';
const MCP_DIR = join(ROOT, MCP_DIRNAME);
const MCP_ENV = join(MCP_DIR, '.env');
const MCP_ENTRY = join(MCP_DIR, 'dist', 'index.js');

const remedies = [];

const say = (m) => console.log(m);
const ok = (m) => say(`  OK    ${m}`);
const warn = (m) => say(`  WARN  ${m}`);
const bad = (m, fix) => { say(`  FAIL  ${m}`); remedies.push(fix); };

// `yarn`, `npm`, `git` and `claude` are .cmd shims on Windows; spawning them
// without a shell fails.
// NOTE: with `shell: true` Node does not quote args — it concatenates them into
// one `cmd.exe /d /s /c` string. Pass every path-shaped argument through
// `shellArg`, and prefer handing paths in via the `cwd` option (which is not
// part of that string) over passing them as arguments at all.
function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args.map(shellArg), { encoding: 'utf8', shell: WIN, ...opts });
}

// `node` is a real executable everywhere, never a shim, so it needs no shell —
// which means its arguments reach it verbatim, spaces and all.
function runNode(args, opts = {}) {
  return spawnSync(process.execPath, args, { encoding: 'utf8', shell: false, ...opts });
}

// Only meaningful for the `shell: true` (Windows) path above. A Windows path
// cannot contain a literal `"`, and inside double quotes cmd.exe stops treating
// `&`, `^` and parentheses as metacharacters, so wrapping is both safe and
// sufficient. On every other platform this is the identity function.
function shellArg(a) {
  const s = String(a);
  return WIN && /[\s&^()|<>]/.test(s) ? `"${s}"` : s;
}

const have = (cmd) => {
  const r = run(cmd, ['--version']);
  return r.status === 0 ? (r.stdout || '').trim() : null;
};

const shortHeadSha = () => {
  const r = run('git', ['rev-parse', '--short', 'HEAD'], { cwd: MCP_DIR });
  return r.status === 0 ? (r.stdout || '').trim() : null;
};

// Brings an existing mcp-server/ up to MCP_REF without ever discarding local
// work: `git status --porcelain` is checked, and honored, before any network
// call is made. Fetch, then `git merge --ff-only` — never a reset, never a
// force checkout. A failed fetch (offline, auth, GitHub down) is a WARN that
// falls back to the existing checkout, not an abort of setup.
// Returns whether the caller needs to rebuild (npm install + npm run build).
function updateMcpServer() {
  const status = run('git', ['status', '--porcelain'], { cwd: MCP_DIR });
  if (status.status !== 0) {
    warn(`${MCP_DIRNAME}/: could not check git status — skipping update, using the existing checkout.`);
    return false;
  }
  const dirty = Boolean((status.stdout || '').trim());

  let fetchFailed = false;
  let diverged = false;
  let beforeSha = null;
  let afterSha = null;

  if (!dirty) {
    beforeSha = shortHeadSha();
    const fetch = run('git', ['fetch', 'origin'], { cwd: MCP_DIR });
    fetchFailed = fetch.status !== 0;
    if (!fetchFailed) {
      const merge = run('git', ['merge', '--ff-only', `origin/${MCP_REF}`], { cwd: MCP_DIR });
      diverged = merge.status !== 0;
      afterSha = diverged ? beforeSha : shortHeadSha();
    }
  }

  const result = mcpUpdateResult({ dirty, fetchFailed, diverged, beforeSha, afterSha });
  if (result.status === 'skipped' && result.reason === 'dirty') {
    warn(`${MCP_DIRNAME}/ has local edits — skipping update to avoid discarding them.`);
    say(`        Commit or stash your changes in ${MCP_DIRNAME}/, then re-run setup to update.`);
  } else if (result.status === 'skipped' && result.reason === 'fetch-failed') {
    warn(`${MCP_DIRNAME}/: git fetch failed (offline or GitHub unreachable) — continuing with the existing checkout.`);
  } else if (result.status === 'skipped' && result.reason === 'diverged') {
    warn(`${MCP_DIRNAME}/ has diverged from origin/${MCP_REF} and cannot fast-forward — skipping update.`);
    say('        This usually means local commits exist. Resolve by hand (rebase, or a fresh clone), then re-run.');
  } else if (result.status === 'up-to-date') {
    ok(`${MCP_DIRNAME}/ already up to date (${result.sha})`);
  } else if (result.status === 'updated') {
    ok(`${MCP_DIRNAME}/ updated ${result.beforeSha} -> ${result.afterSha}`);
  }
  return result.needsBuild;
}

say('\nKinetic Enablement Playground — setup\n');

// ---- Core track: prerequisites -------------------------------------------
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

// ---- Core track: dependencies -------------------------------------------
say('\nInstalling portal dependencies (this can take a few minutes)');
const install = run('yarn', ['install'], { cwd: join(ROOT, 'portal'), stdio: 'inherit' });
if (install.status !== 0) {
  say('\nyarn install failed. Re-run after resolving the error above.');
  process.exit(1);
}
ok('portal dependencies installed');

// ---- Optional track: AI ---------------------------------------------------
// Two very different stdin shapes reach this script:
//   - interactive (a real TTY): rl.question resolves per keystroke-line as
//     usual, but on EOF (e.g. ctrl-D) its promise never settles on its own —
//     the interface just emits 'close'. Race the question against that event
//     so an EOF answer resolves to '' (treated as "no") instead of hanging
//     until Node's unsettled-top-level-await bailout.
//   - piped/redirected (CI, `printf ... | ./setup.sh`): ALL input arrives as
//     one buffered chunk and readline emits 'close' almost immediately, long
//     before the questions that will consume that input are even asked. The
//     'close' race above would then answer every question after the first
//     with '' regardless of what was piped. So for non-TTY stdin we read the
//     whole stream up front, split it into lines, and serve answers from
//     that array in order — falling back to '' once exhausted, which
//     preserves the same EOF-behaves-as-no property.
const isTTY = Boolean(process.stdin.isTTY);

const rl = isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null;
const askTTY = (q, { trim = true } = {}) => new Promise((resolve_) => {
  let settled = false;
  const finish = (v) => { if (!settled) { settled = true; resolve_(v); } };
  const onClose = () => finish('');
  rl.once('close', onClose);
  rl.question(q).then((a) => {
    const s = String(a ?? '');
    rl.off('close', onClose);
    finish(trim ? s.trim() : s);
  }).catch(() => finish(''));
});

let piped = null;
let pipedIndex = 0;
if (!isTTY) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  piped = Buffer.concat(chunks.map((c) => (Buffer.isBuffer(c) ? c : Buffer.from(c))))
    .toString('utf8')
    .split(/\r?\n/);
}

const ask = async (q) => {
  if (piped) {
    say(q);
    return (piped[pipedIndex++] ?? '').trim();
  }
  return askTTY(q);
};

// A password must not be echoed to the terminal, and must not be trimmed
// either — leading/trailing spaces are legal in a password and the .env writer
// quotes the value so they survive.
//
// `_writeToOutput` is readline's own rendering hook: it is what draws every
// keystroke. Silencing it is the standard way to read a secret with the
// built-in readline. If a future Node drops the hook, say so out loud rather
// than echoing a password while pretending not to.
const askSecret = async (q) => {
  if (piped) {
    say(q);
    return piped[pipedIndex++] ?? '';
  }
  const original = rl._writeToOutput;
  if (typeof original !== 'function') {
    warn('This Node build cannot suppress terminal echo — your password will be visible as you type.');
    return askTTY(q, { trim: false });
  }
  rl._writeToOutput = () => {};
  process.stdout.write(q);
  try {
    return await askTTY('', { trim: false });
  } finally {
    rl._writeToOutput = original;
    process.stdout.write('\n');
  }
};

say('\nOptional: AI assistance');
say('  The skills library and MCP server are entirely optional.');
say('  Answer "n" to both and the portal still runs normally.\n');

const wantSkills = (await ask('  Install the Kinetic AI skills library? [y/N] ')).toLowerCase().startsWith('y');
if (wantSkills) {
  const r = run('git', ['submodule', 'update', '--init', 'ai-skills'], { cwd: ROOT, stdio: 'inherit' });
  r.status === 0 ? ok('ai-skills ready')
                 : warn('ai-skills init failed — the portal is unaffected; see ONBOARDING.md');
} else {
  say('  Skipped. Nothing else depends on it.');
}

const wantMcp = (await ask('\n  Set up the Kinetic MCP server? (clones and builds it locally) [y/N] '))
  .toLowerCase().startsWith('y');
let spaceOrigin = null;

// Every failure inside this block is a WARN that breaks out, never an exit:
// the AI track is optional, so a partner who cannot build the MCP server must
// still finish setup with a working portal.
if (wantMcp) mcpTrack: {
  if (!meetsMinorFloor(nodeV, MCP_NODE_FLOOR.major, MCP_NODE_FLOOR.minor)) {
    warn(`node ${nodeV} cannot load the MCP server's credential file — skipping MCP setup.`);
    say(`        Node's --env-file is native from ${MCP_NODE_FLOOR.major}.${MCP_NODE_FLOOR.minor}.0 onward; on older Node the`);
    say('        process dies on an unknown flag before the server starts. Install a');
    say('        newer Node and re-run. The portal is unaffected and still runs here.');
    break mcpTrack;
  }

  let parsed = null;
  let attempts = 0;
  while (!parsed && attempts < 3) {
    attempts += 1;
    const answer = await ask('  Your Kinetic space URL (e.g. https://your-space.kinopsdev.io): ');
    parsed = normalizeSpaceUrl(answer);
    if (!parsed) say('  That does not look like a space URL. Try again.');
  }
  if (!parsed) {
    warn('No valid space URL given after 3 attempts — skipping MCP setup.');
    break mcpTrack;
  }
  spaceOrigin = parsed.origin;
  const name = mcpServerName(parsed.slug);

  // ---- Clone / update ------------------------------------------------------
  // The server is under active development on MCP_REF, so a re-run must bring
  // an existing checkout up to date rather than leaving a partner on whatever
  // commit they first cloned. `needsBuild` gates the (slow) npm install +
  // build below: a fresh clone always needs it; an update needs it only when
  // the fast-forward actually moved HEAD; "already up to date" and every
  // skip need it not at all.
  let needsBuild;
  if (existsSync(MCP_DIR)) {
    needsBuild = updateMcpServer();
  } else {
    say(`\n  Cloning the MCP server (branch ${MCP_REF})`);
    // Full branch history, not a shallow --depth 1 clone: the update path
    // above relies on ordinary `git fetch` + `git merge --ff-only`, which a
    // shallow clone complicates for no benefit here.
    // The destination is a bare relative name resolved through `cwd`, not an
    // absolute path argument: see the `run` note about Windows arg joining.
    const r = run('git', ['clone', '--single-branch', '--branch', MCP_REF,
      MCP_REPO, MCP_DIRNAME], { cwd: ROOT, stdio: 'inherit' });
    if (r.status !== 0 || !existsSync(MCP_DIR)) {
      warn('git clone failed — skipping the rest of the MCP setup. The portal is unaffected.');
      break mcpTrack;
    }
    ok(`${MCP_DIRNAME}/ cloned (gitignored — it is a local artifact, never committed)`);
    needsBuild = true;
  }

  // ---- Credentials -------------------------------------------------------
  // These go into mcp-server/.env at mode 0600 and nowhere else: not into a
  // client config, not into the terminal, not into git.
  if (existsSync(MCP_ENV)) {
    ok(`${MCP_DIRNAME}/.env already exists — left untouched`);
  } else {
    say(`\n  Credentials for ${spaceOrigin}. They are written only to`);
    say(`  ${MCP_DIRNAME}/.env with mode 0600 — never to an MCP client config.`);
    const username = await ask('  Kinetic username: ');
    const password = await askSecret('  Kinetic password (not shown as you type): ');
    if (!username || !password) {
      warn(`No credentials given — ${MCP_DIRNAME}/.env not written.`);
      say(`        Copy ${MCP_DIRNAME}/.env.example to ${MCP_DIRNAME}/.env, fill it in, then re-run.`);
    } else {
      const body = envFileContents({ serverUrl: spaceOrigin, username, password });
      if (body === null) {
        // Node's --env-file has no escape sequence inside quotes, so a value
        // containing all three quote characters cannot be represented.
        warn("That password cannot be represented in a .env file (it contains ', \" and ` all three).");
        say(`        Write ${MCP_DIRNAME}/.env by hand, then re-run.`);
      } else {
        try {
          writeFileSync(MCP_ENV, body, { mode: 0o600, flag: 'wx' });
          try { chmodSync(MCP_ENV, 0o600); } catch { /* chmod is a no-op on Windows */ }
          ok(`${MCP_DIRNAME}/.env written, mode 0600${WIN ? ' (POSIX modes do not apply on Windows)' : ''}`);
        } catch (e) {
          warn(`Could not write ${MCP_DIRNAME}/.env: ${e.code || e.message}`);
        }
      }
    }
  }

  // ---- Build -------------------------------------------------------------
  // Only rebuild when something actually changed (fresh clone or a real
  // fast-forward update): re-running npm install/build on every setup run
  // for an unchanged checkout is wasted minutes for no effect.
  let built = false;
  if (!needsBuild && existsSync(MCP_ENTRY)) {
    built = true;
    ok('MCP server build unchanged — skipping npm install/build');
  } else {
    if (!needsBuild) {
      // Safety net: nothing changed, but dist/index.js is missing anyway
      // (e.g. an interrupted earlier build) — build rather than leave it broken.
      warn(`${join(MCP_DIRNAME, 'dist', 'index.js')} is missing — building anyway.`);
    }
    say('\n  Building the MCP server (npm install, then npm run build)');
    const npmInstall = run('npm', ['install'], { cwd: MCP_DIR, stdio: 'inherit' });
    if (npmInstall.status !== 0) {
      warn(`npm install failed in ${MCP_DIRNAME}/ — see the output above.`);
    } else {
      const build = run('npm', ['run', 'build'], { cwd: MCP_DIR, stdio: 'inherit' });
      if (build.status !== 0) {
        warn(`npm run build failed in ${MCP_DIRNAME}/ — see the output above.`);
      } else if (!existsSync(MCP_ENTRY)) {
        warn(`build finished but ${join(MCP_DIRNAME, 'dist', 'index.js')} is missing.`);
      } else {
        built = true;
        ok('MCP server built');
      }
    }
  }
  if (!built) {
    say('        MCP client configs were not written — fix the build and re-run setup');
    say('        to finish. Nothing in the portal depends on this.');
    break mcpTrack;
  }

  // ---- Client configuration ----------------------------------------------
  // Both paths are absolute on purpose: a relative --env-file resolves against
  // the MCP client's working directory, not the server's, and silently loads
  // nothing at all.
  const args = mcpCommandArgs(MCP_ENV, MCP_ENTRY);
  const manual = ['node', ...args].join(' ');

  // Claude Code: run the real command rather than printing it.
  // `claude mcp add` exits 1 with "already exists" on a second run, so probe
  // first and treat an existing registration as success — re-running setup
  // must leave a working config untouched, not print a false WARN plus a
  // manual remedy that fails the same way.
  if (have('claude')) {
    const registered = () => run('claude', ['mcp', 'get', name], { cwd: ROOT }).status === 0;
    if (registered()) {
      ok(`Claude Code server "${name}" already configured — left untouched`);
    } else {
      const r = run('claude', ['mcp', 'add', name, '--', 'node', ...args], { cwd: ROOT, stdio: 'inherit' });
      if (r.status === 0 || registered()) {
        ok(`Claude Code server "${name}" added`);
      } else {
        warn(`claude mcp add failed. Run manually:\n          claude mcp add ${name} -- ${manual}`);
      }
    }
  } else {
    say(`  Claude Code CLI not found. If you use it later, run:\n          claude mcp add ${name} -- ${manual}`);
  }

  // Cursor and Copilot read files; write them without clobbering.
  const targets = [
    { file: join(ROOT, '.cursor', 'mcp.json'), body: cursorMcpConfig(name, args), label: 'Cursor' },
    { file: join(ROOT, '.vscode', 'mcp.json'), body: vscodeMcpConfig(name, args), label: 'Copilot / VS Code' },
  ];
  for (const t of targets) {
    if (existsSync(t.file)) {
      warn(`${t.label} config already exists — left untouched (${t.file})`);
      say(`        Add the server by hand if it is missing there: ${name} -> ${manual}`);
      continue;
    }
    mkdirSync(dirname(t.file), { recursive: true });
    writeFileSync(t.file, JSON.stringify(t.body, null, 2) + '\n');
    ok(`${t.label} config written (no credentials in it)`);
  }

  say('\n  Tool surface: the default "consolidated" mode covers every platform');
  say('  operation with one tool per resource family, dispatched by `action`');
  say('  (and `object` where a family spans objects). Other modes trade that');
  say('  off differently — `slim` is a small generic surface, `contexts` is');
  say('  one tool per operation, `full` is the legacy surface with every');
  say('  operation under both its historical names.');
  say(`  To change it, set KINETIC_MCP_MODE in ${MCP_DIRNAME}/.env. The exact`);
  say('  tool count for your mode is printed by the smoke test just below.');

  // ---- Verify ------------------------------------------------------------
  // The server ships its own read-only smoke test. Run it rather than
  // inventing a check here, and show the partner its PASS/FAIL lines.
  if (existsSync(MCP_ENV)) {
    say(`\n  Verifying against ${spaceOrigin} — the server's own read-only smoke test`);
    const r = runNode([`--env-file=${MCP_ENV}`, join('scripts', 'smoke-test.js')],
      { cwd: MCP_DIR, stdio: 'inherit' });
    if (r.status === 0) {
      ok('MCP smoke test passed — the server can read your space');
    } else {
      warn('MCP smoke test did not pass — read the PASS/FAIL lines above.');
      say(`        Re-run it any time:  node --env-file=${MCP_ENV} scripts/smoke-test.js`);
      say(`        (from ${MCP_DIRNAME}/. Most failures are a wrong space URL or password in .env.)`);
    }
  } else {
    say(`  Smoke test skipped — ${MCP_DIRNAME}/.env is missing. Fill it in and re-run setup.`);
  }
}

if (rl) await rl.close();

// ---- Cross-config consistency (does not take ownership) ------------------
const envFile = join(ROOT, 'portal', '.env.development.local');
const portalHost = existsSync(envFile) ? proxyHostFromEnv(readFileSync(envFile, 'utf8')) : null;
if (spaceOrigin && !environmentsMatch(portalHost, spaceOrigin)) {
  warn(`The portal targets ${portalHost} but MCP targets ${spaceOrigin}.`);
  say('        That mismatch is usually a mistake. Fix portal/.env.development.local if unintended.');
}

// ---- Next steps ----------------------------------------------------------
say('\nSetup complete.\n');
if (spaceOrigin) say(`  MCP environment: ${spaceOrigin}`);
say('  Next:');
say('    cd portal');
say('    yarn start');
say('  You will be prompted for your Kinetic space URL on first start,');
say('  then the portal opens at http://localhost:3000\n');
