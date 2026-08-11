// frontendUrl.ts
// Los edge functions se despliegan UNA sola vez (no hay un ambiente de
// Supabase por cada frontend), así que la variable de entorno FRONTEND_URL
// solo puede tener un valor fijo a la vez. Eso rompía las pruebas: si
// FRONTEND_URL apuntaba a producción (Vercel), un checkout iniciado desde
// localhost regresaba a Vercel tras pagar; si apuntaba a localhost, un
// usuario real en producción (o alguien probando desde el celular vía el
// túnel de ngrok, ver vite.config.js) terminaba redirigido a localhost.
//
// La solución: el navegador SIEMPRE manda el header `Origin` en un fetch
// cross-origin (como el que hace el frontend hacia *.supabase.co) — no se
// puede falsificar desde JS del lado del cliente, así que sirve para saber
// desde dónde se originó la llamada sin que el cliente tenga que mandar
// nada explícito en el body. Se valida contra una lista blanca (no se
// confía ciegamente en el Origin) para no abrir un open-redirect a través
// de Stripe: cualquier dominio fuera de la lista cae al FRONTEND_URL fijo
// de siempre.
const SUFIJOS_PERMITIDOS = ['.vercel.app', '.ngrok-free.dev']

function esOrigenPermitido(origin: string): boolean {
  try {
    const url = new URL(origin)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true
    return SUFIJOS_PERMITIDOS.some((sufijo) => url.hostname.endsWith(sufijo))
  } catch {
    return false
  }
}

export function resolverFrontendUrl(req: Request): string {
  const origin = req.headers.get('Origin')
  if (origin && esOrigenPermitido(origin)) {
    return origin
  }
  return Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'
}
