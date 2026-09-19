-- Web Push: el maestro recibe una notificación tipo app (Notification API /
-- Push API, vía Service Worker en public/sw.js) cuando un alumno nuevo paga
-- un cupo en una de sus ofertas. El envío real vive en
-- supabase/functions/_shared/pushNotifications.ts y se dispara desde
-- stripe-webhook y verificar-pago-oferta-maestro, exactamente en el mismo
-- punto (y con el mismo criterio de "solo si ESTA llamada confirmó el
-- pago") que ya usa agregarAlumnoAGrupoClase (Whapi) — ver
-- 20260917130000_whatsapp_grupo_clase.sql.
--
-- Cada fila es una PushSubscription del navegador de un usuario (Push API
-- del W3C): puede haber varias por usuario (varios dispositivos/navegadores
-- con notificaciones activadas). `endpoint` es único porque el propio
-- navegador nunca genera el mismo dos veces para el mismo origen+scope de
-- Service Worker.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  creado_en timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
-- Sin policies de select/insert/update/delete para el cliente: todo pasa
-- por los RPCs de abajo (mismo patrón que el resto del esquema, ej.
-- ofertas_tutoria). El cliente nunca necesita leer estas filas — para saber
-- si "ya está activado" consulta el propio navegador
-- (registration.pushManager.getSubscription()), no la base de datos.

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- ── guardar_suscripcion_push ─────────────────────────────────────────────
-- Upsert por endpoint: si el mismo navegador ya tenía una fila (el usuario
-- desactivó y reactivó, o cerró sesión y entró con otra cuenta en el mismo
-- dispositivo), se actualiza el dueño/claves en vez de duplicar o fallar.
create or replace function public.guardar_suscripcion_push(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;

  if p_endpoint is null or p_p256dh is null or p_auth is null then
    raise exception 'datos_incompletos';
  end if;

  insert into push_subscriptions (user_id, endpoint, p256dh, auth_key)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth_key = excluded.auth_key;
end;
$$;

revoke all on function public.guardar_suscripcion_push(text, text, text) from public;
grant execute on function public.guardar_suscripcion_push(text, text, text) to authenticated;

-- ── eliminar_suscripcion_push ────────────────────────────────────────────
create or replace function public.eliminar_suscripcion_push(p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;

  delete from push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
end;
$$;

revoke all on function public.eliminar_suscripcion_push(text) from public;
grant execute on function public.eliminar_suscripcion_push(text) to authenticated;
