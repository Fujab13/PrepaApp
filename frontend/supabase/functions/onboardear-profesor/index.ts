// onboardear-profesor
// Endpoint que el administrador dispara A MANO (curl/Postman con el
// service-role key como Bearer, no hay panel de admin) justo después de dar
// de alta un maestro en `profesores` vía Supabase Studio. Crea su cuenta
// Express de Stripe Connect (si no existe ya), genera una liga de onboarding
// y se la manda por correo. Es re-ejecutable: si ya tiene stripe_account_id,
// solo genera una liga nueva y reenvía el correo (las ligas de Stripe
// expiran rápido — así se recupera sin tener que tocar código).
//
// Ejemplo de uso:
//   curl -X POST https://<proyecto>.supabase.co/functions/v1/onboardear-profesor \
//     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
//     -H "Content-Type: application/json" \
//     -d '{"profesor_id":"<uuid>"}'

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { enviarCorreo, escapeHtml } from '../_shared/resend.ts'

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
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '')

    if (token !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json() as { profesor_id?: string }
    if (!body.profesor_id) {
      return new Response(JSON.stringify({ error: 'profesor_id es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(getEnv('SUPABASE_URL'), serviceRoleKey)
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'

    const { data: profesor, error: profesorError } = await supabaseAdmin
      .from('profesores')
      .select('*')
      .eq('id', body.profesor_id)
      .single()

    if (profesorError || !profesor) {
      return new Response(JSON.stringify({ error: 'Maestro no encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let stripeAccountId = profesor.stripe_account_id as string | null

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'MX',
        email: profesor.email_contacto,
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
      refresh_url: `${frontendUrl}/`,
      return_url: `${frontendUrl}/`,
      type: 'account_onboarding',
    })

    const correo = await enviarCorreo({
      to: profesor.email_contacto,
      subject: 'Configura tu cuenta de pagos — PrepaApp',
      html: `
        <p>Hola ${escapeHtml(profesor.nombre)},</p>
        <p>Para poder recibir tus pagos por las clases de PrepaApp, completa este paso único con Stripe (verificación de identidad y datos bancarios):</p>
        <p><a href="${accountLink.url}">${accountLink.url}</a></p>
        <p>Este enlace expira pronto — si ya no funciona, pídenos uno nuevo.</p>
      `,
    })

    return new Response(JSON.stringify({
      ok: true,
      stripe_account_id: stripeAccountId,
      correo_enviado: correo.ok,
    }), {
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
