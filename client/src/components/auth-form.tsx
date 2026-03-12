import { useState, type FormEvent } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.42Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.08v2.58A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.9A5.99 5.99 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.52H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.48l3.33-2.58Z"
        fill="#FBBC04"
      />
      <path
        d="M12 5.98c1.47 0 2.79.5 3.83 1.48l2.88-2.88C16.96 2.96 14.7 2 12 2A9.99 9.99 0 0 0 3.08 7.52l3.33 2.58c.79-2.36 2.99-4.12 5.59-4.12Z"
        fill="#EA4335"
      />
    </svg>
  );
}

const stagingHostPattern = /(^|[.-])(staging|preview)([.-]|$)/i;
const replitDevHostPattern = /(^|[.-])replit\.dev$/i;
const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

function normalizeEnvironment(value: string | boolean | undefined) {
  return typeof value === 'string' ? value.trim().toLowerCase() : undefined;
}

function isEnabled(value: string | boolean | undefined) {
  const normalized = normalizeEnvironment(value);
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function isLocalHost(hostname: string) {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
}

function isPasswordProviderEnabled() {
  const env = import.meta.env as Record<string, string | boolean | undefined>;
  if (isEnabled(env.VITE_AUTH_PASSWORD_ENABLED)) {
    return true;
  }

  const environmentHints = [env.VITE_APP_ENV, env.VITE_ENVIRONMENT, env.MODE]
    .map(normalizeEnvironment)
    .filter((value): value is string => Boolean(value));

  if (
    environmentHints.some((value) =>
      ['development', 'dev', 'staging', 'preview', 'test'].includes(value)
    )
  ) {
    return true;
  }

  return (
    isLocalHost(window.location.hostname) ||
    stagingHostPattern.test(window.location.hostname) ||
    replitDevHostPattern.test(window.location.hostname)
  );
}

export function AuthForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'password' | null>(null);

  const passwordProviderEnabled = isPasswordProviderEnabled();
  const isPasswordLoading = loadingProvider === 'password';
  const isGoogleLoading = loadingProvider === 'google';

  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    try {
      await signIn('google', { redirectTo: '/' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: 'destructive',
      });
      setLoadingProvider(null);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingProvider('password');

    try {
      await signIn('password', {
        email: email.trim(),
        password,
        flow: authMode,
        redirectTo: '/',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to sign in with email and password';

      toast({
        title: 'Error',
        description: message.includes('Provider `password` is not configured')
          ? 'Password sign-in is not enabled on this Convex deployment yet.'
          : error instanceof Error
            ? error.message
            : authMode === 'signUp'
              ? 'Failed to create your account'
              : 'Failed to sign in with email and password',
        variant: 'destructive',
      });
      setLoadingProvider(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
        <CardDescription className="text-center">
          {passwordProviderEnabled
            ? 'Use email and password for dev or staging, or continue with Google.'
            : 'Sign in with your Google account to continue'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {passwordProviderEnabled ? (
          <>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <Button
                type="button"
                variant={authMode === 'signIn' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('signIn')}
                disabled={loadingProvider !== null}
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant={authMode === 'signUp' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('signUp')}
                disabled={loadingProvider !== null}
              >
                Create account
              </Button>
            </div>
            <form className="space-y-3" onSubmit={handlePasswordSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={inputClassName}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={loadingProvider !== null}
                  data-testid="input-email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={authMode === 'signUp' ? 'new-password' : 'current-password'}
                  className={inputClassName}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  disabled={loadingProvider !== null}
                  data-testid="input-password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loadingProvider !== null || !email.trim() || password.length < 8}
                data-testid={
                  authMode === 'signUp' ? 'button-password-signup' : 'button-password-signin'
                }
              >
                {isPasswordLoading ? <Loader2 className="animate-spin" /> : null}
                {authMode === 'signUp' ? 'Create account with password' : 'Continue with password'}
              </Button>
            </form>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>Or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loadingProvider !== null}
          data-testid="button-google-signin"
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleMark />}
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
}
