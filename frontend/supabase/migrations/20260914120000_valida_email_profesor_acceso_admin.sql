-- es_email_de_profesor: usada por la edge function admin-acceso-profesor
-- para verificar que el email al que un admin quiere generar un magic link
-- pertenece de verdad a una cuenta de profesor (join contra auth.users por
-- user_id) antes de llamar a auth.admin.generateLink. Antes, la función
-- verificaba correctamente que quien LLAMA sea admin, pero generaba el link
-- para cualquier email recibido en el body sin validar el destino — un
-- admin (o su sesión comprometida) podía generar una sesión válida para
-- cualquier cuenta del sistema, no solo profesores.
create or replace function public.es_email_de_profesor(p_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1
    from profesores p
    join auth.users u on u.id = p.user_id
    where lower(u.email) = lower(p_email)
  );
$$;

revoke all on function public.es_email_de_profesor(text) from public;
grant execute on function public.es_email_de_profesor(text) to authenticated;
