// crear-sesion-pago-tutoria
// Crea la Checkout Session de Stripe para pagar una solicitud de tutoría ya
// creada por el RPC `crear_solicitud_tutoria`. Usa Stripe Connect
// (destination charges): la plataforma es el merchant of record, se queda
// con `application_fee_amount` (el 18% ya calculado y guardado en la fila) y
// el resto se transfiere automáticamente a la cuenta conectada del maestro.
//
// Nunca confía en nada que venga del cliente más allá de `solicitud_id`: el
// monto, la comisión y el maestro asignado siempre se leen de la fila que ya
// existe en `solicitudes_tutoria` (escrita únicamente por el RPC), nunca de
// lo que el navegador mande en el body.

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

const NOMBRES_MATERIA: Record<string, string> = {
  espanol: 'Español',
  matematicas: 'Matemáticas',
  ingles: 'Inglés',
  historia: 'Historia',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as { solicitud_id?: string }
    const solicitudId = body.solicitud_id

    if (!solicitudId) {
      return new Response(JSON.stringify({ error: 'solicitud_id es requerido' }), {
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
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'

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

    // Filtra por id Y user_id: sin esto, cualquier usuario logueado podría
    // pasar el solicitud_id de otra persona y pagar/recibir la sesión de
    // otro alumno (IDOR).
    const { data: solicitud, error: solicitudError } = await supabaseAdmin
      .from('solicitudes_tutoria')
      .select('*')
      .eq('id', solicitudId)
      .eq('user_id', user.id)
      .eq('estado', 'pendiente_pago')
      .single()

    if (solicitudError || !solicitud) {
      return new Response(JSON.stringify({ error: 'Solicitud no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profesor, error: profesorError } = await supabaseAdmin
      .from('profesores')
      .select('*')
      .eq('id', solicitud.profesor_id)
      .single()

    if (profesorError || !profesor) {
      return new Response(JSON.stringify({ error: 'Maestro no encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!profesor.stripe_account_id || !profesor.onboarding_completo) {
      return new Response(JSON.stringify({ error: 'El maestro asignado aún no puede recibir pagos' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const nombreMateria = NOMBRES_MATERIA[solicitud.materia_id] ?? solicitud.materia_id

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Tutoría 1-a-1 · ${nombreMateria}`,
              description: `${solicitud.duracion_minutos} min el ${solicitud.fecha_hora_solicitada}`,
            },
            unit_amount: Math.round(Number(solicitud.precio_total_mxn) * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(Number(solicitud.comision_mxn) * 100),
        transfer_data: { destination: profesor.stripe_account_id },
      },
      metadata: {
        tipo: 'tutoria',
        solicitud_id: solicitud.id,
        user_id: user.id,
      },
      success_url: `${frontendUrl}/tutoria-confirmada?solicitud=${solicitud.id}`,
      cancel_url: `${frontendUrl}/tutorias/alumno`,
    })

    await supabaseAdmin
      .from('solicitudes_tutoria')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', solicitud.id)

    return new Response(JSON.stringify({ url: session.url }), {
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
