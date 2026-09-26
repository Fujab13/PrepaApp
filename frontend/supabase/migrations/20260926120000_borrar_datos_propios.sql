-- Deja que cada alumno borre SUS PROPIOS resultados del examen y
-- formularios de área, desde el nuevo panel de Ajustes (pages/Ajustes.jsx,
-- botón de engrane en Sidenav.jsx). Primer paso de "control de sus datos"
-- para usuarios que en su mayoría son menores de edad.
--
-- Estado real de la base al escribir esto (revisado con pg_policies, no
-- solo leyendo migraciones):
--   - resultados_examen YA tenía una policy "delete_propio" idéntica,
--     creada fuera de las migraciones (no aparece en ningún archivo de
--     esta carpeta). Es la que permite que Examen.jsx borre los resultados
--     anteriores al guardar uno nuevo. Se declara aquí igual para que el
--     repo refleje la base.
--   - formularios_area NO tenía policy de delete: sin ella, RLS hace que
--     un `.delete()` desde el cliente no borre nada y tampoco dé error.
--
-- Postgres no tiene CREATE POLICY IF NOT EXISTS, así que cada policy se
-- crea solo si falta: no se borra ni se reemplaza ninguna existente.
-- Mismo criterio que select/insert: solo filas con user_id = auth.uid().

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'resultados_examen' and policyname = 'delete_propio'
  ) then
    create policy "delete_propio" on public.resultados_examen
      for delete to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'formularios_area' and policyname = 'delete_propio'
  ) then
    create policy "delete_propio" on public.formularios_area
      for delete to authenticated
      using (auth.uid() = user_id);
  end if;
end;
$$;
