-- Declara en el repo dos políticas de admin sobre ofertas_maestro que
-- existían solo en la base (creadas a mano desde el panel de Supabase;
-- halladas comparando la base real contra las migraciones, 2026-09-26).
-- 20260917150000_archivar_ofertas_maestro.sql ya mencionaba
-- admin_update_todas como "creada directo en Supabase". No van en la línea
-- base (20260803000000) porque ofertas_maestro y es_admin_actual() se
-- crean después.
--
-- En la base actual es un NO-OP: cada política se crea solo si falta.

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ofertas_maestro' and policyname = 'admin_update_todas') then
    create policy "admin_update_todas" on public.ofertas_maestro
      for update to authenticated
      using (public.es_admin_actual())
      with check (public.es_admin_actual());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ofertas_maestro' and policyname = 'admin_delete_todas') then
    create policy "admin_delete_todas" on public.ofertas_maestro
      for delete to authenticated
      using (public.es_admin_actual());
  end if;
end;
$$;
