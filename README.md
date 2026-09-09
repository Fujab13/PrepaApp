# PrepaApp

App de preparación para examen de admisión universitaria (estilo BUAP/EXANI-II): lecciones con preguntas, lecturas, examen de diagnóstico, tutorías 1:1 con profesores, tienda con monedas/pagos reales y un panel de administración.

**Stack**: React (Vite) · Supabase (Auth, Postgres, Storage, Edge Functions) · Stripe (vía Edge Functions, nunca desde el cliente) · KaTeX/react-katex para fórmulas · react-icons. Sin backend propio: toda la lógica de servidor vive en Supabase (RPCs de Postgres + Deno Edge Functions).

Ver `CLAUDE.md` para las convenciones de código, restricciones de seguridad y detalles de layout que un asistente de IA necesita antes de tocar este repo.

## Estructura (simplificada)

```
project-root/
├── CLAUDE.md                    # convenciones e instrucciones para trabajar en el repo
├── README.md                    # este archivo
└── frontend/                    # el proyecto real (raíz del package.json que importa)
    ├── public/
    │   ├── libros/               # PDFs descargables (guías por área, simulacros)
    │   └── svgs/, music/, ...    # assets estáticos servidos directo por Vercel
    ├── src/
    │   ├── App.jsx               # todas las rutas (react-router-dom v6, flat)
    │   ├── pages/                # una vista por ruta
    │   ├── components/           # UI reutilizable
    │   ├── context/              # AuthContext (sesión), StoreContext (compras)
    │   ├── hooks/                # p.ej. useProgreso.js
    │   ├── services/             # llamadas a Supabase (DB, RPCs, Storage, Edge Functions)
    │   ├── data/                 # contenido estático: examen.js, storeItems.js, libros.js,
    │   │                         # lecciones/*.json, lecturas/*.js
    │   ├── utils/                # helpers sin estado (haptics, LaTeX, íconos)
    │   └── styles/global.css     # tema oscuro vía variables CSS
    ├── supabase/
    │   ├── migrations/           # historial de cambios de esquema (SQL, timestamped)
    │   └── functions/            # 6 Edge Functions Deno (Stripe, magic links de soporte)
    └── referencia/                # notas de análisis, bancos de preguntas fuente, requerimientos
```

## Cómo agregar contenido

**Lecciones nuevas** (`src/data/lecciones/`): agrega un `<materia>.json` con `{ titulo, icono, color, descripcion, preguntas: [...] }`. No hace falta tocar ningún índice — `leccionesGratis.js` descubre automáticamente cualquier `.json` en esa carpeta (`import.meta.glob`). Cada item de `preguntas` es una pregunta (`pregunta`, `opciones`, `correcta`) o un bloque de explicación (solo `pregunta`, sin `opciones`).

**Lecturas nuevas** (`src/data/lecturas/`): agrega un `<materia>.js` con el mismo formato que los existentes, impórtalo en `lecturas/index.js` y añádelo al arreglo `LECTURAS` — a diferencia de lecciones, aquí sí hay que editar el índice a mano.

**Libros/PDFs nuevos**: copia el PDF a `public/libros/` y agrega una entrada (`id`, `nombre`, `archivo`, `color`) en `src/data/libros.js`. Si el PDF no se agrega ahí, queda invisible en la app aunque exista el archivo.

**Exámenes nuevos**: sigue el formato de `src/data/examen.js` — `secciones` (rangos de `id` por materia) y `preguntas` (con `respuestas` en formato `"A. texto"` e `inciso_correcto`). Ver `referencia/requerimientos/preguntas_examen.txt` para la plantilla y los requisitos de calidad esperados.

## Modelo de progreso (Supabase)

Una fila por usuario y materia en `progreso_usuario`, con RLS para que cada quien solo vea/edite la suya:

```sql
create table progreso_usuario (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  materia_id text not null,
  progreso int default 0,
  fecha date default current_date,
  unique(user_id, materia_id, fecha)
);
alter table progreso_usuario enable row level security;
create policy "usuarios ven su propio progreso"
on progreso_usuario for all
using (auth.uid() = user_id);
```

Esquemas más recientes (tutorías, ofertas, calificaciones, pagos) viven como migraciones individuales en `frontend/supabase/migrations/`.

## Configuración local

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Variables de entorno (`frontend/.env`, ver `.env.example`): solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Las llaves privadas (Stripe, `SUPABASE_SERVICE_ROLE_KEY`) nunca van aquí — viven solo en el entorno de las Edge Functions.

**Supabase → Authentication → URL Configuration**:
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`, `http://localhost:5173`

**Google Cloud Console → APIs & Services → Credentials** (OAuth Client ID):
- Authorized JavaScript origins: `http://localhost:5173`

`vite.config.js` expone el dev server en `0.0.0.0:5173` para poder probarlo desde un celular real vía túnel de ngrok — si usas otro subdominio de ngrok, agrégalo a `allowedHosts` ahí.

## Ideas pendientes / backlog

Sin construir todavía, quedan aquí como referencia de intención futura:
- Cuestionario corto (6-12 preguntas) que estime la probabilidad de admisión a una carrera específica de la BUAP, con y sin apoyo de tutoría.
- Flashcards generadas a partir de los puntos clave del proceso de admisión (convocatoria, registro, documentos, resultados).
- Sistema de recordatorios por correo para usuarios premium sobre fechas importantes del proceso de admisión.
- Contenido de Lección/Lectura para Inglés e Historia (hoy solo existen para Español y Matemáticas) — planeado como contenido de pago.
