import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth, type AuthProviderConfig } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';

const stagingHostPattern = /(^|[.-])(staging|preview)([.-]|$)/i;
const replitDevHostPattern = /(^|[.-])replit\.dev$/i;

function normalizeEnvironment(value: string | undefined) {
  return value?.trim().toLowerCase();
}

function isEnabled(value: string | undefined) {
  const normalized = normalizeEnvironment(value);
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function getHostname(url: string | undefined) {
  if (!url) {
    return '';
  }

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function isPasswordProviderEnabled() {
  if (isEnabled(process.env.AUTH_PASSWORD_ENABLED)) {
    return true;
  }

  const environmentHints = [
    process.env.APP_ENV,
    process.env.ENVIRONMENT,
    process.env.VERCEL_ENV,
    process.env.NODE_ENV,
  ]
    .map(normalizeEnvironment)
    .filter((value): value is string => Boolean(value));

  if (
    environmentHints.some((value) =>
      ['development', 'dev', 'staging', 'preview', 'test'].includes(value)
    )
  ) {
    return true;
  }

  const deployment = normalizeEnvironment(process.env.CONVEX_DEPLOYMENT);
  if (
    deployment?.startsWith('dev:') ||
    deployment?.startsWith('preview:') ||
    deployment?.startsWith('staging:')
  ) {
    return true;
  }

  if (!process.env.SITE_URL) {
    return true;
  }

  const hostname = getHostname(process.env.SITE_URL ?? process.env.CONVEX_SITE_URL);
  return (
    ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname) ||
    stagingHostPattern.test(hostname) ||
    replitDevHostPattern.test(hostname)
  );
}

const providers: AuthProviderConfig[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
];

if (isPasswordProviderEnabled()) {
  providers.push(Password());
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers,
});
