// Las mascotas de "Mi Mascota" (ver pages/Mascota.jsx): criaturas de pixel
// art originales, sin calcar ningún personaje/mascota existente. Cada
// `grid` es una rejilla en texto plano para PixelArt.jsx: '.' es
// transparente, cualquier otra letra se busca en `paleta`. No todas miden
// lo mismo — PixelArt.jsx no asume un tamaño fijo, lee filas/columnas de
// cada grid.
//
// `tamanoRelativo` (opcional): cuántas celdas (columnas/filas, la mayor de
// las dos) "debería" tener esta mascota para verse de su tamaño pensado —
// por defecto es el tamaño real del `grid`, así que no hace falta
// declararlo mientras el grid se dibuje a la resolución "normal" de
// siempre. Solo se vuelve necesario si se rediseña el grid de una especie a
// MÁS resolución (más celdas = más detalle, ej. un grid de 46 columnas en
// vez de 23) y se quiere que siga viéndose (y colisionando, ver
// pages/Mascota.jsx) del mismo tamaño que antes: se le pone el tamaño
// ANTERIOR aquí (ver tamanoCeldaPixelArt más abajo), y el tamaño final en
// pantalla queda igual aunque el grid tenga el doble de detalle.
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
// propósito: una especie sin sonidos característicos simplemente no
// vocaliza nunca, eso también puede ser un rasgo suyo.
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
    // Junto con el perro (gratis), la mascota "de entrada": ultra accesible
    // a propósito, prácticamente el precio de un solo Snack Pack (ver
    // storeItems.js: ~9-10 monedas en promedio por unidad completada).
    precioCoins: 20,
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
    precioCoins: 80,
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
    precioCoins: 100,
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
    precioCoins: 240,
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
    id: 'cerdo',
    nombre: 'Cerdo',
    precioCoins: 160,
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
    precioCoins: 140,
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
    precioCoins: 120,
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
    precioCoins: 280,
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
    precioCoins: 200,
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
    id: 'jet-raptor',
    nombre: 'Raptor',
    // El más caro de las mascotas normales (no cosmético de tema): la
    // insignia de la colección, muy por encima del resto a propósito.
    precioCoins: 900,
    frase: 'Objetivo fijado.',
    sonidos: ['*postcombustion*', 'Misil fuera.', '*rugido grave*'],
    atributos: { ritmo: 2.8, ataque: 1.5 },
    // Grid a mucha más resolución que el resto (76×66) — tamanoRelativo lo
    // deja notoriamente más grande que las demás mascotas (a propósito, un
    // jet "se siente" más grande) sin que ocupe la pantalla entera ni su
    // hitbox de colisión (ver tamanoCeldaPixelArt) se salga de proporción.
    tamanoRelativo: 38,
    paleta: { N: '#070a12', O: '#141928', P: '#21283c', Q: '#313a52', R: '#485370', A: '#8d98ad', W: '#dce1ea' },
    grid: [
      '............................NNNOOONN........................................',
      '...........................NONOOOQQON.......................................',
      '..........................NOOOOPPQQQN.......................................',
      '.........................NOOOOPPPQQQN.......................................',
      '........................NOOOOPPPPPQQN.......................................',
      '.......................NOOOOPPPPPPPQN.......................................',
      '......................NOOOOPPPPPPRRN........................................',
      '.....................NOOOOOPPPPPRRN.........................................',
      '....................NOOOOOOPPPPPRRN.........................................',
      '....................NOOOOOPPPPPRRRN.........................................',
      '...................NOOOOOPPPPPPQRRN.........................................',
      '..................NOOOOOPPPPPPQQQN..........................................',
      '.................NOOOOOOPPPPPPQQQN..........................................',
      '................NOOOOOOPPPPPPPQQN...........................................',
      '...............NOOOOOOOPPPPPPPQQN...........................................',
      '.............NNOOOOOOOPPPPPPPQQQN...........................................',
      '...NNNN.....NROOOOOOOOPPPPPPPQQN............................................',
      '.NNPOONN....NOOOOOOOOOPPPPPPQQQN......NN....................................',
      'NRPPPONNNN.NOOOOOOOOOOPPPPPPRRQN.....NOON...................................',
      'RRPPPONOOONNOOOOOOOOOOPPPPPPRRN.....NOOOON..................................',
      'RRPPPNOOOOONNNOOOOOOOOPPPPPPOONN....NOOPPNN.................................',
      'OOPPNNOOOOONONNNOOOOOOPPPPPPOONNN...NOOPQQQN................................',
      'OONNNOOOOOOOOONNNNOOOOPPPPPPOONNNNNNOOOQQQOON...............................',
      'NNNNNNNNNNNNNNNNNNNOOOOOPPPPOOOONOOOOOOOOOOOON..............................',
      'NNNNNNNNNNNNNNNNNNNOOOOOOPPPPOOOOONNOOOOOOOONNNNNNNN........................',
      'NNNNNNNNNNNNNRRRRRPPPPOOPPPPPPPPPPNNNNNNNNNNNNNNNNNNN.......................',
      'NNNNNNNNNNNNNNRRRRPPPPPPPPPPPPPPPPPPPPPPPNPPPNNNNNNNON......................',
      '.NNNNNNNNNNNNNOOOOPPPPPPPPPPPPPPPPPPPPPPPPPPPPNNNNNOOON.....................',
      '.NQQAAAAANNNRROOOOPPPPPPPPPPPPPPPPPPPPPPPPPPPONNNNOOOOONNNNNNNNNNNNNNNNN....',
      '.NQQAAAAAOOORROPPPPPPPPPPPPPPPPPPPPPPPPPPOOOOONNNNNOOOOONNNNNNNNNNNNNAAANN..',
      '..NQAAAAANOOOOOPPPPPPPPPPPPPPPPPPPPPPPPOOOORRRRNNNPPPPPANPPPPPPPPPNNAAAAAAN.',
      '..NRNNNOONNNNOOOONNNNNNOOPPPPPPPPOOOOONNOOQRRRPPPPPPPPAAAPPAAPPPPPPOAWWWAWWN',
      '...NNNNOOONNOOPOOONNNNOOPPPPPPPPPPOOOOONPQQQQQPPPPPPPPWWWWAAWWPPPPOOWWWWWWWW',
      '...NOONOOOOOOOPPOONNNNPPPPPPPPPPPPPOOOOPPQQQQQPPPPPPPPWWWWAAWWWPPPOOWWWWWWWW',
      '..NAOOOONNNNNOOOONNNNNPPPPPPPPPPPPOOONNNNQQQQQQPPPPPPPPPPPNNWWPPPPOOWWWWAWWW',
      '.NRAAAAANNNNNOOOOOOONNPPPPPPPPPPPPPPPNNNNNNNNQNNNNPPPPPPPPNNNPPPPPONNWWAAAWN',
      '.NRRAAAAANQQQQOPPPORRQPPPPPPPPPPPPPPPPPPPNNNNNNNNNOOOOOOONNNNOOOOONNNOOOANN.',
      '.NRRAAAAAQQNNQPPPPPRQQPPPPPPPPPPPPPPPPPPPPNNNNNNNNNOOOOOOOOOOOOOOONNNOONN...',
      'NNNNQQQNNNNNNNPPPPPPPPPPPPPPPPPPPPPPRQQQQPQQPPOOOOOOOONNNNNNNNNNNNNNNNN.....',
      'NNNNQQPNNNNNNNRPPPPPPPPPPRPPPPPPPPPRRRQQQQQNPOOOOOOOON......................',
      'NNNNNNPPNNNNNRRRPPPPPPPPRRRPPPPPPPNNNNNNNNNNNNNOOOOON.......................',
      'NNNNNNNNNNNNNNNNNNNOOOPPPPPPPOOPOONNNNNONNNONNNNNNNN........................',
      'NNNNNNNNNNNNNNNNNNNOOOOPPPPPOOOOOOOOOOOOOOOOON..............................',
      'NNPNNNOOOOOOOONNNNOOOOPPPPPPOOOOOONNOPPPPQOON...............................',
      'NPPPNNOOOOOOONNNOOOOOOPPPPPPOOOONN.NOOPPQQQN................................',
      'RRPPPNOOOONNNNOOOOOOOOPPPPPPOONN....NOPPQQN.................................',
      'RRRPPNNOOOONNOOOOOOOOOPPPPPPOON.....NOOOON..................................',
      'NRRPPNNNNNNNOOOOOOOOOOPPPPPPPQQN.....NNON...................................',
      '.NRPPNNN....NOOOOOOOOOPPPPPPPQQN.......N....................................',
      '..NPPNN.....NOOOOOOOOPPPPPPPPQQPN...........................................',
      '...NN........NOOOOOOOOPPPPPPPQPPN...........................................',
      '..............NOOOOOOOOPPPPPPQQQN...........................................',
      '...............NOOOOOOOPPPPPPPQQN...........................................',
      '................NOOOOOOOPPPPPPPQQN..........................................',
      '.................NOOOOOOPPPPPPPRRN..........................................',
      '..................NOOOOOOPPPPPPRRRN.........................................',
      '...................NOOOOOOPPPPPPRRN.........................................',
      '....................NOOOOOPPPPPPRRN.........................................',
      '.....................NOOOOOPPPPPRRRN........................................',
      '......................NOOOOPPPPPPRRN........................................',
      '.......................NOOOOPPPPQRRN........................................',
      '........................NOOOOPPPQQQN........................................',
      '........................NOOOOOPPPQQRN.......................................',
      '.........................NOOOOOPPQRRN.......................................',
      '..........................NOOOOPPRRON.......................................',
      '...........................NOOOPPROON.......................................',
    ],
  },
  {
    id: 'jet-lightning',
    nombre: 'Lightning',
    precioCoins: 600,
    frase: 'Cielo despejado.',
    sonidos: ['*rugido de turbina*', 'Fiuuum...', '*boom sonico*'],
    atributos: { ritmo: 3.6, sigilo: 1.3 },
    // Mismo criterio de tamaño que jet-raptor (ver comentario ahí) — grid a
    // 64×58, normalizado a la misma referencia para que ambos jets se vean
    // del mismo porte al compararlos.
    tamanoRelativo: 28,
    paleta: { N: '#2b2833', O: '#4a4657', M: '#4d597a', D: '#948b99', C: '#b3aab6', B: '#cdc6d1', G: '#d9bf3f', H: '#f2e07a' },
    grid: [
      '.................NMOOOOODN......................................',
      '.................NOOOCOOON......................................',
      '................NCOCCCCCON......................................',
      '................NCCCCCCCOON.....................................',
      '................NCCCCDCCOOON....................................',
      '................NDBBDDDBDDDN....................................',
      '...............NDDBBDDBBDDDDN...................................',
      '...............NDDBBDDBBDDDDN...................................',
      '...............NDDBBDBBBBDDDDN..................................',
      '...............NDDBDDBBBBBDDDN..................................',
      '...NN..........NDDBDDBBBBBDDDDN.................................',
      '..NDDNN.......NOOBBDDBBBBBDDDDN.................................',
      '.NDDDBBN......NOOBBDDBBBBBBBDDDN................................',
      '.NDDDBBBN.....NOOBBDBBBBBBBBDDDN................................',
      'NDDDCBBBN.....NOOBBDBBBBBBBBDDDDN...............................',
      'NOOCCBBBBN....NDBBBDBBBBBBBBBDDDN...............................',
      'NOOCCCBBON...NBDDBBDBBBBBBBBBDDDDN..............................',
      'NOCCCCBBOON...NDBBBDBBBBBBBBBBDDDN..............................',
      'NMMCCCOOOONN.NDDBBDBBBBBBBBBBBDDDDN.............................',
      'NMCCCCOMOOOONNDDBBDBBBBBBBBBBBDDDDN.............................',
      'NCCCCCMMMMMMMNDCCCDBBBBBBBBBBBBDDDDNNNNNNNNNN...................',
      'CCCCCCMMMMMMMDDCCDBBBBBBBBBBBBBDDDOOOMMCCCCCCNN.................',
      'DCCCCCDMMMMMMDDCDDBBBBBBBBBBBBBBDDOOOOMCCCCCCDDN................',
      'DDCCCDDDDDDMMDDCCDBBBBBBBBBBBDDDDDDDDDDDDNCNNDDDNNNN............',
      'DDDDDDDDDDDDDDDDDDDDBCCCCCCDDDDDDDDDDDDDDNNNNODDDDDONNNNN.......',
      'NNDDDDDOOOOOODDDDDDDCCCCCCCCDDCCCCDDCCCCDDNOOOOODDDOOOOOONNNN...',
      '..NNNNOOOOOOOBBCCCCCCCCCCCCCBDCCCCBDDCCCCBDDOOOGGGHOHHOOOOOODN..',
      '.....NOOOBBBBBBBBBBBBBBBBBBBBDBBBBBDDBBBBBBDOOGGGGHHHHHOOOOBDDNN',
      '....NOOOBBBBBBBBBBBBBBBBBBBBBDBBBBBDDBBBBBBBHHGGGHHHGGGHOOBBBDDD',
      '....NOOOBBBBBBBBBBBBBBBBBBBBBDDDDDDDDBBBBBBBHHGGHHHHHGHHOOBBBDDD',
      '....NOODDBBBBBBBBBBBBBBBBBBBBDBBBBBDDBBBBBBBHHHHHHHHHHHOODDDDDDN',
      '..NNNNOODDOOOBBBCCCBBBBBBBBBBBBBBBBDDBBBBBBOOOHHHHOHHHDOODDDDNN.',
      'NNOOOOOOOOOOOMMOOCCCCCCCCCCDDDDDBBDDDDDDDDDOOOOOOOOOHDDDONNNN...',
      'ODOOOODDDDOOOMMOCCCBCCCCCCDDDDDDOOODDDDDOOOOOOOOOOOONNNNN.......',
      'DDCCCDDDDMMMCCCCCCBBBBBBBBDDDDOOOOOOOOOODDDDDDOONNNN............',
      'DDCCCCOOMMMMMCCDDDBBBBBBBBBBBBBBOOOOODDDDDDDDDDN................',
      'DDCCCCOMMMMMMMDDDDBBBBBBBBBBBBBDDDDODDDDDDDDDNN.................',
      'DDCCCMMMMMOOOMDDCCDBBBBBBBBBBBBDDDDOONNNNNNNN...................',
      'NDDCCMMMMMOONNDCCBDBBBBBBBBBBBBDDDNNN...........................',
      'NDDCCCMMMMNN.NODBBDBBBBBBBBBBBDDDDN.............................',
      'NCCCCCBBBDN...NOBBDDBBBBBBBBBBDDDN..............................',
      'NCCCCCBBDDN...NOBBDDBBBBBBBBBDDDN...............................',
      'NCCCCBBDDN...NBOOBDDBBBBBBBBBDDDN...............................',
      'NCCCCBBDN.....NOOBBDBBBBBBBBDDDDN...............................',
      '.NCCCCCDN.....NOOBBDBBBBBBBBDDDN................................',
      '.NCCCCCN......NOOBBDDBBBBBBBDDDN................................',
      '..NCCCN.......NCOBBDDBBBBBBDDDN.................................',
      '...NNN........NODBBDDBBBBBCDDN..................................',
      '...............NDDBDDBBBBBCCDN..................................',
      '...............NDDBBDBBBBDDDDN..................................',
      '...............NDDBBDBBBBDDDN...................................',
      '...............NDDBBDBBBDDDDN...................................',
      '................NDBBDCBBDDDN....................................',
      '................NBBBDCCDDDDN....................................',
      '................NBBBBCCCDDN.....................................',
      '................NBBBBCCCDN......................................',
      '.................NBBBOCOON......................................',
      '.................NBBOOOON.......................................',
    ],
  },
]

export function obtenerMascota(id) {
  return MASCOTAS.find(m => m.id === id) || null
}

// Tamaño de celda (el `size` que espera PixelArt.jsx) que mantiene a esta
// mascota en su tamaño de diseño (`tamanoRelativo`, o el tamaño real del
// grid si no se declaró) sin importar cuántas celdas tenga su `grid` de
// verdad. `basePx` es el tamaño de celda "normal" que ya usaba cada
// pantalla (Mascota.jsx: TAMANO_PX = 2.25, MascotaCompanera.jsx:
// TAMANO_PX = 3, colección/Tienda: 4) — se reduce en la misma proporción en
// que el grid creció, así redibujar una mascota con más celdas (más
// detalle) no la hace verse ni colisionar más grande.
export function tamanoCeldaPixelArt(mascota, basePx) {
  const columnas = mascota.grid[0]?.length || 1
  const filas = mascota.grid.length
  const maxDim = Math.max(columnas, filas)
  const referencia = mascota.tamanoRelativo || maxDim
  return basePx * (referencia / maxDim)
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