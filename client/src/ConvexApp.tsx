import { Switch, Route } from "wouter";
import { Authenticated, Unauthenticated } from "convex/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LandingPage } from "@/components/landing-page";
import { Dashboard } from "@/components/dashboard";
import { AuthForm } from "@/components/auth-form";
import NotFound from "@/pages/not-found";

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
                  <LandingPage />
                </Unauthenticated>
              </>
            )}
          </Route>
          <Route path="/login">
            {() => (
              <>
                <Authenticated>
                  <Dashboard />
                </Authenticated>
                <Unauthenticated>
                  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <AuthForm mode="signin" />
                  </div>
                </Unauthenticated>
              </>
            )}
          </Route>
          <Route path="/signup">
            {() => (
              <>
                <Authenticated>
                  <Dashboard />
                </Authenticated>
                <Unauthenticated>
                  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <AuthForm mode="signup" />
                  </div>
                </Unauthenticated>
              </>
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </ThemeProvider>
  );
}
