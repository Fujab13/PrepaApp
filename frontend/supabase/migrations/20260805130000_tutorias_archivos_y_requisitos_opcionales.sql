-- Vuelve opcional (informativo, no bloqueante) el requisito de haber
-- completado el Examen Simulador y el Formulario Área antes de reservar una
-- tutoría, y agrega la posibilidad de adjuntar archivos de apoyo genéricos
-- a la solicitud.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - tutoria_archivos no tiene policy de insert/update para authenticated:
--     igual que solicitudes_tutoria, todo lo que cuelga un archivo a una
--     solicitud pasa por el RPC de abajo (security definer), para que nadie
--     pueda asociar un archivo ajeno a su propia solicitud.
--   - El bucket de Storage es privado: los archivos que sube un alumno
--     pueden ser sensibles (boletas, tareas, etc.). El acceso del maestro se
--     resuelve con signed URLs generadas por el webhook de Stripe al
--     confirmar el pago (ver stripe-webhook/index.ts), no con el bucket
--     público.

-- ── Bucket de Storage ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tutoria-archivos', 'tutoria-archivos', false, 10485760,
  array[
    'image/png', 'image/jpeg', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Alcance = carpeta propia (primer segmento de la ruta = auth.uid()), mismo
-- patrón estándar de Supabase Storage para que cada alumno solo pueda subir,
-- ver y quitar sus propios archivos.
create policy "tutoria_archivos_insert_propio"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'tutoria-archivos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "tutoria_archivos_select_propio"
on storage.objects for select to authenticated
using (
  bucket_id = 'tutoria-archivos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "tutoria_archivos_delete_propio"
on storage.objects for delete to authenticated
using (
  bucket_id = 'tutoria-archivos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ── tutoria_archivos ─────────────────────────────────────────────────────────
create table public.tutoria_archivos (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes_tutoria(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  nombre_original text not null,
  tamano_bytes int,
  creado_en timestamptz not null default now()
);

alter table public.tutoria_archivos enable row level security;

create policy "select_propio" on public.tutoria_archivos
  for select to authenticated using (auth.uid() = user_id);
-- Sin policies de insert/update: todo pasa por crear_solicitud_tutoria.

create index tutoria_archivos_solicitud_idx on public.tutoria_archivos (solicitud_id);

-- ── crear_solicitud_tutoria: examen/formulario ya no bloquean, + archivos ───
-- Se DROPea la firma vieja de 4 parámetros en vez de solo hacer
-- `create or replace`: como Postgres resuelve por firma exacta de
-- argumentos, si el cliente llamara sin `p_archivos` ambas versiones
-- coexistirían y ganaría la vieja (con los raise de falta_examen/
-- falta_formulario), dejando el arreglo sin efecto.
drop function if exists public.crear_solicitud_tutoria(text, timestamptz, int, text);

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

  -- Libera en frío solicitudes abandonadas (checkout nunca completado) para
  -- que no bloqueen el horario de un maestro para siempre.
  update solicitudes_tutoria
    set estado = 'cancelada'
    where estado = 'pendiente_pago'
      and creado_en < now() - interval '30 minutes';

  -- Ya no son requisito para reservar (solo se adjuntan si existen): un
  -- maestro que no tenga diagnóstico del alumno igual puede dar la clase.
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

  -- Entre los maestros activos/onboarded para esa materia y libres en ese
  -- horario, prioriza al que tenga menos solicitudes activas (balanceo
  -- simple si hay más de uno para la misma materia).
  select p.id, p.tarifa_hora_mxn into v_profesor_id, v_tarifa
    from profesores p
    where p.activo = true
      and p.onboarding_completo = true
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
