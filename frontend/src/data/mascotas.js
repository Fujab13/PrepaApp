// Las 5 mascotas de "Mi Mascota" (ver pages/Mascota.jsx): criaturas de
// pixel art originales — nada calcado de otro personaje/mascota existente
// (Bill es un triángulo con un ojo y sombrero, un concepto genérico; no
// lleva moño ni bastón ni ninguna otra seña particular de nadie más).
// Cada `grid` es una rejilla en texto plano para PixelArt.jsx: '.' es
// transparente, cualquier otra letra se busca en `paleta`. No todas miden
// lo mismo (Bill es más alto por el sombrero, Stickman más angosto) —
// PixelArt.jsx no asume un tamaño fijo, lee filas/columnas de cada grid.
//
// `precioCoins` sigue el mismo mecanismo que los temas (storeItems.js,
// COIN_ITEMS): 0 = gratis (igual se "compra" una vez para desbloquearla,
// mismo flujo que el tema Alba).
export const MASCOTAS = [
  {
    id: 'perrito',
    nombre: 'Perrito',
    precioCoins: 0,
    frase: '¡El perrito no para de mover la cola!',
    paleta: { B: '#fdfdfd', E: '#f0ddb8', P: '#2b2b2b', N: '#3a2a1a', M: '#7a6a55' },
    grid: [
      '.....BBBB.....',
      '....BBBBBB....',
      '...BBBBBBBB...',
      '.EEBBBBBBBBEE.',
      '.EEBBBBBBBBEE.',
      '.EEBBBBBBBBEE.',
      '.BBBPBBBBPBBB.',
      '.BBBBBBBBBBBB.',
      '.BBBBBNNBBBBB.',
      '..BBBBMMBBBB..',
      '..BBBBBBBBBB..',
      '...BBBBBBBB...',
      '....BBBBBB....',
      '.....BBBB.....',
    ],
  },
  {
    id: 'bill',
    nombre: 'Bill',
    precioCoins: 600,
    frase: 'Bill flota y te guiña el ojo con su sombrero nuevo.',
    paleta: { B: '#2b2b2b', W: '#fdfdfd', P: '#2b2b2b', M: '#2b2b2b', C: '#ffdb00' },
    grid: [
      '......BBB......',
      '.....BWWWB.....',
      '....BWWWWWB....',
      '...BWWWWWWWB...',
      '..BBWWWWWWWBB..',
      '..BCCCCCCCCCB..',
      '..BCCCCCCCCCB..',
      '..BCCCCCCCCB...',
      '....BBBBBBBB...',
      '.BBB.BBBBBB.BBB',
      'BWWB.BBBBBB.BWWB',
      'BWWB....BB....WB',
      'BWWB....BB....WB',
      '.BBB....BB.....',
      '......BBBB......',
    ],
  },
  {
    id: 'gato',
    nombre: 'Gato',
    precioCoins: 300,
    frase: 'El gatito te observa... y decide que sí le caes bien.',
    paleta: { B: '#2b2b2e', P: '#c9e86b', N: '#e08fa0', M: '#5a5a5e' },
    grid: [
      '....B....B....',
      '...BBB..BBB...',
      '..BBBBBBBBBB..',
      '.BBBBBBBBBBBB.',
      '.BBBBBBBBBBBB.',
      '.BBBPPBBBPPBB.',
      '.BBBBBBBBBBBB.',
      '.BBBBBNNBBBBB.',
      '..BBBBMBBBBB..',
      '..BBBBBBBBBB..',
      '...BBBBBBBB...',
      '....BBBBBB....',
      '.....BBBB.....',
      '......BB......',
    ],
  },
  {
    id: 'loro',
    nombre: 'Loro',
    precioCoins: 450,
    frase: '¡El loro repite todo lo que dices!',
    paleta: { B: '#4caf50', A: '#2e7d32', P: '#1a1a1a', K: '#ffb300' },
    grid: [
      '......BB......',
      '....BBBBBB....',
      '..BBBBBBBBBB..',
      '.BBBBBBBBBBBB.',
      '.BBBPBBBBPBBB.',
      '.BBBBBBBBBBBB.',
      '.AABBBBBBBBAA.',
      '.BBBBBBBBBBBB.',
      '..BBBBBBBBBB..',
      '..BBBBKKBBBB..',
      '...BBBBBBBB...',
      '....BBBBBB....',
      '.....BBBB.....',
      '......BB......',
    ],
  },
  {
    id: 'stickman',
    nombre: 'Stickman',
    precioCoins: 800,
    frase: 'Stickman saluda con las dos manos.',
    paleta: { B: '#e5e7eb', P: '#1f2937', M: '#1f2937' },
    grid: [
      '...BBB....',
      '..BBBBB...',
      '..BPBPB...',
      '..BBMBB...',
      '....BB....',
      '.BBBBBBBB.',
      '....BB....',
      '....BB....',
      '....BB....',
      '....BB....',
      '...B..B...',
      '..B....B..',
      '.B......B.',
      'B........B',
    ],
  },
]

export function obtenerMascota(id) {
  return MASCOTAS.find(m => m.id === id) || null
}
