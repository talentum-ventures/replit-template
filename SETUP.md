# Setup Guide

This template is designed to be easy to start on Replit, even if you have never used Convex before.

## Quick Start On Replit

1. Remix or fork the template.
2. Click `Run`.
3. If this is the first run, complete the one-time Convex prompts when they appear.
4. Wait for the automatic setup to finish.
5. Replit will continue into the full app automatically.
6. The app opens directly into the sign-in screen.
7. Sign in with the seeded emulator user `dev@example.com`.

That is the main setup. You do not need to manually create `.env.local`.

## What Happens Automatically

The first-run setup script does this for you:

- installs dependencies if needed
- creates or connects a **development** Convex deployment
- generates Convex Auth keys
- sets `SITE_URL`
- sets `AUTH_GOOGLE_EMULATE_URL` for development
- saves a `.setup-done` file after a successful run

After that, the project starts normally with:

- the frontend on Vite
- the backend on Convex
- the Google emulator on port `4002`
- one Vite process bound to port `5000`
- the root route showing the app sign-in screen instead of a marketing landing page

## Local Development

Recommended local setup:

```bash
npm install
npm run setup
npm run dev:all
```

`npm run setup` provisions or repairs local development auth automatically. It creates a dev Convex deployment if needed, generates Convex Auth keys, sets `SITE_URL=http://localhost:5000`, and sets `AUTH_GOOGLE_EMULATE_URL=http://localhost:4002`.

If you want to run each service separately:

```bash
npm run dev:emulate
npm run dev:backend
npm run dev
```

## AI Handoff For New Projects

If you use an AI assistant to customize this template into a real product, give it two jobs first:

1. Verify setup is complete
2. Gather the business context for the new app

The AI should verify:

- `.setup-done` exists
- `.env.local` contains `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`
- the app is running in full mode instead of demo mode

Then the AI should ask for:

- the name of the project
- who the app is for
- what problem it solves
- the most important features for version one
- auth requirements
- design or brand preferences
- outside services or APIs that need to connect to the app

This helps the AI adapt the template to the actual business instead of making generic changes.

## Development Vs Production

This template uses **different Convex deployments for development and production**.

### Development

Development is created automatically during the first Replit setup.
Development auth uses the emulated Google provider by default.

The generated values go into `.env.local`, usually including:

- `CONVEX_DEPLOYMENT`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

Convex environment variables also include:

- `SITE_URL`
- `AUTH_GOOGLE_EMULATE_URL`
- `JWT_PRIVATE_KEY`
- `JWKS`

### Production

Production should use a separate Convex deployment.

Before you deploy on Replit, add these values to Replit:

- `CONVEX_DEPLOY_KEY`
- `VITE_CONVEX_URL`

`CONVEX_DEPLOY_KEY` tells `npx convex deploy` which production deployment to update.

`VITE_CONVEX_URL` tells the built frontend which Convex deployment to talk to in production.

## Recommended Production Setup

1. Create or choose your production deployment in Convex.
2. Copy the production deploy key from the Convex dashboard.
3. Add `CONVEX_DEPLOY_KEY` in Replit.
4. Add the production `VITE_CONVEX_URL` in Replit.
5. Deploy the app from Replit.

If you use Google OAuth, also update the production callback settings before deploying.

## Optional Google OAuth Setup

Production uses the real Google provider when `AUTH_GOOGLE_EMULATE_URL` is unset.

If you want production Google sign-in:

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).
2. Add this redirect URI in Google:

```text
https://YOUR_CONVEX_DEPLOYMENT.convex.site/api/auth/callback/google
```

3. Set these values in your Convex deployment:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

4. Make sure `SITE_URL` in Convex matches your app URL.
5. Do not set `AUTH_GOOGLE_EMULATE_URL` in production.

For a Replit workspace URL, that will usually look like:

```text
https://YOUR-APP-NAME.YOUR-USER.replit.dev
```

The first-run script automatically sets `SITE_URL` for the workspace when `REPLIT_DEV_DOMAIN` is available.

## Re-Running Setup

If you want to run setup again:

1. Run `npm run setup` locally, or run the `Setup` workflow in Replit
2. You can also click `Run` again. `npm run dev:all` will rerun setup automatically whenever `.env.local` is missing `VITE_CONVEX_URL`

Delete `.env.local` only if you intentionally want a fresh development deployment.

## Troubleshooting

### The app still shows demo mode

- wait for the first-time Convex setup to finish
- check that `.env.local` contains `VITE_CONVEX_URL`
- rerun `npm run setup` locally or the `Setup` workflow in Replit if setup was interrupted

### I want a fresh development Convex instance

- delete `.env.local`
- run `npm run setup` locally or the `Setup` workflow again on Replit

### Google sign-in is failing

- in development, verify `AUTH_GOOGLE_EMULATE_URL` is set in Convex
- in production, verify the callback URL in Google Cloud exactly matches your Convex site URL
- in production, verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set in Convex
- verify `SITE_URL` matches the URL where users open your app
