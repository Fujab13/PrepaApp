import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

const stripe = new Stripe(getEnv('STRIPE_API_KEY'), {
  apiVersion: '2024-11-20',
})

const supabaseAdmin = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'))

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Falta la firma de Stripe' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let event: any
  try {
    // constructEvent (síncrono) no funciona en Deno: su verificación de
    // firma usa SubtleCrypto, que en este runtime solo opera de forma
    // asíncrona. Sin esto, CADA webhook fallaba con 400 antes de siquiera
    // llegar a procesar el evento — Stripe lo reportaba como "other errors"
    // y terminó deshabilitando el endpoint tras 9 días fallando.
    event = await stripe.webhooks.constructEventAsync(body, signature, getEnv('STRIPE_WEBHOOK_SIGNING_SECRET'))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Firma inválida:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { id?: string }

    if (!session.id) {
      return new Response(JSON.stringify({ error: 'No se encontró el id de la sesión' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { error } = await supabaseAdmin.rpc('procesar_pago_completado', {
      p_stripe_intent_id: session.id,
    })

    // "Transacción no encontrada o ya fue procesada" es esperado, no una
    // falla: verificar-pago-producto / verificar-pago-oferta-maestro (la
    // red de seguridad que corre apenas el alumno regresa del checkout)
    // pueden ganarle la carrera a este webhook y confirmar el pago
    // primero. Si se trata como error real (500) aquí, Stripe reintenta
    // sin parar por algo que ya se resolvió bien, y puede volver a
    // deshabilitar el endpoint.
    if (error && !error.message?.includes('no encontrada o ya fue procesada')) {
      console.error('Error al conciliar el pago:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  } else if (event.type === 'checkout.session.expired') {
    // Escenario B (rollback) del flujo de reservas de ofertas_maestro: la
    // sesión de Stripe expiró sin pago. El asiento normalmente ya se liberó
    // solo mucho antes (el TTL interno de 10-15 min corre independiente de
    // esto, ver 20260810130000), pero esto cierra el registro contable a
    // 'cancelado' en vez de dejarlo 'pendiente' para siempre si nadie volvió
    // a consultar esa oferta.
    const session = event.data.object as { id?: string; metadata?: Record<string, string> }

    if (session.id && session.metadata?.tipo === 'oferta_maestro') {
      const { error } = await supabaseAdmin.rpc('marcar_reserva_fallida', {
        p_stripe_intent_id: session.id,
      })

      if (error) {
        console.error('Error liberando reserva expirada de oferta_maestro:', error)
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
