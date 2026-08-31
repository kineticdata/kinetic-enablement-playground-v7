// Pure decision logic for setup.mjs. No IO, no platform checks, no dependencies.

export function parseVersion(s) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(s ?? '').trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function meetsFloor(version, floorMajor) {
  const v = parseVersion(version);
  return v !== null && v.major >= floorMajor;
}

export function normalizeSpaceUrl(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (!url.hostname.includes('.')) return null;
  const slug = url.hostname.split('.')[0];
  if (!slug) return null;
  // Always https: the MCP endpoint and OAuth discovery require it.
  return { origin: `https://${url.hostname}`, slug };
}

export function mcpEndpoint(origin) {
  return `${origin.replace(/\/+$/, '')}/app/platform-ai/mcp`;
}

export function mcpServerName(slug) {
  return `kinetic-${slug}`;
}

export function cursorMcpConfig(name, url) {
  return { mcpServers: { [name]: { url } } };
}

export function vscodeMcpConfig(name, url) {
  return { servers: { [name]: { type: 'http', url } } };
}

export function proxyHostFromEnv(contents) {
  const m = /^REACT_APP_PROXY_HOST=(.+)$/m.exec(String(contents ?? ''));
  return m ? m[1].trim() || null : null;
}

export function environmentsMatch(a, b) {
  // An unknown value cannot be a mismatch — never warn on missing information.
  if (!a || !b) return true;
  const host = (v) => {
    const n = normalizeSpaceUrl(v);
    return n ? n.origin : null;
  };
  const ha = host(a);
  const hb = host(b);
  if (!ha || !hb) return true;
  return ha === hb;
}
