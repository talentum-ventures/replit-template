# replit.md

## Overview

This repository is a Replit-ready template for a Vite + React + Convex app. It is designed so a non-technical user can remix the project, click `Run`, follow the Convex login prompts once, and then keep using the project without repeating setup.

The app has two modes:

- **Demo mode** when `VITE_CONVEX_URL` is missing
- **Full app mode** when Convex is configured

## Replit Setup Flow

On Replit, first-run setup is handled by `script/setup.sh`.

What it does:

1. Installs dependencies if needed
2. Runs `npx convex dev --once` to create or connect a dev Convex deployment
3. Runs `npx @convex-dev/auth` to generate auth keys for that deployment
4. Sets `SITE_URL` in Convex when `REPLIT_DEV_DOMAIN` is available
5. Writes `.setup-done` so the setup only runs once per remix

The script also uses a lock directory so `onBoot` and workflow runs do not try to configure Convex at the same time.

## AI Setup Instructions

If you are an AI agent working in a remix of this template, do this before making product-specific changes:

1. Check whether `.setup-done` exists.
2. If it does not exist, ask the user to click `Run` or run the `Setup` workflow and complete the Convex prompts.
3. Confirm `.env.local` now contains `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`.
4. Confirm the app is no longer using demo mode.
5. Before preparing production deployment, ask the user for their production Convex deployment details and ensure Replit has:
   - `CONVEX_DEPLOY_KEY`
   - production `VITE_CONVEX_URL`

Do not assume the development Convex deployment should also be used for production. This template is designed for separate dev and prod Convex instances.

## AI Business Context Instructions

This repository is only a starting template. Before building features, the AI should gather the business context for the new project.

Ask the user for:

1. The project name and one-sentence description
2. The target users or customers
3. The core problem the app should solve
4. The top 3 to 5 workflows the first version must support
5. Whether authentication is required and which providers should be enabled
6. Any brand, tone, or design preferences
7. Any external systems or APIs the app must integrate with
8. What should be included in version one versus later phases

After collecting that context, the AI should summarize it in plain language and use it to guide all future product, schema, auth, and UI decisions.

## Architecture

### Frontend

- **Build tool**: Vite
- **UI**: React + TypeScript
- **Routing**: wouter
- **Styling**: Tailwind CSS + shadcn/ui components
- **Entry point**: `client/src/main.tsx`

### Backend

- **Application backend**: Convex only
- **Schema**: `convex/schema.ts`
- **Queries and mutations**: `convex/todos.ts`, `convex/users.ts`, `convex/presence.ts`
- **HTTP auth routes**: `convex/http.ts`

There is no Express server in the current template. Production hosting is a static frontend bundle that talks directly to Convex.

### Authentication

- **Library**: `@convex-dev/auth`
- **Configured provider**: Google OAuth
- **Dev-friendly provider**: Password auth is enabled automatically in local/dev/staging-like environments
- **Client integration**: `ConvexAuthProvider` in `client/src/main.tsx`

## Replit Configuration

### Workspace startup

- `onBoot = "bash script/setup.sh"` triggers the one-time setup automatically
- The `Project` workflow starts:
  - `Start Convex Backend`
  - `Start Frontend`
- The `Setup` workflow lets a user rerun setup manually

### Dev and prod separation

- **Development** uses the deployment created by `npx convex dev --once`
- **Production** uses a separate Convex deployment selected through `CONVEX_DEPLOY_KEY` during Replit deploys
- The built frontend should point at production via `VITE_CONVEX_URL`

### Deployment

Replit deployment is configured as a static site:

- Build step: `npx convex deploy && npm run build`
- Static output: `dist/public`

## Environment Model

### Local workspace values

`npx convex dev --once` creates `.env.local` with values like:

- `CONVEX_DEPLOYMENT`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

### Convex environment values

Convex stores backend-only values such as:

- `SITE_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- generated auth keys from `@convex-dev/auth`

### Replit deployment values

Replit should provide production build values such as:

- `CONVEX_DEPLOY_KEY`
- `VITE_CONVEX_URL`

## Important Files

- `script/setup.sh`: one-time Replit setup flow
- `.replit`: startup workflows and deployment config
- `SETUP.md`: user-facing setup guide
- `client/src/main.tsx`: demo mode vs full app switch
- `client/src/ConvexApp.tsx`: app entry when Convex is configured
- `client/src/DemoApp.tsx`: fallback UI before setup is complete
