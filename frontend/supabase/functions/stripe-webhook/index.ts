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
    event = stripe.webhooks.constructEvent(body, signature, getEnv('STRIPE_WEBHOOK_SIGNING_SECRET'))
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

    if (error) {
      console.error('Error al conciliar el pago:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})