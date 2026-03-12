import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Zap, Shield, Smartphone, Code2, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Vite for blazing fast development and optimal performance.',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    description: 'Convex Auth provides secure, scalable authentication out of the box.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Responsive design that looks great on any device, from phones to desktops.',
  },
  {
    icon: Code2,
    title: 'Developer Experience',
    description: 'TypeScript, oxlint, and modern tooling for a delightful development experience.',
  },
];

const techStack = ['Vite', 'Convex', 'shadcn/ui', 'Tailwind CSS', 'TypeScript', 'oxlint'];

export function LandingPage() {
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
            <Link href="/login">
              <Button size="sm" data-testid="button-signin-header">
                Sign in with Google
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Production-Ready
                  <span className="text-primary block sm:inline"> App Template</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl">
                  Start building your next application with Vite, Convex, and shadcn/ui. Everything
                  you need, nothing you don't.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full" data-testid="button-get-started">
                    Sign in with Google
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Everything you need to build
              </h2>
              <p className="mt-2 text-muted-foreground max-w-[600px] mx-auto">
                A carefully crafted template with the best tools and practices for modern web
                development.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 bg-background rounded-lg border hover-elevate"
                >
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Built with the best stack
              </h2>
              <p className="mt-2 text-muted-foreground max-w-[600px] mx-auto">
                Modern technologies that work seamlessly together for the best developer experience.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8">
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
            <p className="text-sm text-muted-foreground">Open source and free to use.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
