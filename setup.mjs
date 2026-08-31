#!/usr/bin/env node
// Cross-platform setup for the Kinetic enablement playground.
// Checks and reports; fixes only what is safe. Zero dependencies. Idempotent.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  meetsFloor, normalizeSpaceUrl, mcpEndpoint, mcpServerName,
  cursorMcpConfig, vscodeMcpConfig, proxyHostFromEnv, environmentsMatch,
} from './lib/setup-core.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const NODE_FLOOR = 20;
const WIN = process.platform === 'win32';
const remedies = [];

const say = (m) => console.log(m);
const ok = (m) => say(`  OK    ${m}`);
const warn = (m) => say(`  WARN  ${m}`);
const bad = (m, fix) => { say(`  FAIL  ${m}`); remedies.push(fix); };

// `yarn` and `claude` are .cmd shims on Windows; spawning them without a shell fails.
// NOTE: with `shell: true` Node does not quote args — it concatenates them into one
// `cmd.exe /d /s /c` string. Every arg passed here is metacharacter-free by
// construction (literals, or hostname-legal text from `new URL()`), and `cwd` is
// passed as an option rather than inlined. Keep it that way: adding a *path*
// argument here would break on any Windows clone path containing a space.
function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', shell: WIN, ...opts });
}
const have = (cmd) => {
  const r = run(cmd, ['--version']);
  return r.status === 0 ? (r.stdout || '').trim() : null;
};

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
const askTTY = (q) => new Promise((resolve) => {
  let settled = false;
  const onClose = () => { if (!settled) { settled = true; resolve(''); } };
  rl.once('close', onClose);
  rl.question(q).then((a) => {
    if (!settled) { settled = true; rl.off('close', onClose); resolve(String(a ?? '').trim()); }
  }).catch(() => { if (!settled) { settled = true; resolve(''); } });
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

const wantMcp = (await ask('\n  Connect the Kinetic MCP server? [y/N] ')).toLowerCase().startsWith('y');
let spaceOrigin = null;
if (wantMcp) {
  let parsed = null;
  let attempts = 0;
  while (!parsed && attempts < 3) {
    attempts += 1;
    const answer = await ask('  Your Kinetic space URL (e.g. https://your-space.kinopsdev.io): ');
    parsed = normalizeSpaceUrl(answer);
    if (!parsed) say('  That does not look like a space URL. Try again.');
  }
  if (!parsed) {
    warn('No valid space URL given after 3 attempts — skipping MCP wiring.');
  } else {
  spaceOrigin = parsed.origin;
  const endpoint = mcpEndpoint(parsed.origin);
  const name = mcpServerName(parsed.slug);

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
      const r = run('claude', ['mcp', 'add', '--transport', 'http', name, endpoint], { cwd: ROOT, stdio: 'inherit' });
      if (r.status === 0) {
        ok(`Claude Code server "${name}" added — run /mcp inside Claude Code to sign in`);
      } else if (registered()) {
        ok(`Claude Code server "${name}" already configured — left untouched`);
      } else {
        warn(`claude mcp add failed. Run manually:\n          claude mcp add --transport http ${name} ${endpoint}`);
      }
    }
  } else {
    say(`  Claude Code CLI not found. If you use it later, run:\n          claude mcp add --transport http ${name} ${endpoint}`);
  }

  // Cursor and Copilot read files; write them without clobbering.
  const targets = [
    { file: join(ROOT, '.cursor', 'mcp.json'), body: cursorMcpConfig(name, endpoint), label: 'Cursor' },
    { file: join(ROOT, '.vscode', 'mcp.json'), body: vscodeMcpConfig(name, endpoint), label: 'Copilot / VS Code' },
  ];
  for (const t of targets) {
    if (existsSync(t.file)) {
      warn(`${t.label} config already exists — left untouched (${t.file})`);
      say(`        Add the server by hand if it is missing there: ${name} -> ${endpoint}`);
      continue;
    }
    mkdirSync(dirname(t.file), { recursive: true });
    writeFileSync(t.file, JSON.stringify(t.body, null, 2) + '\n');
    ok(`${t.label} config written`);
  }

  say(`\n  Only these 11 tools are needed; disable the rest in your client:`);
  say('    get_context, get_api_spec, execute_api, list_kapps, list_forms,');
  say('    get_form, search_submissions, get_submission, list_trees, get_tree, list_errors');
  say('  Cursor errors above ~40 enabled tools, and this server exposes 79.');
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
