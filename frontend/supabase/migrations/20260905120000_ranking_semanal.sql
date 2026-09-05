-- Ranking semanal de actividad para el fondo de "/tutorias" (lista pública,
-- sin requerir sesión — Tutorias.jsx ya no exige login para verse).
--
-- No se reutiliza `profesores.calificacion_promedio`/`numero_calificaciones`
-- (20260826140000): esa arquitectura califica a un PROFESOR desde sus
-- alumnos (1-5 estrellas + comentario, un review por par profesor-alumno,
-- pensada para un "perfil de vendedor") y no tiene noción de tiempo ni de
-- "actividad de la semana" — no encaja con un ranking de ALUMNOS por
-- lecciones/examen resueltos en los últimos 7 días. Se construye una
-- arquitectura de puntos aparte, pensada para esto.
--
-- Sistema de puntos (ver resumen también en el código del frontend):
--   - +10 puntos por cada UNIDAD que un alumno completa en cualquier
--     materia (se detecta por el trigger de abajo comparando
--     unidad_actual antes/después en progreso_usuario).
--   - +100 a +400 puntos por completar el Examen Simulador: 100 fijos +
--     3 por cada punto de precisión global (0-100), para que un examen
--     bien resuelto valga tanto como 10-40 lecciones — "de forma
--     significativa", como se pidió.
--   - El ranking suma solo los puntos con creado_en dentro de los últimos
--     7 días corridos (no semana de calendario): un evento de hace 8 días
--     deja de contar solo, sin necesidad de limpieza ni cron.
--
-- Se registra cada evento en una tabla propia (`puntos_actividad`) en vez
-- de derivar puntos on-the-fly de progreso_usuario/resultados_examen
-- porque esas dos tablas solo guardan el ESTADO ACTUAL (se sobreescriben
-- con upsert/se borra todo menos el último resultado) — no hay forma de
-- saber cuánto avanzó alguien "en los últimos 7 días" sin una bitácora de
-- eventos con su propia fecha, inmutable.
--
-- Los triggers son SECURITY DEFINER a propósito: progreso_usuario y
-- resultados_examen las escribe el cliente directamente (RLS "cada quien
-- lo suyo"), y puntos_actividad no tiene ninguna policy para
-- `authenticated` (nadie debe poder inflar sus propios puntos insertando
-- filas a mano) — sin SECURITY DEFINER, el intento de INSERT del trigger
-- fallaría por RLS y tumbaría el guardado normal de progreso/examen.
--
-- Advertencia de diseño (no se resuelve aquí, se documenta): como
-- progreso_usuario.unidad_actual lo escribe el cliente directamente (sin
-- validar respuestas server-side), alguien podría en teoría subir su
-- propio unidad_actual de golpe para ganar puntos de lecciones que no
-- hizo. Es el mismo modelo de confianza que ya tenía el progreso antes de
-- este ranking (afecta la barra de progreso normal igual); illetrar eso
-- requeriría mover la validación de respuestas al servidor, fuera del
-- alcance de este cambio.

create table public.puntos_actividad (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo = any (array['leccion_completada', 'examen_completado'])),
  puntos int not null check (puntos > 0),
  detalle jsonb,
  creado_en timestamptz not null default now()
);

alter table public.puntos_actividad enable row level security;
-- Sin policies para `authenticated`/`anon`: solo lo escriben los triggers
-- de abajo (SECURITY DEFINER) y solo se lee vía obtener_ranking_semanal().

create index puntos_actividad_user_idx on public.puntos_actividad (user_id, creado_en);
create index puntos_actividad_creado_idx on public.puntos_actividad (creado_en);

-- ── otorgar_puntos_leccion: +10 por cada unidad que se cruza ────────────
create or replace function public.otorgar_puntos_leccion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anterior int := coalesce(old.unidad_actual, 1);
  v_nuevo int := coalesce(new.unidad_actual, 1);
  v_delta int := greatest(v_nuevo - v_anterior, 0);
begin
  if v_delta > 0 then
    insert into puntos_actividad (user_id, tipo, puntos, detalle)
    values (
      new.user_id,
      'leccion_completada',
      v_delta * 10,
      jsonb_build_object('materia_id', new.materia_id, 'unidades', v_delta)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_progreso_usuario_cambia on public.progreso_usuario;
create trigger on_progreso_usuario_cambia
  after insert or update on public.progreso_usuario
  for each row execute function public.otorgar_puntos_leccion();

-- ── otorgar_puntos_examen: 100 + 3 por punto de precisión (100-400) ─────
create or replace function public.otorgar_puntos_examen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_puntos int := 100 + (coalesce(new.precision_global, 0) * 3);
begin
  insert into puntos_actividad (user_id, tipo, puntos, detalle)
  values (
    new.user_id,
    'examen_completado',
    v_puntos,
    jsonb_build_object('precision_global', new.precision_global)
  );
  return new;
end;
$$;

drop trigger if exists on_resultado_examen_creado on public.resultados_examen;
create trigger on_resultado_examen_creado
  after insert on public.resultados_examen
  for each row execute function public.otorgar_puntos_examen();

-- ── obtener_ranking_semanal: top 25 de los últimos 7 días ───────────────
-- Público (grant a anon incluido): Tutorias.jsx no exige sesión para
-- verse, y el ranking solo expone el prefijo del correo (antes de la @),
-- nunca el correo completo ni ningún otro dato del usuario.
create or replace function public.obtener_ranking_semanal()
returns table (
  user_id uuid,
  nombre text,
  puntos bigint,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pa.user_id,
    split_part(u.email, '@', 1) as nombre,
    sum(pa.puntos) as puntos,
    row_number() over (order by sum(pa.puntos) desc, min(pa.creado_en) asc) as posicion
  from puntos_actividad pa
  join auth.users u on u.id = pa.user_id
  where pa.creado_en >= now() - interval '7 days'
  group by pa.user_id, u.email
  order by puntos desc, posicion asc
  limit 25;
$$;

revoke all on function public.obtener_ranking_semanal() from public;
grant execute on function public.obtener_ranking_semanal() to authenticated, anon;
