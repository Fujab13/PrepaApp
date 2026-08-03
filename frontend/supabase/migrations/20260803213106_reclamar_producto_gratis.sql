-- Permite a un usuario autenticado reclamar un producto gratuito (precio = 0)
-- directamente en su inventario, sin pasar por Stripe Checkout (que no admite
-- cobros de $0 en modo `payment`). Sigue el mismo patrón que
-- `procesar_pago_completado`: SECURITY DEFINER porque `inventario_usuario` no
-- permite INSERT/UPDATE directo desde el cliente (RLS), y el `on conflict ...
-- do nothing` + `if found` evita que un usuario spamee el RPC para inflar
-- `cantidad_disponible`/`cantidad_total_adquirida` o duplicar movimientos.

create or replace function public.reclamar_producto_gratis(p_producto_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_producto record;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  select * into v_producto
  from productos
  where id = p_producto_id and activo = true;

  if not found then
    raise exception 'Producto no encontrado o inactivo';
  end if;

  if v_producto.precio <> 0 then
    raise exception 'Este producto no es gratuito';
  end if;

  insert into inventario_usuario (
    user_id, producto_id, fecha_adquisicion,
    cantidad_disponible, cantidad_total_adquirida, actualizado_en
  )
  values (v_user_id, p_producto_id, now(), 1, 1, now())
  on conflict (user_id, producto_id) do nothing;

  if found then
    insert into inventario_movimientos (user_id, producto_id, tipo_movimiento, cantidad, creado_en)
    values (v_user_id, p_producto_id, 'reclamo_gratis', 1, now());
  end if;

  return true;
end;
$$;

revoke all on function public.reclamar_producto_gratis(uuid) from public;
grant execute on function public.reclamar_producto_gratis(uuid) to authenticated;
