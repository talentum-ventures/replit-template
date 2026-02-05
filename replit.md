# replit.md

## Recent Changes (Feb 2026)
- Implemented conditional app loading: Demo mode (without Convex) and Full mode (with Convex)
- Created separate DemoApp and ConvexApp for clean architecture separation
- Added setup guide for first-time users
- Configured oxlint with react-in-jsx-scope disabled for Vite JSX transform
- All tests passing for demo mode functionality

## Overview

A production-ready, mobile-first web application template combining Vite (frontend build), Express (backend API), and Convex (real-time database and authentication). The project includes a complete todo application example with user authentication, demonstrating the full stack integration. When Convex is not configured, the app displays a setup guide; when configured, it provides a full authenticated dashboard experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Build Tool**: Vite with React plugin for fast HMR and optimized production builds
- **UI Framework**: React with TypeScript in strict mode
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark/light mode support)
- **Routing**: wouter - lightweight React router for SPA navigation
- **State Management**: React Query for server state, React Context for theme/sidebar state

### Backend Architecture
- **API Server**: Express.js running on Node.js
- **Real-time Backend**: Convex for database operations, real-time subscriptions, and authentication
- **Dual Storage Pattern**: 
  - Convex handles authenticated user data (todos, user profiles)
  - Drizzle ORM with PostgreSQL available for traditional REST API patterns
- **Build Process**: Custom esbuild script bundles server with selected dependencies for optimized cold starts

### Authentication
- **Provider**: Convex Auth with Password strategy (email/password)
- **Flow**: Sign up/sign in forms using Convex's built-in auth system
- **Session Management**: Handled by Convex automatically with React hooks (`useAuthActions`, `Authenticated`, `Unauthenticated` components)

### Development Tooling
- **Linting**: oxlint (Rust-based, fast) with React/TypeScript plugins
- **Formatting**: Prettier with lint-staged for pre-commit hooks
- **Type Checking**: TypeScript with strict null checks and no unused variables/parameters

### Key Design Decisions

1. **Conditional App Loading**: Main entry point (`main.tsx`) dynamically imports either a demo app or the full Convex-powered app based on `VITE_CONVEX_URL` environment variable presence

2. **Path Aliases**: Configured in both Vite and TypeScript for clean imports:
   - `@/*` → `client/src/*`
   - `@shared/*` → `shared/*`

3. **Server-Side Static Serving**: Production Express server serves Vite-built static files with SPA fallback to `index.html`

4. **Component Architecture**: UI components follow shadcn/ui patterns - copied into project for full customization rather than installed as dependencies

## External Dependencies

### Real-time Database & Auth
- **Convex**: Primary backend-as-a-service for real-time data sync and authentication
  - Schema defined in `convex/schema.ts` with tables: users, todos, plus auth tables
  - Queries and mutations in `convex/todos.ts`, `convex/users.ts`
  - Configuration requires `VITE_CONVEX_URL` environment variable

### Database (Optional REST Pattern)
- **PostgreSQL**: Available via Drizzle ORM for traditional database operations
  - Schema in `shared/schema.ts` 
  - Requires `DATABASE_URL` environment variable
  - Migrations managed via `drizzle-kit push`

### UI Component Primitives
- **Radix UI**: Headless component primitives for accessibility (dialog, dropdown, tabs, etc.)
- **cmdk**: Command palette component
- **react-day-picker**: Calendar/date picker
- **embla-carousel-react**: Carousel component
- **recharts**: Charting library
- **vaul**: Drawer component

### Server Dependencies (Bundled for Production)
Key dependencies bundled via esbuild for optimized cold starts: express, cors, drizzle-orm, pg, express-session, zod, date-fns