// admin-acceso-profesor
// Genera un magic link (auth.admin.generateLink, requiere service-role) para
// que un admin entre directo a la cuenta real de un profesor sin conocer su
// contraseña — pensado para hacer cambios rápidos (corregir una oferta,
// revisar algo) sin pedirle sus credenciales. El propio frontend cierra la
// sesión de admin ANTES de navegar al link (ver AdminMaestros.jsx): el admin
// queda deslogueado de su cuenta y tiene que volver a iniciar sesión normal
// para recuperar sus privilegios — no es "impersonar sin salir", es un
// swap real de sesión, tal como se pidió explícitamente.
//
// No manda correo (a diferencia de registrar-maestro): el link se regresa
// directo al admin ya autenticado, que es quien lo va a usar de inmediato,
// así que no hace falta entregarlo por otro canal.

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

    const { data: esAdmin, error: esAdminError } = await supabaseClient.rpc('es_admin_actual')
    if (esAdminError || !esAdmin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json() as { email?: string }
    const email = body.email?.trim().toLowerCase()
    if (!email) {
      return new Response(JSON.stringify({ error: 'email es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${frontendUrl}/tutorias/maestro` },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Error generando el link de acceso:', linkError)
      return new Response(JSON.stringify({ error: 'No se pudo generar el acceso a esa cuenta' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: linkData.properties.action_link }), {
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
