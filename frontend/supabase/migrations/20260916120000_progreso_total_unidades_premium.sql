-- Progreso de lecciones premium en el informe del maestro (InformeResultados.jsx
-- modo maestro, VistaProgreso): obtener_progreso_por_email ya traía el nombre
-- legible de una lección premium (`nombre_premium`, ver migración
-- 20260908140000), pero no un total de unidades para poder mostrar un
-- porcentaje — ese total solo vive en el JSON de la lección, guardado en el
-- bucket privado "Lecciones privadas" que únicamente el propio comprador
-- puede descargar (ver src/services/leccionesPremium.js). El maestro
-- consultando por correo no tiene forma de acceder a ese archivo, así que
-- VistaProgreso solo podía mostrar "Unidad X" sin "de Y" ni porcentaje para
-- cualquier materia_id "premium-<producto_id>".
--
-- Se agrega `productos.total_unidades`, que el propio cliente del comprador
-- rellena la primera vez que abre la lección en Leccion.jsx (ya tiene el
-- JSON descargado en ese momento, así que puede calcularlo con la misma
-- getTotalUnidades() que usan las lecciones gratuitas) a través del RPC de
-- abajo. Queda disponible para siempre desde ahí, sin volver a depender del
-- bucket privado.

alter table public.productos
  add column if not exists total_unidades int;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'productos_total_unidades_check'
  ) then
    alter table public.productos
      add constraint productos_total_unidades_check
      check (total_unidades is null or (total_unidades between 1 and 200));
  end if;
end $$;

-- ── registrar_total_unidades_producto ────────────────────────────────────
-- Solo quien de verdad tiene el producto en su inventario puede fijar este
-- valor (nada impide a cualquier autenticado inventar un p_producto_id
-- ajeno si no se valida esto), y el `coalesce` en el UPDATE hace que solo
-- se escriba una vez: la primera lectura gana, así una lección abierta
-- muchas veces (o por varios compradores) no pisa el valor real con
-- lecturas parciales o con datos de un cliente viejo.
create or replace function public.registrar_total_unidades_producto(p_producto_id uuid, p_total_unidades int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  if p_total_unidades is null or p_total_unidades < 1 or p_total_unidades > 200 then
    return;
  end if;

  if not exists (
    select 1 from inventario_usuario
    where user_id = v_user_id and producto_id = p_producto_id
  ) then
    raise exception 'no_autorizado';
  end if;

  update productos
    set total_unidades = coalesce(total_unidades, p_total_unidades)
    where id = p_producto_id;
end;
$$;

revoke all on function public.registrar_total_unidades_producto(uuid, int) from public;
grant execute on function public.registrar_total_unidades_producto(uuid, int) to authenticated;

-- ── obtener_progreso_por_email: agrega total_unidades ────────────────────
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
language sql
security definer
set search_path = public
stable
as $$
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
$$;

revoke all on function public.obtener_progreso_por_email(text) from public;
grant execute on function public.obtener_progreso_por_email(text) to authenticated;
