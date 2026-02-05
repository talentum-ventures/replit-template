import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Zap,
  Terminal,
  Database,
  Key,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  {
    icon: Terminal,
    title: "1. Initialize Convex",
    description: "Run this command in your terminal to set up Convex and create your project:",
    code: "npx convex dev",
  },
  {
    icon: Key,
    title: "2. Get Your Convex URL",
    description: "After running the command, Convex will provide you with a deployment URL. Copy it.",
    code: null,
  },
  {
    icon: Database,
    title: "3. Add Environment Variable",
    description: "Add your Convex URL to your environment:",
    code: "VITE_CONVEX_URL=https://your-project.convex.cloud",
  },
  {
    icon: Rocket,
    title: "4. Restart the App",
    description: "Restart the development server to apply the changes. You are ready!",
    code: null,
  },
];

export function SetupGuide() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Command copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">App Template</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/demo">
              <Button size="sm" data-testid="button-view-demo">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              Welcome to Your App Template
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Let&apos;s Get You Set Up
            </h1>
            <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
              Follow these steps to connect Convex and enable authentication, 
              real-time data, and more.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <Card key={index} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {step.code && (
                  <CardContent>
                    <div className="relative">
                      <code className="block bg-muted p-3 rounded-md text-sm font-mono pr-12 overflow-x-auto">
                        {step.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => copyToClipboard(step.code!)}
                        data-testid={`button-copy-${index}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle>What You Get</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Real-time database with Convex",
                  "Secure email/password authentication",
                  "Mobile-first responsive design",
                  "Dark/light theme support",
                  "shadcn/ui components",
                  "TypeScript with strict mode",
                  "oxlint for fast linting",
                  "Prettier for formatting",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/demo">
              <Button size="lg" variant="outline" data-testid="button-preview-demo">
                Preview Demo Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                App Template. Built with Vite + Convex.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Open source and free to use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
