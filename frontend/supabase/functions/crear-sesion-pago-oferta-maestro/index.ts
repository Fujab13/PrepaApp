// crear-sesion-pago-oferta-maestro
// Crea la Checkout Session de Stripe para pagar un asiento YA reservado por
// el RPC `iniciar_reserva_oferta_maestro` (mutex + TTL, ver la migración
// 20260810130000). Este edge function nunca decide si hay cupo ni calcula
// el precio: ambos ya quedaron resueltos y congelados en la fila de
// `transacciones` en el momento de la reserva (monto_total), así que un
// cambio de precio en la oferta después de reservar no afecta lo que se le
// cobra al alumno. Solo lee `transaccion_id`, nunca `oferta_id`, del body —
// evita que el cliente intente pagar/crear una reserva para otra oferta u
// otro usuario por esta vía.
//
// A diferencia de crear-sesion-pago-tutoria, aquí NO se usa Stripe Connect
// (destination charge): ofertas_maestro no tiene onboarding de Stripe para
// el maestro (paga con datos bancarios propios vía `cuenta_clave`, fuera de
// esta migración), así que la plataforma es directamente el merchant of
// record, igual que en crear-sesion-pago (productos).
//
// Límite conocido: el TTL interno (10-15 min, columna `expira_en`) es más
// corto que el mínimo que Stripe permite configurar en `expires_at` de una
// Checkout Session (30 min). Por eso la sesión de Stripe usa su propio
// expires_at por default (24h) y el TTL real lo hace cumplir
// `procesar_pago_completado`: si el pago se confirma después de que
// `expira_en` ya pasó, la función rechaza el commit (ver esa migración). En
// el caso raro de que Stripe cobre después de que el asiento ya se le dio a
// otro alumno, hay que reconciliar/reembolsar a mano.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { resolverFrontendUrl } from '../_shared/frontendUrl.ts'

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
    const body = await req.json() as { transaccion_id?: string }
    const transaccionId = body.transaccion_id

    if (!transaccionId) {
      return new Response(JSON.stringify({ error: 'transaccion_id es requerido' }), {
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
    const frontendUrl = resolverFrontendUrl(req)

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

    // Filtra por id Y user_id (evita pagar/leer la reserva de otro alumno,
    // IDOR) Y estado_pago='pendiente' (no se puede crear una sesión de pago
    // para una reserva ya cancelada/expirada/completada).
    const { data: transaccion, error: transaccionError } = await supabaseAdmin
      .from('transacciones')
      .select('*')
      .eq('id', transaccionId)
      .eq('user_id', user.id)
      .not('oferta_maestro_id', 'is', null)
      .eq('estado_pago', 'pendiente')
      .single()

    if (transaccionError || !transaccion) {
      return new Response(JSON.stringify({ error: 'Reserva no encontrada o ya no está pendiente' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (transaccion.expira_en && new Date(transaccion.expira_en).getTime() < Date.now()) {
      await supabaseAdmin
        .from('transacciones')
        .update({ estado_pago: 'expirado' })
        .eq('id', transaccion.id)

      return new Response(JSON.stringify({ error: 'La reserva del asiento expiró, vuelve a intentarlo' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: oferta, error: ofertaError } = await supabaseAdmin
      .from('ofertas_maestro')
      .select('*')
      .eq('id', transaccion.oferta_maestro_id)
      .single()

    if (ofertaError || !oferta) {
      return new Response(JSON.stringify({ error: 'Oferta no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const nombreMateria = NOMBRES_MATERIA[oferta.materia_id] ?? oferta.materia_id
    const fechaFmt = new Date(oferta.fecha_hora).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Clase con ${oferta.profesor} · ${nombreMateria}`,
              description: `${fechaFmt} · ${oferta.duracion_minutos} min`,
            },
            unit_amount: Math.round(Number(transaccion.monto_total) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        tipo: 'oferta_maestro',
        transaccion_id: transaccion.id,
        oferta_maestro_id: oferta.id,
        user_id: user.id,
      },
      success_url: `${frontendUrl}/oferta-confirmada?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/ofertas?reserva_cancelada=${transaccion.id}`,
    })

    await supabaseAdmin
      .from('transacciones')
      .update({ stripe_intent_id: session.id })
      .eq('id', transaccion.id)

    return new Response(JSON.stringify({ url: session.url, expira_en: transaccion.expira_en }), {
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
