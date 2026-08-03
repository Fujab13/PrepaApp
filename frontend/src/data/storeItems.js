// `type: 'coins'`   -> se compra con monedas internas (gamificación), no
//                      tiene fila en la tabla `productos` de Supabase.
// `type: 'real'`    -> viene de la tabla `productos` de Supabase (nombre,
//                      precio y disponibilidad reales). Si `priceMXN` es 0
//                      se reclama gratis (RPC `reclamar_producto_gratis`);
//                      si no, pasa por Stripe Checkout.

// Items que son pura gamificación: no existen en Supabase y no entregan
// nada descargable, así que se quedan hardcodeados aquí.
export const COIN_ITEMS = [
  {
    id: 'seguimiento-proceso',
    categoria: 'Asistencia',
    icono: 'FaHeadset',
    nombre: 'Seguimiento de proceso',
    descripcion: 'Te decimos que hacer y donde hacerlo.',
    type: 'coins',
    priceCoins: 100,
  },
]

// `productos.categoria`/`icono` no existen como columnas en Supabase (son
// puramente de presentación), así que se resuelven aquí por `id`. Un
// producto nuevo en Supabase sin entrada en este mapa cae en el default y
// de todos modos aparece en la tienda.
const PRODUCTO_UI_META = {
  '9ad86f75-1279-4783-8efc-05f0a36c50ac': {
    categoria: 'Práctica extra',
    icono: 'FaClipboardList',
  },
  'a0c27edc-8b06-42f1-b67d-6a3c2e5c03db': {
    categoria: 'Práctica extra',
    icono: 'FaBriefcaseMedical',
    titulo: 'Medicina lección',
  },
}

const PRODUCTO_UI_META_POR_TIPO = {
  leccion_digital: { categoria: 'Práctica extra', icono: 'FaBriefcaseMedical' },
  intento_examen: { categoria: 'Práctica extra', icono: 'FaClipboardList' },
}

const PRODUCTO_META_DEFAULT = { categoria: 'Práctica extra', icono: 'FaBoxOpen' }

/** Convierte una fila de `productos` (Supabase) en un item que Store.jsx puede renderizar. */
export function productoAStoreItem(producto) {
  const meta =
    PRODUCTO_UI_META[producto.id] ||
    PRODUCTO_UI_META_POR_TIPO[producto.tipo_producto] ||
    PRODUCTO_META_DEFAULT

  return {
    id: `producto-${producto.id}`,
    categoria: meta.categoria,
    icono: meta.icono,
    nombre: meta.titulo || producto.nombre,
    descripcion: producto.descripcion || '',
    type: 'real',
    priceMXN: Number(producto.precio),
    productoId: producto.id,
  }
}
