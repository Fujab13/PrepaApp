-- Registro de profesores con auto-servicio + verificación manual de
-- documentos, reemplazando el gate admin-driven de `maestros`
-- (20260812140000) por uno basado en la tabla `profesores` (la del sistema
-- viejo de Tutorías 1-a-1, hasta ahora en desuso — ver comentario original
-- en 20260812140000_registro_maestros.sql). Se decidió reusarla en vez de
-- crear una tercera tabla porque ya tenía exactamente las columnas que este
-- flujo necesita (nombre, curp, contacto, materias, activo) más `user_id`
-- (agregado en 20260805150000 para el marketplace de Stripe Connect).
--
-- Flujo nuevo:
--   1. El usuario (ya logueado con su cuenta normal) llena un formulario en
--      /tutorias/maestro → `registrar_profesor_propio` crea su fila en
--      `profesores` ligada a su propio auth.uid(), genera una contraseña de
--      6 dígitos y la guarda en texto plano en la columna `contraseña`
--      (igual que `registrar-maestro` ya hacía con la contraseña que
--      generaba para `maestros`: es una contraseña de un solo propósito que
--      un humano tiene que poder leer y reenviar por correo, no la
--      contraseña real de su cuenta).
--   2. Queda con `verificado = false` hasta que alguien del equipo revise
--      la documentación (que el profesor manda por fuera de la app, a un
--      correo) y la active a mano — hoy vía `admin_set_profesor_verificado`
--      desde AdminMaestros.jsx (no hay panel de administración dedicado
--      todavía, se pidió como trabajo futuro).
--   3. `soy_maestro_actual()` ahora exige `profesores.verificado` en vez de
--      la tabla `maestros`. Esa tabla y sus RPCs (`admin_listar_maestros`,
--      `admin_set_maestro_activo`) y el edge function `registrar-maestro`
--      quedan SIN USO pero intactos a propósito (no se borra nada — ver
--      CLAUDE.md sobre no hacer drops sin pedir permiso primero).
--   4. Login de profesor (correo de cuenta + la contraseña de 6 dígitos) es
--      un gate aparte, deliberadamente independiente de
--      `supabase.auth.signInWithPassword`: solo desbloquea las
--      herramientas de maestro en el navegador (ver `verificar_login_profesor`
--      más abajo); la autorización real de escritura sigue viviendo en las
--      policies de `ofertas_maestro` vía `soy_maestro_actual()`, así que
--      esta pantalla nunca es la única barrera de seguridad.
--
-- Se migran a `profesores` los maestros que ya estaban activos en
-- `maestros` (verificado = true de una vez: ya fueron dados de alta a mano
-- por un admin antes de este cambio, no tiene sentido pedirles
-- documentación retroactiva).

-- ── profesores: columnas nuevas ──────────────────────────────────────────
alter table public.profesores
  add column curp text,
  add column verificado boolean not null default false,
  add column "contraseña" text;

alter table public.profesores
  add constraint profesores_curp_formato check (curp is null or curp ~ '^[A-Z0-9]{18}$');

alter table public.profesores
  add constraint profesores_curp_unico unique (curp);

-- ── backfill: maestros ya activos entran verificados de una vez ─────────
insert into public.profesores (user_id, nombre, email_contacto, materias, activo, verificado, onboarding_completo)
select m.user_id, m.nombre, u.email, '{}'::text[], true, true, true
from public.maestros m
join auth.users u on u.id = m.user_id
where m.activo
on conflict (user_id) do update set verificado = true, activo = true;

-- ── soy_maestro_actual: ahora sobre profesores, no sobre maestros ───────
create or replace function public.soy_maestro_actual()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profesores
    where user_id = auth.uid() and verificado and activo
  );
$$;

