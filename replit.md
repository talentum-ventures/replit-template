# replit.md

## Overview

This repository is a Replit-ready template for a Vite + React + Convex app. It is designed so a non-technical user can remix the project, click `Run`, follow the Convex login prompts once, and then keep using the project without repeating setup.

This template is intentionally app-first. It does not use a public landing or marketing homepage; signed-out users are taken straight to the auth screen so the startup path stays focused on using the web app.

The app has two modes:

- **Demo mode** when `VITE_CONVEX_URL` is missing
- **Full app mode** when Convex is configured

Development auth now defaults to an emulated Google OAuth flow. In dev, the app does not talk to real Google unless `AUTH_GOOGLE_EMULATE_URL` is unset.

## Replit Setup Flow

On Replit, setup is handled by `npm run setup`, which calls `script/setup.sh`.

What it does:

1. Installs dependencies if needed
2. Runs `npx convex dev --once` to create or connect a dev Convex deployment
3. Checks whether Convex Auth keys already exist
4. Runs `npx @convex-dev/auth` only when `JWT_PRIVATE_KEY` or `JWKS` are missing
5. Sets `SITE_URL` in Convex to `https://${REPLIT_DEV_DOMAIN}` on Replit
6. Sets `AUTH_GOOGLE_EMULATE_URL` in Convex to `https://${REPLIT_DEV_DOMAIN}/google-emulate`
7. Writes `.setup-done` after a successful run

The script is intentionally repair-friendly. If `.setup-done` already exists, it does not exit early anymore; it revalidates the Convex env and can restore missing auth keys or dev auth env.

The script also uses a lock directory so concurrent setup attempts do not try to configure Convex at the same time.

## Startup Sequence

The Replit `Project` workflow runs in two phases:

1. `Setup`
2. `Runtime`

`Runtime` then starts these workflows in parallel:

- `Start Convex Backend` -> `npm run dev:backend`
- `Start Frontend` -> `npm run dev`
- `Start Emulate` -> `npm run dev:emulate`

Important runtime behavior:

- Vite owns port `5000`
- the Google emulator listens on port `4002`
- Vite proxies `/google-emulate/*` to `http://localhost:4002`
- Convex cloud dev can reach emulate through the public Replit URL because the backend uses `AUTH_GOOGLE_EMULATE_URL=https://<replit-domain>/google-emulate`

This means the expected Replit boot path is:

1. setup finishes
2. Convex backend starts
3. Vite starts on port `5000`
4. emulate starts on port `4002`
5. browser sign-in goes through the Vite proxy, not directly to localhost
6. the root route shows the auth screen rather than a landing page

## Auth Flow Notes

Development and production use different Google provider behavior:

- Development: custom OAuth provider in `convex/auth.ts` points at emulate
- Production: standard Google provider is used when `AUTH_GOOGLE_EMULATE_URL` is unset

The current emulate integration contains a few deliberate compatibility shims for `emulate@0.2.0`:

- token endpoint uses `/oauth2/token`
- token auth method is forced to `client_secret_post`
- `id_token` is removed from the token response before Convex/Auth processes it
- userinfo is fetched with a custom request handler over HTTP
- nullable profile fields are normalized to `undefined` before user upsert

These are important context points if auth is touched later. They are not accidental workarounds; they are required for the installed emulate package to behave correctly with Convex Auth.

## AI Setup Instructions

If you are an AI agent working in a remix of this template, do this before making product-specific changes:

1. Check whether `.setup-done` exists.
2. If it does not exist, ask the user to click `Run` or run the `Setup` workflow and complete the Convex prompts.
3. Confirm `.env.local` now contains `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`.
4. Confirm Convex env includes `SITE_URL`, `AUTH_GOOGLE_EMULATE_URL`, `JWT_PRIVATE_KEY`, and `JWKS`.
5. Confirm the app is no longer using demo mode.
6. Before preparing production deployment, ask the user for their production Convex deployment details and ensure Replit has:
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
- **Unauthenticated entry**: `client/src/ConvexApp.tsx` shows the auth screen at `/`

### Backend

- **Application backend**: Convex only
- **Schema**: `convex/schema.ts`
- **Queries and mutations**: `convex/todos.ts`, `convex/users.ts`, `convex/presence.ts`
- **HTTP auth routes**: `convex/http.ts`

There is no Express server in the current template. Production hosting is a static frontend bundle that talks directly to Convex.

### Authentication

- **Library**: `@convex-dev/auth`
- **Configured provider**: Google OAuth
- **Dev provider**: emulated Google OAuth through `AUTH_GOOGLE_EMULATE_URL`
- **Prod provider**: real Google OAuth through `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- **Client integration**: `ConvexAuthProvider` in `client/src/main.tsx`

## Replit Configuration

### Workspace startup

- The `Project` workflow runs `Setup` first, then starts:
  - `Start Convex Backend`
  - `Start Frontend`
  - `Start Emulate`
- `Start Convex Backend` runs `npm run dev:backend`
- `Start Frontend` owns the single Vite dev server on port `5000`
- `Start Emulate` runs `npm run dev:emulate`
- The `Setup` workflow runs `npm run setup`, and a user can rerun it manually to repair dev auth configuration

### Dev and prod separation

- **Development** uses the deployment created by `npx convex dev --once`
- **Development auth** uses emulate through `AUTH_GOOGLE_EMULATE_URL`
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
- `AUTH_GOOGLE_EMULATE_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `JWT_PRIVATE_KEY`
- `JWKS`

### Replit deployment values

Replit should provide production build values such as:

- `CONVEX_DEPLOY_KEY`
- `VITE_CONVEX_URL`

## Important Files

- `script/setup.sh`: idempotent dev setup and auth bootstrap
- `script/dev-emulate.mjs`: starts emulate with generated redirect URIs for Convex callback hosts
- `.replit`: startup workflows and deployment config
- `SETUP.md`: user-facing setup guide
- `client/src/main.tsx`: demo mode vs full app switch
- `client/src/ConvexApp.tsx`: app entry when Convex is configured, including the auth-first root route
- `client/src/DemoApp.tsx`: fallback UI before setup is complete
