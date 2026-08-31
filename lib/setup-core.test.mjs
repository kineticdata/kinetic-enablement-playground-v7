import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVersion, meetsFloor, normalizeSpaceUrl, mcpEndpoint, mcpServerName,
  cursorMcpConfig, vscodeMcpConfig, proxyHostFromEnv, environmentsMatch,
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
  assert.deepEqual(normalizeSpaceUrl('http://acme-dev.kinopsdev.io/'),
    { origin: 'https://acme-dev.kinopsdev.io', slug: 'acme-dev' });
  assert.deepEqual(normalizeSpaceUrl('acme-dev.kinopsdev.io'),
    { origin: 'https://acme-dev.kinopsdev.io', slug: 'acme-dev' });
  assert.deepEqual(normalizeSpaceUrl('https://acme-dev.kinopsdev.io/app/console/#/x'),
    { origin: 'https://acme-dev.kinopsdev.io', slug: 'acme-dev' });
  assert.equal(normalizeSpaceUrl(''), null);
});

test('normalizeSpaceUrl preserves a non-default port', () => {
  assert.deepEqual(normalizeSpaceUrl('https://space.example.com:8443'),
    { origin: 'https://space.example.com:8443', slug: 'space' });
  assert.deepEqual(normalizeSpaceUrl('http://space.example.com:8443/app/'),
    { origin: 'https://space.example.com:8443', slug: 'space' });
});

test('mcpEndpoint and mcpServerName follow the spec', () => {
  assert.equal(mcpEndpoint('https://acme-dev.kinopsdev.io'),
    'https://acme-dev.kinopsdev.io/app/platform-ai/mcp');
  assert.equal(mcpServerName('acme-dev'), 'kinetic-acme-dev');
});

test('client configs carry only the url and an http transport', () => {
  const c = cursorMcpConfig('kinetic-x', 'https://x/app/platform-ai/mcp');
  assert.deepEqual(c, { mcpServers: { 'kinetic-x': { url: 'https://x/app/platform-ai/mcp' } } });
  const v = vscodeMcpConfig('kinetic-x', 'https://x/app/platform-ai/mcp');
  assert.deepEqual(v, { servers: { 'kinetic-x': { type: 'http', url: 'https://x/app/platform-ai/mcp' } } });
  assert.equal(JSON.stringify(c).includes('password'), false);
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