-- ── registrar_profesor_propio: alta self-service ─────────────────────────
create or replace function public.registrar_profesor_propio(
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
  v_password text;
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
  if exists (select 1 from profesores where user_id = v_user_id) then
    raise exception 'ya_registrado';
  end if;

  v_password := lpad(floor(random() * 1000000)::int::text, 6, '0');

  insert into profesores (
    user_id, nombre, curp, email_contacto, telefono_contacto, materias,
    activo, verificado, "contraseña", onboarding_completo
  ) values (
    v_user_id, trim(p_nombre), upper(trim(p_curp)), trim(p_email_contacto),
    nullif(trim(p_telefono_contacto), ''), p_materias,
    true, false, v_password, false
  )
  returning profesores.id into v_id;

  return query select v_id;
end;
$$;

revoke all on function public.registrar_profesor_propio(text, text, text, text, text[]) from public;
grant execute on function public.registrar_profesor_propio(text, text, text, text, text[]) to authenticated;

-- ── mi_estado_profesor: para que el propio profesor vea su registro ─────
-- Deliberadamente sin exponer "contraseña" ni notas_admin.
create or replace function public.mi_estado_profesor()
returns table (
  id uuid,
  nombre text,
  curp text,
  email_contacto text,
  telefono_contacto text,
  materias text[],
  verificado boolean,
  creado_en timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select id, nombre, curp, email_contacto, telefono_contacto, materias, verificado, creado_en
  from profesores
  where user_id = auth.uid();
$$;

revoke all on function public.mi_estado_profesor() from public;
grant execute on function public.mi_estado_profesor() to authenticated;

-- ── verificar_login_profesor: gate aparte para desbloquear el portal ────
-- Compara contra el correo de la CUENTA (auth.users.email), no
-- email_contacto: son cosas distintas a propósito (ver nota del usuario en
-- la conversación original), y la cuenta es la que ya está ligada por
-- user_id desde el registro.
create or replace function public.verificar_login_profesor(p_email text, p_contrasena text)
returns table (id uuid, nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_nombre text;
begin
  select p.id, p.nombre into v_id, v_nombre
  from profesores p
  join auth.users u on u.id = p.user_id
  where lower(u.email) = lower(trim(p_email))
    and p."contraseña" = p_contrasena
    and p.verificado
    and p.activo;

  if v_id is null then
    raise exception 'credenciales_invalidas';
  end if;

  return query select v_id, v_nombre;
end;
$$;

revoke all on function public.verificar_login_profesor(text, text) from public;
grant execute on function public.verificar_login_profesor(text, text) to authenticated;

-- ── administración: listar y verificar/activar profesores ───────────────
create or replace function public.admin_listar_profesores()
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

  -- Filtra las filas del catálogo viejo de Tutorías 1-a-1 (admin-curadas a
  -- mano en Supabase Studio, sin user_id ni login propio): este panel es
  -- solo para las cuentas que pasaron por `registrar_profesor_propio` o el
  -- backfill de `maestros`, todas con user_id.
  return query
    select p.id, p.user_id, p.nombre, p.curp, p.email_contacto, p.telefono_contacto,
           p.materias, p.activo, p.verificado, p."contraseña", u.email::text, p.creado_en
    from profesores p
    join auth.users u on u.id = p.user_id
    where p.user_id is not null
    order by p.verificado asc, p.creado_en desc;
end;
$$;

revoke all on function public.admin_listar_profesores() from public;
grant execute on function public.admin_listar_profesores() to authenticated;

create or replace function public.admin_set_profesor_verificado(p_profesor_id uuid, p_verificado boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  update profesores set verificado = p_verificado where id = p_profesor_id;

  if not found then
    raise exception 'profesor_no_encontrado';
  end if;
end;
$$;

revoke all on function public.admin_set_profesor_verificado(uuid, boolean) from public;
grant execute on function public.admin_set_profesor_verificado(uuid, boolean) to authenticated;

create or replace function public.admin_set_profesor_activo(p_profesor_id uuid, p_activo boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_actual() then
    raise exception 'no_autorizado';
  end if;

  update profesores set activo = p_activo where id = p_profesor_id;

  if not found then
    raise exception 'profesor_no_encontrado';
  end if;
end;
$$;

revoke all on function public.admin_set_profesor_activo(uuid, boolean) from public;
grant execute on function public.admin_set_profesor_activo(uuid, boolean) to authenticated;
