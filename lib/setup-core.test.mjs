import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVersion, meetsFloor, meetsMinorFloor, normalizeSpaceUrl, mcpServerName,
  mcpCommandArgs, cursorMcpConfig, vscodeMcpConfig, envQuote, envFileContents,
  proxyHostFromEnv, environmentsMatch,
} from './setup-core.mjs';

test('parseVersion handles the v prefix and plain numbers', () => {
  assert.deepEqual(parseVersion('v20.11.1'), { major: 20, minor: 11, patch: 1 });
  assert.deepEqual(parseVersion('25.6.1'), { major: 25, minor: 6, patch: 1 });
  assert.equal(parseVersion('not-a-version'), null);
});

test('meetsFloor compares on major only', () => {
  assert.equal(meetsFloor('v20.0.0', 20), true);
  assert.equal(meetsFloor('v25.6.1', 20), true);
  assert.equal(meetsFloor('v18.20.0', 20), false);
  assert.equal(meetsFloor('garbage', 20), false);
});

test('meetsMinorFloor catches the 20.0–20.5 gap that meetsFloor lets through', () => {
  assert.equal(meetsMinorFloor('v20.6.0', 20, 6), true);
  assert.equal(meetsMinorFloor('v20.19.4', 20, 6), true);
  assert.equal(meetsMinorFloor('v22.0.0', 20, 6), true);
  assert.equal(meetsMinorFloor('v20.5.1', 20, 6), false);
  assert.equal(meetsMinorFloor('v20.0.0', 20, 6), false);
  assert.equal(meetsMinorFloor('v18.20.8', 20, 6), false);
  assert.equal(meetsMinorFloor('garbage', 20, 6), false);
  // The Core track must stay on the major-only floor.
  assert.equal(meetsFloor('v20.5.1', 20), true);
});

test('normalizeSpaceUrl forces https and derives the slug', () => {
  assert.deepEqual(normalizeSpaceUrl('http://acme-dev.kinops.io/'),
    { origin: 'https://acme-dev.kinops.io', slug: 'acme-dev' });
  assert.deepEqual(normalizeSpaceUrl('acme-dev.kinops.io'),
    { origin: 'https://acme-dev.kinops.io', slug: 'acme-dev' });
  assert.deepEqual(normalizeSpaceUrl('https://acme-dev.kinops.io/app/console/#/x'),
    { origin: 'https://acme-dev.kinops.io', slug: 'acme-dev' });
  assert.equal(normalizeSpaceUrl(''), null);
});

test('normalizeSpaceUrl preserves a non-default port', () => {
  assert.deepEqual(normalizeSpaceUrl('https://space.example.com:8443'),
    { origin: 'https://space.example.com:8443', slug: 'space' });
  assert.deepEqual(normalizeSpaceUrl('http://space.example.com:8443/app/'),
    { origin: 'https://space.example.com:8443', slug: 'space' });
});

test('mcpServerName names the environment', () => {
  assert.equal(mcpServerName('acme-dev'), 'kinetic-acme-dev');
});

test('mcpCommandArgs builds an absolute stdio invocation', () => {
  assert.deepEqual(
    mcpCommandArgs('/abs/pg/mcp-server/.env', '/abs/pg/mcp-server/dist/index.js'),
    ['--env-file=/abs/pg/mcp-server/.env', '/abs/pg/mcp-server/dist/index.js', '--stdio'],
  );
});

test('client configs launch node over stdio and carry no credentials', () => {
  const args = mcpCommandArgs('/abs/pg/mcp-server/.env', '/abs/pg/mcp-server/dist/index.js');
  const c = cursorMcpConfig('kinetic-x', args);
  assert.deepEqual(c, { mcpServers: { 'kinetic-x': { command: 'node', args } } });
  const v = vscodeMcpConfig('kinetic-x', args);
  assert.deepEqual(v, { servers: { 'kinetic-x': { type: 'stdio', command: 'node', args } } });
  for (const cfg of [c, v]) {
    const json = JSON.stringify(cfg);
    assert.equal(/password|username|KINETIC_PASSWORD/i.test(json), false);
    assert.equal(json.includes('"url"'), false, 'no hosted http endpoint');
  }
});

test('envQuote picks a quote the value does not contain', () => {
  assert.equal(envQuote('p@ss w0rd'), "'p@ss w0rd'");
  assert.equal(envQuote("has'single"), '"has\'single"');
  assert.equal(envQuote(`has'single and "double"`), '`has\'single and "double"`');
  assert.equal(envQuote(`all ' " \` three`), null);
  // Values that would otherwise be trimmed or cut at a '#' survive.
  assert.equal(envQuote('  pad  '), "'  pad  '");
  assert.equal(envQuote('a#b'), "'a#b'");
});

test('envFileContents writes exactly the three credential vars', () => {
  const body = envFileContents({
    serverUrl: 'https://acme-dev.kinops.io',
    username: 'someone@example.com',
    password: 'not-a-real-password',
  });
  assert.match(body, /^KINETIC_SERVER_URL='https:\/\/acme-dev\.kinops\.io'$/m);
  assert.match(body, /^KINETIC_USERNAME='someone@example\.com'$/m);
  assert.match(body, /^KINETIC_PASSWORD='not-a-real-password'$/m);
  assert.match(body, /NEVER COMMIT THIS FILE/);
  // The mode hint must stay commented out so the default mode applies.
  assert.match(body, /^# KINETIC_MCP_MODE=slim$/m);
  const set = body.split('\n').filter((l) => l && !l.startsWith('#'));
  assert.equal(set.length, 3, 'no fourth variable is set');
});

test('envFileContents refuses a value it cannot quote rather than corrupting the file', () => {
  assert.equal(envFileContents({
    serverUrl: 'https://acme-dev.kinops.io',
    username: 'someone',
    password: `all ' " \` three`,
  }), null);
});

test('proxyHostFromEnv reads REACT_APP_PROXY_HOST', () => {
  assert.equal(proxyHostFromEnv('REACT_APP_PROXY_HOST=https://a.kinopsdev.io\n'), 'https://a.kinopsdev.io');
  assert.equal(proxyHostFromEnv('# comment\nOTHER=1\n'), null);
});

test('environmentsMatch compares hosts, tolerating scheme and slash', () => {
  assert.equal(environmentsMatch('https://a.io', 'http://a.io/'), true);
  assert.equal(environmentsMatch('https://a.io', 'https://b.io'), false);
  assert.equal(environmentsMatch(null, 'https://a.io'), true, 'unknown must not warn');
});
