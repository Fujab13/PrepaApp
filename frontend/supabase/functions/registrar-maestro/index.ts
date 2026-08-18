// registrar-maestro
// Dispara el admin (autenticado con su propia sesión, ver `es_admin_actual`
// dentro de la migración 20260812140000) desde AdminMaestros.jsx: da de alta
// la cuenta de un maestro nuevo con una contraseña generada por el sistema,
// para que pueda entrar al portal de maestros (/tutorias/maestro) sin que
// nadie tenga que elegir/recordar una contraseña propia todavía.
//
// Si el correo ya tiene cuenta (por ejemplo, ya era alumno), no falla: le
// asigna una contraseña nueva a esa cuenta existente y la vincula como
// maestro — así un alumno puede "graduarse" a maestro sin conflicto de
// "correo ya registrado". `auth.admin.createUser`/`updateUserById` requieren
// el service-role key, así que esto SOLO puede vivir en un edge function,
// nunca en el cliente.

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

// Contraseña legible pero con suficiente entropía (12 caracteres de un
// alfabeto sin 0/O/1/l/I para evitar confusiones al transcribirla a mano).
function generarPassword(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('')
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

    const body = await req.json() as { nombre?: string; email?: string }
    const nombre = body.nombre?.trim()
    const email = body.email?.trim().toLowerCase()

    if (!nombre || !email) {
      return new Response(JSON.stringify({ error: 'nombre y email son requeridos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
    const password = generarPassword()

    let targetUserId: string

    const { data: creado, error: crearError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre },
    })

    if (crearError || !creado?.user) {
      // El correo ya tiene cuenta (p. ej. ya era alumno): en vez de fallar,
      // se le asigna la contraseña nueva a esa cuenta y se vincula como
      // maestro.
      const yaExiste = crearError?.message?.toLowerCase().includes('already') || crearError?.status === 422
      if (!yaExiste) {
        console.error('Error creando usuario:', crearError)
        return new Response(JSON.stringify({ error: 'No se pudo crear la cuenta del maestro' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: listado, error: listadoError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })
      const existente = listado?.users?.find((u) => u.email?.toLowerCase() === email)

      if (listadoError || !existente) {
        console.error('No se encontró el usuario existente:', listadoError)
        return new Response(JSON.stringify({ error: 'Ese correo ya existe pero no se pudo vincular' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: actualizarError } = await supabaseAdmin.auth.admin.updateUserById(existente.id, {
        password,
      })
      if (actualizarError) {
        console.error('Error actualizando contraseña:', actualizarError)
        return new Response(JSON.stringify({ error: 'No se pudo asignar la contraseña nueva' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      targetUserId = existente.id
    } else {
      targetUserId = creado.user.id
    }

    const { error: upsertError } = await supabaseAdmin
      .from('maestros')
      .upsert(
        { user_id: targetUserId, nombre, activo: true, registrado_por: user.id },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      console.error('Error vinculando maestro:', upsertError)
      return new Response(JSON.stringify({ error: 'La cuenta se creó pero no se pudo vincular como maestro' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const correo = await enviarCorreo({
      to: email,
      subject: 'Tu acceso al portal de maestros — PrepaApp',
      html: `
        <p>Hola ${escapeHtml(nombre)},</p>
        <p>Ya puedes entrar al portal de maestros de PrepaApp con estos datos:</p>
        <ul>
          <li>Correo: ${escapeHtml(email)}</li>
          <li>Contraseña: ${escapeHtml(password)}</li>
        </ul>
        <p>Inicia sesión y entra a "Tutorías → Maestros" para publicar tus clases.</p>
      `,
    })

    return new Response(JSON.stringify({
      ok: true,
      email,
      password,
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
