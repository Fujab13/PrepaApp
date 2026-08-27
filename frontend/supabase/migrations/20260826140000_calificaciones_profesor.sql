-- Calificaciones (1-5 estrellas + comentario corto) de un alumno hacia un
-- profesor del sistema de `ofertas_maestro`, visibles en una página tipo
-- "perfil de vendedor" (PerfilProfesor.jsx) y como resumen en las propias
-- tarjetas de oferta.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - Es una calificación al PROFESOR, no a una oferta puntual: un mismo
--     alumno puede haber comprado varias clases del mismo profesor a lo
--     largo del tiempo, pero solo tiene sentido un review por par
--     (profesor, alumno) — igual que reseñar a un vendedor en Amazon una
--     vez, no por cada pedido. De ahí el unique (profesor_user_id,
--     calificador_id) en vez de amarrarlo a oferta_maestro_id.
--   - Tabla nueva en vez de reusar `calificaciones` (del sistema viejo de
--     Tutorías 1-a-1): esa tabla exige `solicitud_id not null` y un tope de
--     300 caracteres de comentario; forzar esas columnas a que acepten
--     también este flujo (nullable + condicional) sería más frágil que una
--     tabla chica y propia, mismo criterio que ya se usó para no mezclar
--     `ofertas_maestro` con `ofertas_tutoria`.
--   - El agregado vive en `profesores` (no en `perfiles`): `perfiles` es
--     compartido por alumnos Y profesores en el sistema viejo, y mezclar
--     ahí el promedio de este producto nuevo confundiría los dos números.
--   - Elegible para calificar = tiene al menos una compra 'completado' de
--     alguna oferta de ese profesor cuya clase (fecha_hora + duracion) ya
--     pasó. Se revalida server-side en `calificar_profesor`, nunca se
--     confía en que el cliente solo muestre el formulario cuando toca.
--   - Sin policy de insert en `calificaciones_profesor`: todo pasa por
--     `calificar_profesor` (SECURITY DEFINER), mismo patrón que
--     `calificar_tutoria`. El SELECT sí es público (`using (true)`) porque
--     los reviews son visibles para cualquiera, como en Amazon.

-- ── profesores: agregado de calificación ─────────────────────────────────
alter table public.profesores
  add column calificacion_promedio numeric(3,2) not null default 0,
  add column numero_calificaciones int not null default 0;

-- ── calificaciones_profesor ───────────────────────────────────────────────
create table public.calificaciones_profesor (
  id uuid primary key default gen_random_uuid(),
  profesor_user_id uuid not null references auth.users(id) on delete cascade,
  calificador_id uuid not null references auth.users(id) on delete cascade,
  estrellas int not null check (estrellas between 1 and 5),
  comentario text check (comentario is null or char_length(comentario) <= 150),
  creado_en timestamptz not null default now(),
  unique (profesor_user_id, calificador_id)
);

alter table public.calificaciones_profesor enable row level security;

create policy "select_todas" on public.calificaciones_profesor
  for select to authenticated using (true);

create index calificaciones_profesor_profesor_idx on public.calificaciones_profesor (profesor_user_id);

-- ── recalcular_calificacion_profesor ─────────────────────────────────────
create or replace function public.recalcular_calificacion_profesor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update profesores
    set calificacion_promedio = coalesce(
          (select round(avg(estrellas)::numeric, 2) from calificaciones_profesor where profesor_user_id = new.profesor_user_id),
          0
        ),
        numero_calificaciones = (select count(*) from calificaciones_profesor where profesor_user_id = new.profesor_user_id)
    where user_id = new.profesor_user_id;
  return new;
end;
$$;

drop trigger if exists on_calificacion_profesor_creada on public.calificaciones_profesor;
create trigger on_calificacion_profesor_creada
  after insert on public.calificaciones_profesor
  for each row execute function public.recalcular_calificacion_profesor();

