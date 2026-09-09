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
- Note: `components/` also holds one non-component `.js` file, `progreso.js`, alongside `.jsx` components — it isn't strictly components-only. (`haptics.js` lives in `utils/`, not here; `unidades.js` lives in `data/`, not here — despite the similar naming, neither is in `components/`.)

**Supabase client**: use `src/services/supabaseClient.js` (the one actually imported by `AuthContext`). `src/supabase.js` is a duplicate/legacy client — don't add a third instance, and prefer removing `src/supabase.js` if touching that area.

**Routing**: `react-router-dom` v6, flat routes declared in `src/App.jsx`. No route-guard components — pages check `useAuth()` themselves. Core: `/`, `/leccion/:materiaId`, `/lectura/:materiaId`, `/login`, `/actualizar-password`, `/tienda`, `/examen`, `/examen/:examenId`, `/inventario`, `/formulario-area`, `/informe-resultados`. Tutorías: `/tutorias`, `/tutorias/alumno`, `/tutorias/maestro`, `/tutorias/maestro/alumnos`, `/tutorias/maestro/ganancias`, `/perfil-profesor/:profesorId`, `/ofertas`, `/ofertas/publicar`, `/oferta-confirmada`. Admin: `/admin/pagos`, `/admin/maestros`, `/admin/reportes`, `/admin/ofertas`. There is no `/resultados` route — results are shown as in-page state, not a separate route.

**Naming**: pages/components are PascalCase `.jsx`; utility/data files are camelCase `.js`; domain terms are in Spanish (`Leccion`, `Lectura`, `Examen`, `Resultados`, `progreso`, `materia`) — keep new code consistent with this.

## Supabase backend & payments

`frontend/supabase/` has `config.toml`, a `migrations/` folder (38+ timestamped SQL files — schema changes DO go through here, apply them the same way as the existing ones; this is not a project without migrations), and `functions/` with six Deno edge functions — Stripe is integrated server-side via these, not the client SDK:
- `crear-sesion-pago` — creates the Stripe Checkout session for a Tienda purchase.
- `crear-sesion-pago-oferta-maestro` — creates the Checkout session for a tutoring-offer seat already reserved (price and availability were already resolved/frozen at reservation time; only reads `transaccion_id`, never `oferta_id`, from the request body).
- `stripe-webhook` — handles `checkout.session.completed` and writes the confirmed purchase.
- `verificar-pago-producto` — safety net for `/inventario`: if the webhook is late or fails, asks Stripe directly for the session status and applies the same RPC the webhook would have.
- `verificar-pago-oferta-maestro` — same safety-net pattern as above, for `/oferta-confirmada`.
- `admin-acceso-profesor` — generates a Supabase magic link (`auth.admin.generateLink`, needs the service role) so an admin can sign in directly as a teacher account for support purposes; the frontend signs the admin out first, so this is a real session swap, not impersonation-while-staying-logged-in.

`.env.example` only documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; Stripe secret keys and `SUPABASE_SERVICE_ROLE_KEY` live only inside the edge functions' own env, never in the frontend `.env`.

## Deployment & dev server

`vercel.json` does the SPA rewrite (`/(.*) → /index.html`) plus long-lived `Cache-Control` headers for static assets (`/assets/`, `/svgs/`, `/libros/`, `/temarios/`) — no other build overrides. `vite.config.js` binds the dev server to `0.0.0.0:5173` with an `allowedHosts` entry for an ngrok tunnel — local dev is sometimes tested on real mobile devices via ngrok tunnel.
