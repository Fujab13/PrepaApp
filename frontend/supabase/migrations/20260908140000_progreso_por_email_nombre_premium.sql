-- Corrige obtener_progreso_por_email (migración 20260908130000): probando
-- con datos reales, una fila de progreso de una lección PREMIUM tiene
-- materia_id = 'premium-<producto_id>' (ver Leccion.jsx), que no existe en
-- MATERIAS (src/data/leccionesGratis.js, armado solo a partir de los JSON
-- de lecciones gratuitas) — InformeResultados.jsx no tenía forma de
-- mostrar un nombre legible para esas filas y le mostraba al maestro el
-- uuid crudo.
--
-- `create or replace` no permite cambiar el tipo de retorno de una función
-- existente (pasa de "setof progreso_usuario" a una tabla con una columna
-- extra), así que hay que dropear la firma vieja primero — seguro, solo
-- redefine la función, no toca datos.
drop function if exists public.obtener_progreso_por_email(text);

create function public.obtener_progreso_por_email(p_email text)
returns table (
  materia_id text,
  unidad_actual int,
  elemento_actual int,
  ultima_interaccion timestamp,
  avance_valido boolean,
  nombre_premium text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pu.materia_id,
    pu.unidad_actual,
    pu.elemento_actual,
    pu.ultima_interaccion,
    pu.avance_valido,
    prod.nombre as nombre_premium
  from public.progreso_usuario pu
  join auth.users u on u.id = pu.user_id
  left join public.productos prod
    on pu.materia_id like 'premium-%'
    and prod.id::text = replace(pu.materia_id, 'premium-', '')
  where lower(u.email) = lower(p_email)
  order by pu.materia_id;
$$;

revoke all on function public.obtener_progreso_por_email(text) from public;
grant execute on function public.obtener_progreso_por_email(text) to authenticated;
