-- Nombres de usuario prohibidos: groserías, contenido sexual, insultos y
-- nombres que se hacen pasar por el equipo (admin, soporte, prepaapp…). La
-- mayoría de los alumnos son menores y el usuario se ve en el ranking.
--
-- La lista vive en una TABLA para poder ampliarla sin migraciones:
--   insert into public.usuarios_prohibidos (termino, tipo) values ('xxx', 'palabra');
-- Dos tipos, para no bloquear palabras normales (el clásico problema de
-- "puta" dentro de "computadora" o "pene" dentro de "penelope"):
--   'palabra'  → prohibido si aparece como palabra COMPLETA del usuario,
--               separada por "." "_" o números ("puta", "puta_69", "x.puta").
--   'contiene' → prohibido en cualquier parte; solo para términos que no
--               aparecen dentro de palabras comunes ("pendej", "mierda").
-- La comparación resiste trucos comunes: números por letras
-- (0→o 1→i 3→e 4→a 5→s 7→t: "pu7a", "m1erda") y letras repetidas
-- ("puuuta"). Los términos se guardan en minúsculas, sin acentos.
--
-- Sin políticas RLS a propósito: nadie la lee desde el cliente; solo
-- usuario_prohibido() (security definer). No toca datos existentes.

create table if not exists public.usuarios_prohibidos (
  termino text primary key check (termino ~ '^[a-z]+$'),
  tipo text not null check (tipo in ('palabra', 'contiene'))
);

alter table public.usuarios_prohibidos enable row level security;

insert into public.usuarios_prohibidos (termino, tipo) values
  -- Suplantación del equipo / cuentas oficiales
  ('admin', 'contiene'), ('administrador', 'contiene'), ('prepaapp', 'contiene'),
  ('soporte', 'contiene'), ('moderador', 'contiene'), ('support', 'contiene'),
  ('staff', 'palabra'), ('oficial', 'palabra'), ('official', 'palabra'),
  ('sistema', 'palabra'), ('system', 'palabra'), ('root', 'palabra'), ('mod', 'palabra'),
  -- Groserías e insultos (español)
  ('pendej', 'contiene'), ('cabron', 'contiene'), ('chingad', 'contiene'), ('chinga', 'contiene'),
  ('mierda', 'contiene'), ('culer', 'contiene'), ('pinche', 'contiene'), ('maricon', 'contiene'), ('marica', 'palabra'),
  ('mamada', 'contiene'), ('mamon', 'contiene'), ('ojete', 'contiene'), ('huevon', 'contiene'),
  ('estupid', 'contiene'), ('idiota', 'contiene'), ('imbecil', 'contiene'), ('retrasad', 'contiene'),
  ('puta', 'palabra'), ('putas', 'palabra'), ('puto', 'palabra'), ('putos', 'palabra'),
  ('verga', 'palabra'), ('vergas', 'palabra'), ('culo', 'palabra'), ('culos', 'palabra'),
  ('joto', 'palabra'), ('jotos', 'palabra'), ('zorra', 'palabra'), ('perra', 'palabra'),
  ('naco', 'palabra'), ('mongol', 'palabra'), ('baboso', 'palabra'),
  -- Contenido sexual
  ('porno', 'contiene'), ('porn', 'contiene'), ('sexo', 'contiene'), ('vagina', 'contiene'),
  ('violad', 'contiene'), ('pedofil', 'contiene'), ('xxx', 'contiene'),
  ('pene', 'palabra'), ('penes', 'palabra'), ('pito', 'palabra'), ('teta', 'palabra'),
  ('tetas', 'palabra'), ('nalgas', 'palabra'), ('sex', 'palabra'), ('sexy', 'palabra'),
  ('anal', 'palabra'), ('orgasmo', 'contiene'), ('cogida', 'palabra'),
  -- Odio y violencia
  ('nazi', 'palabra'), ('hitler', 'contiene'), ('kkk', 'contiene'), ('terrorista', 'contiene'),
  ('matar', 'palabra'), ('suicid', 'contiene'),
  -- Drogas
  ('cocaina', 'contiene'), ('marihuana', 'contiene'), ('narco', 'contiene'),
  -- Inglés
  ('fuck', 'contiene'), ('shit', 'contiene'), ('bitch', 'contiene'), ('nigg', 'contiene'),
  ('whore', 'contiene'), ('slut', 'contiene'), ('pussy', 'contiene'), ('cunt', 'contiene'),
  ('dick', 'palabra'), ('cock', 'palabra'), ('ass', 'palabra'), ('fag', 'palabra'),
  ('penis', 'palabra'), ('boobs', 'palabra'), ('rape', 'palabra')
