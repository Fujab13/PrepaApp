-- Dos cambios al ranking semanal (20260905120000 y siguientes), pedidos
-- para poder mostrar un tablero más grande y que cada quien vea su propio
-- lugar aunque quede fuera de ese tablero:
--
--   1. `obtener_ranking_semanal` ahora regresa el top 100 en vez del top 25
--      (el resto de la lógica -ventana de 7 días, security definer, grant a
--      anon- no cambia).
--   2. Nueva función `obtener_mi_posicion_semanal`: regresa los puntos y la
--      posición del usuario que hace la llamada (vía auth.uid()) entre
--      TODOS los alumnos con actividad esta semana, sin límite de 100 — así
--      el frontend puede mostrar "estás en el lugar #2,143" aunque esa
--      posición esté muy por debajo del tablero visible. Solo regresa el
--      renglón del propio llamador (nunca el de nadie más), así que no hace
--      falta ninguna policy nueva en `puntos_actividad` ni se expone
--      información de otros usuarios.

create or replace function public.obtener_ranking_semanal()
returns table (
  user_id uuid,
  nombre text,
  puntos bigint,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pa.user_id,
    split_part(u.email, '@', 1) as nombre,
    sum(pa.puntos) as puntos,
    row_number() over (order by sum(pa.puntos) desc, min(pa.creado_en) asc) as posicion
  from puntos_actividad pa
  join auth.users u on u.id = pa.user_id
  where pa.creado_en >= now() - interval '7 days'
  group by pa.user_id, u.email
  order by puntos desc, posicion asc
  limit 100;
$$;

-- ── obtener_mi_posicion_semanal: solo mi propio renglón, sin límite ─────
create or replace function public.obtener_mi_posicion_semanal()
returns table (
  puntos bigint,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with ranking_completo as (
    select
      pa.user_id,
      sum(pa.puntos) as puntos,
      row_number() over (order by sum(pa.puntos) desc, min(pa.creado_en) asc) as posicion
    from puntos_actividad pa
    where pa.creado_en >= now() - interval '7 days'
    group by pa.user_id
  )
  select r.puntos, r.posicion
  from ranking_completo r
  where r.user_id = auth.uid();
$$;

revoke all on function public.obtener_mi_posicion_semanal() from public;
-- Solo `authenticated` (no `anon`): sin sesión no hay `auth.uid()` de quién
-- buscar, y la función simplemente no regresaría ningún renglón.
grant execute on function public.obtener_mi_posicion_semanal() to authenticated;
