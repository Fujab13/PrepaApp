-- Requisito para "Música enriquecida" (Ajustes → Música): compartir el
-- enlace de la app con 2 amigos. No se verifica de verdad que lo hayan
-- recibido; el frontend cuenta los "Compartir" y, 2 minutos después del
-- segundo, llama a marcar_app_compartida().
--
--   compartio_app  true = ya puede usar la música enriquecida.
-- Se cambia solo vía marcar_app_compartida(); no se da UPDATE de esta
-- columna al cliente.
--
-- Solo agrega una columna y una función: no borra ni cambia ningún dato
-- existente.

alter table public.perfiles
  add column if not exists compartio_app boolean not null default false;

create or replace function public.marcar_app_compartida()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;
  update perfiles set compartio_app = true where id = auth.uid();
end;
$$;

revoke all on function public.marcar_app_compartida() from public, anon;
grant execute on function public.marcar_app_compartida() to authenticated;
