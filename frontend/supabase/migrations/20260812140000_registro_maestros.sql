-- Gate de acceso al portal de maestros: hasta esta migración, cualquier
-- usuario autenticado podía publicar en `ofertas_maestro` (ver comentario
-- original en 20260809120000_ofertas_maestro.sql:9-10, que ya anunciaba
-- "el dueño del proyecto lo agregará como contraseña en el portal más
-- adelante"). Esto agrega la tabla `maestros` (quién puede publicar),
-- refuerza las policies de insert/update de `ofertas_maestro` con ese gate,
-- y agrega las RPCs que necesita el registro admin-driven de maestros
-- (ver edge function registrar-maestro) más el propio portal de ganancias
-- del maestro.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - `maestros` es deliberadamente su propia tabla, NO se reusa
--     `profesores` (esa pertenece al sistema viejo de tutorías 1-a-1 con
--     Stripe Connect, ya confirmado en desuso, con columnas/semántica que
--     no aplican aquí: tarifa_hora_mxn, stripe_account_id, etc.). Mezclar
--     ambos conceptos acoplaría `ofertas_maestro` a un sistema que se está
--     retirando.
--   - Igual que `admins`, sin ninguna policy: ni el propio maestro puede
--     leer/escribir su fila directo, todo pasa por `soy_maestro_actual()` o
--     las RPCs de admin.
--   - El backfill inserta como maestro a cualquiera que ya tenga una fila
--     en `ofertas_maestro`: sin esto, este gate bloquearía de golpe a
--     quien ya estaba publicando antes de que existiera el concepto de
--     "maestro registrado".
--   - `soy_maestro_actual()` se usa DENTRO de las policies de
--     `ofertas_maestro` (no solo se expone al cliente): Postgres permite
--     llamar funciones `security definer`/`stable` desde un `with check`,
--     mismo patrón ya usado en el resto del proyecto para checks
--     reutilizables.
--   - `obtener_mis_transacciones_oferta_maestro` es la versión "solo lo
--     mío" de `admin_detalle_transacciones_profesores` (20260812130000):
--     mismo shape de columnas relevantes para el maestro, pero sin
--     `es_admin_actual()` — el filtro `om.creado_por = auth.uid()` ya es
--     suficiente aislamiento.

-- ── maestros ────────────────────────────────────────────────────────────
create table public.maestros (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  activo boolean not null default true,
  registrado_por uuid references auth.users(id) on delete set null,
  creado_en timestamptz not null default now()
);

alter table public.maestros enable row level security;
revoke all on public.maestros from anon, authenticated;

insert into public.maestros (user_id, nombre)
select distinct om.creado_por, coalesce(p.nombre, om.profesor)
from public.ofertas_maestro om
left join public.perfiles p on p.id = om.creado_por
on conflict (user_id) do nothing;

create or replace function public.soy_maestro_actual()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.maestros where user_id = auth.uid() and activo);
$$;

revoke all on function public.soy_maestro_actual() from public;
grant execute on function public.soy_maestro_actual() to authenticated;

-- ── ofertas_maestro: exigir ser maestro activo para crear/editar ─────────
drop policy if exists "insert_propia" on public.ofertas_maestro;
create policy "insert_propia" on public.ofertas_maestro
  for insert to authenticated
  with check (creado_por = auth.uid() and public.soy_maestro_actual());

drop policy if exists "update_propia" on public.ofertas_maestro;
create policy "update_propia" on public.ofertas_maestro
  for update to authenticated
  using (creado_por = auth.uid() and public.soy_maestro_actual())
  with check (creado_por = auth.uid() and public.soy_maestro_actual());

-- ── administración de maestros (solo admins) ──────────────────────────────
create or replace function public.admin_listar_maestros()
returns table (
  user_id uuid,
  nombre text,
  email text,
  activo boolean,
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
    select m.user_id, m.nombre, u.email::text, m.activo, m.creado_en
    from maestros m
    join auth.users u on u.id = m.user_id
    order by m.creado_en desc;
end;
$$;

revoke all on function public.admin_listar_maestros() from public;
grant execute on function public.admin_listar_maestros() to authenticated;

create or replace function public.admin_set_maestro_activo(p_user_id uuid, p_activo boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  update maestros set activo = p_activo where user_id = p_user_id;

  if not found then
    raise exception 'maestro_no_encontrado';
  end if;
end;
$$;

revoke all on function public.admin_set_maestro_activo(uuid, boolean) from public;
grant execute on function public.admin_set_maestro_activo(uuid, boolean) to authenticated;

-- ── obtener_mis_transacciones_oferta_maestro (portal de ganancias) ───────
create or replace function public.obtener_mis_transacciones_oferta_maestro()
returns table (
  transaccion_id uuid,
  oferta_id uuid,
  materia_id text,
  fecha_hora timestamptz,
  alumno_nombre text,
  alumno_email text,
  monto_total numeric,
  comision_mxn numeric,
  monto_profesor_mxn numeric,
  pagado_profesor boolean,
  pagado_profesor_en timestamptz,
  pagado_en timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    t.id,
    om.id,
    om.materia_id,
    om.fecha_hora,
    coalesce(ap.nombre, af.nombre),
    au.email::text,
    t.monto_total,
    t.comision_mxn,
    t.monto_profesor_mxn,
    t.pagado_profesor,
    t.pagado_profesor_en,
    t.actualizado_en
  from transacciones t
  join ofertas_maestro om on om.id = t.oferta_maestro_id
  join auth.users au on au.id = t.user_id
  left join perfiles ap on ap.id = t.user_id
  left join lateral (
    select fa.nombre
    from formularios_area fa
    where fa.user_id = t.user_id
    order by fa.creado_en desc
    limit 1
  ) af on true
  where t.estado_pago = 'completado'
    and om.creado_por = auth.uid()
  order by t.actualizado_en desc;
$$;

revoke all on function public.obtener_mis_transacciones_oferta_maestro() from public;
grant execute on function public.obtener_mis_transacciones_oferta_maestro() to authenticated;
