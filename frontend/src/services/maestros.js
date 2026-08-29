// services/maestros.js
import { supabase } from './supabaseClient';

/**
 * Transacciones completadas de ofertas_maestro publicadas por el maestro en
 * sesión (RPC `obtener_mis_transacciones_oferta_maestro`), para el portal
 * de ganancias.
 */
export async function obtenerMisTransaccionesOfertaMaestro() {
  const { data, error } = await supabase.rpc('obtener_mis_transacciones_oferta_maestro');
  if (error) {
    console.error('[maestros] No se pudieron cargar tus ganancias:', error.message);
    throw error;
  }
  return data ?? [];
}
