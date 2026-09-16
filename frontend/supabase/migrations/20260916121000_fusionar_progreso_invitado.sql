-- El progreso de un alumno sin cuenta se guarda solo en localStorage
-- (`progreso_quiz_<materiaId>`, ver src/hooks/useProgreso.js) y useProgreso
-- cambia de fuente en cuanto aparece un usuario logueado (localStorage →
-- Supabase). Una cuenta nueva/recién iniciada no tiene fila en
-- progreso_usuario todavía para esa materia, así que el alumno "pierde" de
-- vista el avance que hizo antes de tener cuenta — no se corrompe, pero
-- queda huérfano en el navegador y nunca se fusiona con lo que ya tiene la
-- cuenta. Este RPC fusiona ambas fuentes de una sola vez al iniciar sesión
-- (ver AuthContext.jsx), quedándose siempre con la MÁS AVANZADA de las dos
-- por materia — nunca hace retroceder el progreso ya guardado en la cuenta.
--
-- Recibe un arreglo crudo armado a partir de localStorage, así que se trata
-- como dato no confiable de punta a punta: el arreglo puede no ser un
-- arreglo, cada fila puede no ser un objeto, materia_id puede venir vacío o
-- gigante, unidad_actual/elemento_actual pueden no ser numéricos o estar
-- fuera de rango — cualquiera de estos casos descarta ESA fila sin abortar
-- el resto del lote, y una fila que de todos modos viole alguna constraint
-- de la tabla (por ejemplo el CHECK de unidad_maxima_historica que dispara
-- el trigger de puntos) se atrapa aparte para no perder las demás materias
-- por una sola.
create or replace function public.fusionar_progreso_invitado(p_filas jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_fila jsonb;
  v_materia_id text;
  v_unidad int;
  v_elemento int;
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;

  if p_filas is null or jsonb_typeof(p_filas) <> 'array' then
    return;
  end if;

  for v_fila in select * from jsonb_array_elements(p_filas)
  loop
    if jsonb_typeof(v_fila) <> 'object' then
      continue;
    end if;

    v_materia_id := v_fila->>'materia_id';
    if v_materia_id is null or length(trim(v_materia_id)) = 0 or length(v_materia_id) > 100 then
      continue;
    end if;

    begin
      v_unidad := (v_fila->>'unidad_actual')::int;
      v_elemento := coalesce((v_fila->>'elemento_actual')::int, 0);
    exception when others then
      -- unidad_actual/elemento_actual no numéricos: fila descartada.
      continue;
    end;

    if v_unidad is null or v_unidad < 1 or v_unidad > 130 then
      continue;
    end if;
    v_elemento := greatest(v_elemento, 0);

    begin
      insert into progreso_usuario (user_id, materia_id, unidad_actual, elemento_actual, ultima_interaccion)
      values (v_user_id, trim(v_materia_id), v_unidad, v_elemento, now())
      on conflict (user_id, materia_id) do update
        set unidad_actual = greatest(progreso_usuario.unidad_actual, excluded.unidad_actual),
            elemento_actual = case
              when excluded.unidad_actual > progreso_usuario.unidad_actual then excluded.elemento_actual
              when excluded.unidad_actual < progreso_usuario.unidad_actual then progreso_usuario.elemento_actual
              else greatest(progreso_usuario.elemento_actual, excluded.elemento_actual)
            end,
            ultima_interaccion = greatest(progreso_usuario.ultima_interaccion, excluded.ultima_interaccion);
    exception when others then
      -- Fila individual que de todos modos viola alguna constraint de la
      -- tabla: se ignora esa materia y se sigue con las demás del lote.
      continue;
    end;
  end loop;
end;
$$;

revoke all on function public.fusionar_progreso_invitado(jsonb) from public;
grant execute on function public.fusionar_progreso_invitado(jsonb) to authenticated;
