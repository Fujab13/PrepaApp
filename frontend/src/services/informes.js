// services/informes.js
import { supabase } from './supabaseClient';

/**
 * Trae los formularios de área de un alumno por su correo (RPC
 * SECURITY DEFINER `obtener_formularios_area_por_email`, ver migración
 * 20260811120000). Requiere sesión iniciada; regresa el correo exacto que
 * se conozca, ordenado del más reciente al más antiguo.
 */
export async function obtenerFormulariosPorEmail(email) {
  const { data, error } = await supabase.rpc('obtener_formularios_area_por_email', {
    p_email: email,
  });

  if (error) {
    console.error('[informes] No se pudieron cargar los formularios de área:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Trae los resultados de examen simulador de un alumno por su correo (RPC
 * SECURITY DEFINER `obtener_resultados_examen_por_email`).
 */
export async function obtenerResultadosPorEmail(email) {
  const { data, error } = await supabase.rpc('obtener_resultados_examen_por_email', {
    p_email: email,
  });

  if (error) {
    console.error('[informes] No se pudieron cargar los resultados de examen:', error.message);
    return [];
  }

  return data ?? [];
}
