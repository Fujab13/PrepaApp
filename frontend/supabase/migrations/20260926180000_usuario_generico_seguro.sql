-- Usuario genérico SEGURO: ya no se arma con la parte del correo antes de
-- la @ (mariana.lopez@… → "mariana.lopez"), porque ese genérico es el que
-- muestra el ranking mientras el alumno no elige otro, y dejaba reconstruir
-- el correo de alumnos (muchos, menores). Ahora usa solo las INICIALES del
-- correo + una palabra + número, igual que las sugerencias del login
-- (services/usuario.js → sugerenciasSeguras; misma lista de palabras: si se
-- cambia una, cambiar la otra).
--
-- Además regenera el usuario de las cuentas que TODAVÍA NO lo confirmaron
-- (usuario_confirmado = false): nunca eligieron ese nombre, solo tenían el
-- genérico derivado de su correo. Los usuarios que alguien ya eligió o
-- confirmó no se tocan. No cambia el esquema ni ningún otro dato.

create or replace function public.generar_usuario_base(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_palabras text[] := array[
    'cometa', 'lince', 'atomo', 'pixel', 'nova', 'orbita', 'quasar', 'fenix',
    'colibri', 'jaguar', 'ajolote', 'neutron', 'vector', 'prisma', 'delta',
    'sigma', 'galaxia', 'halcon', 'puma', 'nebula'
  ];
  v_ini text;
  v_candidato text;
  v_intentos int := 0;
begin
  -- Iniciales de la parte local ("mariana.lopez" → "ml"); "a" si no hay letras.
  select coalesce(nullif(left(string_agg(left(t, 1), '' order by n), 2), ''), 'a')
    into v_ini
  from regexp_split_to_table(lower(split_part(coalesce(p_email, ''), '@', 1)), '[^a-z]+')
       with ordinality as x(t, n)
  where t <> '';

  loop
    v_intentos := v_intentos + 1;
    if v_intentos > 60 then
      raise exception 'no_se_pudo_generar_usuario';
    end if;
    v_candidato := v_palabras[1 + floor(random() * array_length(v_palabras, 1))::int]
                   || '_' || v_ini
                   || lpad((floor(random() * 1000))::int::text, 3, '0');
    exit when not exists (select 1 from perfiles where usuario = v_candidato);
  end loop;
  return v_candidato;
end;
$$;

-- create or replace conserva los permisos (sin anon/authenticated), pero se
-- reafirma por claridad: solo la usan funciones internas.
revoke all on function public.generar_usuario_base(text) from public, anon, authenticated;

-- Regenera solo los genéricos sin confirmar, fila por fila (cada llamada ve
-- los ya asignados en esta misma migración y no se repiten).
do $$
declare
  r record;
begin
  for r in
    select p.id, u.email
    from public.perfiles p
    join auth.users u on u.id = p.id
    where not p.usuario_confirmado
  loop
    update public.perfiles set usuario = public.generar_usuario_base(r.email) where id = r.id;
  end loop;
end;
$$;
