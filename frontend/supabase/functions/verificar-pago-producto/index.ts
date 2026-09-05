// verificar-pago-producto
// Red de seguridad para /inventario tras comprar en la Tienda — mismo
// problema y misma solución que ya tiene verificar-pago-oferta-maestro
// (ver ese archivo para el detalle completo): el webhook de Stripe
// (checkout.session.completed) puede llegar tarde o fallar, y sin esto el
// alumno regresa de pagar y ve su inventario desactualizado (su compra
// "no aparece") hasta que alguien vuelva a disparar el webhook o refresque
// más tarde por su cuenta.
//
// Le pregunta a Stripe DIRECTAMENTE por el estado real de la sesión y, si
// ya está pagada, llama al mismo RPC que llamaría el webhook
// (procesar_pago_completado). Seguro de llamar aunque el webhook ya haya
// confirmado el pago: ese RPC solo actúa sobre filas 'pendiente' y el
// error que lanza cuando ya no lo está se trata aquí como éxito.

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
    // su propia compra, nunca la de alguien más (IDOR).
    const { data: transaccion, error: transaccionError } = await supabaseAdmin
      .from('transacciones')
      .select('id, estado_pago')
      .eq('stripe_intent_id', sessionId)
      .eq('user_id', user.id)
      .not('producto_id', 'is', null)
      .single()

    if (transaccionError || !transaccion) {
      return new Response(JSON.stringify({ error: 'Compra no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (transaccion.estado_pago !== 'pendiente') {
      // Ya la confirmó el webhook: nada que hacer.
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
      console.error('Error confirmando pago de producto vía verificación directa:', rpcError)
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
