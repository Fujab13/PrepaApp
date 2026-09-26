-- LÍNEA BASE: lo que ya existía en la base ANTES de la primera migración
-- (creado a mano desde el panel de Supabase) y que ninguna migración
-- declaraba. Sin esto el repo no alcanzaba para reconstruir la base: la
-- primera migración (20260803213106) ya usa productos/inventario_* y no hay
-- nada que los cree.
--
-- Se escribió el 2026-09-26 comparando la base real (catálogo de Postgres)
-- contra las migraciones, y va fechada ANTES de todas a propósito.
--
-- Describe cada tabla como estaba ORIGINALMENTE, no como está hoy: las
-- columnas/restricciones que agregaron migraciones posteriores se dejan
-- fuera para que, al reconstruir desde cero, esas migraciones no fallen
-- por duplicado:
--   - productos.total_unidades (+ su check) ........ 20260916120000
--   - transacciones.oferta_maestro_id, expira_en, referencia_unica,
--     estado_pago_check e índices de oferta .......... 20260810130000
--   - transacciones.comision_mxn … pagado_profesor_por  20260812130000
--   - transacciones.telefono_whatsapp (+ check) ...... 20260917130000
--   - transacciones.agregado_a_grupo_whatsapp ........ 20260917140000
--   - progreso_usuario.unidad_maxima_historica (+check) 20260905130000
--   - progreso_usuario.avance_valido ................. 20260906120000
--   - inventario_movimientos.tipo_movimiento_check: aquí con sus 4 valores
--     originales; 20260803220000 lo amplía.
--
-- En la base actual todo esto es un NO-OP: `create table if not exists`,
-- `create index if not exists`, y políticas/buckets creados solo si
-- faltan. No se modifica ni borra nada existente.
--
-- Se omite a propósito la política vieja y abierta del bucket "Examenes
-- privados" (la cerró 20260901130000): la línea base no debe reintroducir
-- ese hueco.

-- ── productos ───────────────────────────────────────────────────────────────
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(255) not null,
  descripcion text,
  precio numeric(10,2) not null check (precio >= 0),
  tipo_producto varchar(50) not null,
  sku varchar(100) unique,
  activo boolean not null default true,
  metadata jsonb default '{}'::jsonb,
  creado_en timestamptz not null default timezone('utc'::text, now())
);

-- ── transacciones ───────────────────────────────────────────────────────────
create table if not exists public.transacciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  producto_id uuid references public.productos(id) on delete restrict,
  monto_total numeric(10,2) not null,
  moneda varchar(3) not null default 'MXN',
  estado_pago varchar(50) not null default 'pendiente',
  stripe_intent_id varchar(255) unique,
  creado_en timestamptz not null default timezone('utc'::text, now()),
  actualizado_en timestamptz not null default timezone('utc'::text, now()),
  cantidad integer not null default 1 check (cantidad > 0)
);

-- ── inventario_usuario ──────────────────────────────────────────────────────
create table if not exists public.inventario_usuario (
  user_id uuid not null references auth.users(id) on delete cascade,
  producto_id uuid not null references public.productos(id) on delete restrict,
  adquirido_via_transaccion_id uuid references public.transacciones(id) on delete set null,
  fecha_adquisicion timestamptz not null default timezone('utc'::text, now()),
  cantidad_disponible integer not null default 0 check (cantidad_disponible >= 0),
  cantidad_total_adquirida integer not null default 0,
  actualizado_en timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, producto_id)
);

-- ── inventario_movimientos ──────────────────────────────────────────────────
create table if not exists public.inventario_movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  producto_id uuid not null references public.productos(id) on delete restrict,
  tipo_movimiento varchar(30) not null
    constraint inventario_movimientos_tipo_movimiento_check
    check (tipo_movimiento::text = any (array['compra', 'uso', 'reembolso', 'ajuste_admin']::text[])),
  cantidad integer not null,
  transaccion_id uuid references public.transacciones(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  creado_en timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_inv_movs_user_producto
  on public.inventario_movimientos (user_id, producto_id);

-- ── progreso_usuario ────────────────────────────────────────────────────────
create table if not exists public.progreso_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  materia_id text not null,
  unidad_actual integer default 1 check (unidad_actual >= 1 and unidad_actual <= 130),
  elemento_actual integer default 0 check (elemento_actual >= 0),
  ultima_interaccion timestamp default now(),
  unique (user_id, materia_id)
);

-- ── RLS (idempotente) ───────────────────────────────────────────────────────
alter table public.productos enable row level security;
alter table public.transacciones enable row level security;
alter table public.inventario_usuario enable row level security;
alter table public.inventario_movimientos enable row level security;
alter table public.progreso_usuario enable row level security;

-- ── Buckets de Storage que existían antes de las migraciones ────────────────
-- Se revisa ANTES de insertar (no con `on conflict`): storage.buckets tiene
-- triggers BEFORE INSERT de protección que se disparan antes de que Postgres
-- evalúe el conflicto. Así, en una base donde ya existen, no se toca nada.
do $$
declare
  b text;
begin
  foreach b in array array['Examenes comprados', 'Lecciones privadas', 'Examenes privados'] loop
    if not exists (select 1 from storage.buckets where id = b) then
      insert into storage.buckets (id, name, public) values (b, b, false);
    end if;
  end loop;
end;
$$;

-- ── Políticas (solo si faltan; Postgres no tiene CREATE POLICY IF NOT EXISTS)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'productos' and policyname = 'productos_publicos') then
    create policy "productos_publicos" on public.productos
      for select using (activo = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transacciones' and policyname = 'usuario_ve_sus_transacciones') then
    create policy "usuario_ve_sus_transacciones" on public.transacciones
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'inventario_usuario' and policyname = 'usuario_ve_su_inventario') then
    create policy "usuario_ve_su_inventario" on public.inventario_usuario
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'inventario_movimientos' and policyname = 'usuario_ve_sus_movimientos') then
    create policy "usuario_ve_sus_movimientos" on public.inventario_movimientos
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'progreso_usuario' and policyname = 'Usuarios manejan su propio progreso') then
    create policy "Usuarios manejan su propio progreso" on public.progreso_usuario
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  -- Archivos comprados: solo si el producto (por sku / nombre) está en tu
  -- inventario.
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Acceso examenes solo si esta en inventario') then
    create policy "Acceso examenes solo si esta en inventario" on storage.objects
      for select to authenticated
      using (
        bucket_id = 'Examenes comprados'
        and exists (
          select 1
          from public.inventario_usuario iu
          join public.productos p on p.id = iu.producto_id
          where iu.user_id = auth.uid() and p.sku::text = objects.name
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Acceso solo si esta en inventario') then
    create policy "Acceso solo si esta en inventario" on storage.objects
      for select
      using (
        bucket_id = 'Lecciones privadas'
        and exists (
          select 1
          from public.inventario_usuario iu
          join public.productos p on p.id = iu.producto_id
          where iu.user_id = auth.uid() and p.nombre::text = objects.name
        )
      );
  end if;
end;
$$;
