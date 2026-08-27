-- Corrige el avatar del profesor: la versión anterior solo exponía el hash
-- de Gravatar, así que una cuenta sin Gravatar registrado (la mayoría, p.
-- ej. quien entra con Google) mostraba el silueta genérica de Gravatar en
-- vez de su foto real, aunque Supabase ya guarda esa foto en
-- `auth.users.raw_user_meta_data` para cualquier login OAuth (Google
-- popula tanto `avatar_url` como `picture` con la misma URL de
-- lh3.googleusercontent.com). Ahora se expone esa URL como fuente
-- principal; `avatar_hash` de Gravatar queda como respaldo para cuentas de
-- correo/contraseña que sí tengan Gravatar configurado, y el frontend cae
-- al círculo con inicial si ninguna de las dos existe o falla al cargar.
drop function if exists public.obtener_perfil_profesor(uuid);

create function public.obtener_perfil_profesor(p_profesor_user_id uuid)
returns table (
  user_id uuid,
  nombre text,
  materias text[],
  calificacion_promedio numeric,
  numero_calificaciones int,
  creado_en timestamptz,
  avatar_hash text,
  avatar_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.user_id, p.nombre, p.materias, p.calificacion_promedio, p.numero_calificaciones, p.creado_en,
         md5(lower(trim(u.email))),
         coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
  from profesores p
  join auth.users u on u.id = p.user_id
  where p.user_id = p_profesor_user_id;
$$;

revoke all on function public.obtener_perfil_profesor(uuid) from public;
grant execute on function public.obtener_perfil_profesor(uuid) to anon, authenticated;
