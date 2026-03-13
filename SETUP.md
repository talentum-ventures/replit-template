# Setup Guide

This template is designed to be easy to start on Replit, even if you have never used Convex before.

## Quick Start On Replit

1. Remix or fork the template.
2. Click `Run`.
3. Follow the prompts from Convex the first time you are asked.
4. Wait for setup to finish.
5. If the app still shows demo mode, click `Run` again or refresh the preview.

That is the main setup. You do not need to manually create `.env.local`.

## What Happens Automatically

The first-run setup script does this for you:

- installs dependencies if needed
- creates or connects a **development** Convex deployment
- generates Convex Auth keys
- sets `SITE_URL` for the Replit workspace
- saves a `.setup-done` file so setup does not repeat every time

After that, the project starts normally with:

- the frontend on Vite
- the backend on Convex

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

The generated values go into `.env.local`, usually including:

- `CONVEX_DEPLOYMENT`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

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

Google OAuth is optional. The template can still work in development with password auth when appropriate.

If you want Google sign-in:

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).
2. Add this redirect URI in Google:

```text
https://YOUR_CONVEX_DEPLOYMENT.convex.site/api/auth/callback/google
```

3. Set these values in your Convex deployment:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

4. Make sure `SITE_URL` in Convex matches your app URL.

For a Replit workspace URL, that will usually look like:

```text
https://YOUR-APP-NAME.YOUR-USER.replit.dev
```

The first-run script automatically sets `SITE_URL` for the workspace when `REPLIT_DEV_DOMAIN` is available.

## Re-Running Setup

If you want to run setup again:

1. Delete `.setup-done`
2. Run the `Setup` workflow in Replit

You may also want to remove or regenerate `.env.local` if you are intentionally switching development deployments.

## Troubleshooting

### The app still shows demo mode

- wait for the first-time Convex setup to finish
- run the project again
- check that `.env.local` contains `VITE_CONVEX_URL`

### I want a fresh development Convex instance

- delete `.setup-done`
- delete `.env.local`
- run the `Setup` workflow again

### Google sign-in is failing

- verify the callback URL in Google Cloud exactly matches your Convex site URL
- verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set in Convex
- verify `SITE_URL` matches the URL where users open your app
