const lecturaEspanol = {
  id: 'espanol', // debe coincidir exactamente con el id en MATERIAS
  temas: [
    {
      id: 'morfologia-partes-oracion',
      titulo: 'Morfología y Partes de la Oración',
      subtemas: [
        {
          id: 'sustantivos',
          titulo: 'Funciones y tipos de sustantivos',
          conceptos: [
            'Común: nombra de forma genérica (perro, ciudad).',
            'Propio: nombra de forma específica (México, Ana).',
            'Concreto: se percibe con los sentidos (mesa, lluvia).',
            'Abstracto: no se percibe físicamente (amor, libertad).'
          ]
        },
        {
          id: 'pronombres',
          titulo: 'Funciones y tipos de pronombres',
          conceptos: [
            'Personales: yo, tú, él, nosotros...',
            'Posesivos: mío, tuyo, suyo...',
            'Demostrativos: este, ese, aquel...',
            'Relativos: que, quien, cuyo...'
          ]
        },
        {
          id: 'adjetivos',
          titulo: 'Funciones y tipos de adjetivos',
          conceptos: [
            'Calificativos: describen una cualidad (casa grande).',
            'Determinativos: limitan o precisan al sustantivo (este libro).',
            'Concuerdan en género y número con el sustantivo.'
          ]
        },
        {
          id: 'articulos',
          titulo: 'Funciones y tipos de artículos',
          conceptos: [
            'Determinados: el, la, los, las (algo específico).',
            'Indeterminados: un, una, unos, unas (algo no específico).'
          ]
        },
        {
          id: 'adverbios',
          titulo: 'Funciones y tipos de adverbios',
          conceptos: [
            'De modo: bien, mal, rápidamente.',
            'De tiempo: ayer, hoy, siempre.',
            'De lugar: aquí, allá, cerca.',
            'De cantidad: mucho, poco, demasiado.'
          ]
        },
        {
          id: 'preposiciones',
          titulo: 'Preposiciones',
          conceptos: [
            'Enlazan palabras dentro de la oración (a, ante, con, de, en, para, por...).',
            'No tienen significado propio, dependen del contexto.'
          ]
        },
        {
          id: 'conjunciones',
          titulo: 'Conjunciones',
          conceptos: [
            'Coordinantes: unen elementos del mismo nivel (y, o, pero).',
            'Subordinantes: introducen una cláusula dependiente (porque, aunque, si).'
          ]
        },
        {
          id: 'interjecciones',
          titulo: 'Interjecciones',
          conceptos: [
            'Expresan emociones o sensaciones de forma aislada (¡ay!, ¡oh!, ¡vaya!).',
            'No tienen función sintáctica dentro de la oración.'
          ]
        }
      ]
    },
    {
      id: 'el-verbo',
      titulo: 'El Verbo',
      subtemas: [
        {
          id: 'tiempos-verbales',
          titulo: 'Tiempos verbales',
          conceptos: [
            'Presente, pasado y futuro como ejes principales.',
            'Cada tiempo tiene formas simples y compuestas.'
          ]
        },
        {
          id: 'modos-verbales',
          titulo: 'Modos verbales',
          conceptos: [
            'Indicativo: expresa hechos reales o certeza.',
            'Subjuntivo: expresa duda, deseo o hipótesis.',
            'Imperativo: expresa orden o ruego.'
          ]
        }
      ]
    },
    {
      id: 'sintaxis-concordancia',
      titulo: 'Sintaxis y Concordancia',
      subtemas: [
        {
          id: 'sujeto-predicado',
          titulo: 'Sujeto y predicado',
          conceptos: [
            'Sujeto: quien realiza la acción del verbo.',
            'Predicado: lo que se dice del sujeto.'
          ]
        },
        {
          id: 'concordancia-genero-numero',
          titulo: 'Concordancia de género y número',
          conceptos: [
            'El sustantivo y sus modificadores deben coincidir en género y número.',
            'El verbo concuerda en número y persona con el sujeto.'
          ]
        }
      ]
    }
  ]
}

export default lecturaEspanol