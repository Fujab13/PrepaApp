-- Quita el requisito de "la clase ya debe haber pasado" de la elegibilidad
-- para calificar a un profesor. Antes (20260826140000) exigía
-- `now() >= om.fecha_hora + duracion` además de `estado_pago = 'completado'`,
-- pensado para que solo se calificara después de tomar la clase — pero en la
-- práctica eso hace que la elegibilidad dependa de que el reloj avance hasta
-- una fecha futura, algo frágil para probar y sin beneficio real: un pago
-- completado ya es suficiente prueba de que el alumno reservó con ese
-- profesor. De ahora en adelante basta con tener una compra 'completado' de
-- alguna oferta de ese profesor, sin importar si la fecha de la clase ya
-- pasó o todavía no.
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
  if exists (
    select 1 from calificaciones_profesor
    where profesor_user_id = p_profesor_user_id and calificador_id = v_user_id
  ) then
    return 'ya_calificaste';
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
