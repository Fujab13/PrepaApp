-- Reportes anónimos sobre un profesor (estilo Roblox: categoría con
-- gravedad implícita + descripción libre), abiertos a CUALQUIERA —
-- incluido un visitante sin cuenta ni sesión. Es la primera función de
-- este proyecto concedida al rol `anon`; todas las demás escrituras
-- siempre exigieron `authenticated`. Se documenta aquí el trade-off:
--
--   - No hay infraestructura de rate-limiting/CAPTCHA en este proyecto
--     (sin pg_cron, sin Edge de terceros para esto), así que
--     `crear_reporte_profesor` es, por diseño explícito del dueño del
--     producto, spameable por cualquiera con la anon key (que ya es
--     pública en el bundle del frontend, como cualquier proyecto Supabase).
--   - El radio de daño se mantiene acotado a propósito: la tabla `reportes`
--     no tiene NINGUNA policy de select (ni siquiera para el propio
--     reportante), todo pasa por RPCs; un reporte insertado no dispara
--     correos, no cambia `profesores.activo`/`verificado` ni ningún dato
--     visible públicamente — solo aterriza en una cola que un admin revisa
--     a mano. Spam en esa cola es una molestia para el equipo, no una vía
--     para corromper datos ni afectar a otros usuarios.
--   - `descripcion` exige mínimo 10 caracteres (evita el caso trivial de
--     un reporte vacío/un solo carácter) pero esto NO es una defensa real
--     contra abuso automatizado, solo una validación de calidad de datos.
--
-- Diseño del "estilo Roblox": el reportante elige una CATEGORÍA concreta
-- (p. ej. "Acoso o intimidación") en vez de autoevaluar qué tan grave fue
-- su propio reporte — la gravedad ('leve'/'moderado'/'grave') es una
-- propiedad de la categoría, fijada por el frontend a partir de un catálogo
-- fijo (ver data/motivosReporte.js) y solo se revalida en el CHECK de la
-- columna, igual que Roblox no te pregunta "qué tan grave fue esto", solo
-- a qué categoría pertenece.
--
-- `reportante_user_id` es NULL para quien reporta sin sesión (el caso que
-- pide explícitamente el dueño del producto); si hay sesión se guarda para
-- que el admin pueda ver contexto, pero nunca se expone al propio
-- reportante ni se usa para nada más. `reportante_contacto` es un campo de
-- texto libre y opcional (no se fuerza formato de correo) para que quien
-- reporta sin cuenta pueda dejar una forma de que el equipo le siga la
-- pista si quiere, sin obligarlo.

-- ── reportes ───────────────────────────────────────────────────────────────
create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  profesor_user_id uuid not null references auth.users(id) on delete cascade,
  oferta_maestro_id uuid references public.ofertas_maestro(id) on delete set null,
  categoria text not null check (categoria = any (array[
    'no_asistio', 'mala_calidad', 'cobro_indebido', 'lenguaje_ofensivo',
    'solicitud_informacion_personal', 'discriminacion', 'acoso_o_intimidacion',
    'contenido_inapropiado', 'fraude_o_estafa', 'otro'
  ])),
  gravedad text not null check (gravedad = any (array['leve', 'moderado', 'grave'])),
  descripcion text not null check (char_length(trim(descripcion)) between 10 and 1000),
  reportante_user_id uuid references auth.users(id) on delete set null,
  reportante_contacto text check (reportante_contacto is null or char_length(reportante_contacto) <= 200),
  estado text not null default 'pendiente' check (estado = any (array['pendiente', 'en_revision', 'resuelto', 'descartado'])),
  notas_admin text,
  creado_en timestamptz not null default now()
);

alter table public.reportes enable row level security;
revoke all on public.reportes from anon, authenticated;
-- Sin policies a propósito, igual que `admins`/`maestros`: ni el propio
-- reportante puede leer reportes. Todo pasa por RPCs SECURITY DEFINER.

create index reportes_profesor_idx on public.reportes (profesor_user_id);
create index reportes_estado_idx on public.reportes (estado);

