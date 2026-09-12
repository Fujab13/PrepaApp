import { MASCOTAS } from './mascotas'

// Ícono de cada mascota en la Tienda/Inventario — solo presentación, cada
// una sigue siendo cien por ciento pixel art propio en Mascota.jsx.
const ICONOS_MASCOTA = {
  perro: 'FaDog',
  gato: 'FaCat',
  pollito: 'FaKiwiBird',
  pez: 'FaFish',
  caballo: 'FaHorse',
  vaca: 'FaCow',
  cerdo: 'FaPiggyBank',
  gallina: 'FaEgg',
  pato: 'FaFeather',
  'conejo-gris': 'FaCarrot',
  'conejo-blanco': 'FaCarrot',
  tortuga: 'FaShieldAlt',
}

// `type: 'coins'`   -> se compra con monedas internas (gamificación), no
//                      tiene fila en la tabla `productos` de Supabase.
// `type: 'real'`    -> viene de la tabla `productos` de Supabase (nombre,
//                      precio y disponibilidad reales). Si `priceMXN` es 0
//                      se reclama gratis (RPC `reclamar_producto_gratis`);
//                      si no, pasa por Stripe Checkout.

// Items que son pura gamificación: no existen en Supabase y no entregan
// nada descargable, así que se quedan hardcodeados aquí.
//
// `temaId` (solo en items cosméticos de tema): una vez comprado, Store.jsx
// deja de tratar el botón como "comprar" y lo vuelve un toggle de
// activar/desactivar ese tema (ver StoreContext.jsx: temaActivo/elegirTema,
// utils/temas.js, y el bloque `[data-tema="azul-gris"]` en styles/global.css).
//
// `mascotaId` (solo en las mascotas): una vez comprada, se desbloquea en
// /mi-mascota (ver pages/Mascota.jsx) — es una compra única, como un tema.
// `comidaCantidad` (solo en la bolsa de comida): a diferencia de todo lo
// demás, esto SÍ se puede comprar una y otra vez — Store.jsx la trata
// distinto (ver comprarComida en StoreContext.jsx) porque es un consumible,
// no un desbloqueo permanente.
export const COIN_ITEMS = [
  {
    id: 'tema-azul-gris',
    categoria: 'Personalización',
    icono: 'FaPalette',
    nombre: 'Tema Slate Reverie',
    descripcion: 'Repinta la app en azules y grises. Solo cambia colores, no el diseño.',
    type: 'coins',
    priceCoins: 5000,
    temaId: 'azul-gris',
  },
  {
    id: 'tema-blanco',
    categoria: 'Personalización',
    icono: 'FaSun',
    nombre: 'Alba',
    descripcion: 'Versión clara de la app, gratis. Solo cambia colores, no el diseño.',
    type: 'coins',
    priceCoins: 0,
    temaId: 'claro',
  },
  // Nombre/precio de cada mascota se leen de data/mascotas.js — una sola
  // fuente de verdad, no hay que mantener el nombre/precio en dos lados.
  // El ícono sí es puramente de presentación (Store.jsx/Mascota.jsx no lo
  // necesitan para nada funcional), así que se resuelve aquí por id.
  ...MASCOTAS.map(m => ({
    id: `mascota-${m.id}`,
    categoria: 'Mascotas',
    icono: ICONOS_MASCOTA[m.id] || 'FaPaw',
    nombre: m.nombre,
    descripcion: `Desbloquea a ${m.nombre} en Mi Mascota.`,
    type: 'coins',
    priceCoins: m.precioCoins,
    mascotaId: m.id,
  })),
  {
    id: 'comida-mascotas',
    categoria: 'Mascotas',
    icono: 'FaHamburger',
    nombre: 'Snack Pack (x10)',
    descripcion: 'Alimenta a tus mascotas en Mi Mascota.',
    type: 'coins',
    // ~9-10 monedas en promedio por unidad completada (ver
    // EscaneoRecompensa.jsx, calibrado ahí) — 25 la deja al alcance de
    // unas dos lecciones, no de una junta de varias sesiones.
    priceCoins: 25,
    comidaCantidad: 10,
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

/**
 * Resuelve la metadata de presentación (categoría/ícono/título) de una fila
 * de `productos`. Se exporta aparte de `productoAStoreItem` para que
 * Inventario.jsx pueda mostrar el mismo ícono con el que ese producto ya
 * aparecía en la Tienda, en vez de mantener un segundo mapeo por su cuenta.
 */
export function obtenerMetaProducto(producto) {
  return (
    PRODUCTO_UI_META[producto.id] ||
    PRODUCTO_UI_META_POR_TIPO[producto.tipo_producto] ||
    PRODUCTO_META_DEFAULT
  )
}

/** Convierte una fila de `productos` (Supabase) en un item que Store.jsx puede renderizar. */
export function productoAStoreItem(producto) {
  const meta = obtenerMetaProducto(producto)

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
