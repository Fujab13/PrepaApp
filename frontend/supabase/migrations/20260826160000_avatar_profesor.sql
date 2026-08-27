-- Foto de perfil del profesor vía Gravatar ("la foto ligada a tu correo").
-- En vez de exponer el correo de la cuenta directo (privado por diseño
-- desde la migración original de `profesores`), se regresa solo el hash
-- MD5 que la URL de Gravatar espera — nunca el correo en sí. Si el
-- profesor no tiene foto configurada en Gravatar, el propio servicio
-- regresa una silueta genérica (`?d=mp`), así que no hace falta ningún
-- fallback de datos del lado del backend; el frontend solo cubre el caso
-- de que la imagen no cargue (sin red, Gravatar caído, etc.).
--
-- `create or replace` no permite agregar una columna a un `returns table`
-- existente (cambia el tipo de retorno), así que hay que dropear la firma
-- vieja primero; es seguro, solo redefine una función, no toca datos.
drop function if exists public.obtener_perfil_profesor(uuid);

create function public.obtener_perfil_profesor(p_profesor_user_id uuid)
returns table (
  user_id uuid,
  nombre text,
  materias text[],
  calificacion_promedio numeric,
  numero_calificaciones int,
  creado_en timestamptz,
  avatar_hash text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.user_id, p.nombre, p.materias, p.calificacion_promedio, p.numero_calificaciones, p.creado_en,
         md5(lower(trim(u.email)))
  from profesores p
  join auth.users u on u.id = p.user_id
  where p.user_id = p_profesor_user_id;
$$;

revoke all on function public.obtener_perfil_profesor(uuid) from public;
grant execute on function public.obtener_perfil_profesor(uuid) to anon, authenticated;
