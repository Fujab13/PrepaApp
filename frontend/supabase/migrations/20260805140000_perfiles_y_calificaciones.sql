-- Perfiles de usuario (nombre) y calificaciones (1-5 estrellas) entre las
-- dos partes de una tutoría. Es la base para el marketplace de ofertas
-- (ver la migración siguiente): tanto alumnos como maestros necesitan un
-- nombre público y una calificación visible antes de poder publicar o
-- aceptar ofertas de la otra parte.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - El trigger en auth.users solo cubre altas futuras; se hace un
--     backfill explícito para que la fila SIEMPRE exista (el frontend
--     depende de esto para decidir si mostrar el gate de "pon tu nombre").
--   - `perfiles` tiene SELECT abierto a cualquier autenticado (se necesita
--     mostrar nombre+calificación de la otra parte en las tarjetas de
--     oferta), pero el UPDATE se acota a la sola columna `nombre` con un
--     GRANT de columna: los privilegios por default de este proyecto ya
--     conceden UPDATE completo a `authenticated` a nivel de tabla (por
--     eso `profesores` necesita un `revoke all` explícito más abajo en el
--     esquema viejo), así que sin este revoke+grant de columna cualquier
--     usuario podría escribirse su propia calificación_promedio.
--   - `calificaciones` no tiene policy de insert (solo select propia):
--     igual que solicitudes_tutoria/tutoria_archivos, todo lo que crea una
--     calificación pasa por el RPC de abajo (security definer), que
--     valida que la clase ya haya pasado, que esté pagada, y que quien
--     califica en verdad haya participado.

-- ── perfiles ─────────────────────────────────────────────────────────────
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  calificacion_promedio numeric(3,2) not null default 0,
  numero_calificaciones int not null default 0,
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

create policy "select_todos" on public.perfiles
  for select to authenticated using (true);

create policy "update_propio" on public.perfiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Acota el UPDATE (que por default de esquema ya está concedido a
-- `authenticated` sobre todas las columnas) a solo `nombre`.
revoke update on public.perfiles from authenticated;
grant update (nombre) on public.perfiles to authenticated;

create or replace function public.crear_perfil_para_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_perfil on auth.users;
create trigger on_auth_user_created_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil_para_nuevo_usuario();

-- Backfill: el trigger de arriba solo cubre altas futuras.
insert into public.perfiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ── calificaciones ───────────────────────────────────────────────────────
create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes_tutoria(id) on delete cascade,
  calificador_id uuid not null references auth.users(id) on delete cascade,
  calificado_id uuid not null references auth.users(id) on delete cascade,
  estrellas int not null check (estrellas between 1 and 5),
  comentario text check (char_length(comentario) <= 300),
  creado_en timestamptz not null default now(),
  unique (solicitud_id, calificador_id)
);

alter table public.calificaciones enable row level security;

create policy "select_propia" on public.calificaciones
  for select to authenticated using (auth.uid() = calificador_id or auth.uid() = calificado_id);
-- Sin policy de insert: todo pasa por calificar_tutoria.

create index calificaciones_calificado_idx on public.calificaciones (calificado_id);

-- Recalcula el agregado en `perfiles` con un único UPDATE (no lectura-
-- luego-escritura): así el lock de fila de la propia UPDATE serializa
-- correctamente dos calificaciones concurrentes al mismo calificado_id en
-- vez de perder una de las dos por una condición de carrera.
create or replace function public.recalcular_calificacion_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update perfiles
    set calificacion_promedio = coalesce(
          (select round(avg(estrellas)::numeric, 2) from calificaciones where calificado_id = new.calificado_id),
          0
        ),
        numero_calificaciones = (select count(*) from calificaciones where calificado_id = new.calificado_id)
    where id = new.calificado_id;
  return new;
end;
$$;

drop trigger if exists on_calificacion_creada on public.calificaciones;
create trigger on_calificacion_creada
  after insert on public.calificaciones
  for each row execute function public.recalcular_calificacion_perfil();