-- ── calificar_profesor ────────────────────────────────────────────────────
create or replace function public.calificar_profesor(
  p_profesor_user_id uuid,
  p_estrellas int,
  p_comentario text default null
)
returns public.calificaciones_profesor
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_calificacion calificaciones_profesor;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;
  if v_user_id = p_profesor_user_id then
    raise exception 'no_puedes_calificarte';
  end if;
  if p_estrellas is null or p_estrellas < 1 or p_estrellas > 5 then
    raise exception 'estrellas_invalidas';
  end if;
  if p_comentario is not null and char_length(p_comentario) > 150 then
    raise exception 'comentario_muy_largo';
  end if;

  if not exists (
    select 1
    from transacciones t
    join ofertas_maestro om on om.id = t.oferta_maestro_id
    where om.creado_por = p_profesor_user_id
      and t.user_id = v_user_id
      and t.estado_pago = 'completado'
      and now() >= om.fecha_hora + (om.duracion_minutos || ' minutes')::interval
  ) then
    raise exception 'compra_no_encontrada';
  end if;

  begin
    insert into calificaciones_profesor (profesor_user_id, calificador_id, estrellas, comentario)
    values (p_profesor_user_id, v_user_id, p_estrellas, nullif(trim(p_comentario), ''))
    returning * into v_calificacion;
  exception when unique_violation then
    raise exception 'ya_calificaste';
  end;

  return v_calificacion;
end;
$$;

revoke all on function public.calificar_profesor(uuid, int, text) from public;
grant execute on function public.calificar_profesor(uuid, int, text) to authenticated;

-- ── puedo_calificar_profesor ──────────────────────────────────────────────
create or replace function public.puedo_calificar_profesor(p_profesor_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    auth.uid() is not null
    and auth.uid() <> p_profesor_user_id
    and not exists (
      select 1 from calificaciones_profesor
      where profesor_user_id = p_profesor_user_id and calificador_id = auth.uid()
    )
    and exists (
      select 1
      from transacciones t
      join ofertas_maestro om on om.id = t.oferta_maestro_id
      where om.creado_por = p_profesor_user_id
        and t.user_id = auth.uid()
        and t.estado_pago = 'completado'
        and now() >= om.fecha_hora + (om.duracion_minutos || ' minutes')::interval
    );
$$;

revoke all on function public.puedo_calificar_profesor(uuid) from public;
grant execute on function public.puedo_calificar_profesor(uuid) to authenticated;

-- ── obtener_perfil_profesor ────────────────────────────────────────────────
-- Info básica y pública (sin curp/contraseña/notas_admin/contacto interno).
create or replace function public.obtener_perfil_profesor(p_profesor_user_id uuid)
returns table (
  user_id uuid,
  nombre text,
  materias text[],
  calificacion_promedio numeric,
  numero_calificaciones int,
  creado_en timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select user_id, nombre, materias, calificacion_promedio, numero_calificaciones, creado_en
  from profesores
  where user_id = p_profesor_user_id;
$$;

revoke all on function public.obtener_perfil_profesor(uuid) from public;
grant execute on function public.obtener_perfil_profesor(uuid) to authenticated;

-- ── obtener_calificaciones_profesor ───────────────────────────────────────
create or replace function public.obtener_calificaciones_profesor(p_profesor_user_id uuid)
returns table (
  estrellas int,
  comentario text,
  creado_en timestamptz,
  calificador_nombre text
)
language sql
security definer
set search_path = public
stable
as $$
  select c.estrellas, c.comentario, c.creado_en, coalesce(p.nombre, 'Alumno')
  from calificaciones_profesor c
  left join perfiles p on p.id = c.calificador_id
  where c.profesor_user_id = p_profesor_user_id
  order by c.creado_en desc;
$$;

revoke all on function public.obtener_calificaciones_profesor(uuid) from public;
grant execute on function public.obtener_calificaciones_profesor(uuid) to authenticated;
