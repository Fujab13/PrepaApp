// services/productos.js
import { supabase } from './supabaseClient';

/**
 * Trae los productos activos directamente de la tabla `productos` de
 * Supabase (fuente de verdad para nombre, precio y disponibilidad de todo
 * lo que se compra con dinero real). RLS permite SELECT público sobre
 * productos activos.
 */
export async function fetchProductosActivos() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, tipo_producto, sku, metadata')
    .eq('activo', true);

  if (error) {
    console.error('[productos] No se pudieron cargar los productos activos:', error.message);
    return [];
  }

  return data ?? [];
}
