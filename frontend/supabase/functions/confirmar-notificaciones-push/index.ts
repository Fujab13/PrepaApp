// confirmar-notificaciones-push/index.ts
// Llamada por el frontend justo después de guardar_suscripcion_push (ver
// activarNotificaciones en src/services/pushNotifications.js), tanto al
// activar las notificaciones por primera vez como al reactivarlas: manda un
// único push de confirmación ("Notificaciones activadas") a ESE endpoint,
// de feedback inmediato de que sí están funcionando — sin esto, el usuario
// tendría que esperar hasta 3 días a su primer recordatorio de estudio para
// saberlo. El envío real vive en _shared/pushNotifications.ts
// (enviarConfirmacionActivacion), que también resetea
// `ultimo_recordatorio_en` para que el cron de recordatorio-estudio no
// mande uno duplicado poco después.
//
// Igual que crear-sesion-pago: verify_jwt = false a nivel de gateway (ver
// config.toml) porque este proyecto valida el JWT a mano vía
// supabaseClient.auth.getUser() en vez del verify_jwt automático — así el
// resto de la función puede usar supabaseAdmin (service role) sin pelear
// con RLS, ya con el user_id ya confirmado.

import { createClient } from '@supabase/supabase-js'
import { enviarConfirmacionActivacion } from '../_shared/pushNotifications.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint } = await req.json() as { endpoint?: string }
    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'endpoint es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = getEnv('SUPABASE_URL')
    const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY')
    const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Filtra también por user_id: el endpoint es del navegador que llama,
    // pero así nadie puede usar esta función para forzar un push a un
    // endpoint ajeno pasando el suyo propio de Authorization.
    const { data: suscripcion, error: suscripcionError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('endpoint', endpoint)
      .eq('user_id', user.id)
      .maybeSingle()

    if (suscripcionError || !suscripcion) {
      return new Response(JSON.stringify({ error: 'Suscripción no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const enviado = await enviarConfirmacionActivacion(supabaseAdmin, suscripcion)

    return new Response(JSON.stringify({ enviado }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[confirmar-notificaciones-push] Fallo:', err)
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
