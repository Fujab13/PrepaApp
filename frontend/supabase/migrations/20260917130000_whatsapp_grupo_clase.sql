-- Prepara la app para el flujo "clase reservada y pagada -> el alumno entra
-- solo al grupo de WhatsApp de esa clase" vía Whapi.Cloud (ver instrucciones
-- de configuración en referencia/requerimientos/notas.txt). El envío real a
-- la API de Whapi vive en supabase/functions/_shared/whapi.ts, llamado desde
-- stripe-webhook y verificar-pago-oferta-maestro justo después de que
-- procesar_pago_completado confirma el pago — esta migración solo agrega las
-- columnas y el RPC que ese flujo necesita.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - ofertas_maestro.titulo: antes no existía ningún nombre libre para una
--     oferta (solo materia + nombre del profesor) — se agrega para poder
--     armar "<titulo> <fecha> -PrepaApp" como nombre del grupo; si el
--     maestro no lo llena, el código se cae a la materia (ver whapi.ts).
--   - ofertas_maestro.grupo_whatsapp_id: UN solo grupo por oferta, no uno
--     por alumno — todos los que reservan la misma clase entran al mismo
--     grupo. Se llena la primera vez que alguien paga esa oferta.
--   - transacciones.telefono_whatsapp: el alumno lo captura justo antes de
--     pagar (ver guardar_telefono_reserva), deliberadamente NO se reusa
--     formularios_area.telefono — ese es opcional y de un flujo distinto
--     (ver comentario en 20260812120000_alumnos_ofertas_maestro.sql). Solo
--     tiene sentido para reservas de oferta_maestro, nunca para compras de
--     productos de la tienda.

alter table public.ofertas_maestro
  add column titulo text,
  add column grupo_whatsapp_id text;

alter table public.ofertas_maestro
  add constraint ofertas_maestro_titulo_check
  check (titulo is null or (char_length(trim(titulo)) > 0 and char_length(titulo) <= 80));

alter table public.transacciones
  add column telefono_whatsapp text;

alter table public.transacciones
  add constraint transacciones_telefono_whatsapp_check
  check (telefono_whatsapp is null or telefono_whatsapp ~ '^[0-9]{7,15}$');

-- ── guardar_telefono_reserva ────────────────────────────────────────────
-- El alumno lo llama justo antes de "Pagar ahora" (mismo momento en que ya
-- tiene la reserva 'pendiente' de iniciar_reserva_oferta_maestro). Solo
-- puede tocar su propia reserva, todavía pendiente, de una oferta_maestro.
create or replace function public.guardar_telefono_reserva(p_transaccion_id uuid, p_telefono text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;

  if p_telefono is null or char_length(p_telefono) < 7 then
    raise exception 'telefono_invalido';
  end if;

  update transacciones
    set telefono_whatsapp = p_telefono
    where id = p_transaccion_id
      and user_id = auth.uid()
      and oferta_maestro_id is not null
      and estado_pago = 'pendiente';

  if not found then
    raise exception 'reserva_no_encontrada';
  end if;
end;
$$;

revoke all on function public.guardar_telefono_reserva(uuid, text) from public;
grant execute on function public.guardar_telefono_reserva(uuid, text) to authenticated;
