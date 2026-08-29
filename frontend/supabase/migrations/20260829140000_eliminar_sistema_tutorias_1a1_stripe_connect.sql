-- Elimina el sistema viejo de tutorías 1-a-1 con Stripe Connect (anterior
-- incluso al sistema de `maestros` ya retirado en
-- 20260829130000_eliminar_sistema_maestros_viejo.sql). Ya estaba marcado
-- como "en desuso" desde los comentarios de varias migraciones (ver
-- 20260812140000_registro_maestros.sql), y se confirmó con el usuario que
-- ningún archivo vivo del frontend lo usa: cero `.from(...)` ni
-- `supabase.rpc(...)` a estas tablas/funciones en src/, cero rutas que
-- lleven a las páginas que las consultaban.
--
-- Se borran también, en el mismo cambio (fuera de esta migración):
--   - Frontend: OfertaCard.jsx, useSubidaArchivos.js, TutoriaConfirmada.jsx
--     y su ruta /tutoria-confirmada.
--   - Edge functions: crear-sesion-pago-tutoria, conectar-pagos-maestro,
--     onboardear-profesor.
--   - supabase/functions/stripe-webhook/index.ts: se le quitaron las ramas
--     de 'checkout.session.completed' con metadata.tipo='tutoria' y de
--     'account.updated' (onboarding de Stripe Connect), dejando intacta la
--     lógica viva de `ofertas_maestro`.
--
-- Orden de drop (reintento tras dos intentos fallidos: 1) "cannot drop
-- table calificaciones ... function calificar_tutoria depends on type
-- calificaciones"; 2) "cannot drop function es_profesor_de(uuid) ... policy
-- select_como_profesor on table solicitudes_tutoria depends on it"):
--   1. Primero las funciones NO ligadas a un trigger que referencian el
--      tipo-fila de una tabla (crear_solicitud_tutoria, crear_oferta_tutoria,
--      aceptar_oferta_tutoria, calificar_tutoria) — hay que quitarlas antes
--      de poder dropear esas tablas.
--   2. Las demás funciones sueltas del sistema (sin dependencia de tipo).
--   3. Las 4 tablas, con CASCADE: ofertas_tutoria y solicitudes_tutoria se
--      referencian una a la otra (FK circular: cada una tiene una FK hacia
--      la otra), así que ninguna se puede dropear primero sin CASCADE.
--      CASCADE aquí es seguro — ya se confirmó que ninguna tabla viva
--      (perfiles, profesores, transacciones) tiene FK hacia estas 4.
--      DROP TABLE también se lleva entre manos los triggers definidos sobre
--      ellas (on_calificacion_creada, trg_calcular_rango_horario_solicitud_tutoria).
--   4. Por último, las 2 funciones de esos triggers — recién ahora se
--      pueden dropear, porque antes de que cayeran las tablas (paso 3) los
--      triggers todavía dependían de ellas.

-- 1. Funciones con dependencia de tipo sobre una tabla que se va a dropear.
drop function if exists public.crear_solicitud_tutoria(text, timestamptz, integer, text, jsonb);
drop function if exists public.crear_oferta_tutoria(text, text, timestamptz, integer, numeric, text, jsonb);
drop function if exists public.aceptar_oferta_tutoria(uuid);
drop function if exists public.calificar_tutoria(uuid, integer, text);

-- 2. El resto de las funciones sueltas del sistema (sin dependencias de
--    policy ni de trigger).
drop function if exists public.cancelar_oferta_tutoria(uuid);
drop function if exists public.confirmar_pago_tutoria(text);
drop function if exists public.obtener_estado_pagos_propio();
drop function if exists public.asegurar_profesor_propio(uuid);
drop function if exists public.liberar_ofertas_vencidas();
drop function if exists public.actualizar_estado_onboarding_profesor(text, boolean);

-- 3. Las 4 tablas (con cascade por la FK circular ofertas_tutoria <-> solicitudes_tutoria).
drop table if exists public.tutoria_archivos cascade;
drop table if exists public.calificaciones cascade;
drop table if exists public.solicitudes_tutoria cascade;
drop table if exists public.ofertas_tutoria cascade;

-- 4. Las funciones de trigger, y es_profesor_de (usada por la policy
--    select_como_profesor de solicitudes_tutoria) — todas se pueden dropear
--    hasta ahora, porque antes de que cayeran las tablas (paso 3) sus
--    triggers/policies todavía dependían de ellas.
drop function if exists public.recalcular_calificacion_perfil();
drop function if exists public.calcular_rango_horario_solicitud_tutoria();
drop function if exists public.es_profesor_de(uuid);