-- ── crear_reporte_profesor: abierta a anon + authenticated ───────────────
create or replace function public.crear_reporte_profesor(
  p_profesor_user_id uuid,
  p_categoria text,
  p_gravedad text,
  p_descripcion text,
  p_oferta_maestro_id uuid default null,
  p_contacto text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_profesor_user_id is null then
    raise exception 'profesor_requerido';
  end if;

  if not exists (select 1 from profesores where user_id = p_profesor_user_id) then
    raise exception 'profesor_no_encontrado';
  end if;

  if p_categoria is null or p_categoria = '' then
    raise exception 'categoria_requerida';
  end if;

  if p_gravedad is null or p_gravedad not in ('leve', 'moderado', 'grave') then
    raise exception 'gravedad_invalida';
  end if;

  if p_descripcion is null or char_length(trim(p_descripcion)) < 10 then
    raise exception 'descripcion_muy_corta';
  end if;

  if char_length(p_descripcion) > 1000 then
    raise exception 'descripcion_muy_larga';
  end if;

  if p_contacto is not null and char_length(p_contacto) > 200 then
    raise exception 'contacto_muy_largo';
  end if;

  insert into reportes (
    profesor_user_id, oferta_maestro_id, categoria, gravedad, descripcion,
    reportante_user_id, reportante_contacto
  ) values (
    p_profesor_user_id, p_oferta_maestro_id, p_categoria, p_gravedad, trim(p_descripcion),
    auth.uid(), nullif(trim(p_contacto), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.crear_reporte_profesor(uuid, text, text, text, uuid, text) from public;
grant execute on function public.crear_reporte_profesor(uuid, text, text, text, uuid, text) to anon, authenticated;

-- ── admin_listar_reportes ──────────────────────────────────────────────────
create or replace function public.admin_listar_reportes()
returns table (
  id uuid,
  profesor_user_id uuid,
  profesor_nombre text,
  oferta_maestro_id uuid,
  categoria text,
  gravedad text,
  descripcion text,
  reportante_user_id uuid,
  reportante_email text,
  reportante_contacto text,
  estado text,
  notas_admin text,
  creado_en timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  return query
    select
      r.id, r.profesor_user_id, coalesce(p.nombre, '—'), r.oferta_maestro_id,
      r.categoria, r.gravedad, r.descripcion, r.reportante_user_id,
      ru.email::text, r.reportante_contacto, r.estado, r.notas_admin, r.creado_en
    from reportes r
    left join profesores p on p.user_id = r.profesor_user_id
    left join auth.users ru on ru.id = r.reportante_user_id
    order by
      case r.gravedad when 'grave' then 0 when 'moderado' then 1 else 2 end,
      case r.estado when 'pendiente' then 0 when 'en_revision' then 1 else 2 end,
      r.creado_en desc;
end;
$$;

revoke all on function public.admin_listar_reportes() from public;
grant execute on function public.admin_listar_reportes() to authenticated;

-- ── admin_actualizar_estado_reporte ────────────────────────────────────────
create or replace function public.admin_actualizar_estado_reporte(
  p_reporte_id uuid,
  p_estado text,
  p_notas_admin text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  if p_estado not in ('pendiente', 'en_revision', 'resuelto', 'descartado') then
    raise exception 'estado_invalido';
  end if;

  update reportes
    set estado = p_estado,
        notas_admin = coalesce(nullif(trim(p_notas_admin), ''), notas_admin)
    where id = p_reporte_id;

  if not found then
    raise exception 'reporte_no_encontrado';
  end if;
end;
$$;

revoke all on function public.admin_actualizar_estado_reporte(uuid, text, text) from public;
grant execute on function public.admin_actualizar_estado_reporte(uuid, text, text) to authenticated;

-- ── perfil público de profesor: ahora también visible sin sesión ─────────
-- PerfilProfesor.jsx necesita cargar sin login para que un visitante sin
-- cuenta pueda identificar a quién está reportando (mismo espíritu "página
-- pública tipo Amazon" con el que se diseñó la página).
grant execute on function public.obtener_perfil_profesor(uuid) to anon;
grant execute on function public.obtener_calificaciones_profesor(uuid) to anon;
