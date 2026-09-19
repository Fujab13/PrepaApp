// recordatorio-estudio/index.ts
// Disparada por un cron de Postgres cada 6 horas (ver migración
// 20260918140000_recordatorios_estudio.sql, cron.schedule +
// net.http_post). Manda un recordatorio de estudio genérico a cualquier
// suscripción push (tabla push_subscriptions, ver
// 20260918120000_push_subscriptions_profesor.sql) a la que le toque: nunca
// antes de 3 días desde su último recordatorio (o nunca, si es la primera
// vez). El envío real y la elección del mensaje viven en
// _shared/pushNotifications.ts (enviarRecordatoriosEstudio), compartido con
// el aviso de "alumno nuevo" del maestro.
//
// No requiere sesión de usuario (verify_jwt = false, ver config.toml): el
// cron lo llama sin token, igual que crear-sesion-pago. Ver el comentario en
// la migración sobre por qué no hace falta un secreto compartido aquí.

import { createClient } from '@supabase/supabase-js'
import { enviarRecordatoriosEstudio } from '../_shared/pushNotifications.ts'

function getEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

const supabaseAdmin = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'))

const TRES_DIAS_MS = 3 * 24 * 60 * 60 * 1000

Deno.serve(async (_req: Request) => {
  try {
    const limite = new Date(Date.now() - TRES_DIAS_MS).toISOString()

    const { data: suscripciones, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .or(`ultimo_recordatorio_en.is.null,ultimo_recordatorio_en.lte.${limite}`)

    if (error) throw error

    const enviados = suscripciones?.length
      ? await enviarRecordatoriosEstudio(supabaseAdmin, suscripciones)
      : 0

    return new Response(JSON.stringify({ candidatos: suscripciones?.length ?? 0, enviados }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[recordatorio-estudio] Fallo en la corrida:', err)
    return new Response(JSON.stringify({ error: 'fallo_interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
