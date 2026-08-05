-- RPCs de "Tutorías 1-a-1". Todo lo que involucra dinero o asignar un
-- maestro pasa por aquí (nunca por INSERT/UPDATE directo del cliente, ver
-- las policies de la migración anterior).
--
-- crear_solicitud_tutoria: la única de las tres que el cliente puede llamar
-- (GRANT a `authenticated`). Revalida TODO server-side aunque el frontend ya
-- lo valide (antelación, elegibilidad, materia, duración) porque un cliente
-- podría llamar el RPC directo saltándose la UI. Calcula precio/comisión y
-- elige un maestro disponible; si dos alumnos intentan reservar el mismo
-- maestro en horarios que se traslapan al mismo tiempo, el exclusion
-- constraint de la tabla es quien realmente lo impide (esta función solo
-- atrapa esa excepción y la vuelve un mensaje entendible).
--
-- confirmar_pago_tutoria y actualizar_estado_onboarding_profesor: SIN grant
-- a ningún rol. Solo `service_role` (usado por el webhook de Stripe) puede
-- ejecutarlas, porque confirman pagos y no deben poder llamarse desde el
-- navegador de un usuario.

create or replace function public.crear_solicitud_tutoria(
  p_materia_id text,
  p_fecha_hora timestamptz,
  p_duracion_minutos int,
  p_notas text default null
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

  -- Libera en frío solicitudes abandonadas (checkout nunca completado) para
  -- que no bloqueen el horario de un maestro para siempre.
  update solicitudes_tutoria
    set estado = 'cancelada'
    where estado = 'pendiente_pago'
      and creado_en < now() - interval '30 minutes';

  select id into v_resultado_examen_id
    from resultados_examen where user_id = v_user_id
    order by creado_en desc limit 1;
  if v_resultado_examen_id is null then
    raise exception 'falta_examen';
  end if;

  select id into v_formulario_area_id
    from formularios_area where user_id = v_user_id
    order by creado_en desc limit 1;
  if v_formulario_area_id is null then
    raise exception 'falta_formulario';
  end if;

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

  return v_solicitud;
end;
$$;

revoke all on function public.crear_solicitud_tutoria(text, timestamptz, int, text) from public;
grant execute on function public.crear_solicitud_tutoria(text, timestamptz, int, text) to authenticated;


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
      'nombre', v_formulario.nombre,
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


create or replace function public.actualizar_estado_onboarding_profesor(
  p_stripe_account_id text,
  p_completo boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update profesores
    set onboarding_completo = p_completo
    where stripe_account_id = p_stripe_account_id;
end;
$$;

revoke all on function public.actualizar_estado_onboarding_profesor(text, boolean) from public;
-- Sin grant: solo `service_role`.
