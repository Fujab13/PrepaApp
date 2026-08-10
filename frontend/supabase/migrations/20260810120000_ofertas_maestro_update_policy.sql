-- Permite editar (no solo borrar) una oferta propia desde el portal de
-- maestros: ofertas_maestro (20260809120000) solo tenía policies de
-- select/insert/delete, así que un UPDATE del cliente fallaba por RLS
-- aunque el usuario fuera el autor de la fila.
create policy "update_propia" on public.ofertas_maestro
  for update to authenticated
  using (creado_por = auth.uid())
  with check (creado_por = auth.uid());
