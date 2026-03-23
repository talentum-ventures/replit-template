import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';

const rootDir = process.cwd();
const baseConfigPath = path.join(rootDir, 'emulate.config.yaml');

function normalizeUrl(value) {
  return value?.trim().replace(/\/+$/, '');
}

function expandLocalAliases(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return [];
  }

  let url;
  try {
    url = new URL(normalized);
  } catch {
    return [normalized];
  }

  if (url.hostname === 'localhost') {
    const localhostUrl = url.toString().replace(/\/$/, '');
    url.hostname = '127.0.0.1';
    return [localhostUrl, url.toString().replace(/\/$/, '')];
  }

  if (url.hostname === '127.0.0.1') {
    const loopbackUrl = url.toString().replace(/\/$/, '');
    url.hostname = 'localhost';
    return [loopbackUrl, url.toString().replace(/\/$/, '')];
  }

  return [normalized];
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        const key = line.slice(0, separatorIndex).trim();
        const value = unquote(line.slice(separatorIndex + 1).trim());
        return [key, value];
      })
  );
}

const fileEnv = {
  ...readEnvFile(path.join(rootDir, '.env')),
  ...readEnvFile(path.join(rootDir, '.env.local')),
};

const baseConfig = existsSync(baseConfigPath)
  ? (YAML.parse(readFileSync(baseConfigPath, 'utf8')) ?? {})
  : {};

function fetchConvexUsers() {
  try {
    const result = spawnSync(
      'npx',
      ['convex', 'run', 'users:listAll', '--no-push'],
      { cwd: rootDir, encoding: 'utf8', timeout: 15000, shell: process.platform === 'win32' }
    );
    if (result.status !== 0 || !result.stdout) {
      return [];
    }
    const parsed = JSON.parse(result.stdout.trim());
    if (Array.isArray(parsed)) {
      return parsed.filter((u) => u && typeof u.email === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

function mergeUsers(configUsers, dbUsers) {
  const merged = new Map();
  for (const u of configUsers) {
    merged.set(u.email, u);
  }
  for (const u of dbUsers) {
    merged.set(u.email, { ...merged.get(u.email), ...u });
  }
  return Array.from(merged.values());
}

const configUsers = baseConfig.google?.users?.length
  ? baseConfig.google.users
  : [{ email: 'dev@example.com', name: 'Dev User' }];

console.log('Fetching users from Convex DB...');
const dbUsers = fetchConvexUsers();
if (dbUsers.length > 0) {
  console.log(`Found ${dbUsers.length} user(s) in Convex DB, merging with config users.`);
} else {
  console.log('No Convex DB users found (or Convex not reachable), using config users only.');
}
const mergedUsers = mergeUsers(configUsers, dbUsers);

const baseUrls = [
  process.env.CUSTOM_AUTH_SITE_URL,
  process.env.CONVEX_SITE_URL,
  process.env.VITE_CONVEX_SITE_URL,
  fileEnv.CUSTOM_AUTH_SITE_URL,
  fileEnv.CONVEX_SITE_URL,
  fileEnv.VITE_CONVEX_SITE_URL,
  'http://localhost:3211',
  'http://127.0.0.1:3211',
  'http://localhost:3210',
  'http://127.0.0.1:3210',
]
  .flatMap(expandLocalAliases)
  .filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);

const redirectUris = baseUrls.map((baseUrl) => `${baseUrl}/api/auth/callback/google`);

const runtimeConfig = {
  ...baseConfig,
  google: {
    ...baseConfig.google,
    users: mergedUsers,
    oauth_clients: (baseConfig.google?.oauth_clients?.length
      ? baseConfig.google.oauth_clients
      : [
          {
            client_id: 'emulate-google-client-id',
            client_secret: 'emulate-google-client-secret',
          },
        ]
    ).map((client) => ({
      ...client,
      redirect_uris: Array.from(new Set([...(client.redirect_uris ?? []), ...redirectUris])),
    })),
  },
};

const tempDir = mkdtempSync(path.join(os.tmpdir(), 'emulate-'));
const runtimeConfigPath = path.join(tempDir, 'emulate.config.yaml');

writeFileSync(runtimeConfigPath, YAML.stringify(runtimeConfig));

console.log(`Starting Google emulate on http://localhost:4002`);
console.log(`Using redirect URIs:\n${redirectUris.map((uri) => `- ${uri}`).join('\n')}`);

const child = spawn(
  'npx',
  ['emulate', 'start', '--service', 'google', '--port', '4002', '--seed', runtimeConfigPath],
  {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
