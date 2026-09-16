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

/**
 * Alterna (RPC SECURITY DEFINER `marcar_agregado_grupo_whatsapp`, ver
 * migración 20260917140000) si un alumno ya fue agregado al grupo de
 * WhatsApp de la clase. Solo el maestro dueño de la oferta puede llamarla.
 */
export async function marcarAgregadoGrupoWhatsapp(transaccionId, valor) {
  const { error } = await supabase.rpc('marcar_agregado_grupo_whatsapp', {
    p_transaccion_id: transaccionId,
    p_valor: valor,
  });

  if (error) {
    console.error('[ofertasMaestro] No se pudo actualizar el estado de WhatsApp:', error.message);
  }

  return { error };
}
