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
        },
        {
          id: 'tipos-oraciones',
          titulo: 'Tipos de oraciones',
          conceptos: [
            'Simples: tienen un solo verbo conjugado (Juan come manzanas).',
            'Compuestas: tienen dos o más verbos conjugados unidos por un conector (Juan come y Pedro estudia).',
            'Coordinadas: unen ideas de igual jerarquía (y, o, pero).',
            'Subordinadas: una cláusula depende de otra (aunque, porque, cuando).'
          ]
        }
      ]
    },
    {
      id: 'ortografia-acentuacion',
      titulo: 'Ortografía y Acentuación',
      subtemas: [
        {
          id: 'clasificacion-por-acento',
          titulo: 'Clasificación de palabras según el acento',
          conceptos: [
            'Agudas: acento en la última sílaba; llevan tilde si terminan en n, s o vocal (jardín, camión).',
            'Graves o llanas: acento en la penúltima sílaba; llevan tilde si NO terminan en n, s o vocal (árbol, fácil).',
            'Esdrújulas: acento en la antepenúltima sílaba; siempre llevan tilde (teléfono, música).',
            'Sobresdrújulas: acento antes de la antepenúltima sílaba; siempre llevan tilde (dígamelo).'
          ]
        },
        {
          id: 'tilde-diacritica',
          titulo: 'Tilde diacrítica',
          conceptos: [
            'Distingue palabras que se escriben igual pero tienen función distinta.',
            'Sé (verbo saber/ser) vs se (pronombre).',
            'Qué, cuál, cómo, cuándo (interrogativos/exclamativos) vs que, cual, como, cuando (relativos).',
            'Más (cantidad) vs mas (conjunción "pero").'
          ]
        },
        {
          id: 'homofonos-comunes',
          titulo: 'Homófonos y usos frecuentes',
          conceptos: [
            'Haber (verbo auxiliar/existir) vs a ver (preposición + infinitivo).',
            'Halla (del verbo hallar) vs allá (lugar) vs aya (niñera).',
            'Vaca (animal) vs baca (portaequipaje).',
            'Bello (hermoso) vs vello (pelo corporal).'
          ]
        },
        {
          id: 'uso-mayusculas',
          titulo: 'Uso de mayúsculas',
          conceptos: [
            'Al inicio de un texto y después de punto.',
            'En nombres propios de personas, lugares e instituciones.',
            'En siglas y acrónimos (ONU, UNESCO).'
          ]
        }
      ]
    },
    {
      id: 'puntuacion',
      titulo: 'Signos de Puntuación',
      subtemas: [
        {
          id: 'coma',
          titulo: 'La coma',
          conceptos: [
            'Separa elementos de una enumeración (manzanas, peras y uvas).',
            'Aísla aposiciones y aclaraciones (Juan, mi vecino, llegó tarde).',
            'Se usa antes de conectores como "sin embargo" o "por lo tanto".'
          ]
        },
        {
          id: 'punto-y-coma',
          titulo: 'El punto y coma',
          conceptos: [
            'Separa elementos de una lista que ya contienen comas internas.',
            'Une oraciones relacionadas sin necesidad de una conjunción.'
          ]
        },
        {
          id: 'dos-puntos',
          titulo: 'Los dos puntos',
          conceptos: [
            'Introducen una enumeración, una cita o una explicación.',
            'Se usan después del saludo en cartas o correos formales.'
          ]
        }
      ]
    },
    {
      id: 'semantica-vocabulario',
      titulo: 'Semántica y Vocabulario',
      subtemas: [
        {
          id: 'sinonimos-antonimos',
          titulo: 'Sinónimos y antónimos',
          conceptos: [
            'Sinónimos: palabras con significado similar (feliz - contento).',
            'Antónimos: palabras con significado opuesto (generoso - avaro).'
          ]
        },
        {
          id: 'denotacion-connotacion',
          titulo: 'Denotación y connotación',
          conceptos: [
            'Denotación: significado literal y objetivo de una palabra.',
            'Connotación: significado subjetivo o simbólico asociado a una palabra.'
          ]
        },
        {
          id: 'vicios-del-lenguaje',
          titulo: 'Vicios del lenguaje',
          conceptos: [
            'Pleonasmo: redundancia innecesaria ("subir para arriba").',
            'Barbarismo: uso incorrecto de palabras o extranjerismos innecesarios.',
            'Cacofonía: repetición de sonidos que produce un efecto desagradable.',
            'Ambigüedad: falta de claridad que permite más de una interpretación.'
          ]
        }
      ]
    },
    {
      id: 'cohesion-textual',
      titulo: 'Cohesión y Conectores Textuales',
      subtemas: [
        {
          id: 'conectores-logicos',
          titulo: 'Tipos de conectores',
          conceptos: [
            'Causales: expresan causa (porque, ya que, debido a).',
            'Consecutivos: expresan consecuencia (por lo tanto, así que).',
            'Adversativos: expresan contraste (sin embargo, pero, no obstante).',
            'Concesivos: expresan una objeción parcial (aunque, a pesar de que).'
          ]
        }
      ]
    },
    {
      id: 'tipologia-textual',
      titulo: 'Tipología Textual',
      subtemas: [
        {
          id: 'tipos-de-texto',
          titulo: 'Tipos de texto según su propósito',
          conceptos: [
            'Narrativo: cuenta hechos en orden cronológico (cuentos, novelas).',
            'Descriptivo: detalla características de personas, lugares u objetos.',
            'Argumentativo: defiende una opinión con razones y evidencias.',
            'Expositivo/informativo: presenta datos de forma objetiva.'
          ]
        }
      ]
    },
    {
      id: 'figuras-literarias',
      titulo: 'Figuras Literarias',
      subtemas: [
        {
          id: 'figuras-comunes',
          titulo: 'Figuras retóricas frecuentes',
          conceptos: [
            'Símil o comparación: compara usando "como" (sus ojos son como estrellas).',
            'Metáfora: identifica dos elementos sin usar "como" (el tiempo es oro).',
            'Hipérbole: exagera una idea (lloré un mar de lágrimas).',
            'Personificación: da cualidades humanas a algo que no lo es (el viento susurraba).'
          ]
        }
      ]
    },
    {
      id: 'comprension-lectora',
      titulo: 'Comprensión de Lectura',
      subtemas: [
        {
          id: 'estrategias-lectura',
          titulo: 'Estrategias para identificar ideas',
          conceptos: [
            'Idea principal: el mensaje central que el autor quiere comunicar.',
            'Ideas secundarias: detalles que apoyan o complementan la idea principal.',
            'Inferencia: información que no está explícita pero se deduce del texto.',
            'Propósito del autor: informar, narrar, describir, persuadir o entretener.'
          ]
        }
      ]
    }
  ]
}

export default lecturaEspanol