-- Diagnóstico de por qué un alumno no puede calificar a un profesor.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - `puedo_calificar_profesor` (20260826140000) solo regresaba un booleano:
--     cuando daba false, PerfilProfesor.jsx siempre mostraba el mismo
--     mensaje genérico ("solo puedes calificar después de tomar una clase
--     pagada con él"), sin distinguir "nunca compraste" de "tu pago sigue
--     pendiente" o "tu clase todavía no pasa". Eso hacía imposible saber,
--     desde la propia app, por qué a un alumno que sí compró no le
--     aparecían las estrellas activas — había que ir directo a la base de
--     datos a revisar la fila de `transacciones`.
--   - "pago_no_completado" es la causa más probable de reportes de "ya
--     compré y no puedo calificar": antes de la migración/commit que arregló
--     el webhook de Stripe (constructEventAsync, Deno no soporta
--     verificación de firma síncrona), una compra podía cobrarse en Stripe
--     sin que el webhook lograra marcar `transacciones.estado_pago` como
--     'completado' — la fila se queda en 'pendiente' salvo que el alumno se
--     haya quedado en OfertaConfirmada.jsx el tiempo suficiente para que la
--     red de seguridad (verificar-pago-oferta-maestro) la reconciliara. Este
--     estado hace visible ese caso en vez de mostrarlo igual que "nunca
--     compró".
--   - No reemplaza `puedo_calificar_profesor` (queda intacta por si algo
--     más la usa) — esta función es la misma lógica pero con motivo, pensada
--     para reemplazar esa llamada específicamente en PerfilProfesor.jsx.

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
  v_tiene_completada_sin_terminar boolean;
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
    bool_or(t.estado_pago = 'completado' and now() >= om.fecha_hora + (om.duracion_minutos || ' minutes')::interval),
    bool_or(t.estado_pago = 'completado' and now() < om.fecha_hora + (om.duracion_minutos || ' minutes')::interval),
    bool_or(true)
  into v_tiene_completada, v_tiene_completada_sin_terminar, v_tiene_alguna_compra
  from transacciones t
  join ofertas_maestro om on om.id = t.oferta_maestro_id
  where om.creado_por = p_profesor_user_id
    and t.user_id = v_user_id;

  if v_tiene_completada then
    return 'ok';
  elsif v_tiene_completada_sin_terminar then
    return 'clase_no_terminada';
  elsif v_tiene_alguna_compra then
    return 'pago_no_completado';
  else
    return 'sin_compra';
  end if;
end;
$$;

revoke all on function public.estado_calificar_profesor(uuid) from public;
grant execute on function public.estado_calificar_profesor(uuid) to authenticated;
