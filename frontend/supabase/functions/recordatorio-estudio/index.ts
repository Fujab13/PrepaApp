// recordatorio-estudio/index.ts
// Disparada por un cron de Postgres CADA HORA en punto (ver migraciones
// 20260918140000_recordatorios_estudio.sql y
// 20260926200000_preferencias_recordatorio.sql). Manda el recordatorio de
// estudio a las suscripciones push a las que les toca AHORA según las
// preferencias de cada alumno (frecuencia diaria / cada 3 días / semanal y
// hora en SU zona horaria, elegidas en Ajustes). La regla vive en la RPC
// suscripciones_recordatorio_pendientes(), no aquí. El envío real y la elección del mensaje viven en
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

Deno.serve(async (_req: Request) => {
  try {
    const { data: suscripciones, error } = await supabaseAdmin
      .rpc('suscripciones_recordatorio_pendientes')

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
