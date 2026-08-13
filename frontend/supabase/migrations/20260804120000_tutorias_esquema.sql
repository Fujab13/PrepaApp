-- Esquema para "Tutorías 1-a-1": el alumno paga una clase con un maestro
-- contratado externamente (tipo Superprof), la plataforma se queda con una
-- comisión (18%, vía Stripe Connect) y el maestro recibe automáticamente el
-- contexto real del alumno (examen diagnóstico + formulario de área).
--
-- Decisiones de seguridad clave, documentadas aquí porque no son obvias
-- mirando solo las columnas:
--   - resultados_examen / formularios_area son de SOLO APÉNDICE (select+insert
--     propios, sin update/delete) para que un alumno no pueda alterar
--     retroactivamente lo que ya se le mandó a un maestro.
--   - profesores no tiene NINGUNA policy de select para anon/authenticated:
--     el cliente nunca debe ver tarifa, contacto o notas admin directo. Todo
--     acceso pasa por RPCs SECURITY DEFINER (ver la migración de RPCs).
--   - solicitudes_tutoria no tiene policy de insert/update para authenticated:
--     precio/comisión/maestro asignado solo se escriben desde RPCs, nunca
--     desde el cliente, para que no se puedan manipular.
--   - El exclusion constraint sobre (profesor_id, rango_horario) hace que un
--     mismo maestro no pueda quedar doble-agendado en horarios que se
--     traslapan, sin depender de que el código de arriba nunca tenga un bug.

create extension if not exists btree_gist;

-- ── resultados_examen ───────────────────────────────────────────────────────
create table public.resultados_examen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  precision_global int not null check (precision_global between 0 and 100),
  stats_por_seccion jsonb not null,
  tiempo_total_segundos int,
  creado_en timestamptz not null default now()
);

alter table public.resultados_examen enable row level security;

create policy "select_propio" on public.resultados_examen
  for select to authenticated using (auth.uid() = user_id);

create policy "insert_propio" on public.resultados_examen
  for insert to authenticated with check (auth.uid() = user_id);

create index resultados_examen_user_creado_idx
  on public.resultados_examen (user_id, creado_en desc);

-- ── formularios_area ────────────────────────────────────────────────────────
create table public.formularios_area (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  edad text,
  email_contacto text,
  telefono text,
  grado text not null,
  area_interes text not null,
  carrera_interes text,
  autoevaluacion jsonb not null default '{}'::jsonb,
  horas_estudio text,
  preferencias jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);

alter table public.formularios_area enable row level security;

create policy "select_propio" on public.formularios_area
  for select to authenticated using (auth.uid() = user_id);

create policy "insert_propio" on public.formularios_area
  for insert to authenticated with check (auth.uid() = user_id);

create index formularios_area_user_creado_idx
  on public.formularios_area (user_id, creado_en desc);

-- ── profesores ───────────────────────────────────────────────────────────────
-- Catálogo administrado a mano en Supabase Studio (igual que `productos`).
-- Deliberadamente sin ninguna policy de select: el cliente jamás lee esta
-- tabla directo.
create table public.profesores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email_contacto text not null,
  telefono_contacto text,
  materias text[] not null default '{}'
    check (materias <@ array['espanol','matematicas','ingles','historia']),
  tarifa_hora_mxn numeric(10,2) not null check (tarifa_hora_mxn > 0),
  activo boolean not null default true,
  stripe_account_id text unique,
  onboarding_completo boolean not null default false,
  notas_admin text,
  creado_en timestamptz not null default now()
);

alter table public.profesores enable row level security;
revoke all on public.profesores from anon, authenticated;

-- ── solicitudes_tutoria ──────────────────────────────────────────────────────
create table public.solicitudes_tutoria (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profesor_id uuid not null references public.profesores(id),
  materia_id text not null
    check (materia_id = any (array['espanol','matematicas','ingles','historia'])),
  fecha_hora_solicitada timestamptz not null,
  duracion_minutos int not null check (duracion_minutos = any (array[60,90,120])),
  notas_alumno text check (char_length(notas_alumno) <= 500),
  precio_total_mxn numeric(10,2) not null check (precio_total_mxn > 0),
  comision_mxn numeric(10,2) not null check (comision_mxn >= 0),
  monto_profesor_mxn numeric(10,2) not null check (monto_profesor_mxn >= 0),
  estado text not null default 'pendiente_pago'
    check (estado in ('pendiente_pago','confirmada','cancelada','completada')),
  stripe_checkout_session_id text unique,
  resultado_examen_id uuid references public.resultados_examen(id),
  formulario_area_id uuid references public.formularios_area(id),
  meeting_url text,
  notificaciones_enviadas boolean not null default false,
  notificaciones_en_proceso boolean not null default false,
  creado_en timestamptz not null default now(),
  confirmada_en timestamptz,
  -- No puede ser "generated always as (...) stored": timestamptz + interval
  -- es STABLE (depende del GUC de timezone), no IMMUTABLE, y Postgres exige
  -- IMMUTABLE en columnas generadas. Se calcula en su lugar con un trigger
  -- BEFORE INSERT/UPDATE (ver más abajo), que corre antes de que se evalúe
  -- el exclusion constraint de abajo, así que el efecto es idéntico.
  rango_horario tstzrange,
  constraint monto_cuadra check (monto_profesor_mxn + comision_mxn = precio_total_mxn)
);

create or replace function public.calcular_rango_horario_solicitud_tutoria()
returns trigger
language plpgsql
as $$
begin
  new.rango_horario := tstzrange(
    new.fecha_hora_solicitada,
    new.fecha_hora_solicitada + (new.duracion_minutos || ' minutes')::interval,
    '[)'
  );
  return new;
end;
$$;

create trigger trg_calcular_rango_horario_solicitud_tutoria
  before insert or update of fecha_hora_solicitada, duracion_minutos
  on public.solicitudes_tutoria
  for each row execute function public.calcular_rango_horario_solicitud_tutoria();

-- Estructuralmente imposible que un mismo maestro tenga dos solicitudes
-- activas (pendiente de pago o confirmada) que se traslapen en el tiempo.
alter table public.solicitudes_tutoria
  add constraint solicitudes_tutoria_sin_solape
  exclude using gist (profesor_id with =, rango_horario with &&)
  where (estado in ('pendiente_pago', 'confirmada'));

alter table public.solicitudes_tutoria enable row level security;

create policy "select_propia" on public.solicitudes_tutoria
  for select to authenticated using (auth.uid() = user_id);
-- Sin policies de insert/update: todo pasa por RPCs SECURITY DEFINER.

create index solicitudes_tutoria_user_idx on public.solicitudes_tutoria (user_id);
create index solicitudes_tutoria_profesor_idx on public.solicitudes_tutoria (profesor_id);
create index solicitudes_tutoria_session_idx on public.solicitudes_tutoria (stripe_checkout_session_id);
