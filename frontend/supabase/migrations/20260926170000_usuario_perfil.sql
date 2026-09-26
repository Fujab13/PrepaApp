-- Nombre de usuario público (perfiles.usuario): lo elige el alumno al
-- registrarse con correo, o se le genera uno a partir de su correo (Google,
-- cuentas ya existentes) que puede cambiar cuando quiera. Es el nombre que
-- muestra el ranking semanal, en lugar de la parte del correo antes de la @
-- que exponía hasta ahora (muchos correos de menores son su nombre real).
--
-- Solo agrega columnas/funciones y llena las columnas nuevas: no borra ni
-- cambia ningún dato existente de perfiles.
--
--   usuario             3–20 caracteres: a-z, 0-9, "_" y "." (en minúsculas,
--                       así la unicidad no depende de mayúsculas).
--   usuario_confirmado  false = genérico que el alumno aún no ha revisado;
--                       el frontend le pide elegirlo una vez
--                       (components/ElegirUsuarioDialog.jsx).
-- Se cambia solo vía cambiar_mi_usuario() (valida formato y unicidad); no se
-- da UPDATE de estas columnas al cliente.

alter table public.perfiles
  add column if not exists usuario text,
  add column if not exists usuario_confirmado boolean not null default false;

-- ── generar_usuario_base: sugerencia libre a partir de un correo ───────────
-- Parte antes de la @, en minúsculas, solo caracteres válidos, recortada a
-- 15; si queda muy corta, "alumno". Si ya existe, se le agrega _NNNN.
create or replace function public.generar_usuario_base(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_candidato text;
  v_intentos int := 0;
begin
  v_base := left(regexp_replace(lower(split_part(coalesce(p_email, ''), '@', 1)), '[^a-z0-9_.]', '', 'g'), 15);
  if length(v_base) < 3 then
    v_base := 'alumno';
  end if;

  v_candidato := v_base;
  while exists (select 1 from perfiles where usuario = v_candidato) loop
    v_intentos := v_intentos + 1;
    if v_intentos > 50 then
      raise exception 'no_se_pudo_generar_usuario';
    end if;
    v_candidato := v_base || '_' || lpad((floor(random() * 10000))::int::text, 4, '0');
  end loop;
  return v_candidato;
end;
$$;

revoke all on function public.generar_usuario_base(text) from public, anon, authenticated;

-- ── Relleno: perfil faltante + usuario genérico para las cuentas existentes
-- Fila por fila (no un solo UPDATE): así cada generar_usuario_base() ve los
-- usuarios asignados en las vueltas anteriores y no se repiten.
insert into public.perfiles (id)
select u.id from auth.users u
where not exists (select 1 from public.perfiles p where p.id = u.id);

do $$
declare
  r record;
begin
  for r in
    select p.id, u.email
    from public.perfiles p
    join auth.users u on u.id = p.id
    where p.usuario is null
    order by p.creado_en
  loop
    update public.perfiles set usuario = public.generar_usuario_base(r.email) where id = r.id;
  end loop;
end;
$$;

alter table public.perfiles
  alter column usuario set not null,
  add constraint perfiles_usuario_formato check (usuario ~ '^[a-z0-9_.]{3,20}$');

create unique index if not exists perfiles_usuario_unico on public.perfiles (usuario);

-- ── Alta de perfil al registrarse: usa el usuario elegido en el registro
-- (raw_user_meta_data.usuario) si es válido y está libre; si no, genera uno.
create or replace function public.crear_perfil_para_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_elegido text := lower(coalesce(new.raw_user_meta_data ->> 'usuario', ''));
  v_confirmado boolean := false;
  v_usuario text;
begin
  if v_elegido ~ '^[a-z0-9_.]{3,20}$'
     and not exists (select 1 from perfiles where usuario = v_elegido) then
    v_usuario := v_elegido;
    v_confirmado := true;
  else
    v_usuario := generar_usuario_base(new.email);
  end if;

  begin
    insert into public.perfiles (id, usuario, usuario_confirmado)
    values (new.id, v_usuario, v_confirmado)
    on conflict (id) do nothing;
  exception
    -- Dos registros simultáneos con el mismo usuario: en vez de tumbar el
    -- alta de la cuenta ("Database error saving new user"), el segundo se
    -- queda con uno generado y podrá elegir otro después.
    when unique_violation then
      insert into public.perfiles (id, usuario, usuario_confirmado)
      values (new.id, generar_usuario_base(new.email), false)
      on conflict (id) do nothing;
  end;
  return new;
end;
$$;

-- ── usuario_disponible: para el registro (todavía SIN sesión) ──────────────
-- Solo dice si un nombre de usuario válido está libre; los usuarios ya son
-- públicos en el ranking, así que no revela nada nuevo.
create or replace function public.usuario_disponible(p_usuario text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(p_usuario, '')) ~ '^[a-z0-9_.]{3,20}$'
    and not exists (select 1 from perfiles where usuario = lower(p_usuario));
$$;

revoke all on function public.usuario_disponible(text) from public;
-- Pública a propósito (ver convención en 20260926130000): se usa sin sesión.
grant execute on function public.usuario_disponible(text) to anon, authenticated;

-- ── cambiar_mi_usuario: elegir/cambiar el propio usuario ──────────────────
-- Con el mismo usuario que ya se tiene sirve para "confirmarlo" tal cual.
create or replace function public.cambiar_mi_usuario(p_usuario text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_usuario text := lower(trim(coalesce(p_usuario, '')));
begin
  if v_user_id is null then
    raise exception 'no_autenticado';
  end if;
  if v_usuario !~ '^[a-z0-9_.]{3,20}$' then
    raise exception 'usuario_invalido';
  end if;
  if exists (select 1 from perfiles where usuario = v_usuario and id <> v_user_id) then
    raise exception 'usuario_ocupado';
  end if;

  update perfiles
    set usuario = v_usuario, usuario_confirmado = true
    where id = v_user_id;
  return v_usuario;
exception
  when unique_violation then
    raise exception 'usuario_ocupado';
end;
$$;

revoke all on function public.cambiar_mi_usuario(text) from public, anon;
grant execute on function public.cambiar_mi_usuario(text) to authenticated;

-- ── Ranking: muestra el usuario, ya no la parte del correo ────────────────
-- Mismas columnas de retorno que antes (create or replace conserva los
-- permisos, incluido el grant a anon: el ranking es público).
create or replace function public.obtener_ranking_semanal()
returns table (user_id uuid, nombre text, puntos bigint, posicion bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    pa.user_id,
    coalesce(pf.usuario, 'alumno') as nombre,
    sum(pa.puntos) as puntos,
    row_number() over (order by sum(pa.puntos) desc, min(pa.creado_en) asc) as posicion
  from puntos_actividad pa
  left join perfiles pf on pf.id = pa.user_id
  where pa.creado_en >= now() - interval '7 days'
  group by pa.user_id, pf.usuario
  order by puntos desc, posicion asc
  limit 100;
$$;
