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
4. Wait for setup to finish. Replit will then start the backend and frontend automatically.

The first run creates a **development** Convex deployment just for that remix and saves the generated values in `.env.local`.

For a more detailed walkthrough, see [SETUP.md](./SETUP.md).

## Local Development

If you are running the project outside Replit:

```bash
npm install
npx convex dev --once
npx @convex-dev/auth --skip-git-check --allow-dirty-git-state
npm run dev
```

After the one-time setup, keep Convex and Vite running during development:

```bash
npx convex dev
npm run dev
```

## How The Template Works

- `client/src/main.tsx` loads `ConvexApp` when `VITE_CONVEX_URL` exists.
- If that variable is missing, it loads `DemoApp` so the project still opens cleanly before setup is complete.
- `script/setup.sh` handles first-run setup on Replit and writes `.setup-done` so it only runs once per remix.
- `.replit` runs `Setup` first, then starts the frontend and Convex backend in parallel.

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
│   └── setup.sh
├── .replit
├── SETUP.md
├── package.json
└── vite.config.ts
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run dev:backend` | Start `convex dev` |
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

- **Development** is created automatically during first-run setup
- **Production** is selected by `CONVEX_DEPLOY_KEY` during deploy

Before deploying, add the required production values in Replit:

- `CONVEX_DEPLOY_KEY`
- `VITE_CONVEX_URL`

If you enable Google OAuth, also configure the production callback values in Convex and in Google Cloud.

## License

MIT
