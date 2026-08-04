-- El CHECK constraint de inventario_movimientos.tipo_movimiento solo permitía
-- 'compra', 'uso', 'reembolso', 'ajuste_admin'. Pero tres funciones ya
-- insertan valores más descriptivos que ese constraint rechaza:
--   - dar_examen_gratis()        -> 'intento_gratis_registro' (trigger en auth.users)
--   - procesar_pago_completado() -> 'compra_stripe'
--   - reclamar_producto_gratis() -> 'reclamo_gratis'
-- Como cada INSERT vive dentro de la misma transacción que la función que lo
-- llama, el CHECK violation aborta toda la función:
--   - En dar_examen_gratis(), el trigger corre AFTER INSERT ON auth.users,
--     así que aborta también el INSERT del usuario nuevo. Eso es lo que
--     Supabase Auth reporta como "Database error saving new user" al
--     registrarse con un correo nuevo.
--   - En procesar_pago_completado() y reclamar_producto_gratis(), el mismo
--     problema hace que el alta en inventario_usuario se revierta aunque el
--     pago en Stripe (o el reclamo gratuito) sí se haya procesado.
-- Se amplía el constraint para incluir los valores que el código ya usa,
-- en vez de reescribir las funciones, para no perder la semántica de cada
-- tipo de movimiento en el historial.

alter table public.inventario_movimientos
  drop constraint inventario_movimientos_tipo_movimiento_check;

alter table public.inventario_movimientos
  add constraint inventario_movimientos_tipo_movimiento_check
  check (tipo_movimiento::text = any (array[
    'compra',
    'uso',
    'reembolso',
    'ajuste_admin',
    'intento_gratis_registro',
    'compra_stripe',
    'reclamo_gratis'
  ]::text[]));
