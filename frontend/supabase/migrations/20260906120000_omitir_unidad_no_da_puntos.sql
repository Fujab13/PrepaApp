-- "Omitir unidad" (Leccion.jsx) ya existía como salida de emergencia para un
-- alumno atorado: llama a guardarProgreso(unidad + 1, 0), exactamente la
-- misma función que usa terminar una unidad de verdad. El trigger de puntos
-- (otorgar_puntos_leccion, 20260905130000) solo ve el número final en
-- progreso_usuario, así que no podía distinguir "la completó" de "la
-- saltó sin contestar nada" — ambas pagaban los mismos 10 puntos por
-- unidad hacia el ranking semanal.
--
-- Se agrega `avance_valido`: lo manda el cliente en cada guardado (default
-- true para no tocar ningún llamador existente salvo omitirUnidad). Cuando
-- viene en false, el trigger avanza unidad_actual igual (el alumno sigue
-- pudiendo saltarse la unidad con normalidad) pero NO mueve
-- unidad_maxima_historica ni otorga puntos — así que si más adelante
-- regresa y completa esa unidad de verdad (con "Regresar unidad"), sí
-- cobra los puntos en ese momento.

alter table public.progreso_usuario
  add column avance_valido boolean not null default true;

create or replace function public.otorgar_puntos_leccion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tope_semanal constant int := 1000;
  v_maximo_anterior int := coalesce(old.unidad_maxima_historica, 1);
  v_maximo_nuevo int := greatest(coalesce(new.unidad_actual, 1), v_maximo_anterior);
  v_delta_unidades int := greatest(v_maximo_nuevo - v_maximo_anterior, 0);
  v_puntos_propuestos int;
  v_puntos_esta_semana bigint;
  v_puntos_a_otorgar int;
begin
  if coalesce(new.avance_valido, true) then
    -- Persistido en la misma fila (trigger BEFORE): nunca baja, así que un
    -- vaivén de unidad_actual hacia abajo y hacia arriba no vuelve a cobrar
    -- puntos por unidades ya superadas antes.
    new.unidad_maxima_historica := v_maximo_nuevo;

    if v_delta_unidades > 0 then
      v_puntos_propuestos := v_delta_unidades * 10;

      select coalesce(sum(puntos), 0) into v_puntos_esta_semana
        from puntos_actividad
        where user_id = new.user_id
          and tipo = 'leccion_completada'
          and creado_en >= now() - interval '7 days';

      v_puntos_a_otorgar := least(v_puntos_propuestos, greatest(v_tope_semanal - v_puntos_esta_semana, 0));

      if v_puntos_a_otorgar > 0 then
        insert into puntos_actividad (user_id, tipo, puntos, detalle)
        values (
          new.user_id,
          'leccion_completada',
          v_puntos_a_otorgar,
          jsonb_build_object('materia_id', new.materia_id, 'unidades_nuevas', v_delta_unidades)
        );
      end if;
    end if;
  else
    -- Omitida: unidad_actual avanza igual (efecto normal de la función),
    -- pero el máximo histórico de puntos se queda tal cual estaba.
    new.unidad_maxima_historica := v_maximo_anterior;
  end if;

  return new;
end;
$$;
