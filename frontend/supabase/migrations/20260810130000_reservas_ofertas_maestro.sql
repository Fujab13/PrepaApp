-- Ciclo de vida de "solicitudes" (reservas de asiento) para ofertas_maestro:
-- generación con mutex+TTL, expiración automática y commit/rollback de pago.
-- Deliberadamente NO incluye procesamiento de pago (Stripe Checkout / edge
-- function) ni nada de publicación de ofertas — eso ya vive en
-- ofertas_maestro (20260809120000) o queda para una migración aparte.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - `transacciones` pasa de apuntar solo a `productos` a poder apuntar
--     también a `ofertas_maestro`. Se reutiliza la misma tabla (en vez de
--     crear una tabla nueva de "reservas") porque `transacciones` ya es el
--     libro contable de pagos con Stripe (stripe_intent_id, estado_pago) y
--     el estado de una reserva de asiento ES un estado de pago: DISPONIBLE
--     no tiene fila, BLOQUEADO_PENDIENTE_PAGO = fila con estado_pago
--     'pendiente' y expira_en > now(), CONFIRMADO = 'completado'. El
--     "boleto electrónico" es la propia fila confirmada (join a
--     ofertas_maestro para los detalles de la clase); no existe todavía
--     una tabla de boletos separada.
--   - El mutex NO es un lock de aplicación (Redis, etc.): es un
--     `SELECT ... FOR UPDATE` sobre la fila de `ofertas_maestro` dentro de
--     `iniciar_reserva_oferta_maestro`. Postgres serializa cualquier otro
--     intento concurrente de reservar esa misma oferta hasta que la
--     transacción actual termine (commit o rollback), que es exactamente
--     la garantía que pide el mutex con TTL del flujo.
--   - No hay pg_cron en este proyecto (ver `pg_extension`), así que el TTL
--     se hace cumplir de forma oportunista: toda función que lee/crea una
--     reserva llama primero a `liberar_reservas_vencidas_maestro()`, igual
--     que `liberar_ofertas_vencidas()` en el esquema de tutorías
--     (20260805150000). Un asiento cuyo TTL venció se libera en la
--     siguiente consulta de disponibilidad o intento de reserva de
--     cualquier usuario, sin depender de un job en segundo plano.
--   - `asientos_disponibles_oferta_maestro` es SECURITY DEFINER a propósito
--     (no solo por consistencia): la única policy de SELECT en
--     `transacciones` es "cada quien ve las suyas", así que una función
--     SECURITY INVOKER solo contaría las reservas del usuario que pregunta,
--     no las de todos — el cupo se calcularía mal. SECURITY DEFINER deja
--     que la función vea todas las filas para contar el cupo real, pero
--     solo regresa un jsonb con conteos agregados, nunca filas de
--     `transacciones` de otros usuarios.
--   - `oferta_maestro_id` usa `ON DELETE RESTRICT` (igual que
--     `producto_id`), no CASCADE: borrar una oferta que ya tiene alumnos
--     con una reserva pendiente o pagada no debe destrozar el registro de
--     pago. Si un maestro intenta borrar una oferta con reservas activas,
--     el DELETE falla con un error de FK — el frontend de administración
--     de ofertas (PublicacionOfertas / portal de maestro) necesita
--     manejar ese error con un mensaje entendible; no se toca ese código
--     aquí porque no hay todavía UI de reservas del lado del alumno.
--   - Se agrega un CHECK a `estado_pago` (antes sin restricción) con los
--     valores que ya usa el código ('pendiente','completado') más los dos
--     que introduce este flujo ('cancelado','expirado'). Se verificó que
--     hoy solo existen filas 'pendiente' en producción, así que el CHECK
--     no puede romper datos existentes.

-- ── transacciones: soporte para oferta_maestro además de producto ─────────
alter table public.transacciones
  add column oferta_maestro_id uuid references public.ofertas_maestro(id) on delete restrict,
  add column expira_en timestamptz;

alter table public.transacciones
  add constraint transacciones_referencia_unica check (
    (producto_id is not null and oferta_maestro_id is null)
    or (producto_id is null and oferta_maestro_id is not null)
  );

alter table public.transacciones
  add constraint transacciones_estado_pago_check
  check (estado_pago::text = any (array['pendiente','completado','cancelado','expirado']::text[]));

create index transacciones_oferta_maestro_idx on public.transacciones (oferta_maestro_id);
create index transacciones_oferta_maestro_estado_idx
  on public.transacciones (oferta_maestro_id, estado_pago, expira_en);

-- ── liberar_reservas_vencidas_maestro ──────────────────────────────────────
-- Barrido oportunista del TTL: pasa cualquier reserva 'pendiente' cuyo
-- expira_en ya pasó a 'expirado'. Ver nota arriba sobre por qué no hay cron.
create or replace function public.liberar_reservas_vencidas_maestro()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update transacciones
    set estado_pago = 'expirado', actualizado_en = now()
    where oferta_maestro_id is not null
      and estado_pago = 'pendiente'
      and expira_en < now();
end;
$$;

revoke all on function public.liberar_reservas_vencidas_maestro() from public;
grant execute on function public.liberar_reservas_vencidas_maestro() to authenticated;

