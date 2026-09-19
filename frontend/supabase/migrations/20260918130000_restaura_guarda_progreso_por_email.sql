-- Restaura la guarda de maestro/admin en obtener_progreso_por_email, perdida
-- en 20260916120000_progreso_total_unidades_premium.sql: esa migración
-- reemplazó la función por completo (drop + create, para poder agregarle la
-- columna total_unidades) y el DROP se llevó también el chequeo
-- `soy_maestro_actual() or es_admin_actual()` que
-- 20260911120000_cierra_fugas_seguridad_rpc.sql había agregado a propósito
-- para esta misma función, tras detectar que cualquiera podía pedir el
-- progreso de lecciones de CUALQUIER alumno solo con su correo. Sin la
-- guarda, cualquier usuario autenticado (no solo un maestro verificado o un
-- admin) podía volver a hacer exactamente eso. Mismo cuerpo que la versión
-- del 16 de septiembre, solo se agrega de vuelta la guarda (y se pasa de
-- `language sql` a `plpgsql`, que es lo que permite el `if/raise`).
drop function if exists public.obtener_progreso_por_email(text);

create function public.obtener_progreso_por_email(p_email text)
returns table (
  materia_id text,
  unidad_actual int,
  elemento_actual int,
  ultima_interaccion timestamp,
  avance_valido boolean,
  nombre_premium text,
  total_unidades int
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not (public.soy_maestro_actual() or public.es_admin_actual()) then
    raise exception 'no_autorizado';
  end if;

  return query
    select
      pu.materia_id,
      pu.unidad_actual,
      pu.elemento_actual,
      pu.ultima_interaccion,
      pu.avance_valido,
      prod.nombre as nombre_premium,
      prod.total_unidades
    from public.progreso_usuario pu
    join auth.users u on u.id = pu.user_id
    left join public.productos prod
      on pu.materia_id like 'premium-%'
      and prod.id::text = replace(pu.materia_id, 'premium-', '')
    where lower(u.email) = lower(p_email)
    order by pu.materia_id;
end;
$$;

revoke all on function public.obtener_progreso_por_email(text) from public;
grant execute on function public.obtener_progreso_por_email(text) to authenticated;
