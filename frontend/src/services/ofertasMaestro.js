// services/ofertasMaestro.js
import { supabase } from './supabaseClient';

/**
 * Trae, por cada oferta publicada por el maestro en sesión, los alumnos que
 * ya pagaron un cupo (RPC SECURITY DEFINER `obtener_alumnos_ofertas_maestro`,
 * ver migración 20260812120000). Requiere sesión iniciada.
 */
export async function obtenerAlumnosDeOfertas() {
  const { data, error } = await supabase.rpc('obtener_alumnos_ofertas_maestro');

  if (error) {
    console.error('[ofertasMaestro] No se pudieron cargar los alumnos inscritos:', error.message);
    return [];
  }

  return data ?? [];
}
