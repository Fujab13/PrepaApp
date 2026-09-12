// Sobre firmado para el saldo de monedas (gamificación, sin dinero real —
// ver StoreContext.jsx). Junta `coins` y `reclamadas` (las unidades que ya
// pagaron su recompensa de escaneo) en un solo bloque con una firma, para
// que editar el número a mano en DevTools → Application → Local Storage dé
// como resultado un sobre inválido en vez de un saldo nuevo aceptado tal
// cual.
//
// OJO — esto es ofuscación, no criptografía real: SAL vive en este mismo
// archivo, que se envía tal cual (minificado) al navegador. Cualquiera que
// lea el bundle puede encontrar `calcularFirma` y fabricar un sobre válido
// a mano. Lo único que esto detiene es la edición casual de un número en
// DevTools — el vector real que usaría un alumno curioso — no a alguien
// dispuesto a leer el código fuente. Asegurar esto de verdad requeriría un
// backend (fuera de alcance: las monedas se quedan 100% locales a propósito).

const CLAVE_ESTADO = 'monedas_estado'
const CLAVE_LEGACY_COINS = 'user_coins'
const COINS_BIENVENIDA = 300
const SAL = 'PrepaApp::monedas::2026'

function hash(texto) {
  // DJB2, síncrono y sin dependencias — no necesita ser criptográficamente
  // fuerte, solo detectar ediciones manuales del valor guardado.
  let h = 5381
  for (let i = 0; i < texto.length; i++) {
    h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}

function calcularFirma(coins, reclamadas) {
  const cuerpo = `${coins}|${[...reclamadas].sort().join(',')}|${SAL}`
  return hash(cuerpo)
}

function estadoPorDefecto() {
  return { coins: COINS_BIENVENIDA, reclamadas: [] }
}

/** Lee el sobre guardado, migra el formato viejo (número plano) si aplica, y descarta cualquier sobre cuya firma no cuadre. */
export function leerEstado() {
  try {
    const crudo = localStorage.getItem(CLAVE_ESTADO)

    if (crudo) {
      const sobre = JSON.parse(crudo)
      const { coins, reclamadas, sig } = sobre
      if (
        typeof coins === 'number' && Number.isFinite(coins) &&
        Array.isArray(reclamadas) &&
        sig === calcularFirma(coins, reclamadas)
      ) {
        return { coins, reclamadas }
      }
      // Firma no coincide (o formato corrupto): se trata como manipulado.
      return estadoPorDefecto()
    }

    // Sin sobre nuevo todavía: migra el saldo viejo (número plano, sin
    // firma) una sola vez, para no borrarle el progreso a quien ya tenía
    // monedas guardadas antes de este cambio.
    const legacy = localStorage.getItem(CLAVE_LEGACY_COINS)
    if (legacy !== null) {
      const coins = Number(legacy)
      return { coins: Number.isFinite(coins) ? coins : COINS_BIENVENIDA, reclamadas: [] }
    }

    return estadoPorDefecto()
  } catch {
    return estadoPorDefecto()
  }
}

/** Persiste coins + reclamadas juntos, bajo una sola firma (nunca se guardan por separado). */
export function guardarEstado({ coins, reclamadas }) {
  try {
    const sig = calcularFirma(coins, reclamadas)
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify({ coins, reclamadas, sig }))
  } catch {
    // Sin localStorage disponible, el saldo no persiste entre sesiones,
    // pero la app sigue funcionando dentro de esta.
  }
}

export function claveUnidad(materiaId, unidad) {
  return `${materiaId}:${unidad}`
}
