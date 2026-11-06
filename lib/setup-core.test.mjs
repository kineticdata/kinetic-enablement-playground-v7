import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVersion, meetsFloor, normalizeSpaceUrl, mcpServerName, platformMcpUrl,
  cursorMcpEntry, vscodeMcpEntry, mergeMcpConfig, proxyHostFromEnv,
  portalEnvContents, isPlatformMcpMetadata,
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

test('proxyHostFromEnv reads REACT_APP_PROXY_HOST', () => {
  assert.equal(proxyHostFromEnv('REACT_APP_PROXY_HOST=https://a.kinopsdev.io\n'), 'https://a.kinopsdev.io');
  assert.equal(proxyHostFromEnv('# comment\nOTHER=1\n'), null);
});

test('mcpServerName names the environment the way the platform team does', () => {
  assert.equal(mcpServerName('acme-dev'), 'acme-dev-kinetic');
});

test('platformMcpUrl points at the built-in v7 endpoint', () => {
  assert.equal(platformMcpUrl('https://engineering.kinopsdev.io'),
    'https://engineering.kinopsdev.io/app/platform-ai/mcp');
});

test('client entries are remote HTTP servers and carry no credentials', () => {
  const url = 'https://a.kinops.io/app/platform-ai/mcp';
  assert.deepEqual(cursorMcpEntry(url), { url });
  assert.deepEqual(vscodeMcpEntry(url), { type: 'http', url });
  for (const e of [cursorMcpEntry(url), vscodeMcpEntry(url)]) {
    assert.equal(/password|username|token|secret/i.test(JSON.stringify(e)), false);
  }
});

test('mergeMcpConfig creates a file that does not exist yet', () => {
  const r = mergeMcpConfig(null, 'servers', 'a-kinetic', { type: 'http', url: 'u' });
  assert.equal(r.action, 'write');
  assert.deepEqual(JSON.parse(r.text), { servers: { 'a-kinetic': { type: 'http', url: 'u' } } });
});

test('mergeMcpConfig keeps every other server and setting in the file', () => {
  const existing = JSON.stringify({ inputs: [1], servers: { other: { command: 'x' } } });
  const r = mergeMcpConfig(existing, 'servers', 'a-kinetic', { type: 'http', url: 'u' });
  assert.equal(r.action, 'write');
  assert.deepEqual(JSON.parse(r.text), {
    inputs: [1],
    servers: { other: { command: 'x' }, 'a-kinetic': { type: 'http', url: 'u' } },
  });
});

test('mergeMcpConfig is a no-op on re-run and never overwrites a different entry', () => {
  const entry = { url: 'u' };
  const same = JSON.stringify({ mcpServers: { 'a-kinetic': entry } });
  assert.deepEqual(mergeMcpConfig(same, 'mcpServers', 'a-kinetic', entry), { action: 'same' });
  const other = JSON.stringify({ mcpServers: { 'a-kinetic': { command: 'node' } } });
  assert.deepEqual(mergeMcpConfig(other, 'mcpServers', 'a-kinetic', entry), { action: 'conflict' });
});

test('mergeMcpConfig leaves a file it cannot parse alone', () => {
  assert.deepEqual(mergeMcpConfig('{ // comment\n }', 'servers', 'n', {}), { action: 'unparseable' });
  assert.deepEqual(mergeMcpConfig('[]', 'servers', 'n', {}), { action: 'unparseable' });
  assert.equal(mergeMcpConfig('  ', 'servers', 'n', {}).action, 'write', 'an empty file is fine');
});

test('portalEnvContents round-trips through proxyHostFromEnv', () => {
  const origin = 'https://acme-dev.kinops.io';
  assert.equal(proxyHostFromEnv(portalEnvContents(origin)), origin);
});

test('isPlatformMcpMetadata recognizes a v7 space and nothing else', () => {
  const url = 'https://e.kinopsdev.io/app/platform-ai/mcp';
  // Shape served by a real v7 space.
  assert.equal(isPlatformMcpMetadata({ resource: url, authorization_servers: ['https://e.kinopsdev.io'] }, url), true);
  assert.equal(isPlatformMcpMetadata({ resource: `${url}/` }, url), true);
  assert.equal(isPlatformMcpMetadata({ resource: 'https://other.io/mcp' }, url), false);
  assert.equal(isPlatformMcpMetadata(null, url), false);
});
