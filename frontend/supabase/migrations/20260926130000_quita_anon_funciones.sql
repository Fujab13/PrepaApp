-- Quita a `anon` (visitantes SIN sesión) el permiso de ejecutar funciones de
-- `public`, salvo las que son públicas a propósito.
--
-- Por qué hace falta (hallado comparando la base real contra las
-- migraciones, 2026-09-26): casi todas las migraciones hacen
--   revoke all on function ... from public;  grant ... to authenticated;
-- creyendo que con eso anon queda fuera. En Supabase NO basta: el rol
-- `postgres` (el que corre las migraciones) tiene un privilegio por defecto
-- que le da EXECUTE a anon DIRECTAMENTE en cada función nueva, aparte de
-- PUBLIC. Resultado: 44 funciones eran ejecutables sin sesión. Casi todas
-- se protegen solas por dentro (auth.uid()/es_admin_actual()/
-- soy_maestro_actual()), pero tres no: es_email_de_profesor (dejaba
-- adivinar qué correos son de profesores), marcar_reserva_fallida y
-- liberar_reservas_vencidas_maestro (las dos solo las usa el servidor).
--
-- Qué hace, con cuidado de no quitarle nada a nadie más:
--   1. Para cada función de public (sin las de extensiones) que NO esté en
--      la lista de públicas: si hoy `authenticated` o `service_role` la
--      pueden ejecutar, se les da EXECUTE explícito (antes podían tenerlo
--      solo vía PUBLIC); luego se revoca de anon y de PUBLIC.
--   2. Cambia el privilegio por defecto de `postgres` en public para que
--      las funciones NUEVAS ya no nazcan ejecutables por anon.
-- Las funciones de trigger no se ven afectadas: Postgres no revisa EXECUTE
-- al disparar un trigger, solo al crearlo.
--
-- Públicas a propósito (se usan en páginas visibles sin sesión, o su
-- migración les dio grant explícito a anon): ranking semanal, perfil y
-- calificaciones del profesor, asientos disponibles de una oferta y
-- crear_reporte_profesor (reportar a un profesor sin cuenta).
--
-- CONVENCIÓN a partir de aquí: una función nueva que deba ser pública
-- necesita `grant execute ... to anon` explícito.

do $$
declare
  f record;
  publicas text[] := array[
    'obtener_ranking_semanal',
    'obtener_perfil_profesor',
    'obtener_calificaciones_profesor',
    'asientos_disponibles_oferta_maestro',
    'crear_reporte_profesor'
  ];
begin
  for f in
    select p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    left join pg_depend d on d.objid = p.oid and d.deptype = 'e'
    where n.nspname = 'public'
      and d.objid is null
      and p.prokind in ('f', 'p')
      and not (p.proname = any (publicas))
  loop
    if has_function_privilege('authenticated', f.oid, 'execute') then
      execute format('grant execute on function public.%I(%s) to authenticated', f.proname, f.args);
    end if;
    if has_function_privilege('service_role', f.oid, 'execute') then
      execute format('grant execute on function public.%I(%s) to service_role', f.proname, f.args);
    end if;
    execute format('revoke execute on function public.%I(%s) from anon', f.proname, f.args);
    execute format('revoke execute on function public.%I(%s) from public', f.proname, f.args);
  end loop;
end;
$$;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
