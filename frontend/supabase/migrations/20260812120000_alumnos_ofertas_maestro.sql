-- Permite a un maestro ver, por cada oferta que publicó en
-- `ofertas_maestro`, la lista de alumnos que ya pagaron un cupo (correo,
-- nombre y teléfono si existen), para poder contactarlos fuera de la app
-- (WhatsApp, etc.) sin tener que pedirle el dato a cada alumno.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - Igual que `obtener_formularios_area_por_email`, se expone vía RPC
--     SECURITY DEFINER en vez de una policy de SELECT sobre `transacciones`:
--     la única policy hoy es "cada quien ve las suyas" (el comprador), y una
--     policy nueva para el maestro tendría que reimplementar el mismo join
--     con `ofertas_maestro.creado_por` para cada fila. El filtro
--     `om.creado_por = auth.uid()` dentro de la función logra lo mismo sin
--     tocar RLS ni arriesgar exponer transacciones de otras ofertas.
--   - Solo se listan reservas 'completado' (pago confirmado): 'pendiente'
--     todavía puede expirar o cancelarse, así que mostrarla como "alumno
--     inscrito" sería engañoso para el maestro.
--   - El teléfono no vive en `perfiles` (esa tabla solo tiene `nombre`);
--     la única fuente hoy es `formularios_area.telefono`, que es opcional y
--     puede tener varias filas por alumno (re-llenó el formulario). Se toma
--     la más reciente vía LATERAL, igual que `confirmar_pago_tutoria` toma
--     `v_formulario` por id fijo — aquí no hay un id fijo que seguir, así
--     que se ordena por `creado_en desc` y se limita a 1.

create or replace function public.obtener_alumnos_ofertas_maestro()
returns table (
  oferta_id uuid,
  materia_id text,
  fecha_hora timestamptz,
  comprador_id uuid,
  nombre text,
  email text,
  telefono text,
  comprado_en timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    om.id as oferta_id,
    om.materia_id,
    om.fecha_hora,
    t.user_id as comprador_id,
    coalesce(p.nombre, fa.nombre) as nombre,
    u.email::text as email,
    fa.telefono,
    t.actualizado_en as comprado_en
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
