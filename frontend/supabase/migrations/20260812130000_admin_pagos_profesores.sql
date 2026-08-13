-- Ledger de comisión (18%) y pago a profesores (82%) para `ofertas_maestro`,
-- más la lista fija de admins que puede consultarlo. Esto NO toca el flujo
-- viejo de Tutorías 1-a-1 (`solicitudes_tutoria`): ese ya reparte el pago
-- automático vía Stripe Connect (`transfer_data.destination` +
-- `application_fee_amount` en crear-sesion-pago-tutoria), así que no hay
-- nada que "marcar como pagado" ahí. `ofertas_maestro` en cambio fue
-- diseñado a propósito SIN Stripe Connect (ver comentario de
-- crear-sesion-pago-oferta-maestro/index.ts): la plataforma cobra el 100%
-- y el profesor recibe su 82% por transferencia manual a la CLABE que él
-- mismo publicó. Hasta esta migración esa parte vivía "fuera de la app"
-- sin ningún registro; esto le agrega la contabilidad y una forma de
-- consultarla, sin automatizar la transferencia en sí.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - No existe ningún concepto de "admin" en todo el proyecto (ni rol en
--     `perfiles`, ni columna en `AuthContext`). Se agrega la tabla `admins`
--     más chica posible: sin ninguna policy (ni siquiera para el propio
--     admin) — toda lectura/escritura pasa por RPCs `security definer` que
--     validan `es_admin_actual()` primero. Ni el admin puede hacer
--     `select * from admins` desde el cliente.
--   - `comision_mxn`/`monto_profesor_mxn` se calculan y CONGELAN en
--     `procesar_pago_completado`, en el momento exacto en que el pago se
--     confirma — igual que `monto_total` ya se congela al reservar (ver
--     comentario en crear-sesion-pago-oferta-maestro/index.ts). Así, si el
--     % de comisión cambia más adelante, no se altera retroactivamente lo
--     que ya se le debe a un profesor por una clase ya cobrada.
--   - `monto_profesor_mxn` se calcula por resta (`monto_total -
--     comision_mxn`), no por `monto_total * 0.82` aparte: así ambos montos
--     siempre suman exacto y no hay descuadres de centavo por redondeo
--     independiente de cada cálculo.
--   - `admin_detalle_transacciones_profesores` regresa filas planas (una
--     por transacción) en vez de una función de resumen aparte: el
--     resumen por profesor se agrega en el frontend con un `reduce`,
--     mismo patrón que `AlumnosOfertas.jsx` ya usa para agrupar
--     `obtener_alumnos_ofertas_maestro` por oferta. Evita mantener dos
--     formas distintas de sumar el mismo dato (una en SQL, otra en JS).
--   - El nombre del alumno reusa el mismo patrón LATERAL de
--     `20260812120000_alumnos_ofertas_maestro.sql` (perfiles.nombre con
--     fallback al formulario de área más reciente).

-- ── admins ──────────────────────────────────────────────────────────────
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
-- Sin policies a propósito: nadie lee/escribe esta tabla directo desde el
-- cliente. Para agregar otro admin más adelante, repetir este mismo
-- insert con el correo correspondiente.

insert into public.admins (user_id)
select id from auth.users where lower(email) = lower('fujab13@gmail.com')
on conflict do nothing;

create or replace function public.es_admin_actual()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.es_admin_actual() from public;
grant execute on function public.es_admin_actual() to authenticated;

-- ── transacciones: split de comisión/pago a profesor ──────────────────────
alter table public.transacciones
  add column comision_mxn numeric(10,2),
  add column monto_profesor_mxn numeric(10,2),
  add column pagado_profesor boolean not null default false,
  add column pagado_profesor_en timestamptz,
  add column pagado_profesor_por uuid references auth.users(id) on delete set null;

-- ── procesar_pago_completado: ahora también calcula el split 18/82 ────────
-- Mismo cuerpo que en 20260810130000_reservas_ofertas_maestro.sql, solo se
-- agregan comision_mxn/monto_profesor_mxn al UPDATE de la rama
-- oferta_maestro_id (el resto de la función queda sin cambios).
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
          set estado_pago = 'completado',
              comision_mxn = round(v_transaccion.monto_total * 0.18, 2),
              monto_profesor_mxn = v_transaccion.monto_total - round(v_transaccion.monto_total * 0.18, 2),
              actualizado_en = now()
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

-- Backfill: transacciones de oferta_maestro ya completadas antes de esta
-- migración no tienen comision_mxn/monto_profesor_mxn calculados todavía.
update public.transacciones
  set comision_mxn = round(monto_total * 0.18, 2),
      monto_profesor_mxn = monto_total - round(monto_total * 0.18, 2)
  where oferta_maestro_id is not null
    and estado_pago = 'completado'
    and comision_mxn is null;

-- ── admin_detalle_transacciones_profesores ─────────────────────────────────
-- Detalle plano (una fila por transacción completada de ofertas_maestro)
-- para que un admin vea, por profesor, cuánto se le debe, la CLABE a la que
-- transferirle, y pueda marcar cada una como pagada.
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
    order by t.pagado_profesor asc, om.fecha_hora asc;
end;
$$;

revoke all on function public.admin_detalle_transacciones_profesores() from public;
grant execute on function public.admin_detalle_transacciones_profesores() to authenticated;

-- ── admin_marcar_pago_profesor / admin_desmarcar_pago_profesor ────────────
create or replace function public.admin_marcar_pago_profesor(p_transaccion_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  update transacciones
    set pagado_profesor = true,
        pagado_profesor_en = now(),
        pagado_profesor_por = auth.uid()
    where id = p_transaccion_id
      and oferta_maestro_id is not null
      and estado_pago = 'completado'
      and pagado_profesor = false;

  if not found then
    raise exception 'transaccion_no_encontrada_o_ya_pagada';
  end if;
end;
$$;

revoke all on function public.admin_marcar_pago_profesor(uuid) from public;
grant execute on function public.admin_marcar_pago_profesor(uuid) to authenticated;

create or replace function public.admin_desmarcar_pago_profesor(p_transaccion_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  update transacciones
    set pagado_profesor = false,
        pagado_profesor_en = null,
        pagado_profesor_por = null
    where id = p_transaccion_id
      and oferta_maestro_id is not null
      and estado_pago = 'completado'
      and pagado_profesor = true;

  if not found then
    raise exception 'transaccion_no_encontrada_o_no_estaba_pagada';
  end if;
end;
$$;

revoke all on function public.admin_desmarcar_pago_profesor(uuid) from public;
grant execute on function public.admin_desmarcar_pago_profesor(uuid) to authenticated;
