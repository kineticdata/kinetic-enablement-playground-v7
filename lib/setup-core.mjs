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

// The Core track's floor is a major version, so `meetsFloor` is enough for it.
// Node's `--env-file` landed in 20.6.0, so the optional MCP path needs a
// minor-aware comparison — v20.5.1 clears the major-only check and still dies
// with an unknown-flag error.
export function meetsMinorFloor(version, floorMajor, floorMinor) {
  const v = parseVersion(version);
  if (v === null) return false;
  if (v.major !== floorMajor) return v.major > floorMajor;
  return v.minor >= floorMinor;
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
  // Always https: KINETIC_SERVER_URL must not send credentials over plain http.
  return { origin: `https://${url.host}`, slug };
}

export function mcpServerName(slug) {
  return `kinetic-${slug}`;
}

// The MCP server is a local stdio process. Both paths must be absolute: a
// relative `--env-file` resolves against the MCP *client's* working directory,
// not the server's, and silently loads nothing.
export function mcpCommandArgs(envFilePath, entryPath) {
  return [`--env-file=${envFilePath}`, entryPath, '--stdio'];
}

export function cursorMcpConfig(name, args) {
  return { mcpServers: { [name]: { command: 'node', args } } };
}

export function vscodeMcpConfig(name, args) {
  return { servers: { [name]: { type: 'stdio', command: 'node', args } } };
}

// Node's `--env-file` parser (measured, not assumed): an unquoted value is
// trimmed and truncated at the first `#`; a value wrapped in ', " or ` is taken
// literally, and there is NO escape sequence inside those quotes. So pick a
// quote character the value does not itself contain. If it contains all three,
// the value cannot be represented and the caller must say so rather than write
// a silently wrong file.
export function envQuote(value) {
  const s = String(value ?? '');
  for (const q of ["'", '"', '`']) if (!s.includes(q)) return `${q}${s}${q}`;
  return null;
}

export function envFileContents({ serverUrl, username, password }) {
  const fields = [
    ['KINETIC_SERVER_URL', serverUrl],
    ['KINETIC_USERNAME', username],
    ['KINETIC_PASSWORD', password],
  ];
  const lines = [];
  for (const [key, value] of fields) {
    const quoted = envQuote(value);
    if (quoted === null) return null;
    lines.push(`${key}=${quoted}`);
  }
  return [
    '# Kinetic Platform MCP server credentials. NEVER COMMIT THIS FILE.',
    '# Written by the playground setup script with mode 0600.',
    '# Loaded only via: node --env-file=<absolute path to this file> ...',
    '',
    ...lines,
    '',
    '# Tool surface. consolidated (default) = one tool per resource family;',
    '# slim = generic spec/execute only; contexts = one tool per operation;',
    '# full = legacy surface. All modes reach every platform operation.',
    '# The server prints its mode and exact tool count at startup.',
    '# KINETIC_MCP_MODE=slim',
    '',
  ].join('\n');
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
