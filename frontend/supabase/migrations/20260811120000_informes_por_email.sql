-- Permite reconstruir el informe (formulario de área + examen simulador) de
-- un alumno a partir de su correo, para que un maestro pueda revisarlo desde
-- InformeResultados.jsx.
--
-- Decisiones de seguridad, documentadas porque no son obvias mirando solo
-- las columnas:
--   - resultados_examen no guardaba respuestas/tiempos/marcadas por
--     pregunta, solo el agregado por sección — sin esto no alcanza para
--     reconstruir el mismo detalle que ve el alumno en Resultados.jsx justo
--     al terminar el examen.
--   - El acceso por correo se expone vía RPC SECURITY DEFINER, no vía una
--     policy de select abierta a `authenticated`: una policy abierta
--     dejaría a cualquiera listar/paginar TODA la tabla con una sola query;
--     la RPC solo regresa filas de un correo exacto que el llamador ya debe
--     conocer. No hay gate de rol "maestro" (ese concepto no existe todavía
--     en el proyecto) — mismo gap ya aceptado para ofertas_maestro.

alter table public.resultados_examen
  add column respuestas jsonb,
  add column tiempos_pregunta jsonb,
  add column marcadas jsonb not null default '[]'::jsonb;

create or replace function public.obtener_formularios_area_por_email(p_email text)
returns setof public.formularios_area
language sql
security definer
set search_path = public
as $$
  select fa.*
  from public.formularios_area fa
  join auth.users u on u.id = fa.user_id
  where lower(u.email) = lower(p_email)
  order by fa.creado_en desc;
$$;

revoke all on function public.obtener_formularios_area_por_email(text) from public;
grant execute on function public.obtener_formularios_area_por_email(text) to authenticated;

create or replace function public.obtener_resultados_examen_por_email(p_email text)
returns setof public.resultados_examen
language sql
security definer
set search_path = public
as $$
  select re.*
  from public.resultados_examen re
  join auth.users u on u.id = re.user_id
  where lower(u.email) = lower(p_email)
  order by re.creado_en desc;
$$;

revoke all on function public.obtener_resultados_examen_por_email(text) from public;
grant execute on function public.obtener_resultados_examen_por_email(text) to authenticated;
