-- Agrega la CLABE de cobro al REGISTRO del profesor (`profesores.numero_cuenta`)
-- en vez de capturarla a mano en cada oferta publicada (`ofertas_maestro.
-- cuenta_clave`, 20260809120000). Motivación: un profesor solo tiene una
-- cuenta, y dejarlo escribirla de nuevo en cada oferta permitía
-- inconsistencias (y typos) entre clases del mismo profesor — ver el
-- comentario en AdminMaestros.jsx ("no existe un número de cuenta único en
-- el registro"), que dejaba de ser cierto con esta migración.
--
-- `ofertas_maestro.profesor`/`cuenta_clave` NO se eliminan: el frontend
-- deja de mostrarlos como campos editables al publicar (los autocompleta
-- con `profesores.nombre`/`numero_cuenta` y los muestra bloqueados), pero
-- la tabla los conserva para no romper AdminPagos/AlumnosOfertas/Tutorias.jsx
-- (que ya leen esas columnas) ni el histórico de ofertas ya publicadas.
--
-- `numero_cuenta` es nullable a propósito: los profesores ya verificados
-- antes de esta migración no tienen valor y `actualizar_profesor_propio`
-- solo corrige registros PENDIENTES (verificado = false) — necesitan una
-- vía para capturarla sin pasar de nuevo por verificación de documentos,
-- de ahí `actualizar_cuenta_profesor` (nueva, sin el guardia de
-- `verificado = false`: la cuenta de cobro no forma parte de lo que ya se
-- validó contra la documentación, así que cambiarla no rompe esa garantía).

alter table public.profesores
  add column numero_cuenta text;

alter table public.profesores
  add constraint profesores_numero_cuenta_formato check (numero_cuenta is null or numero_cuenta ~ '^[0-9]{18}$');

-- ── registrar_profesor_propio: ahora exige la CLABE desde el alta ───────
drop function if exists public.registrar_profesor_propio(text, text, text, text, text[]);

create function public.registrar_profesor_propio(
  p_nombre text,
  p_curp text,
  p_email_contacto text,
  p_telefono_contacto text,
  p_materias text[],
  p_numero_cuenta text
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
  if p_numero_cuenta is null or trim(p_numero_cuenta) !~ '^[0-9]{18}$' then
    raise exception 'cuenta_invalida';
  end if;
  if exists (select 1 from profesores where user_id = v_user_id) then
    raise exception 'ya_registrado';
  end if;

  v_password := lpad(floor(random() * 1000000)::int::text, 6, '0');

  insert into profesores (
    user_id, nombre, curp, email_contacto, telefono_contacto, materias, numero_cuenta,
    activo, verificado, "contraseña", onboarding_completo
  ) values (
    v_user_id, trim(p_nombre), upper(trim(p_curp)), trim(p_email_contacto),
    nullif(trim(p_telefono_contacto), ''), p_materias, trim(p_numero_cuenta),
    true, false, v_password, false
  )
  returning profesores.id into v_id;

  return query select v_id;
end;
$$;

revoke all on function public.registrar_profesor_propio(text, text, text, text, text[], text) from public;
grant execute on function public.registrar_profesor_propio(text, text, text, text, text[], text) to authenticated;

-- ── actualizar_profesor_propio: corrige la CLABE junto con el resto ─────
-- mientras el registro sigue pendiente (mismo guardia verificado = false
-- de siempre; qualifica profesores.id igual que 20260904120000).
drop function if exists public.actualizar_profesor_propio(text, text, text, text, text[]);

create function public.actualizar_profesor_propio(
  p_nombre text,
  p_curp text,
  p_email_contacto text,
  p_telefono_contacto text,
  p_materias text[],
  p_numero_cuenta text
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
  if p_numero_cuenta is null or trim(p_numero_cuenta) !~ '^[0-9]{18}$' then
    raise exception 'cuenta_invalida';
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
        materias = p_materias,
        numero_cuenta = trim(p_numero_cuenta)
    where profesores.id = v_id and verificado = false;

  if not found then
    raise exception 'ya_verificado';
  end if;

  return query select v_id;
end;
$$;

revoke all on function public.actualizar_profesor_propio(text, text, text, text, text[], text) from public;
grant execute on function public.actualizar_profesor_propio(text, text, text, text, text[], text) to authenticated;

-- ── actualizar_cuenta_profesor: cambia SOLO la CLABE, en cualquier estado ─
-- La cuenta de cobro no fue parte de lo que el equipo validó contra la
-- documentación (a diferencia de nombre/CURP/materias), así que un
-- profesor YA VERIFICADO también puede corregirla aquí sin re-abrir su
-- registro ni perder `verificado`.
create or replace function public.actualizar_cuenta_profesor(p_numero_cuenta text)
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
  if p_numero_cuenta is null or trim(p_numero_cuenta) !~ '^[0-9]{18}$' then
    raise exception 'cuenta_invalida';
  end if;

  update profesores
    set numero_cuenta = trim(p_numero_cuenta)
    where user_id = v_user_id
    returning profesores.id into v_id;

  if v_id is null then
    raise exception 'no_registrado';
  end if;

  return query select v_id;
end;
$$;

revoke all on function public.actualizar_cuenta_profesor(text) from public;
grant execute on function public.actualizar_cuenta_profesor(text) to authenticated;

-- ── mi_estado_profesor: expone numero_cuenta al propio profesor ─────────
drop function if exists public.mi_estado_profesor();

create function public.mi_estado_profesor()
returns table (
  id uuid,
  nombre text,
  curp text,
  email_contacto text,
  telefono_contacto text,
  materias text[],
  numero_cuenta text,
  verificado boolean,
  creado_en timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select id, nombre, curp, email_contacto, telefono_contacto, materias, numero_cuenta, verificado, creado_en
  from profesores
  where user_id = auth.uid();
$$;

revoke all on function public.mi_estado_profesor() from public;
grant execute on function public.mi_estado_profesor() to authenticated;

-- ── admin_listar_profesores: agrega numero_cuenta para el panel Profesores ─
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
  numero_cuenta text,
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
           p.materias, p.numero_cuenta, p.activo, p.verificado, p."contraseña", u.email::text, p.creado_en,
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

-- ── admin_detalle_transacciones_profesores: agrega la CLABE registrada ──
-- Además de `cuenta_clave` (la congelada en la oferta al momento de
-- publicarla), ahora también regresa `profesor_numero_cuenta` (la
-- canónica, de `profesores`) para que AdminPagos.jsx pueda mostrarla una
-- sola vez por profesor en vez de tener que inferirla de sus ofertas.
drop function if exists public.admin_detalle_transacciones_profesores();

create function public.admin_detalle_transacciones_profesores()
returns table (
  transaccion_id uuid,
  profesor_id uuid,
  profesor_nombre text,
  profesor_email text,
  profesor_numero_cuenta text,
  oferta_id uuid,
  materia_id text,
  materia_otro text,
  fecha_hora timestamptz,
  cuenta_clave text,
  alumno_nombre text,
  alumno_email text,
  monto_total numeric,
  comision_mxn numeric,
  monto_profesor_mxn numeric,
  pagado_profesor boolean,
  pagado_profesor_en timestamptz,
  pagado_en timestamptz
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
      t.id,
      om.creado_por,
      coalesce(pp.nombre, om.profesor),
      pu.email::text,
      pf.numero_cuenta,
      om.id,
      om.materia_id,
      om.materia_otro,
      om.fecha_hora,
      om.cuenta_clave,
      coalesce(ap.nombre, af.nombre),
      au.email::text,
      t.monto_total,
      t.comision_mxn,
      t.monto_profesor_mxn,
      t.pagado_profesor,
      t.pagado_profesor_en,
      t.actualizado_en
    from transacciones t
    join ofertas_maestro om on om.id = t.oferta_maestro_id
    join auth.users pu on pu.id = om.creado_por
    left join perfiles pp on pp.id = om.creado_por
    left join profesores pf on pf.user_id = om.creado_por
    join auth.users au on au.id = t.user_id
    left join perfiles ap on ap.id = t.user_id
    left join lateral (
      select fa.nombre
      from formularios_area fa
      where fa.user_id = t.user_id
      order by fa.creado_en desc
      limit 1
    ) af on true
    where t.estado_pago = 'completado'
    order by t.pagado_profesor asc, om.fecha_hora asc;
end;
$$;

revoke all on function public.admin_detalle_transacciones_profesores() from public;
grant execute on function public.admin_detalle_transacciones_profesores() to authenticated;
