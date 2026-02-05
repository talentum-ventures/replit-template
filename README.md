# Vite + Convex App Template

A production-ready, mobile-first web application template built with modern technologies and best practices.

## Tech Stack

- **Frontend Build**: [Vite](https://vitejs.dev) - Next generation frontend tooling
- **Backend API**: [Express](https://expressjs.com) - Fast, minimalist web framework
- **Database & Real-time**: [Convex](https://convex.dev) - Real-time backend as a service
- **Authentication**: [Convex Auth](https://labs.convex.dev/auth) - Built-in authentication
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- **Routing**: [wouter](https://github.com/molefrog/wouter) - Minimalist React router
- **Linting**: [oxlint](https://oxc.rs) - Ultra-fast Rust-based linter
- **Formatting**: [Prettier](https://prettier.io) - Code formatter
- **Language**: [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript

## Features

- Mobile-first responsive design
- Dark/light theme support
- Type-safe throughout (TypeScript strict mode)
- Real-time data synchronization with Convex
- Secure authentication with email/password
- Pre-configured linting and formatting
- Git hooks with Husky and lint-staged
- VS Code settings and recommended extensions
- Example todo app with full CRUD operations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- A Convex account (free at [convex.dev](https://convex.dev))

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Convex**:
   ```bash
   npx convex dev
   ```
   This will prompt you to create a new project or link to an existing one.

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   
   Add your Convex URL:
   ```
   VITE_CONVEX_URL=https://your-project.convex.cloud
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`.

## Project Structure

```
├── client/                 # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── ui/       # shadcn/ui components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── App.tsx       # Main app component
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Global styles
│   └── index.html        # HTML template
├── server/                # Backend (Express)
│   ├── index.ts          # Server entry
│   ├── routes.ts         # API routes
│   └── storage.ts        # Storage interface
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Authentication config
│   ├── users.ts          # User functions
│   ├── todos.ts          # Todo CRUD functions
│   └── http.ts           # HTTP routes
├── shared/               # Shared types
│   └── schema.ts         # TypeScript schemas
├── .oxlintrc.json        # oxlint configuration
├── .prettierrc           # Prettier configuration
├── .vscode/              # VS Code settings
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npx oxlint client convex --fix` | Run oxlint and fix issues |
| `npx prettier --write .` | Format code with Prettier |
| `npx convex dev` | Start Convex development |
| `npx convex deploy` | Deploy Convex to production |

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow the existing code patterns
- Use shadcn/ui components when available
- Keep components small and focused
- Use the `@/` path alias for imports

### Responsive Design

The template uses a mobile-first approach:
- Base styles target mobile devices
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for larger screens
- Test on various device sizes

### Adding New Routes

Routes use wouter. Add new routes in `client/src/App.tsx`:

```tsx
import { Switch, Route } from "wouter";
import { NewPage } from "@/pages/new-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/new" component={NewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

### Adding Convex Functions

1. Define your schema in `convex/schema.ts`
2. Create query/mutation functions in `convex/` directory
3. Import and use with `useQuery`/`useMutation` from `convex/react`

Example query:
```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function MyComponent() {
  const data = useQuery(api.myModule.myQuery, { arg: "value" });
  return <div>{data}</div>;
}
```

## Authentication

The template uses Convex Auth for authentication:

```tsx
import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

function App() {
  return (
    <>
      <Authenticated>
        {/* Show when logged in */}
      </Authenticated>
      <Unauthenticated>
        {/* Show when logged out */}
      </Unauthenticated>
    </>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## Deployment

### Convex

Deploy your Convex backend:
```bash
npx convex deploy
```

### Frontend + Express

The app can be deployed to any Node.js hosting platform:
- Replit (recommended)
- Railway
- Render
- Fly.io

Build and run:
```bash
npm run build
npm run start
```

## Linting & Formatting

### oxlint

Ultra-fast linting with oxlint:
```bash
# Check for issues
npx oxlint client convex

# Fix issues automatically
npx oxlint client convex --fix
```

### Prettier

Format code:
```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Pre-commit Hooks

The template includes Husky and lint-staged for automatic linting on commit:
- Runs oxlint with auto-fix on staged `.ts/.tsx` files
- Runs Prettier on staged files

## License

MIT
