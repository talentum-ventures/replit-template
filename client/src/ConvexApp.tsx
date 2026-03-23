import { Switch, Route } from 'wouter';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { Dashboard } from '@/components/dashboard';
import { AuthForm } from '@/components/auth-form';
import NotFound from '@/pages/not-found';

function AuthScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthForm />
    </div>
  );
}

export function ConvexApp() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/">
            {() => (
              <>
                <Authenticated>
                  <Dashboard />
                </Authenticated>
                <Unauthenticated>
                  <AuthScreen />
                </Unauthenticated>
              </>
            )}
          </Route>
          <Route path="/login">
            {() => (
              <>
                <Unauthenticated>
                  <AuthScreen />
                </Unauthenticated>
                <Authenticated>
                  <Dashboard />
                </Authenticated>
              </>
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </ThemeProvider>
  );
}
