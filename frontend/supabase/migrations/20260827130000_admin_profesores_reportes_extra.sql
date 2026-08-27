-- Dos ajustes al panel de admin de profesores/reportes:
--   1. `admin_listar_profesores` ahora también regresa cuántos reportes
--      tiene cada profesor (total y pendientes/en revisión), para que
--      AdminMaestros.jsx pueda marcarlos en rojo sin tener que cruzar con
--      `admin_listar_reportes` por separado en el cliente.
--   2. `admin_listar_reportes` ahora también regresa el correo de la
--      CUENTA del profesor reportado (no solo su nombre), para que el
--      admin pueda copiarlo/verlo grande y buscarlo directo en el panel de
--      profesores (que ahora tiene buscador por correo/nombre/CURP).

drop function if exists public.admin_listar_profesores();

create function public.admin_listar_profesores()
returns table (
  id uuid,
  user_id uuid,
  nombre text,
  curp text,
  email_contacto text,
  telefono_contacto text,
  materias text[],
  activo boolean,
  verificado boolean,
  "contraseña" text,
  email_cuenta text,
  creado_en timestamptz,
  total_reportes int,
  reportes_pendientes int
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  return query
    select p.id, p.user_id, p.nombre, p.curp, p.email_contacto, p.telefono_contacto,
           p.materias, p.activo, p.verificado, p."contraseña", u.email::text, p.creado_en,
           coalesce(r.total, 0)::int, coalesce(r.pendientes, 0)::int
    from profesores p
    join auth.users u on u.id = p.user_id
    left join lateral (
      select count(*) as total,
             count(*) filter (where estado in ('pendiente', 'en_revision')) as pendientes
      from reportes
      where profesor_user_id = p.user_id
    ) r on true
    where p.user_id is not null
    order by p.verificado asc, p.creado_en desc;
end;
$$;

revoke all on function public.admin_listar_profesores() from public;
grant execute on function public.admin_listar_profesores() to authenticated;

drop function if exists public.admin_listar_reportes();

create function public.admin_listar_reportes()
returns table (
  id uuid,
  profesor_user_id uuid,
  profesor_nombre text,
  profesor_email text,
  oferta_maestro_id uuid,
  categoria text,
  gravedad text,
  descripcion text,
  reportante_user_id uuid,
  reportante_email text,
  reportante_contacto text,
  estado text,
  notas_admin text,
  creado_en timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  return query
    select
      r.id, r.profesor_user_id, coalesce(p.nombre, '—'), pu.email::text, r.oferta_maestro_id,
      r.categoria, r.gravedad, r.descripcion, r.reportante_user_id,
      ru.email::text, r.reportante_contacto, r.estado, r.notas_admin, r.creado_en
    from reportes r
    left join profesores p on p.user_id = r.profesor_user_id
    left join auth.users pu on pu.id = r.profesor_user_id
    left join auth.users ru on ru.id = r.reportante_user_id
    order by
      case r.gravedad when 'grave' then 0 when 'moderado' then 1 else 2 end,
      case r.estado when 'pendiente' then 0 when 'en_revision' then 1 else 2 end,
      r.creado_en desc;
end;
$$;

revoke all on function public.admin_listar_reportes() from public;
grant execute on function public.admin_listar_reportes() to authenticated;
