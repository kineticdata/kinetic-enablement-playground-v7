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
      : bad('yarn not found', 'Install yarn: npm install -g yarn');

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
const rl = createInterface({ input: process.stdin, output: process.stdout });
// On EOF (piped/closed stdin) rl.question's promise never settles on its own
// in current Node — the interface just emits 'close'. Race the question
// against that event so an EOF answer resolves to '' (treated as "no")
// instead of hanging until Node's unsettled-top-level-await bailout.
const ask = (q) => new Promise((resolve) => {
  let settled = false;
  const onClose = () => { if (!settled) { settled = true; resolve(''); } };
  rl.once('close', onClose);
  rl.question(q).then((a) => {
    if (!settled) { settled = true; rl.off('close', onClose); resolve(String(a ?? '').trim()); }
  }).catch(() => { if (!settled) { settled = true; resolve(''); } });
});

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
  if (have('claude')) {
    const r = run('claude', ['mcp', 'add', '--transport', 'http', name, endpoint], { cwd: ROOT, stdio: 'inherit' });
    r.status === 0
      ? ok(`Claude Code server "${name}" added — run /mcp inside Claude Code to sign in`)
      : warn(`claude mcp add failed. Run manually:\n          claude mcp add --transport http ${name} ${endpoint}`);
  } else {
    say(`  Claude Code CLI not found. If you use it later, run:\n          claude mcp add --transport http ${name} ${endpoint}`);
  }

  // Cursor and Copilot read files; write them without clobbering.
  const targets = [
    { file: join(ROOT, '.cursor', 'mcp.json'), body: cursorMcpConfig(name, endpoint), label: 'Cursor' },
    { file: join(ROOT, '.vscode', 'mcp.json'), body: vscodeMcpConfig(name, endpoint), label: 'Copilot / VS Code' },
  ];
  for (const t of targets) {
    if (existsSync(t.file)) { warn(`${t.label} config already exists — left untouched (${t.file})`); continue; }
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

await rl.close();

// ---- Cross-config consistency (does not take ownership) ------------------
const envFile = join(ROOT, 'portal', '.env.development.local');
const portalHost = existsSync(envFile) ? proxyHostFromEnv(readFileSync(envFile, 'utf8')) : null;
if (spaceOrigin && !environmentsMatch(portalHost, spaceOrigin)) {
  warn(`the portal targets ${portalHost} but MCP targets ${spaceOrigin}.`);
  say('        That mismatch is usually a mistake. Fix portal/.env.development.local if unintended.');
}

// ---- Next steps ----------------------------------------------------------
say('\nSetup complete.\n');
if (spaceOrigin) say(`  MCP environment: ${spaceOrigin}`);
say('  Next:');
say('    cd portal && yarn start');
say('  You will be prompted for your Kinetic space URL on first start,');
say('  then the portal opens at http://localhost:3000\n');
