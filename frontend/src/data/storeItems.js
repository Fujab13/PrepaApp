// `type: 'coins'`   -> se compra con monedas internas (gamificación)
// `type: 'real'`    -> requiere dinero real, pasa por Stripe Checkout
//                      (requiere `productoId`: el UUID de la fila en la
//                      tabla `productos` de Supabase)

export const STORE_ITEMS = [
  {
    id: 'paquete-200-preguntas',
    categoria: 'Práctica extra',
    icono: 'A',
    nombre: 'Paquete de +200 preguntas',
    descripcion: '¿Terminaste las preguntas tan rápido🏂?',
    type: 'coins',
    priceCoins: 17
  },
  {
    id: 'examen-simulador',
    categoria: 'Práctica extra',
    icono: 'B',
    nombre: 'Examen simulador ',
    descripcion: 'Este es un examen de 2hrs de cuatro secciones',
    type: 'real',
    priceMXN: 80,
    productoId: '9ad86f75-1279-4783-8efc-05f0a36c50ac' 
  },
  {
    id: 'paquete-200-flashcards',
    categoria: 'Práctica extra',
    icono: 'C',
    nombre: 'Paquete de +200 flashcards',
    descripcion: 'Extra de flashcards sobre conceptos.',
    type: 'coins',
    priceCoins: 17
  },
  {
    id: 'seguimiento-proceso',
    categoria: 'Asistencia',
    icono: 'D',
    nombre: 'Seguimiento de proceso',
    descripcion: 'Te decimos que hacer y donde hacerlo.',
    type: 'coins',
    priceCoins: 100,
  },
  {
    id: 'plan-premium-mensual',
    categoria: 'Suscripción',
    icono: 'E',
    nombre: 'PrepaApp Premium (3 meses)',
    descripcion: 'Acceso ilimitado + Lecciones en linea',
    type: 'real',
    priceMXN: 127,
    productoId: '9ad86f75-1279-4783-8efc-05f0a36c50ac' //Extraido directamente de la tabla productos en Supabase
  }
]