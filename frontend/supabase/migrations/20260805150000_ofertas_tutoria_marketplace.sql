-- Marketplace de "Tutorías 1-a-1": alumnos Y maestros publican ofertas
-- (materia, horario, precio propio) y cualquiera puede aceptar una del
-- lado contrario. Las ofertas aceptadas se insertan en la MISMA tabla
-- `solicitudes_tutoria` que ya usa todo el pipeline de Stripe Connect
-- (crear-sesion-pago-tutoria, confirmar_pago_tutoria, el webhook, los
-- correos) — cero cambios a esos edge functions. El catálogo admin viejo
-- (`profesores` sin user_id) y `crear_solicitud_tutoria` (auto-match) se
-- dejan intactos por si ya hay maestros reales dados de alta a mano; esta
-- migración solo los endurece de forma aditiva (ver más abajo) para que
-- convivan sin pisarse con las filas de marketplace.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - `profesores.user_id` es NULL en las filas admin viejas y se rellena
--     la primera vez que alguien publica/acepta como maestro
--     (`asegurar_profesor_propio`). `tarifa_hora_mxn` se vuelve nullable
--     porque el precio ahora es por oferta, no una tarifa fija por hora.
--   - `crear_solicitud_tutoria` (RPC viejo) ahora exige
--     `tarifa_hora_mxn is not null`: sin este guardia, si alguna vez una
--     fila de marketplace queda con `materias` no vacío, el auto-match
--     viejo podría elegirla y reventar el NOT NULL de
--     `solicitudes_tutoria.precio_total_mxn` al calcular `tarifa*duracion`
--     sobre NULL. No cambia el comportamiento de ninguna fila admin
--     legítima (todas ya tienen tarifa).
--   - `liberar_ofertas_vencidas()` NO es un job en cron: se llama de forma
--     oportunista al inicio de crear_oferta_tutoria/aceptar_oferta_tutoria
--     y una vez al montar cada página de tutorías. Sin ella, una oferta
--     aceptada cuya solicitud se cancela por pago abandonado (>30 min)
--     quedaría "muerta" para siempre: invisible en la lista de abiertas y
--     sin ningún camino de código para reabrirla.
--   - `aceptar_oferta_tutoria` NUNCA intenta marcar una oferta vencida
--     como tal antes de lanzar su excepción: un UPDATE seguido de un
--     RAISE EXCEPTION no atrapado en la misma función revierte TODO,
--     incluido ese UPDATE (una excepción no atrapada aborta la
--     transacción completa de la llamada). Por eso no existe un estado
--     'expirada': las ofertas vencidas simplemente dejan de listarse por
--     filtro de fecha del lado del cliente/RLS de solo-abiertas.
--   - `obtener_estado_pagos_propio()` existe para que el dueño de una fila
--     de `profesores` pueda saber su propio estado de onboarding sin
--     que el cliente tenga NUNCA select directo sobre `profesores` (esa
--     tabla puede tener `notas_admin`, admin-only por diseño desde la
--     migración original).

-- ── profesores: soporte para maestros de marketplace ────────────────────
alter table public.profesores
  add column user_id uuid unique references auth.users(id) on delete set null;

alter table public.profesores
  alter column tarifa_hora_mxn drop not null;

alter table public.profesores
  drop constraint if exists profesores_tarifa_hora_mxn_check;

alter table public.profesores
  add constraint profesores_tarifa_hora_mxn_check check (tarifa_hora_mxn is null or tarifa_hora_mxn > 0);

