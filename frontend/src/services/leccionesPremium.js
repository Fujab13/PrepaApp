// services/leccionesPremium.js
import { supabase } from './supabaseClient';

const BUCKET_LECCIONES_PRIVADAS = 'Lecciones privadas';
const SIGNED_URL_EXPIRY_SECONDS = 60; // solo necesitamos tiempo para 1 descarga inmediata
const STORAGE_KEY_PREFIX = 'leccion_premium_';
const STORAGE_KEY_ACTUAL = 'leccion_premium_actual';

function nombreArchivo(nombreProducto) {
  // El nombre del archivo en el bucket coincide EXACTO con productos.nombre
  return `${nombreProducto}`;
}

/**
 * Genera una Signed URL temporal para el JSON de la lección.
 * Nunca expone el bucket como público: la URL expira sola.
 */
export async function obtenerUrlFirmadaLeccion(nombreProducto) {
  if (!nombreProducto) throw new Error('nombreProducto es requerido');

  const { data, error } = await supabase
    .storage
    .from(BUCKET_LECCIONES_PRIVADAS)
    .createSignedUrl(nombreArchivo(nombreProducto), SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    console.error('Error generando URL firmada:', error.message);
    throw new Error('No se pudo generar el acceso a la lección.');
  }

  return data.signedUrl;
}

/**
 * Descarga el JSON de la lección usando la Signed URL.
 */
export async function descargarLeccionPremium(nombreProducto) {
  const signedUrl = await obtenerUrlFirmadaLeccion(nombreProducto);

  const respuesta = await fetch(signedUrl);
  if (!respuesta.ok) {
    throw new Error(`No se pudo descargar la lección (status ${respuesta.status}).`);
  }

  return respuesta.json();
}

/**
 * Guarda el JSON descargado en sessionStorage para que Leccion.jsx/Home.jsx
 * lo consuman sin volver a pedir la Signed URL.
 * Usamos sessionStorage (no localStorage) porque es contenido de acceso
 * temporal ligado a la sesión activa, no algo que deba persistir para siempre.
 */
export function guardarLeccionEnSesion(productoId, nombreProducto, leccionJson) {
  const payload = {
    productoId,
    nombreProducto,
    data: leccionJson,
    guardadoEn: Date.now(),
  };
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${productoId}`, JSON.stringify(payload));
    sessionStorage.setItem(STORAGE_KEY_ACTUAL, JSON.stringify(payload));
  } catch (e) {
    console.error('No se pudo guardar la lección en sessionStorage:', e);
  }
}

export function obtenerLeccionDeSesion(productoId) {
  try {
    const key = productoId ? `${STORAGE_KEY_PREFIX}${productoId}` : STORAGE_KEY_ACTUAL;
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('No se pudo leer la lección de sessionStorage:', e);
    return null;
  }
}

export function limpiarLeccionActual() {
  sessionStorage.removeItem(STORAGE_KEY_ACTUAL);
}

/**
 * Punto de entrada único para Inventario.jsx: usa caché si ya existe,
 * si no, descarga y cachea.
 */
export async function cargarYCachearLeccion(productoId, nombreProducto) {
  const existente = obtenerLeccionDeSesion(productoId);
  if (existente) return existente.data;

  const leccion = await descargarLeccionPremium(nombreProducto);
  guardarLeccionEnSesion(productoId, nombreProducto, leccion);
  return leccion;
}