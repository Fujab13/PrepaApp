// services/adminPagos.js
import { supabase } from './supabaseClient';

/**
 * Detalle plano (una fila por transacción completada de ofertas_maestro) de
 * cuánto se le debe a cada profesor y si ya se le pagó (RPC SECURITY
 * DEFINER `admin_detalle_transacciones_profesores`, ver migración
 * 20260812130000). Requiere que el usuario en sesión sea admin — el backend
 * ya lo valida; aquí solo se propaga el error.
 */
export async function obtenerDetalleTransaccionesProfesores() {
  const { data, error } = await supabase.rpc('admin_detalle_transacciones_profesores');

  if (error) {
    console.error('[adminPagos] No se pudo cargar el detalle de pagos:', error.message);
    throw error;
  }

  return data ?? [];
}

export async function marcarPagoProfesor(transaccionId) {
  const { error } = await supabase.rpc('admin_marcar_pago_profesor', {
    p_transaccion_id: transaccionId,
  });
  if (error) throw error;
}

export async function desmarcarPagoProfesor(transaccionId) {
  const { error } = await supabase.rpc('admin_desmarcar_pago_profesor', {
    p_transaccion_id: transaccionId,
  });
  if (error) throw error;
}
