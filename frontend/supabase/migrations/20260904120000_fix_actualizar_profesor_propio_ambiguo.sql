-- `actualizar_profesor_propio` (20260826130000) declara `returns table (id
-- uuid)`, lo que crea una variable plpgsql llamada `id` en el mismo scope
-- que la columna `profesores.id`. Las dos referencias sin calificar a `id`
-- en el cuerpo (el `select id into v_id ...` y el `where id = v_id` del
-- update) quedaban ambiguas para Postgres y la función fallaba SIEMPRE con
-- el error 42702 "column reference \"id\" is ambiguous" — por eso un
-- profesor pendiente de verificar nunca podía guardar cambios al editar su
-- registro. Confirmado reproduciendo la llamada contra la base en vivo.
create or replace function public.actualizar_profesor_propio(
  p_nombre text,
  p_curp text,
  p_email_contacto text,
  p_telefono_contacto text,
  p_materias text[]
)
returns table (id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;
  if p_nombre is null or trim(p_nombre) = '' then
    raise exception 'nombre_requerido';
  end if;
  if p_curp is null or trim(p_curp) = '' then
    raise exception 'curp_requerida';
  end if;
  if p_email_contacto is null or trim(p_email_contacto) = '' then
    raise exception 'email_contacto_requerido';
  end if;
  if p_materias is null or array_length(p_materias, 1) is null then
    raise exception 'materias_requeridas';
  end if;

  select profesores.id into v_id from profesores where user_id = v_user_id;
  if v_id is null then
    raise exception 'no_registrado';
  end if;

  update profesores
    set nombre = trim(p_nombre),
        curp = upper(trim(p_curp)),
        email_contacto = trim(p_email_contacto),
        telefono_contacto = nullif(trim(p_telefono_contacto), ''),
        materias = p_materias
    where profesores.id = v_id and verificado = false;

  if not found then
    raise exception 'ya_verificado';
  end if;

  return query select v_id;
end;
$$;

revoke all on function public.actualizar_profesor_propio(text, text, text, text, text[]) from public;
grant execute on function public.actualizar_profesor_propio(text, text, text, text, text[]) to authenticated;
