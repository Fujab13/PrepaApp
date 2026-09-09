-- Permite a un maestro consultar el progreso de lecciones (unidad/elemento
-- por materia) de un alumno a partir de su correo, para agregarlo a
-- InformeResultados.jsx junto al formulario de área y el examen simulador.
--
-- Mismo patrón de seguridad que obtener_formularios_area_por_email /
-- obtener_resultados_examen_por_email (ver migración 20260811120000): RPC
-- SECURITY DEFINER en vez de una policy de select abierta a `authenticated`
-- (una policy abierta dejaría a cualquiera listar/paginar TODA la tabla con
-- una sola query; la RPC solo regresa filas del correo exacto que el
-- llamador ya debe conocer). Mismo gap ya aceptado: no hay gate de rol
-- "maestro" todavía, cualquier usuario autenticado puede llamarla si conoce
-- el correo — igual que las otras dos RPC de informes.

create or replace function public.obtener_progreso_por_email(p_email text)
returns setof public.progreso_usuario
language sql
security definer
set search_path = public
stable
as $$
  select pu.*
  from public.progreso_usuario pu
  join auth.users u on u.id = pu.user_id
  where lower(u.email) = lower(p_email)
  order by pu.materia_id;
$$;

revoke all on function public.obtener_progreso_por_email(text) from public;
grant execute on function public.obtener_progreso_por_email(text) to authenticated;
