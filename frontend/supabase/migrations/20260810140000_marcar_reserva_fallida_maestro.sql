-- Escenario B (pago rechazado o sesión de Stripe expirada) del flujo de
-- reservas de ofertas_maestro. El rollback por TIMEOUT ya funciona sin esto
-- (liberar_reservas_vencidas_maestro se llama de forma oportunista y libera
-- el asiento en cuanto alguien vuelve a consultar disponibilidad o a
-- reservar, normalmente mucho antes de que Stripe considere expirada su
-- propia sesión de Checkout). Esta función es un cierre adicional para el
-- registro contable: cuando el webhook recibe `checkout.session.expired` de
-- Stripe, marca la fila como 'cancelado' explícitamente en vez de dejarla
-- eternamente 'pendiente' si nadie volvió a consultar esa oferta.
--
-- SIN grant a ningún rol, igual que `confirmar_pago_tutoria`: solo
-- `service_role` (el webhook) puede invocarla.
create or replace function public.marcar_reserva_fallida(p_stripe_intent_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update transacciones
    set estado_pago = 'cancelado', actualizado_en = now()
    where stripe_intent_id = p_stripe_intent_id
      and oferta_maestro_id is not null
      and estado_pago = 'pendiente';
end;
$$;

revoke all on function public.marcar_reserva_fallida(text) from public;
