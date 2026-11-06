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
  // Always https: KINETIC_SERVER_URL must not send credentials over plain http.
  return { origin: `https://${url.host}`, slug };
}

// Matches the naming the platform team uses in its own instructions
// (`<space-slug>-kinetic`), so every tool call names the environment it hit.
export function mcpServerName(slug) {
  return `${slug}-kinetic`;
}

// The built-in Platform AI MCP endpoint that every v7 space serves. It speaks
// MCP over streamable HTTP and authenticates with OAuth, so there is no
// credential anywhere on disk in this repo.
export function platformMcpUrl(origin) {
  return `${origin}/app/platform-ai/mcp`;
}

// Cursor reads `mcpServers`; a `url` entry is a remote (HTTP) server.
export function cursorMcpEntry(url) {
  return { url };
}

// VS Code / Copilot reads `servers`, and each entry names its transport.
export function vscodeMcpEntry(url) {
  return { type: 'http', url };
}

// Adds one server entry to an MCP client config file without disturbing
// anything else in it. Pure: takes the file's current text (or null when the
// file does not exist) and returns what the caller should do.
//   write       — `text` is the new file contents
//   same        — the entry is already there, identical; nothing to do
//   conflict    — a different entry already uses this name; leave it alone
//   unparseable — not plain JSON (e.g. VS Code's JSON-with-comments); leave it
export function mergeMcpConfig(existingText, rootKey, name, entry) {
  let config = {};
  if (existingText !== null && existingText !== undefined && existingText.trim()) {
    try {
      config = JSON.parse(existingText);
    } catch {
      return { action: 'unparseable' };
    }
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return { action: 'unparseable' };
    }
  }
  const servers = config[rootKey] ?? {};
  if (typeof servers !== 'object' || Array.isArray(servers)) {
    return { action: 'unparseable' };
  }
  if (Object.hasOwn(servers, name)) {
    return JSON.stringify(servers[name]) === JSON.stringify(entry)
      ? { action: 'same' }
      : { action: 'conflict' };
  }
  const next = { ...config, [rootKey]: { ...servers, [name]: entry } };
  return { action: 'write', text: JSON.stringify(next, null, 2) + '\n' };
}

export function proxyHostFromEnv(contents) {
  const m = /^REACT_APP_PROXY_HOST=(.+)$/m.exec(String(contents ?? ''));
  return m ? m[1].trim() || null : null;
}

// The portal's dev-server config. `yarn start` (portal/src/setupEnv.cjs) only
// prompts for the space URL when this file is missing, so writing it here is
// what keeps the partner from being asked the same question twice.
export function portalEnvContents(origin) {
  return `REACT_APP_PROXY_HOST=${origin}\n`;
}

// A v7 space serves OAuth protected-resource metadata (RFC 9728) for its MCP
// endpoint at `/.well-known/oauth-protected-resource/app/platform-ai/mcp`,
// and that document's `resource` is the endpoint itself. Tolerates a trailing
// slash on either side.
export function isPlatformMcpMetadata(metadata, mcpUrl) {
  const strip = (u) => String(u ?? '').replace(/\/+$/, '');
  return Boolean(metadata) && typeof metadata === 'object'
    && strip(metadata.resource) === strip(mcpUrl);
}
