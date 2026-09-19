// services/pushNotifications.js
// Activa/desactiva las notificaciones push del navegador (Push API +
// Service Worker en public/sw.js) para el usuario en sesión. Hoy solo las
// usa el maestro en TutoriasMaestro.jsx (aviso de alumno nuevo inscrito),
// pero no hay nada específico de ese caso aquí — es genérico por diseño.
import { supabase } from './supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// El navegador espera la llave pública VAPID como Uint8Array, no como el
// string base64url que se reparte normalmente.
function convertirLlaveVapid(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(base64);
  return Uint8Array.from([...binario].map((c) => c.charCodeAt(0)));
}

export function notificacionesSoportadas() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

/**
 * Suscripción push ya activa en ESTE navegador (o null). No requiere red:
 * consulta directo al Service Worker/Push API del navegador.
 */
export async function obtenerSuscripcionActual() {
  if (!notificacionesSoportadas()) return null;
  const registro = await navigator.serviceWorker.getRegistration();
  if (!registro) return null;
  return registro.pushManager.getSubscription();
}

/**
 * Pide permiso de notificaciones, registra el Service Worker si hace falta,
 * crea la suscripción push del navegador y la guarda en Supabase (RPC
 * `guardar_suscripcion_push`, ver migración 20260918120000). Lanza si el
 * usuario niega el permiso o si algo falla — el caller decide cómo avisar.
 */
export async function activarNotificaciones() {
  if (!notificacionesSoportadas()) {
    throw new Error('no_soportado');
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    throw new Error('permiso_denegado');
  }

  const registro = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  let suscripcion = await registro.pushManager.getSubscription();
  if (!suscripcion) {
    suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertirLlaveVapid(VAPID_PUBLIC_KEY),
    });
  }

  const json = suscripcion.toJSON();
  const { error } = await supabase.rpc('guardar_suscripcion_push', {
    p_endpoint: json.endpoint,
    p_p256dh: json.keys.p256dh,
    p_auth: json.keys.auth,
  });
  if (error) throw error;

  // Push de confirmación inmediato (edge function
  // confirmar-notificaciones-push): feedback de que ya están funcionando,
  // en vez de esperar hasta 3 días al primer recordatorio de estudio. Nunca
  // bloquea la activación — si falla, el usuario ya quedó suscrito igual.
  mandarConfirmacionActivacion(json.endpoint);

  return suscripcion;
}

async function mandarConfirmacionActivacion(endpoint) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirmar-notificaciones-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
  } catch (err) {
    console.error('[pushNotifications] No se pudo mandar el push de confirmación:', err);
  }
}

/**
 * Cancela la suscripción push de este navegador, tanto del lado del
 * navegador como en Supabase.
 */
export async function desactivarNotificaciones() {
  const suscripcion = await obtenerSuscripcionActual();
  if (!suscripcion) return;

  const endpoint = suscripcion.endpoint;
  await suscripcion.unsubscribe();

  const { error } = await supabase.rpc('eliminar_suscripcion_push', { p_endpoint: endpoint });
  if (error) console.error('[pushNotifications] No se pudo borrar la suscripción en el servidor:', error.message);
}