-- Hardening aditivo del RPC viejo (ver comentario arriba). Mismo cuerpo
-- que la migración del 5-ago, solo se agrega la condición de tarifa.
create or replace function public.crear_solicitud_tutoria(
  p_materia_id text,
  p_fecha_hora timestamptz,
  p_duracion_minutos int,
  p_notas text default null,
  p_archivos jsonb default '[]'::jsonb
)
returns public.solicitudes_tutoria
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profesor_id uuid;
  v_tarifa numeric(10,2);
  v_precio numeric(10,2);
  v_comision numeric(10,2);
  v_monto_profesor numeric(10,2);
  v_resultado_examen_id uuid;
  v_formulario_area_id uuid;
  v_rango tstzrange;
  v_solicitud solicitudes_tutoria;
  v_archivo jsonb;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  if p_materia_id is null or p_materia_id not in ('espanol','matematicas','ingles','historia') then
    raise exception 'materia_invalida';
  end if;

  if p_duracion_minutos is null or p_duracion_minutos not in (60, 90, 120) then
    raise exception 'duracion_invalida';
  end if;

  if p_fecha_hora is null or p_fecha_hora < now() + interval '24 hours' then
    raise exception 'antelacion_insuficiente';
  end if;

  if p_notas is not null and char_length(p_notas) > 500 then
    raise exception 'notas_muy_largas';
  end if;

  if p_archivos is not null and jsonb_typeof(p_archivos) = 'array' and jsonb_array_length(p_archivos) > 5 then
    raise exception 'demasiados_archivos';
  end if;

  update solicitudes_tutoria
    set estado = 'cancelada'
    where estado = 'pendiente_pago'
      and creado_en < now() - interval '30 minutes';

  select id into v_resultado_examen_id
    from resultados_examen where user_id = v_user_id
    order by creado_en desc limit 1;

  select id into v_formulario_area_id
    from formularios_area where user_id = v_user_id
    order by creado_en desc limit 1;

  v_rango := tstzrange(
    p_fecha_hora,
    p_fecha_hora + (p_duracion_minutos || ' minutes')::interval,
    '[)'
  );

  select p.id, p.tarifa_hora_mxn into v_profesor_id, v_tarifa
    from profesores p
    where p.activo = true
      and p.onboarding_completo = true
      and p.tarifa_hora_mxn is not null
      and p_materia_id = any(p.materias)
      and not exists (
        select 1 from solicitudes_tutoria s
        where s.profesor_id = p.id
          and s.estado in ('pendiente_pago', 'confirmada')
          and s.rango_horario && v_rango
      )
    order by (
      select count(*) from solicitudes_tutoria s2
      where s2.profesor_id = p.id and s2.estado in ('pendiente_pago', 'confirmada')
    ) asc, p.id
    limit 1;

  if v_profesor_id is null then
    raise exception 'sin_profesor_disponible';
  end if;

  v_precio := round(v_tarifa * p_duracion_minutos / 60.0, 2);
  v_comision := round(v_precio * 0.18, 2);
  v_monto_profesor := v_precio - v_comision;

  begin
    insert into solicitudes_tutoria (
      user_id, profesor_id, materia_id, fecha_hora_solicitada, duracion_minutos,
      notas_alumno, precio_total_mxn, comision_mxn, monto_profesor_mxn,
      resultado_examen_id, formulario_area_id
    ) values (
      v_user_id, v_profesor_id, p_materia_id, p_fecha_hora, p_duracion_minutos,
      p_notas, v_precio, v_comision, v_monto_profesor,
      v_resultado_examen_id, v_formulario_area_id
    )
    returning * into v_solicitud;
  exception when exclusion_violation then
    raise exception 'horario_no_disponible';
  end;

  if p_archivos is not null and jsonb_typeof(p_archivos) = 'array' then
    for v_archivo in select * from jsonb_array_elements(p_archivos)
    loop
      if v_archivo->>'storage_path' is null
        or v_archivo->>'nombre_original' is null
        or left(v_archivo->>'storage_path', length(v_user_id::text) + 1) <> v_user_id::text || '/'
      then
        raise exception 'archivo_invalido';
      end if;

      insert into tutoria_archivos (
        solicitud_id, user_id, storage_path, nombre_original, tamano_bytes
      ) values (
        v_solicitud.id, v_user_id,
        v_archivo->>'storage_path', v_archivo->>'nombre_original',
        nullif(v_archivo->>'tamano_bytes', '')::int
      );
    end loop;
  end if;

  return v_solicitud;
end;
$$;

