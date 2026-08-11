import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { enviarCorreo, escapeHtml } from '../_shared/resend.ts'

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

const NOMBRES_MATERIA: Record<string, string> = {
  espanol: 'Español',
  matematicas: 'Matemáticas',
  ingles: 'Inglés',
  historia: 'Historia',
}

function fmtFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return iso
  }
}

// Manda los correos de una tutoría ya confirmada. Nunca lanza: cualquier
// error se loguea y deja `notificaciones_en_proceso=false` para que un
// reintento (redelivery de Stripe, o un "resend" manual desde el Dashboard)
// pueda volver a intentarlo. El "boleto" atómico (el UPDATE condicionado)
// evita que dos entregas del mismo evento manden los correos dos veces.
async function enviarNotificacionesTutoria(data: any) {
  const solicitud = data?.solicitud
  const alumno = data?.alumno
  const examen = data?.examen
  const profesor = data?.profesor

  if (!solicitud || solicitud.notificaciones_enviadas || solicitud.notificaciones_en_proceso) {
    return
  }

  const { data: claim, error: claimError } = await supabaseAdmin
    .from('solicitudes_tutoria')
    .update({ notificaciones_en_proceso: true })
    .eq('id', solicitud.id)
    .eq('notificaciones_enviadas', false)
    .eq('notificaciones_en_proceso', false)
    .select('id')

  if (claimError || !claim || claim.length === 0) {
    return // otra entrega del webhook ya se está encargando (o ya se mandaron)
  }

  try {
    const nombreMateria = NOMBRES_MATERIA[solicitud.materia_id] ?? solicitud.materia_id
    const fechaFmt = fmtFechaHora(solicitud.fecha_hora_solicitada)

    const seccionesOrdenadas = (Array.isArray(examen?.stats_por_seccion) ? examen.stats_por_seccion : [])
      .map((s: any) => ({ ...s, pct: s.total > 0 ? Math.round((s.correctas / s.total) * 100) : 0 }))
      .sort((a: any, b: any) => a.pct - b.pct)

    const statsHtml = seccionesOrdenadas
      .map((s: any) => `<li>${escapeHtml(s.nombre)}: ${s.correctas}/${s.total} (${s.pct}%)</li>`)
      .join('')

    // Archivos que el alumno haya adjuntado al reservar (opcionales). El
    // bucket es privado, así que el maestro necesita una liga firmada -
    // generarla aquí es más simple que exponer un endpoint aparte, y una
    // liga individual que falle no debe tumbar el resto del correo.
    const { data: archivos } = await supabaseAdmin
      .from('tutoria_archivos')
      .select('storage_path, nombre_original')
      .eq('solicitud_id', solicitud.id)

    const ligasArchivos = (
      await Promise.allSettled(
        (archivos ?? []).map(async (archivo: any) => {
          const { data: firmada, error: firmaError } = await supabaseAdmin
            .storage
            .from('tutoria-archivos')
            .createSignedUrl(archivo.storage_path, 60 * 60 * 24 * 7)
          if (firmaError || !firmada?.signedUrl) throw firmaError ?? new Error('sin_url')
          return { nombre: archivo.nombre_original, url: firmada.signedUrl }
        })
      )
    )
      .filter((r): r is PromiseFulfilledResult<{ nombre: string; url: string }> => r.status === 'fulfilled')
      .map((r) => r.value)

    const archivosHtml = ligasArchivos.length > 0
      ? `<p><strong>Archivos que subió el alumno:</strong></p><ul>${ligasArchivos
          .map((a) => `<li><a href="${a.url}">${escapeHtml(a.nombre)}</a></li>`)
          .join('')}</ul>`
      : ''

    // `enviarCorreo` nunca lanza (atrapa su propio error de red/API y regresa
    // {ok:false}), así que hay que revisar `.ok` explícitamente y escalarlo a
    // una excepción — si no, un fallo de Resend (dominio no verificado, rate
    // limit, etc.) se marcaría igual como "notificaciones_enviadas" sin que
    // el correo haya salido, y nunca se reintentaría. Nota: si el correo del
    // alumno sale bien pero el del profesor falla, el reintento (redelivery
    // de Stripe) vuelve a mandar el del alumno también — aceptable frente a
    // que el profesor se quede sin avisar.
    const correoAlumno = await enviarCorreo({
      to: alumno.email,
      subject: `Tu tutoría de ${nombreMateria} está confirmada`,
      html: `
        <p>Hola ${escapeHtml(alumno.nombre)},</p>
        <p>Tu clase de <strong>${escapeHtml(nombreMateria)}</strong> quedó confirmada:</p>
        <ul>
          <li>Fecha y hora: ${escapeHtml(fechaFmt)}</li>
          <li>Duración: ${solicitud.duracion_minutos} minutos</li>
          <li>Precio: $${Number(solicitud.precio_total_mxn).toFixed(2)} MXN</li>
        </ul>
        <p>Únete a tu clase aquí: <a href="${solicitud.meeting_url}">${solicitud.meeting_url}</a></p>
      `,
    })
    if (!correoAlumno.ok) {
      throw new Error(`No se pudo enviar el correo al alumno: ${correoAlumno.error}`)
    }

    const correoProfesor = await enviarCorreo({
      to: profesor.email_contacto,
      subject: `Nueva clase confirmada: ${nombreMateria}`,
      html: `
        <p>Hola ${escapeHtml(profesor.nombre)},</p>
        <p>Tienes una nueva clase confirmada:</p>
        <ul>
          <li>Materia: ${escapeHtml(nombreMateria)}</li>
          <li>Fecha y hora: ${escapeHtml(fechaFmt)}</li>
          <li>Duración: ${solicitud.duracion_minutos} minutos</li>
          <li>Liga de la clase: <a href="${solicitud.meeting_url}">${solicitud.meeting_url}</a></li>
        </ul>
        <p><strong>Sobre el alumno:</strong></p>
        <ul>
          <li>Nombre: ${escapeHtml(alumno.nombre)}</li>
          <li>Grado: ${escapeHtml(alumno.grado)}</li>
          <li>Área de interés: ${escapeHtml(alumno.area_interes)}</li>
          ${alumno.carrera_interes ? `<li>Carrera de interés: ${escapeHtml(alumno.carrera_interes)}</li>` : ''}
          <li>Teléfono: ${escapeHtml(alumno.telefono || 'No proporcionado')}</li>
        </ul>
        ${solicitud.notas_alumno ? `<p><strong>Notas del alumno sobre la clase:</strong> ${escapeHtml(solicitud.notas_alumno)}</p>` : ''}
        <p><strong>Resultados del examen diagnóstico (${examen?.precision_global ?? '—'}% global) — conviene enfocar la clase en lo más débil primero:</strong></p>
        <ul>${statsHtml}</ul>
        ${archivosHtml}
      `,
    })
    if (!correoProfesor.ok) {
      throw new Error(`No se pudo enviar el correo al profesor: ${correoProfesor.error}`)
    }

    await supabaseAdmin
      .from('solicitudes_tutoria')
      .update({ notificaciones_enviadas: true, notificaciones_en_proceso: false })
      .eq('id', solicitud.id)
  } catch (err) {
    console.error('Error mandando notificaciones de tutoría:', err)
    await supabaseAdmin
      .from('solicitudes_tutoria')
      .update({ notificaciones_en_proceso: false })
      .eq('id', solicitud.id)
  }
}

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
    const session = event.data.object as { id?: string; metadata?: Record<string, string> }

    if (!session.id) {
      return new Response(JSON.stringify({ error: 'No se encontró el id de la sesión' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (session.metadata?.tipo === 'tutoria') {
      const { data, error } = await supabaseAdmin.rpc('confirmar_pago_tutoria', {
        p_checkout_session_id: session.id,
      })

      if (error) {
        console.error('Error al confirmar pago de tutoría:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      // Las notificaciones nunca deben tumbar la confirmación del pago: si
      // fallan, se loguean y quedan recuperables (ver comentario arriba).
      await enviarNotificacionesTutoria(data)
    } else {
      const { error } = await supabaseAdmin.rpc('procesar_pago_completado', {
        p_stripe_intent_id: session.id,
      })

      if (error) {
        console.error('Error al conciliar el pago:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }
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
  } else if (event.type === 'account.updated') {
    const account = event.data.object as { id: string; charges_enabled?: boolean; payouts_enabled?: boolean }
    const completo = Boolean(account.charges_enabled && account.payouts_enabled)

    const { error } = await supabaseAdmin.rpc('actualizar_estado_onboarding_profesor', {
      p_stripe_account_id: account.id,
      p_completo: completo,
    })

    if (error) {
      console.error('Error actualizando onboarding de profesor:', error)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
