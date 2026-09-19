-- Recordatorio de estudio genérico cada ~3 días, sobre la misma tabla
-- `push_subscriptions` que ya usan las notificaciones de "alumno nuevo" del
-- maestro (ver 20260918120000_push_subscriptions_profesor.sql y
-- supabase/functions/_shared/pushNotifications.ts): es genérica por diseño,
-- así que cualquier suscrito (alumno o maestro) recibe este recordatorio
-- también, no solo lo que activó originalmente.
--
-- Mecanismo: un cron de Postgres (pg_cron) llama cada 6 horas a la edge
-- function `recordatorio-estudio` vía pg_net (HTTP interno); esa función
-- decide a quién le toca (ultimo_recordatorio_en null o con más de 3 días)
-- y manda el push. Se corre cada 6h en vez de una sola vez al día para que
-- alguien que activa notificaciones a media tarde no espere casi 24h extra
-- a que el cron diario ya hubiera pasado — la cadencia real por persona
-- sigue siendo de 3 días, la corre cada 6h solo la hace más puntual.
--
-- pg_cron/pg_net son extensiones ya preinstaladas en Supabase (Database →
-- Extensions) pero no siempre habilitadas por default en un proyecto nuevo;
-- si este CREATE EXTENSION falla por permisos, hay que habilitarlas a mano
-- desde el dashboard antes de reintentar esta migración.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

alter table public.push_subscriptions
  add column ultimo_recordatorio_en timestamptz;

-- El endpoint no valida un secreto (a diferencia de un webhook de Stripe,
-- que sí puede y debe verificar firma): igual que crear-sesion-pago u otras
-- funciones con verify_jwt = false, queda alcanzable sin autenticación. El
-- peor abuso posible es forzar un envío anticipado a quien ya estaba a
-- punto de recibir su recordatorio (nunca antes de que termine SU propio
-- cooldown de 3 días, porque ultimo_recordatorio_en se actualiza en cada
-- envío) — no hay forma de spamear repetidamente a la misma persona ni de
-- leer datos, así que no se justifica la complejidad extra de un secreto
-- compartido solo para esto.
select cron.schedule(
  'recordatorio-estudio-cada-6h',
  '0 */6 * * *',
  $$
  select net.http_post(
    url := 'https://fiuzmomidaxvewhsodsj.supabase.co/functions/v1/recordatorio-estudio',
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);
