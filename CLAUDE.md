# PrepaApp

React (`.jsx` / `.js`) on Vite, Supabase (Auth, PostgreSQL, and Storage), Stripe for payments, react-icons, KaTeX/LaTeX for formula rendering, Node.js, deployed on Vercel. **FORBIDDEN: Executing destructive scripts in Supabase (`TRUNCATE`, `DROP TABLE`, `delete()` without a `where` clause), deleting storage buckets, or overwriting database schemas; in case of migration or database conflicts, investigate and ask first—NEVER perform forced resets or delete tables in production or development.** Ensure mobile-first design (touch targets at least 44px). Routes and views in `src/pages/`, reusable UI components in `src/components/`, services and integrations in `src/services/`. Prefer adapting existing components over creating new ones. Environment variables: exclusively use `import.meta.env` for public variables (`VITE_*`) and NEVER expose private keys (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) on the frontend. Educational material: Use only minimal dummy/test data when strictly necessary.

## Project layout

The real project lives in `frontend/` (the repo root's `package-lock.json` is a stub, ignore it). Package manager is npm — no yarn/pnpm lockfiles. `frontend/package.json` only defines `dev`, `build`, and `preview` scripts; **there is no `lint` or `test` script**, and no test framework (vitest/jest/cypress) or linter (ESLint/Prettier) is configured in this repo. Don't assume `npm test` or `npm run lint` exist.

`frontend/src/` beyond `pages/`, `components/`, `services/`:
- `context/` — `AuthContext.jsx` (Supabase session/user) and `StoreContext.jsx` (store/purchase state), both wrap `<Routes>` in `App.jsx`. No Redux/Zustand.
- `hooks/` — e.g. `useProgreso.js` for user progress logic.
- `data/` — static content: `examen.js`, `leccionesGratis.js`, `libros.js`, `storeItems.js`, `unidades.js`, plus `lecciones/` and `lecturas/` subfolders. New lessons/readings are added as a JS file and re-exported via each folder's `index.js` (see root `README.md` for the exact steps and the `progreso_usuario` SQL/RLS model).
- `utils/` — e.g. `haptics.js` (vibration on button taps, used globally in `App.jsx`), `renderIconoMateria.js`.
- `styles/global.css` — dark theme via CSS custom properties (`--bg`, `--surface`, `--correct`, `--wrong`, etc.).
- Note: `components/` also holds a few non-component `.js` files (`haptics.js`, `progreso.js`, `unidades.js`) alongside `.jsx` components — it isn't strictly components-only.

**Supabase client**: use `src/services/supabaseClient.js` (the one actually imported by `AuthContext`). `src/supabase.js` is a duplicate/legacy client — don't add a third instance, and prefer removing `src/supabase.js` if touching that area.

**Routing**: `react-router-dom` v6, flat routes declared in `src/App.jsx` (`/`, `/leccion/:materiaId`, `/lectura/:materiaId`, `/login`, `/tienda`, `/examen`, `/resultados`, `/inventario`). No route-guard components — pages check `useAuth()` themselves.

**Naming**: pages/components are PascalCase `.jsx`; utility/data files are camelCase `.js`; domain terms are in Spanish (`Leccion`, `Lectura`, `Examen`, `Resultados`, `progreso`, `materia`) — keep new code consistent with this.

## Supabase backend & payments

`frontend/supabase/` has `config.toml` and `functions/` with two Deno edge functions: `crear-sesion-pago` (creates the Stripe checkout session) and `stripe-webhook` (handles the Stripe webhook) — Stripe is integrated server-side via Supabase Edge Functions, not the client SDK. No `migrations/` folder exists; schema changes happen elsewhere (ask before assuming how to apply them). `.env.example` only documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; Stripe secret keys and `SUPABASE_SERVICE_ROLE_KEY` live only inside the edge functions' own env, never in the frontend `.env`.

## Deployment & dev server

`vercel.json` only does a SPA rewrite (`/(.*) → /index.html`), no other build overrides. `vite.config.js` binds the dev server to `0.0.0.0:5173` with an `allowedHosts` entry for an ngrok tunnel — local dev is sometimes tested on real mobile devices via ngrok tunnel.
