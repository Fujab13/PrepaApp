// conectar-pagos-maestro
// Variante self-service de onboardear-profesor: cualquier usuario logueado
// que ya tenga (o esté por publicar) una oferta de tutoría como maestro
// puede conectar su propia cuenta de Stripe Connect sin que un admin tenga
// que dar de alta nada a mano. Se autentica con el JWT del propio usuario
// (a diferencia de onboardear-profesor, que solo acepta el service-role key
// a mano vía curl) y hace un redirect síncrono en la misma sesión, así que
// no manda correo — el usuario ya está viendo la pantalla en ese momento.
//
// `asegurar_profesor_propio` es un RPC de Postgres SIN grants a ningún rol
// (ver la migración de ofertas): se puede llamar aquí con el cliente
// service-role exactamente igual que el webhook llama a
// confirmar_pago_tutoria, porque este edge function es código de servidor
// de confianza, no el navegador del usuario.

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

const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { error: asegurarError } = await supabaseAdmin.rpc('asegurar_profesor_propio', {
      p_user_id: user.id,
    })
    if (asegurarError) {
      const noTieneNombre = asegurarError.message?.includes('nombre_requerido')
      return new Response(JSON.stringify({
        error: noTieneNombre ? 'Configura tu nombre antes de conectar tus pagos' : 'No se pudo preparar tu cuenta de maestro',
      }), {
        status: noTieneNombre ? 409 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profesor, error: profesorError } = await supabaseAdmin
      .from('profesores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profesorError || !profesor) {
      return new Response(JSON.stringify({ error: 'No se encontró tu cuenta de maestro' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let stripeAccountId = profesor.stripe_account_id as string | null

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'MX',
        email: profesor.email_contacto ?? user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      stripeAccountId = account.id

      await supabaseAdmin
        .from('profesores')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', profesor.id)
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${frontendUrl}/tutorias/maestro`,
      return_url: `${frontendUrl}/tutorias/maestro`,
      type: 'account_onboarding',
    })

    return new Response(JSON.stringify({ url: accountLink.url }), {
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