revoke all on function public.crear_solicitud_tutoria(text, timestamptz, int, text, jsonb) from public;
grant execute on function public.crear_solicitud_tutoria(text, timestamptz, int, text, jsonb) to authenticated;

-- ── ofertas_tutoria ──────────────────────────────────────────────────────
-- `autor_id`/`aceptada_por` referencian `perfiles(id)` (no `auth.users(id)`
-- directo, aunque son el mismo valor): así el cliente puede pedir
-- `.select('*, autor:perfiles(nombre,calificacion_promedio,...)')` en una
-- sola llamada de PostgREST para las tarjetas de oferta, sin una consulta
-- aparte por cada autor. Es seguro porque `perfiles.id` siempre existe para
-- todo `auth.users.id` (trigger + backfill, ver migración anterior).
create table public.ofertas_tutoria (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.perfiles(id) on delete cascade,
  rol_autor text not null check (rol_autor in ('alumno','maestro')),
  materia_id text not null check (materia_id = any (array['espanol','matematicas','ingles','historia'])),
  fecha_hora timestamptz not null,
  duracion_minutos int not null check (duracion_minutos = any (array[60,90,120])),
  precio_mxn numeric(10,2) not null check (precio_mxn between 50 and 5000),
  notas text check (char_length(notas) <= 500),
  estado text not null default 'abierta' check (estado in ('abierta','aceptada','cancelada')),
  aceptada_por uuid references public.perfiles(id),
  aceptada_en timestamptz,
  solicitud_id uuid references public.solicitudes_tutoria(id),
  creado_en timestamptz not null default now()
);

alter table public.ofertas_tutoria enable row level security;

create policy "select_abiertas_o_propias" on public.ofertas_tutoria
  for select to authenticated
  using (estado = 'abierta' or autor_id = auth.uid() or aceptada_por = auth.uid());
-- Sin insert/update para el cliente: todo pasa por los RPCs de abajo.

create index ofertas_tutoria_autor_idx on public.ofertas_tutoria (autor_id);
create index ofertas_tutoria_estado_rol_materia_idx on public.ofertas_tutoria (estado, rol_autor, materia_id);

-- ── tutoria_archivos: soporte para archivos de una oferta aún no aceptada ─
alter table public.tutoria_archivos
  alter column solicitud_id drop not null;

alter table public.tutoria_archivos
  add column oferta_id uuid references public.ofertas_tutoria(id) on delete cascade;

alter table public.tutoria_archivos
  add constraint tutoria_archivos_padre_check check (solicitud_id is not null or oferta_id is not null);

create index tutoria_archivos_oferta_idx on public.tutoria_archivos (oferta_id);

-- ── solicitudes_tutoria: trazabilidad hacia la oferta que la originó ────
alter table public.solicitudes_tutoria
  add column oferta_id uuid references public.ofertas_tutoria(id);

-- Antes de este esquema, el "profesor" de una solicitud nunca era un
-- usuario logueado (catálogo admin, sin auth.users), así que nunca hizo
-- falta que la propia solicitud le fuera visible. Ahora que un maestro de
-- marketplace SÍ es un usuario real, necesita ver sus propias clases
-- asignadas (para el meeting_url, calificar al alumno después, etc.). Es
-- una policy de SELECT adicional (se combinan con OR): no reemplaza ni
-- afloja `select_propia`, solo agrega este caso.
--
-- El chequeo va en una función SECURITY DEFINER, NO como subquery directo
-- en el USING de la policy: `profesores` tiene `revoke all ... from
-- anon, authenticated` (nunca debe ser legible por el cliente), y un
-- USING de policy corre con los privilegios del rol que hace la consulta
-- — un subquery ahí sí quedaría bloqueado por ese revoke (a diferencia de
-- una función security definer, que corre con los privilegios de su
-- dueño y por eso puede leer `profesores` igual que el resto de los RPCs
-- de este esquema).
create or replace function public.es_profesor_de(p_profesor_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profesores where id = p_profesor_id and user_id = auth.uid()
  );
