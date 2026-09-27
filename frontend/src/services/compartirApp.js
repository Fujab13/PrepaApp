// compartirApp.js
// Requisito de "Música enriquecida" (pages/Ajustes.jsx): compartir el enlace
// de la app con 2 amigos. No se verifica que lo reciban; basta con usar el
// botón 2 veces y, 2 minutos después, se marca perfiles.compartio_app
// (migración 20260927120000_compartio_app.sql).

import { supabase } from './supabaseClient'

export const COMPARTIDAS_REQUERIDAS = 2
export const ESPERA_DESBLOQUEO_MS = 2 * 60 * 1000

// Hoja de compartir nativa si existe (móvil); si no, copia el enlace.
// Regresa true si cuenta como compartido, false si el usuario canceló.
export async function compartirEnlaceApp() {
  const url = window.location.origin
  if (navigator.share) {
    try {
      await navigator.share({ title: 'PrepaApp', text: 'Estudia conmigo en PrepaApp', url })
      return true
    } catch (e) {
      if (e?.name === 'AbortError') return false
      // Otro error (p. ej. navegador embebido que no lo permite): copiar.
    }
  }
  await navigator.clipboard.writeText(url)
  return true
}

export async function marcarAppCompartida() {
  const { error } = await supabase.rpc('marcar_app_compartida')
  if (error) throw error
}

// Progreso local por usuario, para que no se pierda al salir de Ajustes.
const claveCompartidas = (userId) => `musica_compartidas:${userId}`
const claveDesde = (userId) => `musica_compartida_desde:${userId}`

export function leerProgresoCompartir(userId) {
  try {
    return {
      compartidas: Number(localStorage.getItem(claveCompartidas(userId))) || 0,
      desde: Number(localStorage.getItem(claveDesde(userId))) || null,
    }
  } catch {
    return { compartidas: 0, desde: null }
  }
}

export function guardarProgresoCompartir(userId, { compartidas, desde }) {
  try {
    localStorage.setItem(claveCompartidas(userId), String(compartidas))
    if (desde) localStorage.setItem(claveDesde(userId), String(desde))
  } catch { /* sin almacenamiento: el progreso solo dura en esta visita */ }
}

export function borrarProgresoCompartir(userId) {
  try {
    localStorage.removeItem(claveCompartidas(userId))
    localStorage.removeItem(claveDesde(userId))
  } catch { /* nada que borrar */ }
}
