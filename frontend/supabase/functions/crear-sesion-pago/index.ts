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
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as { producto_id?: string; cantidad?: number | string }
    const cantidad = typeof body.cantidad === 'number' ? body.cantidad : Number(body.cantidad ?? 1)
    const { producto_id } = body

    if (!producto_id || !Number.isInteger(cantidad) || cantidad < 1) {
      return new Response(JSON.stringify({ error: 'producto_id y cantidad son requeridos' }), {
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

    const { data: producto, error: productoError } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('id', producto_id)
      .eq('activo', true)
      .single()

    if (productoError || !producto) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const montoTotal = Number(producto.precio) * cantidad

    const { data: transaccion, error: transaccionError } = await supabaseAdmin
      .from('transacciones')
      .insert({
        user_id: user.id,
        producto_id: producto.id,
        monto_total: montoTotal,
        cantidad,
        moneda: 'MXN',
        estado_pago: 'pendiente',
      })
      .select()
      .single()

    if (transaccionError || !transaccion) {
      return new Response(JSON.stringify({ error: 'No se pudo registrar la transacción' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: { name: producto.nombre, description: producto.descripcion ?? undefined },
            unit_amount: Math.round(Number(producto.precio) * 100),
          },
          quantity: cantidad,
        },
      ],
      metadata: {
        transaccion_id: transaccion.id,
        user_id: user.id,
        producto_id: producto.id,
      },
      success_url: `${frontendUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pago-cancelado`,
    })

    await supabaseAdmin
      .from('transacciones')
      .update({ stripe_intent_id: session.id })
      .eq('id', transaccion.id)

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