import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SetupGuide } from "@/components/setup-guide";
import { DashboardDemo } from "@/components/dashboard-demo";
import { LandingPage } from "@/components/landing-page";
import NotFound from "@/pages/not-found";

function DemoApp() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/" component={SetupGuide} />
          <Route path="/demo" component={DashboardDemo} />
          <Route path="/landing" component={LandingPage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default DemoApp;
