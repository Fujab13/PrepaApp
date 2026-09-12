-- Complemento de 20260911120000: descontar_intento seguía teniendo EXECUTE
-- otorgado a PUBLIC (visible en pg_proc.proacl como la entrada "=X/postgres"
-- sin nombre de rol), que es distinto del grant específico a `anon` — por
-- eso el REVOKE ... FROM anon de la migración anterior no bastó y el rol
-- `anon` seguía pudiendo ejecutarla vía ese grant heredado de PUBLIC.
revoke execute on function public.descontar_intento(uuid, uuid) from public;
