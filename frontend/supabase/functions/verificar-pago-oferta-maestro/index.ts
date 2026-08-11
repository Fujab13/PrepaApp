// verificar-pago-oferta-maestro
// Red de seguridad para /oferta-confirmada: esa página confía en que el
// webhook de Stripe (checkout.session.completed) llame a
// procesar_pago_completado, pero un webhook puede llegar tarde, fallar la
// verificación de firma (p.ej. STRIPE_WEBHOOK_SIGNING_SECRET desincronizado
// con el endpoint activo en el Dashboard, típico al probar en local) o no
// entregarse nunca. Sin esto, la fila se queda 'pendiente' para siempre y la
// pantalla de "Confirmando tu pago…" nunca avanza aunque Stripe sí haya
// cobrado.
//
// Este endpoint le pregunta a Stripe DIRECTAMENTE por el estado real de la
// sesión (fuente de verdad) y, si ya está pagada, llama al mismo RPC que
// llamaría el webhook. Es seguro llamarlo aunque el webhook ya haya
// confirmado el pago (o lo confirme un instante después): procesar_pago_-
// completado solo actúa sobre filas 'pendiente' y el error que lanza cuando
// ya no lo está ('Transacción no encontrada o ya fue procesada') se trata
// aquí como éxito, no como falla.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as { session_id?: string }
    const sessionId = body.session_id

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session_id es requerido' }), {
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

    // Filtra por user_id: un usuario solo puede forzar la verificación de
    // sus propias reservas, nunca las de alguien más (IDOR).
    const { data: transaccion, error: transaccionError } = await supabaseAdmin
      .from('transacciones')
      .select('id, estado_pago')
      .eq('stripe_intent_id', sessionId)
      .eq('user_id', user.id)
      .not('oferta_maestro_id', 'is', null)
      .single()

    if (transaccionError || !transaccion) {
      return new Response(JSON.stringify({ error: 'Reserva no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (transaccion.estado_pago !== 'pendiente') {
      // Ya la confirmó el webhook (o ya expiró/se canceló): nada que hacer.
      return new Response(JSON.stringify({ estado_pago: transaccion.estado_pago }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ estado_pago: 'pendiente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: rpcError } = await supabaseAdmin.rpc('procesar_pago_completado', {
      p_stripe_intent_id: sessionId,
    })

    // Si el webhook ganó la carrera entre el retrieve() de arriba y esta
    // llamada, el RPC ya no encuentra la fila 'pendiente' y lanza ese error
    // esperado — se trata como éxito, no como falla real.
    if (rpcError && !rpcError.message?.includes('no encontrada o ya fue procesada')) {
      console.error('Error confirmando pago vía verificación directa:', rpcError)
      return new Response(JSON.stringify({ error: 'No se pudo confirmar el pago' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ estado_pago: 'completado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
