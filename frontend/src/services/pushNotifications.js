// services/pushNotifications.js
// Activa/desactiva las notificaciones push del navegador (Push API +
// Service Worker en public/sw.js) para el usuario en sesión: campanita del
// Sidenav y Ajustes (recordatorios de estudio) y TutoriasMaestro.jsx (aviso
// de alumno nuevo). Genérico por diseño.
//
// Preferencias de los recordatorios (frecuencia y hora local): tabla
// preferencias_recordatorio, migración 20260926200000.
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

// 'granted' | 'denied' | 'default' | 'no_soportado'. Con 'denied' el
// navegador ya NO vuelve a preguntar: hay que desbloquearlo en la
// configuración del sitio, y la UI debe decirlo.
export function estadoPermiso() {
  if (!notificacionesSoportadas()) return 'no_soportado';
  return Notification.permission;
}

// Mensaje corto para mostrar cuando activar falla.
export function mensajeErrorNotificaciones(err) {
  if (err?.message === 'permiso_denegado') return 'Permite las notificaciones en tu navegador.';
  if (err?.message === 'permiso_bloqueado') return 'Desbloquéalas en la configuración del sitio.';
  if (err?.message === 'no_soportado') return 'Tu navegador no las permite.';
  return 'No se pudieron activar. Intenta de nuevo.';
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

  // Bloqueado de antes: requestPermission() ni siquiera mostraría el aviso.
  if (Notification.permission === 'denied') {
    throw new Error('permiso_bloqueado');
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

  // Preferencias de recordatorio con la hora ACTUAL del alumno si aún no
  // tiene (si ya las había ajustado, la RPC no las toca).
  await supabase.rpc('asegurar_preferencias_recordatorio', {
    p_hora: new Date().getHours(),
    p_zona: zonaHorariaLocal(),
  }).then(({ error: e }) => { if (e) console.error('[pushNotifications] Preferencias:', e.message); });

  // Primera notificación = la confirmación, mostrada por el PROPIO navegador
  // al instante (antes la mandaba el servidor y podía tardar o no llegar).
  mostrarConfirmacion(registro);

  return suscripcion;
}

function mostrarConfirmacion(registro) {
  registro.showNotification('Notificaciones activadas', {
    body: 'Así te recordaremos estudiar. Ajusta cuándo en Ajustes.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: '/ajustes' },
  }).catch((err) => console.error('[pushNotifications] No se pudo mostrar la confirmación:', err));
}

export function zonaHorariaLocal() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City';
  } catch {
    return 'America/Mexico_City';
  }
}

// Preferencias del propio usuario, o null si nunca las guardó (el servidor
// usa entonces: cada 3 días, 17:00, hora de México).
export async function obtenerPreferenciasRecordatorio(userId) {
  const { data, error } = await supabase
    .from('preferencias_recordatorio')
    .select('frecuencia_dias, hora, zona_horaria')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function guardarPreferenciasRecordatorio({ frecuenciaDias, hora }) {
  const { error } = await supabase.rpc('guardar_preferencias_recordatorio', {
    p_frecuencia: frecuenciaDias,
    p_hora: hora,
    p_zona: zonaHorariaLocal(),
  });
  if (error) throw error;
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