$$;

revoke all on function public.es_profesor_de(uuid) from public;
grant execute on function public.es_profesor_de(uuid) to authenticated;

create policy "select_como_profesor" on public.solicitudes_tutoria
  for select to authenticated
  using (es_profesor_de(profesor_id));

-- ── asegurar_profesor_propio: helper interno, SIN grants ─────────────────
-- Solo invocable desde otras funciones security definer de este esquema
-- (crear_oferta_tutoria, aceptar_oferta_tutoria), nunca directo desde el
-- cliente. Crea (si no existe) la fila de `profesores` ligada al usuario
-- que se está volviendo maestro, sembrando nombre/correo desde
-- perfiles/auth.users. Revalida que ya haya un nombre configurado: el
-- frontend ya bloquea publicar/aceptar sin nombre, pero esta función no
-- confía solo en ese gate (mismo principio que el resto del esquema).
create or replace function public.asegurar_profesor_propio(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;
  v_email text;
  v_profesor_id uuid;
begin
  select id into v_profesor_id from profesores where user_id = p_user_id;
  if v_profesor_id is not null then
    return v_profesor_id;
  end if;

  select nombre into v_nombre from perfiles where id = p_user_id;
  if v_nombre is null or trim(v_nombre) = '' then
    raise exception 'nombre_requerido';
  end if;

  select email into v_email from auth.users where id = p_user_id;

  insert into profesores (user_id, nombre, email_contacto, materias, activo, onboarding_completo)
  values (p_user_id, v_nombre, v_email, '{}', true, false)
  on conflict (user_id) do nothing
  returning id into v_profesor_id;

  if v_profesor_id is null then
    -- Otra llamada concurrente ya insertó la fila: relee.
    select id into v_profesor_id from profesores where user_id = p_user_id;
  end if;

  return v_profesor_id;
end;
$$;

-- ── obtener_estado_pagos_propio ───────────────────────────────────────────
create or replace function public.obtener_estado_pagos_propio()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profesor profesores;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  select * into v_profesor from profesores where user_id = v_user_id;

  return jsonb_build_object(
    -- `profesor_id` (el id propio en `profesores`, no datos de otros) se
    -- expone para que el cliente pueda filtrar `solicitudes_tutoria` por
    -- `profesor_id` del lado de la query — la RLS de esa tabla ya
    -- restringe el acceso, esto solo evita mandar un profesor_id ajeno.
    'profesor_id', v_profesor.id,
    'onboarding_completo', coalesce(v_profesor.onboarding_completo, false),
    'tiene_cuenta_stripe', v_profesor.stripe_account_id is not null
  );
end;
$$;

revoke all on function public.obtener_estado_pagos_propio() from public;
grant execute on function public.obtener_estado_pagos_propio() to authenticated;

-- ── liberar_ofertas_vencidas ──────────────────────────────────────────────
create or replace function public.liberar_ofertas_vencidas()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update solicitudes_tutoria
    set estado = 'cancelada'
    where estado = 'pendiente_pago'
      and creado_en < now() - interval '30 minutes';

  update ofertas_tutoria o
    set estado = 'abierta', aceptada_por = null, aceptada_en = null, solicitud_id = null
    from solicitudes_tutoria s
    where o.solicitud_id = s.id
      and o.estado = 'aceptada'
      and s.estado = 'cancelada';
end;
$$;

revoke all on function public.liberar_ofertas_vencidas() from public;
grant execute on function public.liberar_ofertas_vencidas() to authenticated;

-- ── crear_oferta_tutoria ──────────────────────────────────────────────────
create or replace function public.crear_oferta_tutoria(
  p_rol text,
  p_materia_id text,
  p_fecha_hora timestamptz,
  p_duracion_minutos int,
  p_precio_mxn numeric,
  p_notas text default null,
  p_archivos jsonb default '[]'::jsonb
)
returns public.ofertas_tutoria
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_oferta ofertas_tutoria;
  v_archivo jsonb;
begin
  perform liberar_ofertas_vencidas();

  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  if p_rol is null or p_rol not in ('alumno','maestro') then
    raise exception 'rol_invalido';
  end if;

  if p_materia_id is null or p_materia_id not in ('espanol','matematicas','ingles','historia') then
    raise exception 'materia_invalida';
  end if;

  if p_duracion_minutos is null or p_duracion_minutos not in (60, 90, 120) then
    raise exception 'duracion_invalida';
  end if;

  if p_fecha_hora is null or p_fecha_hora < now() + interval '24 hours' then
    raise exception 'antelacion_insuficiente';
  end if;

  if p_precio_mxn is null or p_precio_mxn < 50 or p_precio_mxn > 5000 then
    raise exception 'precio_invalido';
  end if;

  if p_notas is not null and char_length(p_notas) > 500 then
    raise exception 'notas_muy_largas';
  end if;

  if p_archivos is not null and jsonb_typeof(p_archivos) = 'array' and jsonb_array_length(p_archivos) > 5 then
    raise exception 'demasiados_archivos';
  end if;

  if p_rol = 'maestro' then
    perform asegurar_profesor_propio(v_user_id);
  end if;

  insert into ofertas_tutoria (
    autor_id, rol_autor, materia_id, fecha_hora, duracion_minutos, precio_mxn, notas
  ) values (
    v_user_id, p_rol, p_materia_id, p_fecha_hora, p_duracion_minutos, p_precio_mxn, p_notas
  )
  returning * into v_oferta;

  if p_archivos is not null and jsonb_typeof(p_archivos) = 'array' then
    for v_archivo in select * from jsonb_array_elements(p_archivos)
    loop
      if v_archivo->>'storage_path' is null
        or v_archivo->>'nombre_original' is null
        or left(v_archivo->>'storage_path', length(v_user_id::text) + 1) <> v_user_id::text || '/'
      then
        raise exception 'archivo_invalido';
      end if;

      insert into tutoria_archivos (
        oferta_id, user_id, storage_path, nombre_original, tamano_bytes
      ) values (
        v_oferta.id, v_user_id,
        v_archivo->>'storage_path', v_archivo->>'nombre_original',
        nullif(v_archivo->>'tamano_bytes', '')::int
      );
    end loop;
  end if;

  return v_oferta;
end;
$$;

revoke all on function public.crear_oferta_tutoria(text, text, timestamptz, int, numeric, text, jsonb) from public;
grant execute on function public.crear_oferta_tutoria(text, text, timestamptz, int, numeric, text, jsonb) to authenticated;

-- ── cancelar_oferta_tutoria ────────────────────────────────────────────────
create or replace function public.cancelar_oferta_tutoria(p_oferta_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_oferta ofertas_tutoria;
  v_paths text[];
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  select * into v_oferta from ofertas_tutoria where id = p_oferta_id for update;
  if not found then
    raise exception 'oferta_no_encontrada';
  end if;

  if v_oferta.autor_id <> v_user_id then
    raise exception 'no_autorizado';
  end if;

  if v_oferta.estado <> 'abierta' then
    raise exception 'oferta_no_cancelable';
  end if;

  -- Limpia archivos huérfanos: filas + objetos del bucket. Corre con los
  -- privilegios del dueño de la función, puede tocar storage.objects
  -- directo sin necesitar un cliente admin aparte.
  select array_agg(storage_path) into v_paths from tutoria_archivos where oferta_id = p_oferta_id;

  if v_paths is not null then
    delete from storage.objects where bucket_id = 'tutoria-archivos' and name = any(v_paths);
  end if;

  delete from tutoria_archivos where oferta_id = p_oferta_id;

  update ofertas_tutoria set estado = 'cancelada' where id = p_oferta_id;
end;
$$;

revoke all on function public.cancelar_oferta_tutoria(uuid) from public;
grant execute on function public.cancelar_oferta_tutoria(uuid) to authenticated;

-- ── aceptar_oferta_tutoria ─────────────────────────────────────────────────
-- El corazón del match. Nunca confía en nada del cliente más allá del id
-- de la oferta: precio/comisión se calculan del lado servidor sobre
-- oferta.precio_mxn, y el maestro/alumno resultante se resuelve siempre
-- del lado servidor (nunca del body de la llamada).
create or replace function public.aceptar_oferta_tutoria(p_oferta_id uuid)
returns public.solicitudes_tutoria
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_oferta ofertas_tutoria;
  v_alumno_id uuid;
  v_profesor_id uuid;
  v_profesor profesores;
  v_precio numeric(10,2);
  v_comision numeric(10,2);
  v_monto_profesor numeric(10,2);
  v_resultado_examen_id uuid;
  v_formulario_area_id uuid;
  v_solicitud solicitudes_tutoria;
begin
  -- También cancela solicitudes con pago abandonado (>30 min) y reabre
  -- ofertas cuya solicitud haya terminado cancelada por esa vía.
  perform liberar_ofertas_vencidas();

  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  select * into v_oferta from ofertas_tutoria where id = p_oferta_id for update;
  if not found then
    raise exception 'oferta_no_encontrada';
  end if;

  if v_oferta.estado <> 'abierta' then
    raise exception 'oferta_no_disponible';
  end if;

  if v_oferta.autor_id = v_user_id then
    raise exception 'no_puedes_aceptar_tu_propia_oferta';
  end if;

  -- No se marca 'vencida' aquí: un UPDATE seguido de un RAISE no atrapado
  -- se revertiría completo (ver comentario al inicio del archivo). Las
  -- ofertas vencidas simplemente dejan de listarse del lado del cliente.
  if v_oferta.fecha_hora < now() + interval '24 hours' then
    raise exception 'oferta_vencida';
  end if;

  if v_oferta.rol_autor = 'maestro' then
    v_alumno_id := v_user_id;
    select id into v_profesor_id from profesores where user_id = v_oferta.autor_id;
    if v_profesor_id is null then
      raise exception 'profesor_no_disponible';
    end if;
  else
    v_alumno_id := v_oferta.autor_id;
    v_profesor_id := asegurar_profesor_propio(v_user_id);
  end if;

  select * into v_profesor from profesores where id = v_profesor_id;
  if not coalesce(v_profesor.onboarding_completo, false) or v_profesor.stripe_account_id is null then
    raise exception 'profesor_sin_pagos_conectados';
  end if;

  v_precio := v_oferta.precio_mxn;
  v_comision := round(v_precio * 0.18, 2);
  v_monto_profesor := v_precio - v_comision;

  select id into v_resultado_examen_id
    from resultados_examen where user_id = v_alumno_id
    order by creado_en desc limit 1;

  select id into v_formulario_area_id
    from formularios_area where user_id = v_alumno_id
    order by creado_en desc limit 1;

  begin
    insert into solicitudes_tutoria (
      user_id, profesor_id, materia_id, fecha_hora_solicitada, duracion_minutos,
      notas_alumno, precio_total_mxn, comision_mxn, monto_profesor_mxn,
      resultado_examen_id, formulario_area_id, oferta_id
    ) values (
      v_alumno_id, v_profesor_id, v_oferta.materia_id, v_oferta.fecha_hora, v_oferta.duracion_minutos,
      v_oferta.notas, v_precio, v_comision, v_monto_profesor,
      v_resultado_examen_id, v_formulario_area_id, v_oferta.id
    )
    returning * into v_solicitud;
  exception when exclusion_violation then
    raise exception 'horario_no_disponible';
  end;

  update ofertas_tutoria
    set estado = 'aceptada', aceptada_por = v_user_id, aceptada_en = now(), solicitud_id = v_solicitud.id
    where id = p_oferta_id;

  update tutoria_archivos
    set solicitud_id = v_solicitud.id, oferta_id = null
    where oferta_id = p_oferta_id;

  return v_solicitud;
end;
$$;

revoke all on function public.aceptar_oferta_tutoria(uuid) from public;
grant execute on function public.aceptar_oferta_tutoria(uuid) to authenticated;
