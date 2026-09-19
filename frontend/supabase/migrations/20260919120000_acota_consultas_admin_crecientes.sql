-- Acota dos consultas de admin que traían TODA la tabla sin límite ni
-- filtro de fecha (admin_detalle_transacciones_profesores y
-- admin_listar_reportes) — no es un problema hoy (poco volumen), pero
-- ambas crecen sin tope con el tiempo: la primera literalmente en
-- proporción al éxito del negocio (más tutorías pagadas = más filas por
-- transferir CADA VEZ que un admin abre Pagos a profesores), la segunda
-- con cada reporte de alumno que se acumula.
--
-- En vez de paginación (que en admin_detalle_transacciones_profesores
-- rompería los totales por profesor y el resumen global que
-- AdminPagos.jsx calcula agrupando TODAS las filas del lado del cliente —
-- una transacción repartida entre "páginas" distintas dejaría esos totales
-- mal), el filtro es por relevancia: lo que sigue pendiente de resolver
-- SIEMPRE se ve completo (nunca se le puede esconder al admin una deuda
-- sin pagar o un reporte sin atender, sin importar qué tan viejo sea),
-- y solo se acota el HISTÓRICO ya cerrado (pagado / resuelto-descartado)
-- a los últimos 90 días — eso es lo que crece sin límite útil, ya que
-- nadie necesita ver en cada carga un pago de hace un año que ya se hizo.

create or replace function public.admin_detalle_transacciones_profesores()
returns table (
  transaccion_id uuid,
  profesor_id uuid,
  profesor_nombre text,
  profesor_email text,
  oferta_id uuid,
  materia_id text,
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
      -- Nunca se esconde una deuda pendiente, sin importar su antigüedad;
      -- solo se acota el histórico YA pagado a los últimos 90 días.
      and (t.pagado_profesor = false or t.pagado_profesor_en > now() - interval '90 days')
    order by t.pagado_profesor asc, om.fecha_hora asc;
end;
$$;

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
    where
      -- Igual que arriba: lo que sigue abierto (pendiente/en_revision)
      -- nunca se esconde; solo se acota lo ya cerrado (resuelto/
      -- descartado) a los últimos 90 días.
      r.estado in ('pendiente', 'en_revision')
      or r.creado_en > now() - interval '90 days'
    order by
      case r.gravedad when 'grave' then 0 when 'moderado' then 1 else 2 end,
      case r.estado when 'pendiente' then 0 when 'en_revision' then 1 else 2 end,
      r.creado_en desc;
end;
$$;
