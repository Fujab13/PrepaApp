// services/maestros.js
import { supabase } from './supabaseClient';

/**
 * Da de alta a un maestro nuevo (o vincula una cuenta existente) con una
 * contraseña generada por el sistema (edge function `registrar-maestro`,
 * ver migración 20260812140000). Requiere que quien llama sea admin — el
 * backend ya lo valida.
 */
export async function registrarMaestro(nombre, email) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Tu sesión expiró, vuelve a iniciar sesión.');

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/registrar-maestro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ nombre, email }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'No se pudo registrar al maestro.');
  }
  return data;
}

export async function listarMaestros() {
  const { data, error } = await supabase.rpc('admin_listar_maestros');
  if (error) {
    console.error('[maestros] No se pudo listar maestros:', error.message);
    throw error;
  }
  return data ?? [];
}

export async function establecerMaestroActivo(userId, activo) {
  const { error } = await supabase.rpc('admin_set_maestro_activo', {
    p_user_id: userId,
    p_activo: activo,
  });
  if (error) throw error;
}

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
