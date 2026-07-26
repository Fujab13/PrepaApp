// services/leccionesPremium.js
import { supabase } from './supabaseClient'

export async function obtenerLeccionesDisponibles() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('inventario_usuario')
    .select(`
      producto_id,
      productos (
        id,
        nombre
      )
    `)
    .eq('user_id', user.id)

  if (error) throw error

  return data
    .map(item => item.productos)
    .filter(Boolean)
}

export async function descargarLeccionPremium(nombreArchivo) {
  const { data, error } = await supabase
    .storage
    .from('Lecciones privadas')
    .download(nombreArchivo)

  if (error) {
    throw new Error('No tienes acceso a esta lección o no existe.')
  }

  const texto = await data.text()
  return JSON.parse(texto)
}