// `type: 'coins'`   -> se compra con monedas internas (gamificación)
// `type: 'real'`    -> requiere dinero real, pasa por Stripe Checkout
//                      (requiere `productoId`: el UUID de la fila en la
//                      tabla `productos` de Supabase)

export const STORE_ITEMS = [
  {
    id: 'medicina-lecciones',
    categoria: 'Práctica extra',
    icono: 'FaBriefcaseMedical',
    nombre: 'Medicina lección',
    descripcion: 'Expansión de lecciones ',
    type: 'coins',
    priceCoins: 17
  },
  {
    id: 'examen-simulador',
    categoria: 'Práctica extra',
    icono: 'FaClipboardList',
    nombre: 'Examen simulador ',
    descripcion: 'Este es un examen de 2hrs de cuatro secciones',
    type: 'real',
    priceMXN: 80,
    productoId: '9ad86f75-1279-4783-8efc-05f0a36c50ac' 
  },
  {
    id: 'seguimiento-proceso',
    categoria: 'Asistencia',
    icono: 'FaHeadset',
    nombre: 'Seguimiento de proceso',
    descripcion: 'Te decimos que hacer y donde hacerlo.',
    type: 'coins',
    priceCoins: 100,
  },
  {
    id: 'plan-premium-mensual',
    categoria: 'Suscripción',
    icono: 'FaCrown',
    nombre: 'PrepaApp Premium (3 meses)',
    descripcion: 'Acceso ilimitado + Lecciones en linea',
    type: 'real',
    priceMXN: 127,
    productoId: '9ad86f75-1279-4783-8efc-05f0a36c50ac' //Extraido directamente de la tabla productos en Supabase
  }
]