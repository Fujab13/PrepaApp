-- Ofertas de maestros (sistema simple, deliberadamente separado del
-- marketplace bidireccional en ofertas_tutoria/solicitudes_tutoria de
-- 20260805150000): aquí SOLO el maestro publica y el alumno solo consulta
-- y coordina por WhatsApp fuera de la app — no hay flujo de pago ni RPC de
-- "aceptar" dentro de PrepaApp todavía, por eso no hay columna de estado
-- ni referencia a solicitudes_tutoria.
--
-- Decisiones que no son obvias mirando solo las columnas:
--   - No existe todavía un gate de rol "maestro" (el dueño del proyecto lo
--     agregará como contraseña en el portal más adelante), así que la
--     policy de insert solo exige que `creado_por` sea quien publica —
--     CUALQUIER usuario autenticado puede publicar una oferta por ahora.
--     El delete sí queda restringido al autor.
--   - `cuenta_clave` guarda la CLABE (18 dígitos) del maestro: el pago se
--     coordina directo entre maestro y alumno fuera de la app (no vía
--     Stripe), así que el alumno necesita ver a dónde transferir.
--   - `materia_id` reusa el mismo check de 4 materias que
--     tutorias_esquema.sql / MATERIAS_TUTORIA para no divergir del resto
--     del catálogo, aunque esta tabla no comparte FKs ni RPCs con esas
--     otras migraciones.

create table public.ofertas_maestro (
  id uuid primary key default gen_random_uuid(),
  creado_por uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profesor text not null check (char_length(trim(profesor)) > 0),
  materia_id text not null check (materia_id = any (array['espanol','matematicas','ingles','historia'])),
  fecha_hora timestamptz not null,
  duracion_minutos int not null check (duracion_minutos > 0 and duracion_minutos <= 480),
  precio_mxn numeric(10,2) not null check (precio_mxn > 0 and precio_mxn <= 5000),
  cupo_maximo int not null default 1 check (cupo_maximo > 0 and cupo_maximo <= 50),
  notas text check (notas is null or char_length(notas) <= 500),
  cuenta_clave text not null check (cuenta_clave ~ '^[0-9]{18}$'),
  creado_en timestamptz not null default now()
);

alter table public.ofertas_maestro enable row level security;

create policy "select_todas" on public.ofertas_maestro
  for select to authenticated
  using (true);

create policy "insert_propia" on public.ofertas_maestro
  for insert to authenticated
  with check (creado_por = auth.uid());

create policy "delete_propia" on public.ofertas_maestro
  for delete to authenticated
  using (creado_por = auth.uid());

create index ofertas_maestro_fecha_idx on public.ofertas_maestro (fecha_hora);
create index ofertas_maestro_creado_por_idx on public.ofertas_maestro (creado_por);
