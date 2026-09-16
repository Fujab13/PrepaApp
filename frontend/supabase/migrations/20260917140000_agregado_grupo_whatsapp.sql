-- Botón manual del maestro: "ya agregué a este alumno al grupo de WhatsApp"
-- (se decidió NO automatizar la creación de grupos por ahora vía Whapi, ver
-- referencia/requerimientos/notas.txt). El alumno ve un mensaje de espera en
-- su portal de ofertas (Ofertas.jsx / PublicacionOfertas.jsx, modo alumno)
-- mientras agregado_a_grupo_whatsapp siga en false, y desaparece en cuanto
-- el maestro lo marca desde AlumnosOfertas.jsx. Es un TOGGLE, no un estado
-- de una sola vía: el maestro puede desmarcarlo (ej. tuvo que rehacer el
-- grupo) y el mensaje de espera reaparece.

alter table public.transacciones
  add column agregado_a_grupo_whatsapp boolean not null default false;

-- ── marcar_agregado_grupo_whatsapp ──────────────────────────────────────
-- Solo el maestro dueño de la oferta ligada a esa reserva puede tocar su
-- propio estado — nunca el alumno, y nunca el maestro de otra oferta. Se
-- exige estado_pago = 'completado' porque solo eso representa un alumno de
-- verdad inscrito (mismo criterio que obtener_alumnos_ofertas_maestro).
create or replace function public.marcar_agregado_grupo_whatsapp(p_transaccion_id uuid, p_valor boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;

  update transacciones t
    set agregado_a_grupo_whatsapp = p_valor
    from ofertas_maestro om
    where t.id = p_transaccion_id
      and t.oferta_maestro_id = om.id
      and om.creado_por = auth.uid()
      and t.estado_pago = 'completado';

  get diagnostics v_filas = row_count;

  if v_filas = 0 then
    raise exception 'reserva_no_encontrada';
  end if;
end;
$$;

revoke all on function public.marcar_agregado_grupo_whatsapp(uuid, boolean) from public;
grant execute on function public.marcar_agregado_grupo_whatsapp(uuid, boolean) to authenticated;

-- ── obtener_alumnos_ofertas_maestro: + transaccion_id / agregado_a_grupo_whatsapp ──
-- CREATE OR REPLACE no permite agregar columnas a un RETURNS TABLE
-- existente (ver mismo problema resuelto en 20260829120000), así que DROP +
-- CREATE con el mismo cuerpo de esa migración, solo agregando las dos
-- columnas que necesita el botón nuevo en AlumnosOfertas.jsx.
drop function if exists public.obtener_alumnos_ofertas_maestro();

create function public.obtener_alumnos_ofertas_maestro()
returns table (
  oferta_id uuid,
  materia_id text,
  materia_otro text,
  fecha_hora timestamptz,
  comprador_id uuid,
  nombre text,
  email text,
  telefono text,
  comprado_en timestamptz,
  transaccion_id uuid,
  agregado_a_grupo_whatsapp boolean
)
language sql
security definer
set search_path = public
as $$
  select
    om.id as oferta_id,
    om.materia_id,
    om.materia_otro,
    om.fecha_hora,
    t.user_id as comprador_id,
    coalesce(p.nombre, fa.nombre) as nombre,
    u.email::text as email,
    fa.telefono,
    t.actualizado_en as comprado_en,
    t.id as transaccion_id,
    t.agregado_a_grupo_whatsapp
  from public.transacciones t
  join public.ofertas_maestro om on om.id = t.oferta_maestro_id
  join auth.users u on u.id = t.user_id
  left join public.perfiles p on p.id = t.user_id
  left join lateral (
    select fa2.nombre, fa2.telefono
    from public.formularios_area fa2
    where fa2.user_id = t.user_id
    order by fa2.creado_en desc
    limit 1
  ) fa on true
  where om.creado_por = auth.uid()
    and t.estado_pago = 'completado'
  order by om.fecha_hora asc, t.actualizado_en asc;
$$;

revoke all on function public.obtener_alumnos_ofertas_maestro() from public;
grant execute on function public.obtener_alumnos_ofertas_maestro() to authenticated;
