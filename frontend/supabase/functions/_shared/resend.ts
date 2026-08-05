// resend.ts
// Helper compartido por los edge functions de tutorías para mandar correo vía
// la API de Resend (fetch directo, sin SDK). Carpeta con "_" al inicio para
// que el CLI de Supabase no la trate como un function desplegable.

export async function enviarCorreo({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM_EMAIL')

  if (!apiKey || !from) {
    console.error('Falta RESEND_API_KEY o RESEND_FROM_EMAIL')
    return { ok: false, error: 'Correo no configurado' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    if (!res.ok) {
      const texto = await res.text()
      console.error('Resend respondió con error:', res.status, texto)
      return { ok: false, error: `Resend ${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    console.error('Fallo de red mandando correo:', err)
    return { ok: false, error: 'Fallo de red' }
  }
}

// Escapa texto libre proporcionado por el usuario (notas, nombre, etc.)
// antes de interpolarlo en el HTML del correo, para evitar inyección HTML
// en el cliente de correo de quien lo reciba (sobre todo el maestro, que es
// un tercero externo a la app).
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
