-- Permite al maestro publicar una oferta de una materia fuera del catálogo
-- fijo de MATERIAS_TUTORIA (espanol/matematicas/ingles/historia): agrega
-- 'otros' como materia_id válido y una columna `materia_otro` para el
-- nombre libre que escribe el maestro (ej. "Robótica", "Contabilidad").
--
-- `materia_otro` es NOT NULL solo cuando materia_id = 'otros' y debe ser
-- NULL en cualquier otro caso, para no tener dos fuentes de verdad del
-- nombre de la materia cuando sí está en el catálogo fijo.

alter table public.ofertas_maestro
  drop constraint if exists ofertas_maestro_materia_id_check;

alter table public.ofertas_maestro
  add constraint ofertas_maestro_materia_id_check
  check (materia_id = any (array['espanol','matematicas','ingles','historia','otros']));

alter table public.ofertas_maestro
  add column materia_otro text;

alter table public.ofertas_maestro
  add constraint ofertas_maestro_materia_otro_check
  check (
    (materia_id = 'otros' and materia_otro is not null and char_length(trim(materia_otro)) > 0 and char_length(materia_otro) <= 60)
    or (materia_id <> 'otros' and materia_otro is null)
  );

-- Las siguientes 3 funciones ya denormalizaban om.materia_id en su
-- RETURNS TABLE; se agrega materia_otro para que el front-end pueda
-- mostrar el nombre libre en vez del literal 'otros'. CREATE OR REPLACE
-- no permite agregar una columna a un RETURNS TABLE existente, así que
-- hay que hacer DROP + CREATE (mismo cuerpo, solo se agrega la columna).

drop function if exists public.obtener_alumnos_ofertas_maestro();

create function public.obtener_alumnos_ofertas_maestro()
returns table (
  oferta_id uuid,
  materia_id text,
  materia_otro text,
  fecha_hora timestamptz,
  comprador_id uuid,
  nombre text,
  email text,
  telefono text,
  comprado_en timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    om.id as oferta_id,
    om.materia_id,
    om.materia_otro,
    om.fecha_hora,
    t.user_id as comprador_id,
    coalesce(p.nombre, fa.nombre) as nombre,
    u.email::text as email,
    fa.telefono,
    t.actualizado_en as comprado_en
  from public.transacciones t
  join public.ofertas_maestro om on om.id = t.oferta_maestro_id
  join auth.users u on u.id = t.user_id
  left join public.perfiles p on p.id = t.user_id
  left join lateral (
    select fa2.nombre, fa2.telefono
    from public.formularios_area fa2
    where fa2.user_id = t.user_id
    order by fa2.creado_en desc
    limit 1
  ) fa on true
  where om.creado_por = auth.uid()
    and t.estado_pago = 'completado'
  order by om.fecha_hora asc, t.actualizado_en asc;
$$;

revoke all on function public.obtener_alumnos_ofertas_maestro() from public;
grant execute on function public.obtener_alumnos_ofertas_maestro() to authenticated;

drop function if exists public.obtener_mis_transacciones_oferta_maestro();

create function public.obtener_mis_transacciones_oferta_maestro()
returns table (
  transaccion_id uuid,
  oferta_id uuid,
  materia_id text,
  materia_otro text,
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
    om.materia_otro,
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

drop function if exists public.admin_detalle_transacciones_profesores();

create function public.admin_detalle_transacciones_profesores()
returns table (
  transaccion_id uuid,
  profesor_id uuid,
  profesor_nombre text,
  profesor_email text,
  oferta_id uuid,
  materia_id text,
  materia_otro text,
  fecha_hora timestamptz,
  cuenta_clave text,
  alumno_nombre text,
  alumno_email text,
  monto_total numeric,
  comision_mxn numeric,
  monto_profesor_mxn numeric,
  pagado_profesor boolean,
  pagado_profesor_en timestamptz,
  pagado_en timestamptz
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
      t.id,
      om.creado_por,
      coalesce(pp.nombre, om.profesor),
      pu.email::text,
      om.id,
      om.materia_id,
      om.materia_otro,
      om.fecha_hora,
      om.cuenta_clave,
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
    join auth.users pu on pu.id = om.creado_por
    left join perfiles pp on pp.id = om.creado_por
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
    order by t.pagado_profesor asc, om.fecha_hora asc;
end;
$$;

revoke all on function public.admin_detalle_transacciones_profesores() from public;
grant execute on function public.admin_detalle_transacciones_profesores() to authenticated;