on conflict (termino) do nothing;

-- ── usuario_prohibido: ¿choca con la lista? ────────────────────────────────
create or replace function public.usuario_prohibido(p_usuario text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v text := lower(coalesce(p_usuario, ''));
  v_leet text;
  v_tokens text[];
  v_juntos text[];
begin
  v_leet := translate(v, '013457', 'oieast');
  -- Palabras sueltas: separando por . _ y números (texto tal cual), por
  -- . _ (con números convertidos en letras) y con letras repetidas
  -- colapsadas ("puuuta" → "puta").
  v_tokens := regexp_split_to_array(v, '[._0-9]+')
           || regexp_split_to_array(v_leet, '[._]+')
           || regexp_split_to_array(regexp_replace(v_leet, '(.)\1+', '\1', 'g'), '[._]+');
  -- Todo junto, sin separadores, para los términos de tipo 'contiene'.
  v_juntos := array[
    regexp_replace(v, '[^a-z]', '', 'g'),
    regexp_replace(v_leet, '[^a-z]', '', 'g'),
    regexp_replace(regexp_replace(v_leet, '[^a-z]', '', 'g'), '(.)\1+', '\1', 'g')
  ];

  return exists (
    select 1 from usuarios_prohibidos up
    where (up.tipo = 'palabra' and up.termino = any (v_tokens))
       or (up.tipo = 'contiene' and exists (
             select 1 from unnest(v_juntos) j where strpos(j, up.termino) > 0))
  );
end;
$$;

revoke all on function public.usuario_prohibido(text) from public, anon, authenticated;

-- ── estado_usuario: lo que usa el campo del registro para su mensaje ──────
-- 'invalido' (formato), 'no_permitido' (lista), 'ocupado' o 'libre'.
create or replace function public.estado_usuario(p_usuario text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when lower(coalesce(p_usuario, '')) !~ '^[a-z0-9_.]{3,20}$' then 'invalido'
    when public.usuario_prohibido(p_usuario) then 'no_permitido'
    when exists (select 1 from perfiles where usuario = lower(p_usuario)) then 'ocupado'
    else 'libre'
  end;
$$;

revoke all on function public.estado_usuario(text) from public;
-- Pública a propósito (convención de 20260926130000): el registro no tiene sesión.
grant execute on function public.estado_usuario(text) to anon, authenticated;

-- ── usuario_disponible: ahora también descarta los prohibidos ─────────────
-- (la usan las sugerencias; create or replace conserva su grant a anon).
create or replace function public.usuario_disponible(p_usuario text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.estado_usuario(p_usuario) = 'libre';
$$;

-- ── cambiar_mi_usuario: rechaza los prohibidos ───────────────────────────
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
  if public.usuario_prohibido(v_usuario) then
    raise exception 'usuario_no_permitido';
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

-- ── Alta de perfil: un usuario prohibido en el registro se cambia por uno
-- generado (sin confirmar, así se le pedirá elegir otro).
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
     and not public.usuario_prohibido(v_elegido)
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
    when unique_violation then
      insert into public.perfiles (id, usuario, usuario_confirmado)
      values (new.id, generar_usuario_base(new.email), false)
      on conflict (id) do nothing;
  end;
  return new;
end;
$$;
