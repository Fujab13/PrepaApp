-- Recordatorios de estudio con frecuencia y hora elegidas por el alumno
-- (Ajustes → Recordatorios de estudio), en lugar de "cada ~3 días a
-- cualquier hora".
--
--   preferencias_recordatorio  una fila por usuario (aplica a todos sus
--                              navegadores suscritos): frecuencia 1/3/7
--                              días, hora 0–23 y SU zona horaria (sin ella,
--                              "a las 7" sería la hora del servidor, UTC).
--   Sin fila = valores por defecto (cada 3 días, 17:00, hora de México):
--   así la suscripción que ya existía sigue recibiendo recordatorios.
--
-- El cron pasa de cada 6 horas a CADA HORA (en punto): con cada 6h no hay
-- forma de respetar una hora elegida. La edge function recordatorio-estudio
-- ya no decide sola a quién le toca: pregunta a
-- suscripciones_recordatorio_pendientes() (abajo), que compara la hora
-- LOCAL de cada alumno y su frecuencia contra su último recordatorio.
--
-- guardar_suscripcion_push ahora marca ultimo_recordatorio_en al activar:
-- el frontend ya muestra en el momento una notificación de confirmación
-- (ya no la manda el servidor), y el primer recordatorio llega una
-- frecuencia completa después, no a la siguiente hora.
--
-- No borra ni cambia ningún dato existente.

create table if not exists public.preferencias_recordatorio (
  user_id uuid primary key references auth.users(id) on delete cascade,
  frecuencia_dias smallint not null default 3 check (frecuencia_dias in (1, 3, 7)),
  hora smallint not null default 17 check (hora between 0 and 23),
  zona_horaria text not null default 'America/Mexico_City',
  actualizado_en timestamptz not null default now()
);

alter table public.preferencias_recordatorio enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'preferencias_recordatorio' and policyname = 'select_propio') then
    create policy "select_propio" on public.preferencias_recordatorio
      for select to authenticated using (auth.uid() = user_id);
  end if;
end;
$$;

-- Zona horaria válida para Postgres, o la de México si no la reconoce.
create or replace function public.zona_horaria_valida(p_zona text)
returns text
language plpgsql
stable
set search_path = public
as $$
begin
  perform now() at time zone p_zona;
  return p_zona;
exception when others then
  return 'America/Mexico_City';
end;
$$;

revoke all on function public.zona_horaria_valida(text) from public, anon, authenticated;

-- ── guardar_preferencias_recordatorio: desde Ajustes ──────────────────────
create or replace function public.guardar_preferencias_recordatorio(p_frecuencia int, p_hora int, p_zona text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;
  if p_frecuencia not in (1, 3, 7) or p_hora not between 0 and 23 then
    raise exception 'datos_invalidos';
  end if;
  insert into preferencias_recordatorio (user_id, frecuencia_dias, hora, zona_horaria, actualizado_en)
  values (auth.uid(), p_frecuencia, p_hora, zona_horaria_valida(p_zona), now())
  on conflict (user_id) do update
    set frecuencia_dias = excluded.frecuencia_dias,
        hora = excluded.hora,
        zona_horaria = excluded.zona_horaria,
        actualizado_en = now();
end;
$$;

revoke all on function public.guardar_preferencias_recordatorio(int, int, text) from public, anon;
grant execute on function public.guardar_preferencias_recordatorio(int, int, text) to authenticated;

-- ── asegurar_preferencias_recordatorio: al activar por primera vez ────────
-- Crea las preferencias con la hora ACTUAL del alumno si aún no tiene; si
-- ya tenía (las ajustó antes), no las toca.
create or replace function public.asegurar_preferencias_recordatorio(p_hora int, p_zona text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no_autenticado';
  end if;
  insert into preferencias_recordatorio (user_id, hora, zona_horaria)
  values (auth.uid(), least(greatest(coalesce(p_hora, 17), 0), 23), zona_horaria_valida(p_zona))
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.asegurar_preferencias_recordatorio(int, text) from public, anon;
grant execute on function public.asegurar_preferencias_recordatorio(int, text) to authenticated;

-- ── guardar_suscripcion_push: ahora marca el recordatorio al activar ─────
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
  insert into push_subscriptions (user_id, endpoint, p256dh, auth_key, ultimo_recordatorio_en)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, now())
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth_key = excluded.auth_key,
        ultimo_recordatorio_en = now();
end;
$$;

-- ── suscripciones_recordatorio_pendientes: a quién le toca AHORA ─────────
-- Le toca si: es su hora (en SU zona horaria) y ya pasó su frecuencia desde
-- el último recordatorio (con 2 h de tolerancia por si el cron se atrasa).
-- Solo para la edge function (service role).
create or replace function public.suscripciones_recordatorio_pendientes()
returns table (id uuid, endpoint text, p256dh text, auth_key text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.endpoint, s.p256dh, s.auth_key
  from push_subscriptions s
  left join preferencias_recordatorio p on p.user_id = s.user_id
  where extract(hour from (now() at time zone coalesce(p.zona_horaria, 'America/Mexico_City')))::int
          = coalesce(p.hora, 17)
    and (s.ultimo_recordatorio_en is null
         or s.ultimo_recordatorio_en
              <= now() - make_interval(days => coalesce(p.frecuencia_dias, 3)) + interval '2 hours');
$$;

revoke all on function public.suscripciones_recordatorio_pendientes() from public, anon, authenticated;
grant execute on function public.suscripciones_recordatorio_pendientes() to service_role;

-- ── Cron: de cada 6 h a cada hora en punto ───────────────────────────────
select cron.unschedule(jobid) from cron.job where jobname = 'recordatorio-estudio-cada-6h';

select cron.schedule(
  'recordatorio-estudio-cada-hora',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://fiuzmomidaxvewhsodsj.supabase.co/functions/v1/recordatorio-estudio',
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);
