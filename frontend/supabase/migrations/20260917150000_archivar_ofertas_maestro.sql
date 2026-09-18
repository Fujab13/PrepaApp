-- "Borrar" una oferta pasa de ser un DELETE real a un archivado lógico.
--
-- Por qué: `transacciones.oferta_maestro_id` es `on delete restrict` (ver
-- 20260810130000_reservas_ofertas_maestro.sql) y `transacciones` nunca borra
-- filas, solo les cambia `estado_pago` entre pendiente/completado/cancelado/
-- expirado — así que CUALQUIER reserva que alguien haya iniciado alguna vez
-- para una oferta, aunque nunca haya pagado y esté hace meses 'expirado',
-- bloqueaba el DELETE para siempre. Eso es lo correcto para una oferta con
-- ventas reales (borrarla de verdad rompería el historial de ganancias del
-- maestro en `obtener_mis_transacciones_oferta_maestro` y los reportes de
-- admin, que hacen JOIN contra esta tabla) pero no había forma de que un
-- maestro sacara de su lista una oferta vieja sin importar el caso. En vez
-- de distinguir "sin reservas nunca" (sí se podría hacer DELETE) de "con
-- reservas" (bloqueado), se unifica todo en un solo comportamiento simple:
-- archivar. El registro se queda en la base para siempre, por auditoría.
--
-- `archivada_en` null = activa. Se pone/quita con un UPDATE normal, así que
-- no hace falta ninguna policy nueva — ya existe `update_propia` (creado_por
-- = auth.uid() and soy_maestro_actual(), ver 20260812140000_registro_maestros.sql)
-- para el maestro, y `admin_update_todas` (creada directo en Supabase, no
-- vive en ningún archivo de esta carpeta — ver comentario en AdminOfertas.jsx)
-- para el admin.

alter table public.ofertas_maestro
  add column archivada_en timestamptz;

-- ── iniciar_reserva_oferta_maestro: rechazar ofertas archivadas ─────────
-- Antes no lo validaba: alguien con un link viejo (guardado, compartido)
-- podía seguir reservando una oferta que el maestro ya había archivado —
-- el frontend ya no la muestra en la lista, pero la RPC en sí no se
-- defendía. Mismo cuerpo que 20260810130000, solo se agrega el chequeo.
create or replace function public.iniciar_reserva_oferta_maestro(
  p_oferta_id uuid,
  p_ttl_minutos int default 15
)
returns public.transacciones
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_oferta ofertas_maestro;
  v_ocupados int;
  v_transaccion transacciones;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  if p_ttl_minutos is null or p_ttl_minutos < 10 or p_ttl_minutos > 15 then
    raise exception 'ttl_invalido';
  end if;

  perform liberar_reservas_vencidas_maestro();

  -- Mutex: bloquea la fila de la oferta hasta que esta función termine.
  -- Cualquier otra llamada concurrente a esta misma oferta (de cualquier
  -- usuario) espera aquí en vez de leer un cupo desactualizado.
  select * into v_oferta from ofertas_maestro where id = p_oferta_id for update;

  if not found then
    raise exception 'oferta_no_encontrada';
  end if;

  if v_oferta.archivada_en is not null then
    raise exception 'oferta_archivada';
  end if;

  if v_oferta.creado_por = v_user_id then
    raise exception 'no_puedes_reservar_tu_propia_oferta';
  end if;

  if v_oferta.fecha_hora <= now() then
    raise exception 'oferta_vencida';
  end if;

  -- Reintentar (p.ej. el alumno recarga la pantalla de pago) no debe
  -- acumular holds propios que cuenten dos veces contra el cupo.
  update transacciones
    set estado_pago = 'cancelado', actualizado_en = now()
    where oferta_maestro_id = p_oferta_id
      and user_id = v_user_id
      and estado_pago = 'pendiente';

  select count(*) into v_ocupados
    from transacciones
    where oferta_maestro_id = p_oferta_id
      and (estado_pago = 'completado' or (estado_pago = 'pendiente' and expira_en > now()));

  if v_ocupados >= v_oferta.cupo_maximo then
    raise exception 'sin_cupo_disponible';
  end if;

  insert into transacciones (
    user_id, oferta_maestro_id, monto_total, cantidad, moneda, estado_pago, expira_en
  ) values (
    v_user_id, p_oferta_id, v_oferta.precio_mxn, 1, 'MXN', 'pendiente',
    now() + (p_ttl_minutos || ' minutes')::interval
  )
  returning * into v_transaccion;

  return v_transaccion;
end;
$$;

revoke all on function public.iniciar_reserva_oferta_maestro(uuid, int) from public;
grant execute on function public.iniciar_reserva_oferta_maestro(uuid, int) to authenticated;