-- ── calificar_tutoria ────────────────────────────────────────────────────
-- Única forma de insertar en `calificaciones`. Revalida todo server-side:
-- que la solicitud exista, que ya se haya pagado (confirmada/completada,
-- nunca pendiente_pago/cancelada), que la clase ya haya terminado, y que
-- quien llama en verdad sea el alumno o el maestro de esa solicitud (nunca
-- confía en que el cliente mande el rol correcto).
create or replace function public.calificar_tutoria(
  p_solicitud_id uuid,
  p_estrellas int,
  p_comentario text default null
)
returns public.calificaciones
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_solicitud solicitudes_tutoria;
  v_profesor profesores;
  v_calificado_id uuid;
  v_calificacion calificaciones;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  if p_estrellas is null or p_estrellas < 1 or p_estrellas > 5 then
    raise exception 'estrellas_invalidas';
  end if;

  if p_comentario is not null and char_length(p_comentario) > 300 then
    raise exception 'comentario_muy_largo';
  end if;

  select * into v_solicitud from solicitudes_tutoria where id = p_solicitud_id;
  if not found then
    raise exception 'solicitud_no_encontrada';
  end if;

  if v_solicitud.estado not in ('confirmada', 'completada') then
    raise exception 'clase_no_calificable';
  end if;

  if now() < v_solicitud.fecha_hora_solicitada + (v_solicitud.duracion_minutos || ' minutes')::interval then
    raise exception 'clase_aun_no_termina';
  end if;

  select * into v_profesor from profesores where id = v_solicitud.profesor_id;

  if v_user_id = v_solicitud.user_id then
    -- El alumno califica al maestro. Un profesor del catálogo admin viejo
    -- (sin user_id, dado de alta a mano) no tiene cuenta que calificar.
    if v_profesor.user_id is null then
      raise exception 'no_calificable';
    end if;
    v_calificado_id := v_profesor.user_id;
  elsif v_user_id = v_profesor.user_id then
    -- El maestro califica al alumno.
    v_calificado_id := v_solicitud.user_id;
  else
    raise exception 'no_autorizado';
  end if;

  begin
    insert into calificaciones (solicitud_id, calificador_id, calificado_id, estrellas, comentario)
    values (p_solicitud_id, v_user_id, v_calificado_id, p_estrellas, nullif(trim(p_comentario), ''))
    returning * into v_calificacion;
  exception when unique_violation then
    raise exception 'ya_calificaste';
  end;

  return v_calificacion;
end;
$$;

revoke all on function public.calificar_tutoria(uuid, int, text) from public;
grant execute on function public.calificar_tutoria(uuid, int, text) to authenticated;

-- ── confirmar_pago_tutoria: preferir el nombre de perfiles ──────────────
-- `formularios_area` es opcional desde la migración del 5-ago, así que
-- para reservas nacidas del marketplace su `nombre` frecuentemente será
-- NULL. `perfiles.nombre` es ahora la fuente de nombre más confiable.
create or replace function public.confirmar_pago_tutoria(p_checkout_session_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_solicitud solicitudes_tutoria;
  v_profesor profesores;
  v_examen resultados_examen;
  v_formulario formularios_area;
  v_perfil perfiles;
  v_alumno_email text;
begin
  select * into v_solicitud
    from solicitudes_tutoria
    where stripe_checkout_session_id = p_checkout_session_id
    for update;

  if not found then
    raise exception 'solicitud_no_encontrada';
  end if;

  if v_solicitud.estado not in ('pendiente_pago', 'confirmada') then
    raise exception 'estado_no_confirmable';
  end if;

  if v_solicitud.estado = 'pendiente_pago' then
    update solicitudes_tutoria
      set estado = 'confirmada',
          confirmada_en = now(),
          meeting_url = 'https://meet.jit.si/prepaapp-'
            || substr(md5(random()::text || v_solicitud.id::text), 1, 10)
      where id = v_solicitud.id
      returning * into v_solicitud;
  end if;

  select * into v_profesor from profesores where id = v_solicitud.profesor_id;
  select * into v_examen from resultados_examen where id = v_solicitud.resultado_examen_id;
  select * into v_formulario from formularios_area where id = v_solicitud.formulario_area_id;
  select * into v_perfil from perfiles where id = v_solicitud.user_id;
  select email into v_alumno_email from auth.users where id = v_solicitud.user_id;

  return jsonb_build_object(
    'solicitud', jsonb_build_object(
      'id', v_solicitud.id,
      'materia_id', v_solicitud.materia_id,
      'fecha_hora_solicitada', v_solicitud.fecha_hora_solicitada,
      'duracion_minutos', v_solicitud.duracion_minutos,
      'notas_alumno', v_solicitud.notas_alumno,
      'precio_total_mxn', v_solicitud.precio_total_mxn,
      'meeting_url', v_solicitud.meeting_url,
      'notificaciones_enviadas', v_solicitud.notificaciones_enviadas,
      'notificaciones_en_proceso', v_solicitud.notificaciones_en_proceso
    ),
    'alumno', jsonb_build_object(
      'email', v_alumno_email,
      'nombre', coalesce(v_perfil.nombre, v_formulario.nombre),
      'telefono', v_formulario.telefono,
      'grado', v_formulario.grado,
      'area_interes', v_formulario.area_interes,
      'carrera_interes', v_formulario.carrera_interes,
      'autoevaluacion', v_formulario.autoevaluacion,
      'horas_estudio', v_formulario.horas_estudio,
      'preferencias', v_formulario.preferencias
    ),
    'examen', jsonb_build_object(
      'precision_global', v_examen.precision_global,
      'stats_por_seccion', v_examen.stats_por_seccion
    ),
    'profesor', jsonb_build_object(
      'nombre', v_profesor.nombre,
      'email_contacto', v_profesor.email_contacto
    )
  );
end;
$$;

revoke all on function public.confirmar_pago_tutoria(text) from public;
-- Sin grant: solo `service_role` (bypass de privilegios) puede ejecutarla.
