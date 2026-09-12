-- Cierra tres fallas de seguridad encontradas en una auditoría manual
-- (revisadas contra la base de datos real con `supabase db advisors`, no
-- solo leyendo el código): tres RPCs sin ningún chequeo de autorización que
-- exponían datos sensibles o permitían manipular datos de otro usuario,
-- alcanzables sin sesión porque el rol `anon` tenía permiso de ejecución.

-- 1) obtener_formularios_area_por_email / obtener_progreso_por_email /
--    obtener_resultados_examen_por_email no verificaban quién llamaba: cualquiera
--    sin iniciar sesión podía pedir el progreso, resultados de examen y
--    Formulario de Área (incluye tutor/responsable, teléfono, edad, grado) de
--    CUALQUIER alumno solo con su correo. Las tablas de origen sí tienen RLS
--    correcto (auth.uid() = user_id); estas funciones SECURITY DEFINER lo
--    saltaban por completo. Se restringen a maestro verificado o admin,
--    igual que el resto del panel de "Informes de alumnos" (/tutorias/maestro).
create or replace function public.obtener_formularios_area_por_email(p_email text)
 returns setof formularios_area
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not (public.soy_maestro_actual() or public.es_admin_actual()) then
    raise exception 'no_autorizado';
  end if;

  return query
    select fa.*
    from public.formularios_area fa
    join auth.users u on u.id = fa.user_id
    where lower(u.email) = lower(p_email)
    order by fa.creado_en desc;
end;
$function$;

create or replace function public.obtener_progreso_por_email(p_email text)
 returns table(materia_id text, unidad_actual integer, elemento_actual integer, ultima_interaccion timestamp without time zone, avance_valido boolean, nombre_premium text)
 language plpgsql
 stable
 security definer
 set search_path to 'public'
as $function$
begin
  if not (public.soy_maestro_actual() or public.es_admin_actual()) then
    raise exception 'no_autorizado';
  end if;

  return query
    select
      pu.materia_id,
      pu.unidad_actual,
      pu.elemento_actual,
      pu.ultima_interaccion,
      pu.avance_valido,
      prod.nombre as nombre_premium
    from public.progreso_usuario pu
    join auth.users u on u.id = pu.user_id
    left join public.productos prod
      on pu.materia_id like 'premium-%'
      and prod.id::text = replace(pu.materia_id, 'premium-', '')
    where lower(u.email) = lower(p_email)
    order by pu.materia_id;
end;
$function$;

create or replace function public.obtener_resultados_examen_por_email(p_email text)
 returns setof resultados_examen
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not (public.soy_maestro_actual() or public.es_admin_actual()) then
    raise exception 'no_autorizado';
  end if;

  return query
    select re.*
    from public.resultados_examen re
    join auth.users u on u.id = re.user_id
    where lower(u.email) = lower(p_email)
    order by re.creado_en desc;
end;
$function$;

-- 2) descontar_intento(p_user_id, p_producto_id) recibía el user_id objetivo
--    como parámetro sin comparar contra auth.uid(): cualquiera podía vaciar el
--    inventario pagado de OTRO usuario. No la llama el frontend actual, pero
--    seguía viva y ejecutable por `anon`. Se exige que el llamador sea el
--    propio dueño del inventario.
create or replace function public.descontar_intento(p_user_id uuid, p_producto_id uuid)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_filas_afectadas integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'no_autorizado';
  end if;

  update inventario_usuario
  set cantidad_disponible = cantidad_disponible - 1, actualizado_en = timezone('utc', now())
  where user_id = p_user_id and producto_id = p_producto_id and cantidad_disponible > 0;

  get diagnostics v_filas_afectadas = row_count;

  if v_filas_afectadas = 1 then
    insert into inventario_movimientos (user_id, producto_id, tipo_movimiento, cantidad)
    values (p_user_id, p_producto_id, 'uso', -1);
    return true;
  else
    return false;
  end if;
end;
$function$;

-- 3) verificar_login_profesor comparaba un código de 6 dígitos guardado en
--    texto plano sin ningún límite de intentos, y era ejecutable por `anon`:
--    cualquiera podía intentar fuerza bruta (1,000,000 combinaciones) contra
--    el correo de cualquier maestro sin haber iniciado sesión. En la práctica
--    esta verificación solo activa una bandera de UI en sessionStorage (los
--    datos reales del maestro ya están protegidos por RLS vía auth.uid()), así
--    que no exponía datos directamente — pero sigue siendo una superficie de
--    fuerza bruta innecesaria. Se exige sesión propia del maestro objetivo:
--    ya no es posible probar códigos sin antes tener la sesión real de esa
--    cuenta, lo que hace la fuerza bruta anónima imposible.
create or replace function public.verificar_login_profesor(p_email text, p_contrasena text)
 returns table(id uuid, nombre text)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_id uuid;
  v_nombre text;
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;

  select p.id, p.nombre into v_id, v_nombre
  from profesores p
  join auth.users u on u.id = p.user_id
  where lower(u.email) = lower(trim(p_email))
    and p."contraseña" = p_contrasena
    and p.verificado
    and p.activo
    and p.user_id = auth.uid();

  if v_id is null then
    raise exception 'credenciales_invalidas';
  end if;

  return query select v_id, v_nombre;
end;
$function$;

-- Estas cinco funciones nunca debieron ser alcanzables sin sesión: ahora que
-- cada una valida por dentro, se le quita además el permiso de ejecución a
-- `anon` como segunda capa (defensa en profundidad).
revoke execute on function public.obtener_formularios_area_por_email(text) from anon;
revoke execute on function public.obtener_progreso_por_email(text) from anon;
revoke execute on function public.obtener_resultados_examen_por_email(text) from anon;
revoke execute on function public.descontar_intento(uuid, uuid) from anon;
revoke execute on function public.verificar_login_profesor(text, text) from anon;
