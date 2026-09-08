-- Estadísticas globales de la plataforma para AdminPagos.jsx (contenedor
-- nuevo arriba de Comisión/Pendiente/Ya pagado). Por ahora solo el conteo de
-- usuarios registrados; se agrega como función aparte (en vez de meterlo en
-- admin_detalle_transacciones_profesores) porque no tiene relación con
-- transacciones y así puede reusarse en otras pantallas de admin sin
-- arrastrar todo el detalle de pagos.
--
-- select count(*) from auth.users solo es posible aquí porque la función es
-- security definer (dueña postgres) — igual que el resto de RPCs de este
-- archivo, gateado con es_admin_actual() antes de tocar auth.users.

create or replace function public.admin_contar_usuarios_registrados()
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  return (select count(*)::int from auth.users);
end;
$$;

revoke all on function public.admin_contar_usuarios_registrados() from public;
grant execute on function public.admin_contar_usuarios_registrados() to authenticated;
