# Convex App Replit Template

A Replit-first starter for building a React app with Convex, authentication, and a clean mobile-friendly UI.

## What You Get

- Vite + React + TypeScript frontend
- Convex backend with real-time queries and mutations
- Convex Auth integration
- Demo mode before Convex is configured
- One-time Replit setup flow for non-technical users
- Tailwind CSS + shadcn/ui
- Linting, formatting, and typechecking already wired up

## Quick Start On Replit

1. Remix or fork the template.
2. Click `Run`.
3. Follow the Convex prompts the first time setup runs.
4. Wait for setup to finish. Replit will then start the backend, frontend, and Google emulator automatically.
5. The app opens directly into the sign-in screen.
6. Sign in with the seeded emulator user `dev@example.com`.

The first run creates or reconnects a **local Convex development backend** for that remix and saves the generated values in `.env.local`.

For a more detailed walkthrough, see [SETUP.md](./SETUP.md).

## Local Development

If you are running the project outside Replit:

```bash
npm install
npm run setup
npm run dev:all
```

The setup command provisions or reconnects the local Convex backend if needed, configures Convex Auth keys, and sets the dev Google emulator URL automatically.

This template is app-first, not marketing-first. When unauthenticated, `/` renders the sign-in screen instead of a landing page.

If you prefer to run services separately for debugging:

```bash
npm run dev:emulate
npm run dev:backend
npm run dev
```

## How The Template Works

- `client/src/main.tsx` loads `ConvexApp` when `VITE_CONVEX_URL` exists.
- If that variable is missing, it loads `DemoApp` so the project still opens cleanly before setup is complete.
- `client/src/ConvexApp.tsx` renders the dashboard for authenticated users and the auth screen for signed-out users at `/`.
- `script/setup.sh` handles first-run setup on Replit and can be rerun locally or on Replit to repair auth-related env.
- `script/dev-emulate.mjs` starts the Google emulator with the exact callback URLs needed by local Convex and Replit dev.
- `.replit` runs `Setup` first, then starts the emulator, frontend, and Convex backend in parallel.

## Project Structure

```text
.
├── client/
│   ├── index.html
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── ConvexApp.tsx
│       ├── DemoApp.tsx
│       ├── index.css
│       └── main.tsx
├── convex/
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── http.ts
│   ├── presence.ts
│   ├── schema.ts
│   ├── todos.ts
│   └── users.ts
├── script/
│   ├── dev-all.sh
│   ├── dev-emulate.mjs
│   └── setup.sh
├── .replit
├── SETUP.md
├── package.json
└── vite.config.ts
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run setup` | Provision or repair local/Replit dev setup, including Convex Auth keys and emulate env |
| `npm run dev` | Start the Vite dev server |
| `npm run dev:all` | Start the Google emulator, Convex dev, and Vite together |
| `npm run dev:backend` | Start `convex dev --local` |
| `npm run dev:emulate` | Start the local Google emulator with generated callback URLs |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |
| `npm run lint:fix` | Run oxlint with fixes |
| `npm run format` | Format the repo with oxfmt |
| `npm run format:check` | Check formatting with oxfmt |
| `npm run typecheck` | Run tsgo type checking |
| `npm run check` | Alias for `npm run typecheck` |

## Development Notes

- Use the `@/` alias for imports from `client/src`
- Add Convex functions inside `convex/`
- Use `useQuery` and `useMutation` from `convex/react` in the UI
- Add routes in `client/src/ConvexApp.tsx`

## Production Deployment On Replit

Development and production use different Convex deployments:

- **Development** uses the local backend created automatically during first-run setup
- **Development auth** uses emulated Google OAuth through `AUTH_GOOGLE_EMULATE_URL`
- **Production** is selected by `CONVEX_DEPLOY_KEY` during deploy

Before deploying, add the required production values in Replit:

- `CONVEX_DEPLOY_KEY`
- `VITE_CONVEX_URL`

If you enable Google OAuth, also configure the production callback values in Convex and in Google Cloud.

Do not set `AUTH_GOOGLE_EMULATE_URL` in production. When that variable is unset, the app uses the real Google provider with `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

## License

MIT
