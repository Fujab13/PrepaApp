-- Endurece el sistema de puntos del ranking semanal (20260905120000) contra
-- abuso directo del cliente. progreso_usuario/resultados_examen los escribe
-- el propio alumno sin validación server-side de sus respuestas (así ya
-- funcionaba el progreso ANTES de que existiera un ranking público; ver
-- advertencia de diseño en la migración anterior) — con un ranking visible
-- para todos, eso deja de ser un detalle interno y se vuelve un incentivo
-- real para hacer trampa. Se auditaron dos vectores concretos:
--
--   1. "Vaivén" en progreso_usuario: progreso_usuario tiene UNA fila por
--      (user_id, materia_id) que se sobreescribe con upsert. El trigger
--      anterior (otorgar_puntos_leccion) daba puntos por la diferencia
--      entre el valor viejo y el nuevo de esa MISMA fila en cada
--      escritura — nada le impedía a alguien bajar unidad_actual a 1 y
--      subirla de nuevo repetidamente (llamando al upsert directo, sin
--      pasar por el quiz) para cobrar los mismos 10 puntos por unidad una
--      y otra vez. Se corrige guardando el máximo histórico alcanzado
--      (`unidad_maxima_historica`, nueva columna) y dando puntos solo
--      cuando se SUPERA ese máximo, nunca al repetir un valor ya alcanzado.
--   2. Materias falsas ilimitadas: `materia_id` es texto libre sin catálogo
--      fijo en esta tabla (a propósito, ver comentario original — cubre
--      tanto los ids fijos de MATERIAS_TUTORIA como "medicina"/"premium-
--      <productoId>" de lecciones compradas). Aun con el punto 1
--      corregido, nada impide crear miles de materia_id inventados
--      (`fake1`, `fake2`, ...) y cobrar hasta 1,290 puntos por cada uno
--      (unidad_actual tope 130 × 10, CHECK ya existente en la tabla) —
--      puntos ilimitados en conjunto. Se corrige con un TOPE SEMANAL
--      agregado por usuario (ver constantes abajo): no importa cuántas
--      materias reales o inventadas use, la suma de puntos por lecciones
--      de los últimos 7 días nunca pasa del tope.
--
-- Un tercer vector en resultados_examen: como "solo se conserva el
-- resultado más reciente" se implementa en el CLIENTE (Examen.jsx borra
-- los resultados viejos DESPUÉS de insertar uno nuevo), nada impedía
-- insertar filas nuevas en ráfaga llamando al INSERT directo, cobrando
-- hasta 400 puntos por cada una sin límite. Se corrige con un enfriamiento
-- (cooldown) de 12 horas entre exámenes que sí otorgan puntos — el
-- resultado se sigue guardando siempre con normalidad (Resultados.jsx no
-- se ve afectado), solo deja de sumar al ranking si el anterior fue hace
-- menos de 12 horas.

-- ── progreso_usuario: máximo histórico alcanzado por materia ────────────
-- Se inicializa al valor actual de cada fila para no regalar puntos
-- retroactivos por progreso que ya existía antes de este cambio.
alter table public.progreso_usuario
  add column unidad_maxima_historica int not null default 1;

update public.progreso_usuario
  set unidad_maxima_historica = unidad_actual
  where unidad_actual > unidad_maxima_historica;

alter table public.progreso_usuario
  add constraint progreso_usuario_maxima_historica_check
  check (unidad_maxima_historica >= 1 and unidad_maxima_historica <= 130);

-- ── otorgar_puntos_leccion: máximo histórico + tope semanal agregado ────
-- Tope elegido con margen generoso sobre el uso legítimo más intenso hoy
-- posible (Español ~48 unidades + Matemáticas ~24, únicas materias con
-- lecciones reales completas por ahora — ver CLAUDE.md): 1000 puntos
-- (100 unidades) por usuario por semana cubre eso sobrado sin abrir la
-- puerta a materias inventadas sin límite.
drop trigger if exists on_progreso_usuario_cambia on public.progreso_usuario;
drop function if exists public.otorgar_puntos_leccion();

create function public.otorgar_puntos_leccion()
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

  return new;
end;
$$;

create trigger on_progreso_usuario_cambia
  before insert or update on public.progreso_usuario
  for each row execute function public.otorgar_puntos_leccion();

-- ── otorgar_puntos_examen: enfriamiento de 12 horas ──────────────────────
create or replace function public.otorgar_puntos_examen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enfriamiento constant interval := interval '12 hours';
  v_puntos int := 100 + (coalesce(new.precision_global, 0) * 3);
  v_ultimo timestamptz;
begin
  select max(creado_en) into v_ultimo
    from puntos_actividad
    where user_id = new.user_id and tipo = 'examen_completado';

  if v_ultimo is null or v_ultimo <= now() - v_enfriamiento then
    insert into puntos_actividad (user_id, tipo, puntos, detalle)
    values (new.user_id, 'examen_completado', v_puntos, jsonb_build_object('precision_global', new.precision_global));
  end if;

  return new;
end;
$$;

-- El trigger en sí no cambia (sigue AFTER INSERT); solo se reemplaza el
-- cuerpo de la función de arriba, así que no hace falta recrearlo.