-- ── asientos_disponibles_oferta_maestro ────────────────────────────────────
-- El "ping" del paso 1 del flujo: valida que la oferta siga existiendo y
-- regresa cupo/ocupados/disponibles ya con el barrido de TTL aplicado.
create or replace function public.asientos_disponibles_oferta_maestro(p_oferta_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_oferta ofertas_maestro;
  v_ocupados int;
begin
  perform liberar_reservas_vencidas_maestro();

  select * into v_oferta from ofertas_maestro where id = p_oferta_id;

  if not found then
    return jsonb_build_object('existe', false);
  end if;

  select count(*) into v_ocupados
    from transacciones
    where oferta_maestro_id = p_oferta_id
      and (estado_pago = 'completado' or (estado_pago = 'pendiente' and expira_en > now()));

  return jsonb_build_object(
    'existe', true,
    'vigente', v_oferta.fecha_hora > now(),
    'cupo_maximo', v_oferta.cupo_maximo,
    'ocupados', v_ocupados,
    'disponibles', greatest(v_oferta.cupo_maximo - v_ocupados, 0)
  );
end;
$$;

revoke all on function public.asientos_disponibles_oferta_maestro(uuid) from public;
grant execute on function public.asientos_disponibles_oferta_maestro(uuid) to authenticated;

-- ── iniciar_reserva_oferta_maestro ─────────────────────────────────────────
-- Pasos 2-3.2 del flujo: adquiere el mutex (FOR UPDATE sobre la oferta),
-- cuenta cupo ya libre de reservas vencidas, y si hay lugar inserta la fila
-- 'pendiente' con su TTL. Nunca confía en precio/oferta del cliente más
-- allá de p_oferta_id: el monto siempre se lee de ofertas_maestro.
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

-- ── cancelar_reserva_oferta_maestro ────────────────────────────────────────
-- Rollback manual (el alumno cierra/cancela el checkout antes de que el TTL
-- expire por sí solo). Solo toca reservas propias y todavía 'pendiente'.
create or replace function public.cancelar_reserva_oferta_maestro(p_transaccion_id uuid)
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

  update transacciones
    set estado_pago = 'cancelado', actualizado_en = now()
    where id = p_transaccion_id
      and user_id = v_user_id
      and oferta_maestro_id is not null
      and estado_pago = 'pendiente';

  if not found then
    raise exception 'reserva_no_encontrada';
  end if;
end;
$$;

revoke all on function public.cancelar_reserva_oferta_maestro(uuid) from public;
grant execute on function public.cancelar_reserva_oferta_maestro(uuid) to authenticated;

-- ── procesar_pago_completado: ahora también commitea reservas de asiento ──
-- Mismo cuerpo que antes para el flujo de productos; se agrega la rama de
-- oferta_maestro (Escenario A del flujo: commit final a 'completado') y un
-- guardia de TTL (si el webhook de Stripe llega después de que el asiento ya
-- expiró, no se puede confirmar en silencio — se marca 'expirado' y se
-- lanza una excepción para que quede en los logs y se reconcilie a mano,
-- porque en ese punto Stripe ya pudo haber cobrado). Se agrega `for update`
-- al SELECT inicial (no estaba antes) para cerrar una condición de carrera
-- si Stripe reintenta la entrega del mismo evento casi al mismo tiempo.
create or replace function public.procesar_pago_completado(p_stripe_intent_id text)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
    v_transaccion RECORD;
begin
    select * into v_transaccion from transacciones
    where stripe_intent_id = p_stripe_intent_id and estado_pago = 'pendiente'
    for update;

    if not found then
        raise exception 'Transacción no encontrada o ya fue procesada';
    end if;

    if v_transaccion.oferta_maestro_id is not null then
        if v_transaccion.expira_en is not null and v_transaccion.expira_en < now() then
            update transacciones
              set estado_pago = 'expirado', actualizado_en = now()
              where id = v_transaccion.id;
            raise exception 'La reserva del asiento expiró antes de confirmar el pago';
        end if;

        update transacciones
          set estado_pago = 'completado', actualizado_en = now()
          where id = v_transaccion.id;

        return;
    end if;

    -- 2. Marcar transacción como completada (flujo de productos, sin cambios)
    UPDATE transacciones
    SET estado_pago = 'completado', actualizado_en = NOW()
    WHERE id = v_transaccion.id;

    -- 3. Actualizar o insertar en inventario_usuario
    INSERT INTO inventario_usuario (user_id, producto_id, fecha_adquisicion, cantidad_disponible, cantidad_total_adquirida, actualizado_en, adquirido_via_transaccion_id)
    VALUES (v_transaccion.user_id, v_transaccion.producto_id, NOW(), v_transaccion.cantidad, v_transaccion.cantidad, NOW(), v_transaccion.id)
    ON CONFLICT (user_id, producto_id)
    DO UPDATE SET
        cantidad_disponible = inventario_usuario.cantidad_disponible + v_transaccion.cantidad,
        cantidad_total_adquirida = inventario_usuario.cantidad_total_adquirida + v_transaccion.cantidad,
        actualizado_en = NOW();

    -- 4. Registrar en inventario_movimientos
    INSERT INTO inventario_movimientos (user_id, producto_id, tipo_movimiento, cantidad, transaccion_id, creado_en)
    VALUES (v_transaccion.user_id, v_transaccion.producto_id, 'compra_stripe', v_transaccion.cantidad, v_transaccion.id, NOW());
end;
$function$;
