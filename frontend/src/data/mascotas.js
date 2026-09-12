// Las mascotas de "Mi Mascota" (ver pages/Mascota.jsx): criaturas de pixel
// art originales, sin calcar ningún personaje/mascota existente. Cada
// `grid` es una rejilla en texto plano para PixelArt.jsx: '.' es
// transparente, cualquier otra letra se busca en `paleta`. No todas miden
// lo mismo — PixelArt.jsx no asume un tamaño fijo, lee filas/columnas de
// cada grid.
//
// `precioCoins` sigue el mismo mecanismo que los temas (storeItems.js,
// COIN_ITEMS): 0 = gratis (igual se "compra" una vez para desbloquearla,
// mismo flujo que el tema Alba).
//
// `frase`: lo que dice al tocarla fuera de Mi Mascota (ver
// MascotaCompanera.jsx) y el title del sandbox — máximo 3 palabras a
// propósito, es un vistazo rápido, no una descripción.
//
// `sonidos`: frases cortas que la mascota "dice" de vez en cuando en el
// sandbox (ver MascotaViva en Mascota.jsx) — sin emojis, solo texto, como
// el resto de la señalética de esta pantalla. Un array vacío es válido y a
// propósito: la tortuga no vocaliza nunca, eso también es un rasgo suyo.
//
// `atributos` (opcional): rasgos de comportamiento por especie que el
// sandbox lee al simular su física —
//   - `salta`: hace saltos visuales periódicos (solo cosmético, no mueve su
//     posición real; ver clase CSS mascota-salto).
//   - `ritmo`: multiplicador de velocidad de paseo (1 = normal); úsalo para
//     que una especie se sienta más lenta o más rápida que el resto.
// Cualquier mascota sin `atributos` usa los valores por defecto (no salta,
// ritmo 1) — no hace falta declarar el objeto si no se aparta de ellos.
export const MASCOTAS = [
  {
    id: 'perro',
    nombre: 'Perro',
    precioCoins: 0,
    frase: '¡Cola feliz!',
    sonidos: ['¡Guau!', '¡Guau guau!'],
    atributos: { ritmo: 1.1 },
    paleta: { N: '#1d1f1e', A: '#a76032', B: '#c7763e' },
    grid: [
      '.............NNN.......',
      '............NAAANNN....',
      '...........NAAANBBNN...',
      '..NN.......NAAANBNBNNNN',
      '.NBN.......NAAANBNBBBBN',
      'NAN........NNAANBBBBBBN',
      'NAN.........NNNBBBNNNN.',
      'NANNNNNNNNNNBBNBBNNBN..',
      'NNBNBBBBBBBBBBBNNNNN...',
      '.NNBBBBBBBBBBBBBBN.....',
      '..NBBBBBBBBBBBBBBN.....',
      '..NBBBBNBBBBBBBBBN.....',
      '..NBBBBNBBBBNBBNN......',
      '.NBBBBNANNNNNBBNN......',
      '.NBBNNAN....NBBNN......',
      '.NBBNNAAN...NBBBNN.....',
      '.NNNN.NNN...NNNNNN.....',
    ],
  },
  {
    id: 'gato',
    nombre: 'Gato',
    precioCoins: 250,
    frase: 'Te aprueba.',
    sonidos: ['¡Miau!', 'Miau...', 'Ronroneo...'],
    // El más ágil de los que no saltan.
    atributos: { ritmo: 1.25 },
    paleta: { N: '#1e201f', A: '#8c8d87', B: '#a9a9a9' },
    grid: [
      '........N.....NN.',
      '........AN...NAN.',
      '........AANNNAAN.',
      '........AAAAAAAAN',
      '..NN...NAAAAAAAAN',
      '.NBN...AAANAAANAN',
      '.NBN...AAAAANAAAN',
      'NAN.....AAAAAAANN',
      'NAN...NNNNAAAANN.',
      'NAN..NAAAAAAAAN..',
      'NAN.NAAAAAAAAAN..',
      'NAN.NAAAAAAAAAN..',
      '.NANAAAANANANAN..',
      '.NANAAANNANANAN..',
      '..NNAAANNANANAN..',
      '...NAAAAANNANAAN.',
      '....NNNNNNNNNNNN.',
    ],
  },
  {
    id: 'pollito',
    nombre: 'Pollito',
    precioCoins: 150,
    frase: '¡Quiero jugar!',
    sonidos: ['¡Pío!', '¡Pío pío!'],
    atributos: { ritmo: 0.95 },
    paleta: { N: '#1e201f', A: '#ed8339', B: '#fccf3e' },
    grid: [
      '....NNNN.......',
      '...NBBBNN......',
      '..NBBBBBN......',
      '..NBBNBBN......',
      'NAABBBBBN......',
      'NNABBBBBN......',
      '..NNBBBBBN...NN',
      '..NBBBBBBBBNNBN',
      '..NBBBBBBBBBBBN',
      '..NBBBBBNBBNBBN',
      '..NBBBBBNNNBBN.',
      '...NBBBBBBBBBN.',
      '....NBBBBBBBN..',
      '.....NNNNNNN...',
      '......N...N....',
      '....NNN.NNN....',
    ],
  },
  {
    id: 'pez',
    nombre: 'Pez',
    precioCoins: 180,
    frase: 'Burbujas felices.',
    sonidos: ['Blub...', 'Blub blub...'],
    atributos: { ritmo: 0.9 },
    paleta: { N: '#1f211e', A: '#bf4b1a', B: '#f08132' },
    grid: [
      '.....NNNN.......',
      '...NNBBBBN......',
      '..NNNNNNN.....NN',
      '.BBBBBBBBNN..NBN',
      'NBBBBBBBBBBNNBBN',
      'NBNBBBBBBBBBBBN.',
      'ABBBBAABBBBBBBN.',
      'NBBBBBBBBBBNNBBN',
      '.NBBBBBBBNN..NBN',
      '..NNNNNNN.....NN',
      '....BBBN........',
      '.....NN.........',
    ],
  },
  {
    id: 'caballo',
    nombre: 'Caballo',
    precioCoins: 550,
    frase: 'Relincho fuerte.',
    sonidos: ['¡Iiiihh!', '¡Brrrm!'],
    // Galopa: el más rápido de todas las mascotas.
    atributos: { ritmo: 1.6 },
    paleta: { N: '#1f2120', A: '#353533', B: '#a76032' },
    grid: [
      '.............NN.N....',
      '............NBNNNN...',
      '............NBNBBN...',
      '...........NNBBBBBN..',
      '...........NNBBBNBBN.',
      '..........NNBBBBBBBBN',
      '.........NNNBBBBBBBBN',
      '...NNNNNNNNBBBBNNNBBN',
      '..NNBBBBBBBBBBBN..NN.',
      '.NNBBBBBBBBBBBBN.....',
      '.NNBBBBBBBBBBBBN.....',
      '.NNBBBNBBBBBBBBN.....',
      'NNNBBBNBBBBBBBBN.....',
      'NNNBBNNNNNNNBNBN.....',
      '..NBBNA....NBNBN.....',
      '..NBNBN....NBNBN.....',
      '..NBNBN....NBNBN.....',
      '..NNNNN....NNNNN.....',
    ],
  },
  {
    id: 'vaca',
    nombre: 'Vaca',
    precioCoins: 400,
    frase: 'Muge tranquila.',
    sonidos: ['¡Muu!', '¡Muuuu!'],
    // Pesada y lenta, aunque no tanto como la tortuga.
    atributos: { ritmo: 0.7 },
    paleta: { N: '#1e201f', A: '#f0a190', B: '#f5efe1' },
    grid: [
      '..............N.....N..',
      '..............NNNNNNN..',
      '............NNNNNBBNNNN',
      '...NNNNNNNNNNNNNBBBBNNN',
      '..NNBBBNNNNBBBNBBNBBN..',
      '.NNBBBBNNNNBBBNBBNBBN..',
      '.NBBNNBNNNNNBBNBBBBBNN.',
      '.NBNNNBBNNNBBBNBBAAAAN.',
      '.NBNNNBBBBBBBBBNAANAAN.',
      '.NBNNBBBBBBBBBBNAAAAAN.',
      'N.NBBBNNNBBBBBBBNNNNN..',
      'N.NBBNNNNBBNBBBBBN.....',
      'N.NBBNAAANNNBBNBNN.....',
      '..NBBNAANN.NBBNNN......',
      '..NBNANAN..NBBNBN......',
      '..NBNNNN...NBBNBN......',
      '..NNNN.N...NNNNNN......',
    ],
  },
  {
    id: 'cerdo',
    nombre: 'Cerdo',
    precioCoins: 260,
    frase: '¡Oink feliz!',
    sonidos: ['¡Oink!', '¡Oink oink!'],
    atributos: { ritmo: 0.75 },
    paleta: { N: '#1e201f', A: '#f2a08b' },
    grid: [
      '...NNN.NN.........',
      '..NAAANAAN........',
      '.NNNNNAAANNNNNN...',
      '..NAAAAANAAAAAAN..',
      'NNNAANAAAAAAAAAAN.',
      'NAAAAAAAAAAAAAAAN.',
      'NANAAAAAAAAAAAAANN',
      'NAAAAAAAAAAAAAAANA',
      '.NNNAAAAAAAAAAAANN',
      '...NNAAAAAAAAAAAN.',
      '....NAAAAAAAAAAN..',
      '.....NNAANNNNAAN..',
      '.....NAANN..NAAN..',
      '.....NNANN..NANN..',
      '.....NNNNN..NNN...',
    ],
  },
  {
    id: 'gallina',
    nombre: 'Gallina',
    precioCoins: 220,
    frase: 'Picoteando cerca.',
    sonidos: ['¡Cloc cloc!', '¡Coc coc!'],
    atributos: { ritmo: 0.85 },
    paleta: { N: '#1e201f', A: '#c88f38', B: '#f8b437' },
    grid: [
      '...NNN..........',
      '..NAAAN.........',
      '.NNNNNN.........',
      '.NBBBBN.........',
      'NBBNBBBN........',
      'NBBBBBBN......NN',
      '.NBBBBBNN....BBN',
      '.NBBBBBBBNNNNBBN',
      '..NBBBBBBBBBBBBN',
      '..NBBBNBBBBBBBBN',
      '..NBBBNBBBBBNBBN',
      '..NBBBBNNNNNBBN.',
      '...NBBBBBBBBBB..',
      '....NBBBBBBBBN..',
      '.....NNNNNNN....',
      '.......N..N.....',
      '.....NNN.NN.....',
    ],
  },
  {
    id: 'pato',
    nombre: 'Pato',
    precioCoins: 200,
    frase: 'Nadando feliz.',
    sonidos: ['¡Cuac!', '¡Cuac cuac!'],
    atributos: { ritmo: 0.8 },
    paleta: { N: '#1e201f', A: '#d6b534', B: '#fccf3e' },
    grid: [
      '..........NNNN....',
      '.........NBBBBN...',
      '........NBBBBBBN..',
      '........NBBBNNBN..',
      '........NBBBBBBAAN',
      '.........BBBBBNNNN',
      'NN.......NBBBBNNNN',
      'NBBBBBBBBBBBBB....',
      'NBBBBBBBBBBBBBN...',
      'NBBBNBBBBBBBBBN...',
      '.NBBBNBBBNBBBBN...',
      '.NBBBNNNNBBBBBN...',
      '..NBBBBBBBBBBN....',
      '...NNBBBBBBBN.....',
      '.....NNNNNNN......',
      '.....NA..NA.......',
      '.....NN..NNN......',
    ],
  },
  {
    id: 'conejo-gris',
    nombre: 'Conejo Gris',
    precioCoins: 500,
    frase: 'Nariz inquieta.',
    // Los conejos no "hablan" — su señal característica es el golpe de pata
    // (thump) con el que avisan, y el salto (ver atributos.salta) en vez de
    // una voz.
    sonidos: ['*Thump!*'],
    atributos: { salta: true, ritmo: 1.35 },
    paleta: { N: '#0a0c0b', A: '#1f2120', B: '#4b4b49', C: '#8a8d86', D: '#aeaea6', E: '#e5e7e6', F: '#ffffff' },
    grid: [
      '.............A...AA....',
      '.............ADA.ADA...',
      '.............ADDAADA...',
      '.............ADDAADA...',
      '....AAAAAAA..ADDAADA...',
      '..AAAFEEEEEDAFADDADAA..',
      '.AAEEEEEEEEEEAABDDDDD..',
      '.AEEEEEEEEEEEEDDDDADDA.',
      '.EEEEEEEEEEEEEDDDDDDDD.',
      'AEEEEEEEEEEEEEDDDDDDDDA',
      'AEEEEEEEEEEEEEEDDDDDDA.',
      '.AAEEEFEEEEEEEEEDAAAAA.',
      '..NFEEAEEFFFEEFFFD.....',
      '...AEFAFFAAAFFAAA......',
      '...ACACAA...ACACA......',
      '...ACACA....ACACA......',
      '...AAACA....ACACA......',
      '....AAAA....AAAAA......',
    ],
  },
  {
    id: 'conejo-blanco',
    nombre: 'Conejo Blanco',
    precioCoins: 350,
    frase: 'Saltitos curiosos.',
    sonidos: ['*Thump!*'],
    atributos: { salta: true, ritmo: 1.35 },
    paleta: { N: '#0c0c0c', A: '#202221', B: '#5a5c5b', C: '#8e8d88', D: '#ee9784', E: '#f4eee2', F: '#ffffff' },
    grid: [
      '......A.........',
      '..NEEADD........',
      '..AEEADD........',
      '..AEEADD........',
      '..AEEADA........',
      '..AEAFA.........',
      '..EEEEA.........',
      'AAEEEEEAAAAA....',
      'AEEAEEEAAAAAA...',
      'AEEEEEEEEEEE....',
      'AAEEEEEEEAEEEA..',
      '.AAAEEEECEEEEA..',
      '...AEEEEAEEEEA..',
      '....AEBEAEEEEAA.',
      '....AFAAAAEEEAEA',
      '...AEEAAEFEEAAA.',
      '...AAAAAAAAAA...',
    ],
  },
  {
    id: 'tortuga',
    nombre: 'Tortuga',
    precioCoins: 300,
    frase: 'Sin prisa.',
    // Nunca "dice" nada — el silencio es parte de su carácter — y su ritmo
    // de paseo es bastante más lento que el del resto.
    sonidos: [],
    atributos: { ritmo: 0.45 },
    paleta: { N: '#1c1e1d', A: '#2d481f', B: '#477930', C: '#6aa048' },
    grid: [
      '.......NNNNNN......',
      '......NBBBBBAAN....',
      'NNN..NBAABBBAABN...',
      'NCCNNBBABBAABBBBN..',
      'NCCNNBABBBABBBBBN..',
      'NCCNNBABBBAABBAANN.',
      'NCCCNABBBBAABBAAAA.',
      'NCCCCAAAAAAAAAAABBN',
      '.NNNCCCCCCCCCCCCNNN',
      '....NNNNNNNNNNNNNN.',
      '...NNCCNAAAAANCCNN.',
      '...NNCCNNNNNNNACCN.',
      '...NNCCN.....NCCCN.',
      '....NNNN......NNN..',
    ],
  },
]

export function obtenerMascota(id) {
  return MASCOTAS.find(m => m.id === id) || null
}

// Versión "silueta" de la paleta de cada mascota (todas sus letras
// apuntando a 'currentColor' en vez de su color real) — la usan Mascota.jsx
// (Tu colección) y Store.jsx para mostrar las mascotas que aún no son tuyas
// en gris, heredando el color de texto del tema. Se precalcula una sola vez
// aquí (paleta/grid son estáticos, nunca cambian) en vez de recomputarla con
// Object.fromEntries en cada render de cada página que las lista.
const PALETAS_SILUETA = new Map(
  MASCOTAS.map(m => [m.id, Object.fromEntries(Object.keys(m.paleta).map(c => [c, 'currentColor']))])
)

export function paletaSilueta(id) {
  return PALETAS_SILUETA.get(id)
}
