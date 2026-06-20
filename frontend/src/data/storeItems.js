// Catálogo de la tienda.
// `type: 'coins'`   -> se compra con monedas internas (gamificación)
// `type: 'real'`    -> requiere dinero real, pasa por startRealPayment()
//
// priceMXN se deja en pesos mexicanos (ajusta si tu amigo usa otra moneda
// o multi-currency desde el proveedor de pagos).

export const STORE_ITEMS = [
  {
    id: 'paquete-100-preguntas',
    categoria: 'Práctica extra',
    icono: '📝',
    nombre: 'Paquete de 100 preguntas',
    descripcion: 'Banco extra de reactivos estilo examen de admisión.',
    type: 'coins',
    priceCoins: 150,
  },
  {
    id: 'racha-protegida',
    categoria: 'Gamificación',
    icono: '🛡️',
    nombre: 'Protector de racha',
    descripcion: 'Salva tu racha si un día no puedes estudiar.',
    type: 'coins',
    priceCoins: 80,
  },
  {
    id: 'doble-xp-24h',
    categoria: 'Gamificación',
    icono: '⚡',
    nombre: 'Doble XP por 24h',
    descripcion: 'Duplica los puntos que ganas en lecciones y quizzes.',
    type: 'coins',
    priceCoins: 60,
  },
  {
    id: 'guia-examen-completa',
    categoria: 'Material premium',
    icono: '📚',
    nombre: 'Guía completa de examen',
    descripcion: 'PDF con resumen de todas las materias y simulador final.',
    type: 'real',
    priceMXN: 49,
  },
  {
    id: 'tutorias-1a1',
    categoria: 'Material premium',
    icono: '🎓',
    nombre: 'Sesión de tutoría 1:1',
    descripcion: '45 minutos con un tutor para dudas específicas.',
    type: 'real',
    priceMXN: 199,
  },
  {
    id: 'plan-premium-mensual',
    categoria: 'Suscripción',
    icono: '✨',
    nombre: 'PrepaApp Premium (mensual)',
    descripcion: 'Acceso ilimitado a todo el material y sin límites diarios.',
    type: 'real',
    priceMXN: 99,
  },
]