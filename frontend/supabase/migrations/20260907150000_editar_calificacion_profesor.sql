-- Permite editar una calificación ya publicada (antes `calificar_profesor`
-- solo insertaba y tronaba con 'ya_calificaste' en el segundo intento) y
-- deja identificar cuál reseña es la del usuario en sesión para poder
-- fijarla primero en la lista, como "Tu opinión" en Play Store.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - Se vuelve upsert (`on conflict ... do update`) sobre el mismo unique
--     (profesor_user_id, calificador_id) que ya existía — no hace falta
--     tocar el índice ni la tabla. `ya_calificaste` deja de ser un error de
--     `calificar_profesor`: reenviar ahora SÍ actualiza estrellas/comentario
--     en vez de fallar. Se agrega `actualizado_en` para saber si una fila
--     fue editada.
--   - El trigger que recalcula `profesores.calificacion_promedio` solo
--     escuchaba `after insert` — con upsert, editar el número de estrellas
--     de una reseña existente dispara un UPDATE, no un INSERT, así que el
--     promedio se quedaría desactualizado si no se amplía el trigger a
--     `after insert or update of estrellas`.
--   - `estado_calificar_profesor`/`puedo_calificar_profesor` ya no truenan
--     ni bloquean cuando el alumno ya calificó — "ya calificaste" deja de
--     ser un estado bloqueante porque ahora se puede editar libremente.
--   - `obtener_calificaciones_profesor` regresa `id` (para key estable en
--     React) y `es_propia` (comparando calificador_id contra auth.uid()) en
--     vez de solo estrellas/comentario/fecha/nombre, y ordena por
--     `es_propia desc` primero — el frontend ya no necesita saber el id de
--     nadie más para decidir qué reseña fijar arriba.

alter table public.calificaciones_profesor
  add column if not exists actualizado_en timestamptz not null default now();

drop trigger if exists on_calificacion_profesor_creada on public.calificaciones_profesor;
create trigger on_calificacion_profesor_creada
  after insert or update of estrellas on public.calificaciones_profesor
  for each row execute function public.recalcular_calificacion_profesor();

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
  ) then
    raise exception 'compra_no_encontrada';
  end if;

  insert into calificaciones_profesor (profesor_user_id, calificador_id, estrellas, comentario)
  values (p_profesor_user_id, v_user_id, p_estrellas, nullif(trim(p_comentario), ''))
  on conflict (profesor_user_id, calificador_id)
  do update set estrellas = excluded.estrellas, comentario = excluded.comentario, actualizado_en = now()
  returning * into v_calificacion;

  return v_calificacion;
end;
$$;

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
    and exists (
      select 1
      from transacciones t
      join ofertas_maestro om on om.id = t.oferta_maestro_id
      where om.creado_por = p_profesor_user_id
        and t.user_id = auth.uid()
        and t.estado_pago = 'completado'
    );
$$;

create or replace function public.estado_calificar_profesor(p_profesor_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_tiene_completada boolean;
  v_tiene_alguna_compra boolean;
begin
  if v_user_id is null then
    return 'no_autenticado';
  end if;
  if v_user_id = p_profesor_user_id then
    return 'uno_mismo';
  end if;

  select
    bool_or(t.estado_pago = 'completado'),
    bool_or(true)
  into v_tiene_completada, v_tiene_alguna_compra
  from transacciones t
  join ofertas_maestro om on om.id = t.oferta_maestro_id
  where om.creado_por = p_profesor_user_id
    and t.user_id = v_user_id;

  if v_tiene_completada then
    return 'ok';
  elsif v_tiene_alguna_compra then
    return 'pago_no_completado';
  else
    return 'sin_compra';
  end if;
end;
$$;

-- ── obtener_mi_calificacion_profesor ──────────────────────────────────────
create or replace function public.obtener_mi_calificacion_profesor(p_profesor_user_id uuid)
returns table (estrellas int, comentario text)
language sql
security definer
set search_path = public
stable
as $$
  select estrellas, comentario
  from calificaciones_profesor
  where profesor_user_id = p_profesor_user_id and calificador_id = auth.uid();
$$;

revoke all on function public.obtener_mi_calificacion_profesor(uuid) from public;
grant execute on function public.obtener_mi_calificacion_profesor(uuid) to authenticated;

-- ── obtener_calificaciones_profesor: id + es_propia, propia primero ──────
-- Cambia de forma (agrega columnas) — CREATE OR REPLACE no permite tocar el
-- tipo de retorno de una función existente, así que hay que dropearla.
drop function if exists public.obtener_calificaciones_profesor(uuid);

create function public.obtener_calificaciones_profesor(p_profesor_user_id uuid)
returns table (
  id uuid,
  estrellas int,
  comentario text,
  creado_en timestamptz,
  calificador_nombre text,
  es_propia boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id, c.estrellas, c.comentario, c.creado_en, coalesce(p.nombre, 'Alumno'),
    c.calificador_id = auth.uid()
  from calificaciones_profesor c
  left join perfiles p on p.id = c.calificador_id
  where c.profesor_user_id = p_profesor_user_id
  order by (c.calificador_id = auth.uid()) desc, c.creado_en desc;
$$;

revoke all on function public.obtener_calificaciones_profesor(uuid) from public;
grant execute on function public.obtener_calificaciones_profesor(uuid) to authenticated;
