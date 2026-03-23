import { convexAuth, type AuthProviderConfig } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';
import type { OAuthConfig } from '@auth/core/providers';

type GoogleProfile = {
  sub?: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

type UserinfoRequestContext = {
  tokens: {
    access_token?: string;
  };
  provider: {
    userinfo?: {
      url?: URL | string;
    };
  };
};

function createGoogleProvider(): AuthProviderConfig {
  const emulateUrl = process.env.AUTH_GOOGLE_EMULATE_URL?.trim().replace(/\/+$/, '');
  if (emulateUrl) {
    return {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: process.env.AUTH_GOOGLE_ID || 'emulate-google-client-id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'emulate-google-client-secret',
      authorization: {
        url: `${emulateUrl}/o/oauth2/v2/auth`,
        params: { scope: 'openid email profile' },
      },
      client: {
        token_endpoint_auth_method: 'client_secret_post',
      },
      token: {
        url: `${emulateUrl}/oauth2/token`,
        async conform(response: Response) {
          const data = await response.json();
          if (!response.ok || typeof data !== 'object' || data === null) {
            return response;
          }

          const { id_token: _idToken, ...rest } = data;
          return Response.json(rest, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        },
      },
      userinfo: {
        url: `${emulateUrl}/oauth2/v2/userinfo`,
        async request({ tokens, provider }: UserinfoRequestContext) {
          const response = await fetch(provider.userinfo?.url as URL, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch emulated Google profile: ${response.status}`);
          }

          return response.json();
        },
      },
      profile(profile: GoogleProfile) {
        return {
          id: profile.id || profile.sub || '',
          name: profile.name ?? undefined,
          email: profile.email ?? undefined,
          image: profile.picture ?? undefined,
        };
      },
    } satisfies OAuthConfig<GoogleProfile>;
  }

  return Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  });
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [createGoogleProvider()],
});
