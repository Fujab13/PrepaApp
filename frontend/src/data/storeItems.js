// `type: 'coins'`   -> se compra con monedas internas (gamificación)
// `type: 'real'`    -> requiere dinero real, pasa por startRealPayment()

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
    id: 'paquete-200-flashcards',
    categoria: 'Práctica extra',
    icono: 'B',
    nombre: 'Paquete de +200 flashcards',
    descripcion: 'Extra de flashcards sobre conceptos.',
    type: 'coins',
    priceCoins: 17
  },
  {
    id: 'seguimiento-proceso',
    categoria: 'Asistencia',
    icono: 'C',
    nombre: 'Seguimiento de proceso',
    descripcion: 'Te decimos que hacer y donde hacerlo.',
    type: 'coins',
    priceCoins: 100,
  },
  {
    id: 'plan-premium-mensual',
    categoria: 'Suscripción',
    icono: 'D',
    nombre: 'PrepaApp Premium (3 meses)',
    descripcion: 'Acceso ilimitado + Lecciones en linea',
    type: 'real',
    priceMXN: 127
  }
]