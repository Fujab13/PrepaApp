// Preferencia de tema visual (ver src/data/storeItems.js: el "Tema Azul
// Grisáceo" se compra con monedas en la Tienda — StoreContext.jsx expone
// `elegirTema` para activarlo/desactivarlo una vez comprado). Local al
// dispositivo, igual que utils/modoDificil.js — no pasa por Supabase.

const CLAVE_TEMA = 'tema_activo'

export function leerTemaActivo() {
  try {
    return localStorage.getItem(CLAVE_TEMA) || null
  } catch {
    return null
  }
}

// null/undefined quita el atributo (vuelve al tema original de :root).
export function aplicarTema(temaId) {
  try {
    if (temaId) {
      document.documentElement.setAttribute('data-tema', temaId)
      localStorage.setItem(CLAVE_TEMA, temaId)
    } else {
      document.documentElement.removeAttribute('data-tema')
      localStorage.removeItem(CLAVE_TEMA)
    }
  } catch {
    // Sin localStorage disponible, la preferencia no persiste entre
    // sesiones, pero el cambio visual sigue aplicando dentro de esta.
  }
}
