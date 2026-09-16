// services/progreso.js
import { supabase } from './supabaseClient';

const PREFIJO_PROGRESO_INVITADO = 'progreso_quiz_';

/**
 * Lee todo el progreso de invitado (sin cuenta) que useProgreso.js haya
 * guardado en localStorage, uno por materia (`progreso_quiz_<materiaId>`).
 * Tolera entradas corruptas o con forma inesperada — localStorage puede
 * haber sido editado a mano, truncado, o venir de una versión vieja del
 * cliente — descartando esa fila en vez de tirar toda la lectura.
 */
export function leerProgresoInvitadoLocal() {
  const filas = [];
  let claves;
  try {
    claves = Object.keys(localStorage);
  } catch {
    return filas; // localStorage no disponible (modo privado, etc.)
  }

  for (const key of claves) {
    if (!key.startsWith(PREFIJO_PROGRESO_INVITADO)) continue;
    const materiaId = key.slice(PREFIJO_PROGRESO_INVITADO.length);
    if (!materiaId) continue;

    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      const unidad = Number(parsed?.unidad_actual);
      const elemento = Number(parsed?.elemento_actual);
      if (!Number.isFinite(unidad) || unidad < 1) continue;
      filas.push({
        key,
        materia_id: materiaId,
        unidad_actual: Math.floor(unidad),
        elemento_actual: Number.isFinite(elemento) ? Math.max(0, Math.floor(elemento)) : 0,
      });
    } catch {
      continue; // JSON inválido: se ignora, no bloquea las demás materias.
    }
  }

  return filas;
}

/**
 * Fusiona progreso de invitado con el que ya tenga la cuenta (RPC
 * SECURITY DEFINER `fusionar_progreso_invitado`, ver migración
 * 20260916121000): por cada materia se queda con la más avanzada de las
 * dos, nunca hace retroceder lo que ya estaba guardado en la cuenta.
 * Devuelve false ante cualquier falla (sin red, RPC caída) para que quien
 * llama sepa que NO debe borrar el localStorage todavía.
 */
export async function fusionarProgresoInvitado(filas) {
  const payload = filas.map(({ materia_id, unidad_actual, elemento_actual }) => ({
    materia_id,
    unidad_actual,
    elemento_actual,
  }));
  const { error } = await supabase.rpc('fusionar_progreso_invitado', { p_filas: payload });
  if (error) {
    console.error('[progreso] No se pudo fusionar el progreso de invitado:', error.message);
    return false;
  }
  return true;
}

/**
 * Registra en `productos.total_unidades` el total de unidades de una
 * lección premium (RPC SECURITY DEFINER `registrar_total_unidades_producto`,
 * ver migración 20260916120000). Solo el propio comprador puede calcularlo
 * (necesita el JSON de la lección, descargado del bucket privado) y solo se
 * guarda una vez — llamadas repetidas con el mismo o distinto valor no
 * hacen nada después de la primera. Best-effort: un fallo aquí no debe
 * interrumpir la lección en curso.
 */
export async function registrarTotalUnidadesProducto(productoId, totalUnidades) {
  const { error } = await supabase.rpc('registrar_total_unidades_producto', {
    p_producto_id: productoId,
    p_total_unidades: totalUnidades,
  });
  if (error) {
    console.error('[progreso] No se pudo registrar el total de unidades del producto:', error.message);
  }
}
