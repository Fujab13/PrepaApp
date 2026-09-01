// services/examenesPremium.js
// Espejo de services/leccionesPremium.js para exámenes comprados en la
// Tienda (ej. "Intento adicional - Examen Diagnóstico"): mismo bucket
// privado + Signed URL + caché en sessionStorage, mismo punto de entrada
// único para Inventario.jsx, para que abrir un examen premium se sienta
// igual que abrir una lección premium.
//
// A diferencia de leccionesPremium.js (que usa productos.nombre tal cual
// como key del archivo, ej. "medicina.json"), aquí se usa productos.sku:
// Supabase Storage rechaza keys con acentos/espacios (InvalidKey), y el
// nombre real de este producto es "Intento adicional - Examen Diagnóstico"
// — el sku ("INTENTO_EXAMEN_DIAG_01") ya es un identificador seguro y,
// a diferencia del nombre, no cambia si algún día se retoca el texto de
// la Tienda.
import { supabase } from './supabaseClient';

// "Examenes comprados" (no "Examenes privados"): ese bucket ya existía con
// una política que dejaba leer cualquier examen a cualquier usuario
// autenticado, sin checar el inventario — este es uno nuevo, con la misma
// política de acceso "solo si está en tu inventario" que ya usa el bucket
// de lecciones (ver migración de política en Supabase, tabla storage.objects).
const BUCKET_EXAMENES_PRIVADOS = 'Examenes comprados';
const SIGNED_URL_EXPIRY_SECONDS = 60; // solo necesitamos tiempo para 1 descarga inmediata
const STORAGE_KEY_PREFIX = 'examen_premium_';
const STORAGE_KEY_ACTUAL = 'examen_premium_actual';

/**
 * Genera una Signed URL temporal para el JSON del examen.
 * Nunca expone el bucket como público: la URL expira sola.
 */
export async function obtenerUrlFirmadaExamen(claveArchivo) {
  if (!claveArchivo) throw new Error('claveArchivo (sku) es requerido');

  const { data, error } = await supabase
    .storage
    .from(BUCKET_EXAMENES_PRIVADOS)
    .createSignedUrl(claveArchivo, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    console.error('Error generando URL firmada del examen:', error.message);
    throw new Error('No se pudo generar el acceso al examen.');
  }

  return data.signedUrl;
}

/**
 * Descarga el JSON del examen usando la Signed URL. Formato esperado:
 * { nombre?: string, secciones: [...], preguntas: [...] } — mismas formas
 * que SECCIONES/PREGUNTAS en data/examen.js.
 */
export async function descargarExamenPremium(claveArchivo) {
  const signedUrl = await obtenerUrlFirmadaExamen(claveArchivo);

  const respuesta = await fetch(signedUrl);
  if (!respuesta.ok) {
    throw new Error(`No se pudo descargar el examen (status ${respuesta.status}).`);
  }

  return respuesta.json();
}

/**
 * Guarda el JSON descargado en sessionStorage para que Examen.jsx lo
 * consuma sin volver a pedir la Signed URL. sessionStorage (no localStorage)
 * porque es contenido de acceso temporal ligado a la sesión activa.
 */
export function guardarExamenEnSesion(productoId, claveArchivo, examenJson) {
  const payload = {
    productoId,
    claveArchivo,
    data: examenJson,
    guardadoEn: Date.now(),
  };
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${productoId}`, JSON.stringify(payload));
    sessionStorage.setItem(STORAGE_KEY_ACTUAL, JSON.stringify(payload));
  } catch (e) {
    console.error('No se pudo guardar el examen en sessionStorage:', e);
  }
}

export function obtenerExamenDeSesion(productoId) {
  try {
    const key = productoId ? `${STORAGE_KEY_PREFIX}${productoId}` : STORAGE_KEY_ACTUAL;
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('No se pudo leer el examen de sessionStorage:', e);
    return null;
  }
}

export function limpiarExamenActual() {
  sessionStorage.removeItem(STORAGE_KEY_ACTUAL);
}

/**
 * Punto de entrada único para Inventario.jsx: usa caché si ya existe,
 * si no, descarga y cachea.
 */
export async function cargarYCachearExamen(productoId, claveArchivo) {
  const existente = obtenerExamenDeSesion(productoId);
  if (existente) return existente.data;

  const examen = await descargarExamenPremium(claveArchivo);
  guardarExamenEnSesion(productoId, claveArchivo, examen);
  return examen;
}
