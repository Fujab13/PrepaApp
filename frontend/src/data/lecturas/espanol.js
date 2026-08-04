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
          id: 'conjugacion-verbal',
          titulo: 'Conjugación verbal',
          conceptos: [
            'Conjugar es cambiar la forma del verbo según persona, número, tiempo y modo.',
            'En español hay tres conjugaciones según su terminación: -ar (amar), -er (temer), -ir (partir).'
          ]
        },
        {
          id: 'persona-numero',
          titulo: 'Persona y número',
          conceptos: [
            'Persona: 1ª (yo/nosotros), 2ª (tú/ustedes), 3ª (él/ellos).',
            'Número: singular (una sola persona/cosa) o plural (varias).',
            'El verbo debe coincidir siempre en persona y número con su sujeto.'
          ]
        },
        {
          id: 'tiempos-verbales',
          titulo: 'Tiempos verbales',
          conceptos: [
            'Presente, pasado y futuro como ejes principales.',
            'Cada tiempo tiene formas simples (como) y compuestas (he comido).',
            'El pretérito imperfecto narra acciones habituales o continuas en el pasado ("jugaba todos los días").'
          ]
        },
        {
          id: 'modos-verbales',
          titulo: 'Modos verbales',
          conceptos: [
            'Indicativo: expresa hechos reales o certeza.',
            'Subjuntivo: expresa duda, deseo o hipótesis ("ojalá llueva").',
            'Imperativo: expresa orden o ruego ("¡cierra la puerta!").'
          ]
        },
        {
          id: 'voz-activa-pasiva',
          titulo: 'Voz activa y voz pasiva',
          conceptos: [
            'Activa: el sujeto realiza la acción ("los niños comieron el pastel").',
            'Pasiva: el sujeto la recibe ("el pastel fue comido por los niños").'
          ]
        },
        {
          id: 'verbos-regulares-irregulares',
          titulo: 'Verbos regulares e irregulares',
          conceptos: [
            'Regulares: siguen el patrón normal de su conjugación (cantar, comer).',
            'Irregulares: cambian su raíz o terminación de forma especial (tener → tengo, tuve).'
          ]
        },
        {
          id: 'perifrasis-verbales',
          titulo: 'Perífrasis verbales',
          conceptos: [
            'Combinan un verbo auxiliar + verbo principal para matizar el significado.',
            'De futuro próximo: "voy a estudiar". De acción en progreso: "estoy leyendo". De obligación: "tengo que terminar".'
          ]
        }
      ]
    },
    {
      id: 'sintaxis-concordancia',
      titulo: 'Sintaxis y Concordancia',
      subtemas: [
        {
          id: 'concordancia-nominal',
          titulo: 'Concordancia nominal (género y número)',
          conceptos: [
            'El sustantivo y sus modificadores (artículos, adjetivos) deben coincidir en género y número.',
            'Ejemplo correcto: "las casas blancas"; incorrecto: "las casa blanco".'
          ]
        },
        {
          id: 'concordancia-verbal',
          titulo: 'Concordancia verbal (sujeto y verbo)',
          conceptos: [
            'El verbo debe concordar con el sujeto en persona y número.',
            'Con sujetos compuestos ("Juan y Pedro"), el verbo va siempre en plural.'
          ]
        },
        {
          id: 'sujeto',
          titulo: 'Sujeto',
          conceptos: [
            'Es quien realiza (o recibe, en voz pasiva) la acción del verbo.',
            'Puede ser tácito o elíptico: no aparece escrito, pero se identifica por la terminación del verbo ("Llegamos tarde" = nosotros).'
          ]
        },
        {
          id: 'predicado',
          titulo: 'Predicado',
          conceptos: [
            'Es todo lo que se dice del sujeto; siempre contiene el verbo conjugado.',
            'Se identifica preguntando "¿qué hace o qué le pasa al sujeto?".'
          ]
        },
        {
          id: 'complemento-directo',
          titulo: 'Complemento directo',
          conceptos: [
            'Recibe directamente la acción del verbo ("compré un libro").',
            'Se puede sustituir por lo, la, los, las ("lo compré").'
          ]
        },
        {
          id: 'complemento-indirecto',
          titulo: 'Complemento indirecto',
          conceptos: [
            'Indica quién recibe el beneficio o daño de la acción ("le regalé flores a mi madre").',
            'Se puede sustituir por le o les.'
          ]
        },
        {
          id: 'complemento-circunstancial',
          titulo: 'Complemento circunstancial',
          conceptos: [
            'Añade información sobre modo, tiempo, lugar, causa, etc. ("viajamos a la playa en verano").',
            'Puede haber varios en una misma oración, cada uno respondiendo una pregunta distinta (¿cuándo?, ¿dónde?, ¿cómo?).'
          ]
        },
        {
          id: 'atributo',
          titulo: 'Atributo',
          conceptos: [
            'Acompaña a verbos copulativos (ser, estar, parecer) y describe una cualidad del sujeto ("el cielo está nublado").'
          ]
        },
        {
          id: 'predicativo',
          titulo: 'Predicativo',
          conceptos: [
            'Se parece al atributo, pero acompaña a verbos NO copulativos ("los niños llegaron cansados").',
            'Describe al sujeto (o al complemento directo) al mismo tiempo que ocurre la acción.'
          ]
        }
      ]
    },
    {
      id: 'tipos-de-oracion',
      titulo: 'Tipos de Oración',
      subtemas: [
        {
          id: 'oraciones-simples',
          titulo: 'Oraciones simples',
          conceptos: [
            'Tienen un solo verbo conjugado ("el niño juega en el parque").'
          ]
        },
        {
          id: 'oraciones-compuestas',
          titulo: 'Oraciones compuestas',
          conceptos: [
            'Tienen dos o más verbos conjugados unidos por un conector ("el niño juega y su hermana estudia").'
          ]
        },
        {
          id: 'coordinadas',
          titulo: 'Coordinadas',
          conceptos: [
            'Unen dos cláusulas del mismo nivel de importancia, sin que una dependa de la otra (y, o, pero).'
          ]
        },
        {
          id: 'subordinadas',
          titulo: 'Subordinadas',
          conceptos: [
            'Una cláusula depende gramaticalmente de otra, la principal ("espero que estudies mucho").'
          ]
        },
        {
          id: 'enunciativas',
          titulo: 'Enunciativas',
          conceptos: [
            'Afirman o niegan un hecho de forma objetiva; se dividen en afirmativas y negativas.'
          ]
        },
        {
          id: 'interrogativas',
          titulo: 'Interrogativas',
          conceptos: [
            'Formulan una pregunta, directa ("¿vendrás?") o indirecta ("no sé si vendrás").'
          ]
        },
        {
          id: 'exclamativas',
          titulo: 'Exclamativas',
          conceptos: [
            'Expresan sorpresa, alegría u otra emoción intensa ("¡qué hermoso paisaje!").'
          ]
        },
        {
          id: 'exhortativas',
          titulo: 'Exhortativas',
          conceptos: [
            'Dan órdenes, ruegos o consejos ("cierra la ventana, por favor").'
          ]
        },
        {
          id: 'dubitativas',
          titulo: 'Dubitativas',
          conceptos: [
            'Expresan duda o probabilidad ("quizás llueva mañana").'
          ]
        },
        {
          id: 'desiderativas',
          titulo: 'Desiderativas',
          conceptos: [
            'Expresan un deseo, muchas veces con "ojalá" ("ojalá apruebe el examen").'
          ]
        }
      ]
    },
    {
      id: 'redaccion-indirecta',
      titulo: 'Redacción Indirecta',
      subtemas: [
        {
          id: 'correccion-gramatical',
          titulo: 'Corrección gramatical de oraciones',
          conceptos: [
            'Revisa siempre concordancia, tiempos verbales y uso correcto de pronombres antes de dar por buena una oración.'
          ]
        },
        {
          id: 'correccion-sintactica',
          titulo: 'Corrección de errores sintácticos',
          conceptos: [
            'Verifica que cada oración tenga sujeto y predicado claros, sin elementos sobrando o faltando.'
          ]
        },
        {
          id: 'orden-logico-palabras',
          titulo: 'Orden lógico de palabras',
          conceptos: [
            'El orden natural en español es sujeto + verbo + complementos; alterarlo sin razón genera confusión.'
          ]
        },
        {
          id: 'precision-lexica-redaccion',
          titulo: 'Precisión léxica',
          conceptos: [
            'Elige la palabra más exacta para la idea que quieres comunicar, evitando términos vagos como "cosa" o "algo".'
          ]
        },
        {
          id: 'seleccion-palabra-adecuada',
          titulo: 'Selección de la palabra adecuada',
          conceptos: [
            'Considera el contexto, el registro (formal/informal) y el destinatario antes de elegir una palabra.'
          ]
        },
        {
          id: 'reescritura-oraciones',
          titulo: 'Reescritura de oraciones',
          conceptos: [
            'Reescribir para mejorar claridad no significa cambiar el significado original, solo su forma.'
          ]
        }
      ]
    },
    {
      id: 'vicios-del-lenguaje',
      titulo: 'Vicios del Lenguaje',
      subtemas: [
        {
          id: 'solecismos',
          titulo: 'Solecismos',
          conceptos: [
            'Errores que rompen las reglas de construcción sintáctica.',
            'Clásico ejemplo: pluralizar el "haber" impersonal ("habían muchas personas" en vez de "había muchas personas").'
          ]
        },
        {
          id: 'pleonasmos',
          titulo: 'Pleonasmos',
          conceptos: [
            'Redundancia innecesaria de palabras ("subir para arriba", "entrar para adentro").'
          ]
        },
        {
          id: 'cacofonias',
          titulo: 'Cacofonías',
          conceptos: [
            'Repetición de sonidos que produce un efecto desagradable al oído ("Ana anda con Ana a Ancón").'
          ]
        },
        {
          id: 'barbarismos',
          titulo: 'Barbarismos',
          conceptos: [
            'Uso incorrecto de una palabra, por mala pronunciación, escritura o extranjerismo innecesario ("haiga" en vez de "haya").'
          ]
        },
        {
          id: 'dequeismo',
          titulo: 'Dequeísmo',
          conceptos: [
            'Usar "de que" cuando la construcción no lo requiere ("pienso de que tienes razón" en vez de "pienso que...").'
          ]
        },
        {
          id: 'queismo',
          titulo: 'Queísmo',
          conceptos: [
            'Omitir la preposición "de" cuando sí se requiere ("me acuerdo que fuimos" en vez de "me acuerdo DE que fuimos").'
          ]
        },
        {
          id: 'anfibologia',
          titulo: 'Anfibología',
          conceptos: [
            'Ambigüedad en el significado de una oración por su construcción ("vi al hombre con el telescopio": ¿quién tenía el telescopio?).'
          ]
        },
        {
          id: 'muletillas',
          titulo: 'Muletillas',
          conceptos: [
            'Palabras o frases repetidas por costumbre al hablar, sin aportar significado ("o sea", "este...").'
          ]
        }
      ]
    },
    {
      id: 'acentuacion',
      titulo: 'Acentuación',
      subtemas: [
        {
          id: 'division-silabica',
          titulo: 'División silábica',
          conceptos: [
            'Toda palabra se separa en sílabas según sus vocales: cada sílaba necesita al menos una.',
            'Dominar la división en sílabas es el primer paso para clasificar el acento correctamente.'
          ]
        },
        {
          id: 'diptongos',
          titulo: 'Diptongos',
          conceptos: [
            'Unión de una vocal fuerte (a, e, o) y una débil (i, u), o de dos débiles, en la misma sílaba ("aire", "ciudad").'
          ]
        },
        {
          id: 'hiatos',
          titulo: 'Hiatos',
          conceptos: [
            'Dos vocales juntas que se pronuncian en sílabas distintas, no forman diptongo ("po-e-ta", "ma-í-z").'
          ]
        },
        {
          id: 'triptongos',
          titulo: 'Triptongos',
          conceptos: [
            'Unión de tres vocales (débil-fuerte-débil) en una sola sílaba ("buey", "estudiáis").'
          ]
        },
        {
          id: 'palabras-agudas',
          titulo: 'Palabras agudas',
          conceptos: [
            'Llevan el acento en la última sílaba.',
            'Llevan tilde solo si terminan en N, S o vocal (canción, compás, sofá).'
          ]
        },
        {
          id: 'palabras-graves',
          titulo: 'Palabras graves',
          conceptos: [
            'Llevan el acento en la penúltima sílaba (también llamadas llanas).',
            'Llevan tilde solo si NO terminan en N, S o vocal (árbol, fácil, azúcar).'
          ]
        },
        {
          id: 'palabras-esdrujulas',
          titulo: 'Palabras esdrújulas',
          conceptos: [
            'Llevan el acento en la antepenúltima sílaba.',
            'Siempre, sin excepción, llevan tilde (médico, música, teléfono).'
          ]
        },
        {
          id: 'palabras-sobresdrujulas',
          titulo: 'Palabras sobresdrújulas',
          conceptos: [
            'El acento cae antes de la antepenúltima sílaba, casi siempre al añadir pronombres a un verbo.',
            'Siempre llevan tilde (cuéntaselo, repítemelo).'
          ]
        },
        {
          id: 'acento-diacritico',
          titulo: 'Acento diacrítico',
          conceptos: [
            'Distingue palabras que se escriben igual pero cumplen funciones distintas.',
            'Sé (verbo) vs se (pronombre); más (cantidad) vs mas (conjunción "pero"); él (pronombre) vs el (artículo).'
          ]
        },
        {
          id: 'acento-enfatico',
          titulo: 'Acento enfático',
          conceptos: [
            'Se usa en palabras como qué, cómo, dónde, cuándo cuando introducen una pregunta o exclamación (directa o indirecta).',
            'Ejemplo: "no sé cómo llegar" (enfático) frente a "llegué como pude" (sin tilde).'
          ]
        }
      ]
    },
    {
      id: 'uso-grafias',
      titulo: 'Uso Correcto de Grafías',
      subtemas: [
        {
          id: 'grafia-b-v',
          titulo: 'B y V',
          conceptos: [
            'Se escribe con B tras M y antes de otra consonante (bicicleta, absolver).',
            'Se escribe con V después de N y en los adjetivos terminados en -ava, -ave, -avo (nuevo, octava).'
          ]
        },
        {
          id: 'grafia-c-s-z',
          titulo: 'C, S y Z',
          conceptos: [
            'La C suena suave ante E, I (cielo); la Z suele usarse ante A, O, U (zapato).',
            'Muchas confusiones vienen del seseo regional: cuando dudes, verifica la palabra en el diccionario.'
          ]
        },
        {
          id: 'grafia-g-j',
          titulo: 'G y J',
          conceptos: [
            'La G ante E, I suena como J (general), por eso se confunden tanto al escribir.',
            'La J siempre mantiene el mismo sonido fuerte en cualquier posición (jirafa, reloj).'
          ]
        },
        {
          id: 'grafia-ll-y',
          titulo: 'LL y Y',
          conceptos: [
            'En la mayoría del español actual, LL y Y suenan igual (yeísmo), lo que provoca errores frecuentes.',
            'Cuando dudes entre ambas, recurre a la familia de palabras o al diccionario (lluvia, no "yuvia").'
          ]
        },
        {
          id: 'grafia-h',
          titulo: 'H',
          conceptos: [
            'Es una letra muda en español: no representa ningún sonido, pero su ortografía es obligatoria (hormiga, hospital).'
          ]
        },
        {
          id: 'grafia-x',
          titulo: 'X',
          conceptos: [
            'Suena como "cs" en la mayoría de los casos (examen, exacto).',
            'En algunas palabras de origen indígena suena como J (México, Oaxaca).'
          ]
        },
        {
          id: 'grafia-r-rr',
          titulo: 'R y RR',
          conceptos: [
            'RR (sonido fuerte) se usa solo entre vocales (carro, perro).',
            'R suena fuerte también al inicio de palabra o tras N, L, S, aunque se escriba sencilla (rosa, alrededor).'
          ]
        },
        {
          id: 'grafia-m-antes-p-b',
          titulo: 'M antes de P y B',
          conceptos: [
            'Antes de P y B siempre se escribe M, nunca N (tambor, campo, también).'
          ]
        }
      ]
    },
    {
      id: 'mayusculas-minusculas',
      titulo: 'Mayúsculas y Minúsculas',
      subtemas: [
        {
          id: 'reglas-generales-mayusculas',
          titulo: 'Reglas generales',
          conceptos: [
            'Se escribe con mayúscula la primera palabra de un texto y la que sigue a un punto.'
          ]
        },
        {
          id: 'nombres-propios',
          titulo: 'Nombres propios',
          conceptos: [
            'Siempre van con mayúscula inicial, sin importar dónde aparezcan en la oración (Ana, México, Amazonas).'
          ]
        },
        {
          id: 'instituciones',
          titulo: 'Instituciones',
          conceptos: [
            'Los nombres de instituciones llevan mayúscula en sus palabras principales (Universidad Nacional Autónoma de México).'
          ]
        },
        {
          id: 'titulos',
          titulo: 'Títulos',
          conceptos: [
            'En títulos de obras, solo la primera palabra y los nombres propios llevan mayúscula ("Cien años de soledad").'
          ]
        },
        {
          id: 'abreviaturas',
          titulo: 'Abreviaturas',
          conceptos: [
            'Las abreviaturas de tratamiento se escriben con mayúscula inicial y punto final (Sr., Dr., Lic.).'
          ]
        }
      ]
    },
    {
      id: 'signos-puntuacion',
      titulo: 'Signos de Puntuación',
      subtemas: [
        {
          id: 'punto',
          titulo: 'Punto',
          conceptos: [
            'El punto y seguido separa oraciones de un mismo párrafo; el punto y aparte, párrafos distintos.'
          ]
        },
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
        },
        {
          id: 'puntos-suspensivos',
          titulo: 'Puntos suspensivos',
          conceptos: [
            'Indican una pausa, duda, o que el enunciado queda incompleto de forma intencional.'
          ]
        },
        {
          id: 'signos-interrogacion',
          titulo: 'Signos de interrogación',
          conceptos: [
            'En español se usan de apertura y cierre: ¿...? (a diferencia del inglés, que solo usa el de cierre).'
          ]
        },
        {
          id: 'signos-exclamacion',
          titulo: 'Signos de exclamación',
          conceptos: [
            'También llevan apertura y cierre: ¡...!, y expresan sorpresa, alegría u otra emoción intensa.'
          ]
        },
        {
          id: 'parentesis',
          titulo: 'Paréntesis',
          conceptos: [
            'Se usan para insertar información aclaratoria o adicional que no rompe la idea principal.'
          ]
        },
        {
          id: 'corchetes',
          titulo: 'Corchetes',
          conceptos: [
            'Se usan para aclarar algo dentro de un texto que ya está entre paréntesis, o para señalar una omisión ([...]).'
          ]
        },
        {
          id: 'comillas',
          titulo: 'Comillas',
          conceptos: [
            'Se usan para citar textualmente las palabras de alguien o señalar un uso especial de una palabra.'
          ]
        },
        {
          id: 'guion',
          titulo: 'Guion',
          conceptos: [
            'El guion corto une palabras compuestas o divide una palabra al final de un renglón.'
          ]
        },
        {
          id: 'raya',
          titulo: 'Raya',
          conceptos: [
            'La raya (guion largo) introduce un diálogo o un inciso aclaratorio dentro de una oración.'
          ]
        }
      ]
    },
    {
      id: 'relaciones-semanticas',
      titulo: 'Relaciones Semánticas',
      subtemas: [
        {
          id: 'sinonimos',
          titulo: 'Sinónimos',
          conceptos: [
            'Palabras con significado similar (feliz - contento).',
            'Rara vez son 100% intercambiables: el contexto decide cuál suena mejor.'
          ]
        },
        {
          id: 'antonimos',
          titulo: 'Antónimos',
          conceptos: [
            'Palabras con significado opuesto (generoso - avaro).'
          ]
        },
        {
          id: 'homonimos',
          titulo: 'Homónimos',
          conceptos: [
            'Palabras que se pronuncian o escriben igual pero tienen distinto significado.',
            'Es el término general que engloba tanto a los homófonos como a los homógrafos.'
          ]
        },
        {
          id: 'homofonos',
          titulo: 'Homófonos',
          conceptos: [
            'Se pronuncian igual pero se escriben diferente y significan cosas distintas (hola / ola, vaca / baca).'
          ]
        },
        {
          id: 'homografos',
          titulo: 'Homógrafos',
          conceptos: [
            'Se escriben exactamente igual pero tienen distinto significado ("vino": la bebida, o el verbo venir en pasado).'
          ]
        },
        {
          id: 'paronimos',
          titulo: 'Parónimos',
          conceptos: [
            'Se parecen mucho en su escritura o sonido, pero significan cosas distintas (actitud / aptitud, adoptar / adaptar).'
          ]
        },
        {
          id: 'polisemia',
          titulo: 'Polisemia',
          conceptos: [
            'Una misma palabra tiene varios significados relacionados entre sí ("banco": institución financiera o asiento).'
          ]
        }
      ]
    },
    {
      id: 'vocabulario',
      titulo: 'Vocabulario',
      subtemas: [
        {
          id: 'significado-contextual',
          titulo: 'Significado contextual',
          conceptos: [
            'El significado exacto de una palabra a menudo depende de las palabras que la rodean.',
            'Antes de definir una palabra ambigua, siempre revisa la oración completa.'
          ]
        },
        {
          id: 'denotacion',
          titulo: 'Denotación',
          conceptos: [
            'Es el significado literal y objetivo de una palabra, el que aparece en el diccionario.'
          ]
        },
        {
          id: 'connotacion',
          titulo: 'Connotación',
          conceptos: [
            'Es el significado subjetivo o simbólico que una palabra adquiere según el contexto ("tiene un corazón de piedra").'
          ]
        },
        {
          id: 'campos-semanticos',
          titulo: 'Campos semánticos',
          conceptos: [
            'Grupos de palabras que comparten un mismo tema (sartén, cuchara, olla → cocina).'
          ]
        },
        {
          id: 'familias-lexicas',
          titulo: 'Familias léxicas',
          conceptos: [
            'Palabras que comparten la misma raíz (tierra, terrenal, aterrizar).'
          ]
        },
        {
          id: 'series-lexicas',
          titulo: 'Series léxicas',
          conceptos: [
            'Conjuntos de palabras ordenadas según un criterio compartido, como intensidad o gradación (tibio, cálido, caliente, ardiente).'
          ]
        },
        {
          id: 'neologismos',
          titulo: 'Neologismos',
          conceptos: [
            'Palabras de creación reciente que se incorporan al idioma, muchas veces ligadas a la tecnología (selfi, tuitear).'
          ]
        },
        {
          id: 'arcaismos',
          titulo: 'Arcaísmos',
          conceptos: [
            'Palabras o expresiones que han caído en desuso (vusted, facer).'
          ]
        },
        {
          id: 'tecnicismos',
          titulo: 'Tecnicismos',
          conceptos: [
            'Palabras propias de un campo especializado del conocimiento (cardiología, algoritmo).'
          ]
        },
        {
          id: 'extranjerismos',
          titulo: 'Extranjerismos',
          conceptos: [
            'Palabras tomadas de otro idioma, adaptadas o no al español (marketing, software).'
          ]
        }
      ]
    },
    {
      id: 'formacion-palabras',
      titulo: 'Formación de Palabras',
      subtemas: [
        {
          id: 'raiz',
          titulo: 'Raíz',
          conceptos: [
            'Es el elemento que contiene el significado básico de una palabra, común a toda su familia léxica.'
          ]
        },
        {
          id: 'prefijos',
          titulo: 'Prefijos',
          conceptos: [
            'Se colocan antes de la raíz y modifican su significado ("re-" en reconstruir = volver a construir).'
          ]
        },
        {
          id: 'sufijos',
          titulo: 'Sufijos',
          conceptos: [
            'Se colocan después de la raíz y modifican su significado o función ("-mente" en lentamente = de modo lento).'
          ]
        },
        {
          id: 'composicion',
          titulo: 'Composición',
          conceptos: [
            'Une dos palabras completas para formar una nueva (para + aguas = paraguas).'
          ]
        },
        {
          id: 'derivacion',
          titulo: 'Derivación',
          conceptos: [
            'Agrega prefijos o sufijos a una raíz para crear una palabra nueva (feliz → infeliz, felicidad).'
          ]
        },
        {
          id: 'parasintesis',
          titulo: 'Parasíntesis',
          conceptos: [
            'Combina composición y derivación al mismo tiempo, en una sola palabra (picapedrero).'
          ]
        }
      ]
    },
    {
      id: 'precision-lexica',
      titulo: 'Precisión Léxica',
      subtemas: [
        {
          id: 'registro-formal',
          titulo: 'Registro formal',
          conceptos: [
            'Se usa en contextos académicos, profesionales o institucionales ("le informo que su solicitud fue aprobada").'
          ]
        },
        {
          id: 'registro-informal',
          titulo: 'Registro informal',
          conceptos: [
            'Lenguaje coloquial, cercano y espontáneo, típico entre amigos o familia ("¿qué onda? ¿vamos por unos tacos?").'
          ]
        },
        {
          id: 'adecuacion-vocabulario',
          titulo: 'Adecuación del vocabulario',
          conceptos: [
            'Elegir las palabras apropiadas según el contexto y el destinatario del mensaje.'
          ]
        },
        {
          id: 'seleccion-terminos',
          titulo: 'Selección de términos',
          conceptos: [
            'Preferir siempre la palabra más exacta para la idea, evitando términos vagos o ambiguos.'
          ]
        },
        {
          id: 'correccion-lexica',
          titulo: 'Corrección léxica',
          conceptos: [
            'Usar cada palabra con el significado que realmente tiene, evitando confundirla con un parónimo o palabra similar.'
          ]
        }
      ]
    },
    {
      id: 'analogias',
      titulo: 'Analogías',
      subtemas: [
        {
          id: 'relaciones-significado',
          titulo: 'Relaciones de significado',
          conceptos: [
            'Comparan un par de palabras por sinonimia o antonimia ("feliz es a contento como triste es a apenado").'
          ]
        },
        {
          id: 'relaciones-funcion',
          titulo: 'Relaciones de función',
          conceptos: [
            'Comparan un objeto con su uso o utilidad ("llave es a abrir como cuchillo es a cortar").'
          ]
        },
        {
          id: 'relaciones-causa-efecto',
          titulo: 'Relaciones de causa-efecto',
          conceptos: [
            'Un elemento provoca directamente al otro ("fuego es a calor como hielo es a frío").'
          ]
        },
        {
          id: 'relaciones-pertenencia',
          titulo: 'Relaciones de pertenencia',
          conceptos: [
            'Un elemento es parte de, o pertenece a, otro más grande ("rueda es a automóvil como hoja es a árbol").'
          ]
        },
        {
          id: 'relaciones-oposicion',
          titulo: 'Relaciones de oposición',
          conceptos: [
            'Comparan dos pares de palabras antónimas entre sí ("día es a noche como caliente es a frío").'
          ]
        }
      ]
    },
    {
      id: 'completamiento-oraciones',
      titulo: 'Completamiento de Oraciones',
      subtemas: [
        {
          id: 'coherencia-logica',
          titulo: 'Coherencia lógica',
          conceptos: [
            'La palabra o frase elegida debe tener sentido con la idea completa de la oración, no solo "sonar bien".'
          ]
        },
        {
          id: 'coherencia-gramatical',
          titulo: 'Coherencia gramatical',
          conceptos: [
            'La opción elegida debe respetar género, número, tiempo verbal y concordancia con el resto de la oración.'
          ]
        },
        {
          id: 'seleccion-contextual',
          titulo: 'Selección contextual',
          conceptos: [
            'Ante varias opciones plausibles, el contexto completo de la oración señala cuál encaja mejor.'
          ]
        }
      ]
    },
    {
      id: 'organizacion-discurso',
      titulo: 'Organización del Discurso',
      subtemas: [
        {
          id: 'ordenamiento-oraciones',
          titulo: 'Ordenamiento de oraciones',
          conceptos: [
            'Busca primero la oración que presenta el tema; luego sigue el hilo de causa-efecto o cronología.'
          ]
        },
        {
          id: 'reconstruccion-parrafos',
          titulo: 'Reconstrucción de párrafos',
          conceptos: [
            'Fíjate en los conectores (por eso, además, sin embargo): casi siempre delatan qué oración va después de cuál.'
          ]
        },
        {
          id: 'secuencia-logica-ideas',
          titulo: 'Secuencia lógica de ideas',
          conceptos: [
            'Un texto bien organizado avanza de lo general a lo particular, o sigue un orden temporal o causal claro.'
          ]
        }
      ]
    },
    {
      id: 'eliminacion-enunciados',
      titulo: 'Eliminación de Enunciados',
      subtemas: [
        {
          id: 'redundancia',
          titulo: 'Redundancia',
          conceptos: [
            'Se elimina la oración que repite una idea ya expresada antes en el párrafo, sin aportar nada nuevo.'
          ]
        },
        {
          id: 'impertinencia',
          titulo: 'Impertinencia',
          conceptos: [
            'Se elimina la oración que no tiene relación con el tema central del párrafo.'
          ]
        },
        {
          id: 'inconsistencia-tematica',
          titulo: 'Inconsistencia temática',
          conceptos: [
            'Se elimina la oración que rompe la unidad temática, aunque esté bien escrita por sí sola.'
          ]
        }
      ]
    },
    {
      id: 'tipologia-textual',
      titulo: 'Tipos de Texto',
      subtemas: [
        {
          id: 'narrativo',
          titulo: 'Narrativo',
          conceptos: [
            'Cuenta hechos en orden cronológico, con personajes y una trama (cuentos, novelas).'
          ]
        },
        {
          id: 'descriptivo',
          titulo: 'Descriptivo',
          conceptos: [
            'Detalla las características de un lugar, persona u objeto, apelando a los sentidos.'
          ]
        },
        {
          id: 'expositivo',
          titulo: 'Expositivo',
          conceptos: [
            'Presenta datos de forma objetiva con el fin de informar o explicar un tema (artículos enciclopédicos).'
          ]
        },
        {
          id: 'argumentativo',
          titulo: 'Argumentativo',
          conceptos: [
            'Defiende una opinión (tesis) con razones y evidencias que buscan convencer al lector.'
          ]
        },
        {
          id: 'literario',
          titulo: 'Literario',
          conceptos: [
            'Tiene una función estética; usa recursos como metáforas y otras figuras retóricas.'
          ]
        },
        {
          id: 'periodistico',
          titulo: 'Periodístico',
          conceptos: [
            'Informa sobre hechos de actualidad, respondiendo qué, quién, cuándo, dónde y por qué.'
          ]
        },
        {
          id: 'academico',
          titulo: 'Académico',
          conceptos: [
            'Usa un lenguaje formal y objetivo, respaldado en fuentes o investigación (ensayos, tesis).'
          ]
        },
        {
          id: 'administrativo',
          titulo: 'Administrativo',
          conceptos: [
            'Sigue formatos establecidos para trámites o gestiones formales (solicitudes, oficios).'
          ]
        }
      ]
    },
    {
      id: 'comprension-global',
      titulo: 'Comprensión Global',
      subtemas: [
        {
          id: 'idea-principal',
          titulo: 'Idea principal',
          conceptos: [
            'Es el planteamiento central alrededor del cual gira toda la información del texto.'
          ]
        },
        {
          id: 'ideas-secundarias',
          titulo: 'Ideas secundarias',
          conceptos: [
            'Apoyan, explican o amplían la idea principal con detalles y ejemplos.'
          ]
        },
        {
          id: 'tema-central',
          titulo: 'Tema central',
          conceptos: [
            'Es el asunto general del texto, expresado en pocas palabras (no es lo mismo que la idea principal, que es una afirmación completa).'
          ]
        },
        {
          id: 'titulo-adecuado',
          titulo: 'Título adecuado',
          conceptos: [
            'Debe reflejar de forma breve y precisa el contenido central del texto, sin ser ni demasiado amplio ni demasiado específico.'
          ]
        },
        {
          id: 'proposito-autor',
          titulo: 'Propósito del autor',
          conceptos: [
            'La razón por la que escribió el texto: informar, narrar, describir, persuadir o entretener.'
          ]
        },
        {
          id: 'intencion-comunicativa',
          titulo: 'Intención comunicativa',
          conceptos: [
            'Lo que el autor busca lograr en el lector: convencerlo, alertarlo, conmoverlo, etc.'
          ]
        },
        {
          id: 'tono-autor',
          titulo: 'Tono del autor',
          conceptos: [
            'La actitud emocional que transmite hacia el tema: serio, irónico, humorístico, crítico.'
          ]
        }
      ]
    },
    {
      id: 'coherencia-cohesion',
      titulo: 'Coherencia y Cohesión',
      subtemas: [
        {
          id: 'coherencia-local',
          titulo: 'Coherencia local',
          conceptos: [
            'Es la relación lógica entre oraciones cercanas dentro de un mismo párrafo.'
          ]
        },
        {
          id: 'coherencia-global',
          titulo: 'Coherencia global',
          conceptos: [
            'Es la relación lógica de todas las ideas a lo largo de todo el texto, de principio a fin.'
          ]
        },
        {
          id: 'conectores-logicos-resumen',
          titulo: 'Conectores lógicos',
          conceptos: [
            'Palabras que enlazan ideas y muestran cómo se relacionan entre sí (además, sin embargo, por lo tanto).'
          ]
        },
        {
          id: 'marcadores-discursivos',
          titulo: 'Marcadores discursivos',
          conceptos: [
            'Organizan el texto y guían al lector ("en primer lugar", "por otro lado", "en conclusión").'
          ]
        },
        {
          id: 'referencias',
          titulo: 'Referencias',
          conceptos: [
            'Palabras que remiten a algo ya mencionado antes en el texto, como los pronombres ("Juan llegó. Él estaba feliz").'
          ]
        },
        {
          id: 'deicticos',
          titulo: 'Deícticos',
          conceptos: [
            'Palabras cuyo significado depende del contexto de quien habla (aquí, ahora, yo, esto).'
          ]
        },
        {
          id: 'elipsis',
          titulo: 'Elipsis',
          conceptos: [
            'Omitir una palabra o frase que se sobreentiende por el contexto ("Pedro compró manzanas y María, peras").'
          ]
        },
        {
          id: 'sustitucion-lexica',
          titulo: 'Sustitución léxica',
          conceptos: [
            'Reemplazar una palabra por un sinónimo o expresión equivalente para evitar repetirla ("el perro corría. El animal parecía feliz").'
          ]
        },
        {
          id: 'repeticion-lexica',
          titulo: 'Repetición léxica',
          conceptos: [
            'Repetir intencionalmente una palabra clave para dar énfasis o claridad a una idea importante.'
          ]
        }
      ]
    },
    {
      id: 'conectores-logicos',
      titulo: 'Conectores Lógicos',
      subtemas: [
        {
          id: 'conector-adicion',
          titulo: 'Adición',
          conceptos: [
            'Suman una idea a otra: además, también, asimismo.'
          ]
        },
        {
          id: 'conector-contraste',
          titulo: 'Contraste',
          conceptos: [
            'Muestran una oposición entre ideas: sin embargo, no obstante, pero.'
          ]
        },
        {
          id: 'conector-causa',
          titulo: 'Causa',
          conceptos: [
            'Explican el motivo de algo: porque, ya que, debido a.'
          ]
        },
        {
          id: 'conector-consecuencia',
          titulo: 'Consecuencia',
          conceptos: [
            'Muestran el resultado de algo: por lo tanto, así que, por consiguiente.'
          ]
        },
        {
          id: 'conector-comparacion',
          titulo: 'Comparación',
          conceptos: [
            'Comparan dos elementos: al igual que, de la misma manera, tal como.'
          ]
        },
        {
          id: 'conector-ejemplificacion',
          titulo: 'Ejemplificación',
          conceptos: [
            'Introducen un ejemplo: por ejemplo, tal como, a saber.'
          ]
        },
        {
          id: 'conector-temporalidad',
          titulo: 'Temporalidad',
          conceptos: [
            'Ubican los hechos en el tiempo: mientras tanto, después, luego.'
          ]
        },
        {
          id: 'conector-condicion',
          titulo: 'Condición',
          conceptos: [
            'Plantean una condición para que algo ocurra: si, siempre que, en caso de que.'
          ]
        },
        {
          id: 'conector-finalidad',
          titulo: 'Finalidad',
          conceptos: [
            'Expresan el propósito de una acción: para que, con el fin de, a fin de que.'
          ]
        }
      ]
    },
    {
      id: 'analisis-informacion',
      titulo: 'Análisis de Información',
      subtemas: [
        {
          id: 'informacion-explicita',
          titulo: 'Información explícita',
          conceptos: [
            'Es la que aparece dicha de forma directa y literal en el texto.'
          ]
        },
        {
          id: 'informacion-implicita',
          titulo: 'Información implícita',
          conceptos: [
            'No está dicha directamente, pero se puede deducir del contexto o de las pistas del texto.'
          ]
        },
        {
          id: 'inferencias',
          titulo: 'Inferencias',
          conceptos: [
            'Conclusiones que el lector obtiene a partir de pistas del texto, aunque no estén dichas explícitamente.'
          ]
        },
        {
          id: 'deducciones',
          titulo: 'Deducciones',
          conceptos: [
            'Razonamientos que parten de datos generales del texto para llegar a una afirmación específica y lógica.'
          ]
        },
        {
          id: 'conclusiones',
          titulo: 'Conclusiones',
          conceptos: [
            'Cierran el razonamiento a partir de todo lo expuesto anteriormente en el texto.'
          ]
        },
        {
          id: 'comparacion-textos',
          titulo: 'Comparación de textos',
          conceptos: [
            'Identifica similitudes y diferencias entre dos textos que abordan un mismo tema.'
          ]
        },
        {
          id: 'sintesis',
          titulo: 'Síntesis',
          conceptos: [
            'Reduce un texto a sus ideas esenciales, expresadas de forma breve y propia.'
          ]
        },
        {
          id: 'parafrasis',
          titulo: 'Paráfrasis',
          conceptos: [
            'Expresa la misma idea de un texto usando palabras distintas a las del autor original.'
          ]
        },
        {
          id: 'resumen',
          titulo: 'Resumen',
          conceptos: [
            'Presenta de forma breve las ideas más importantes de un texto, sin perder su sentido original.'
          ]
        }
      ]
    },
    {
      id: 'analisis-critico',
      titulo: 'Análisis Crítico',
      subtemas: [
        {
          id: 'hechos',
          titulo: 'Hechos',
          conceptos: [
            'Información verificable y objetiva, que puede comprobarse (el agua hierve a 100°C al nivel del mar).'
          ]
        },
        {
          id: 'opiniones',
          titulo: 'Opiniones',
          conceptos: [
            'Puntos de vista subjetivos que pueden variar entre personas ("esta es la mejor película del año").'
          ]
        },
        {
          id: 'juicios-valor',
          titulo: 'Juicios de valor',
          conceptos: [
            'Evaluaciones subjetivas basadas en las creencias o preferencias de quien las emite.'
          ]
        },
        {
          id: 'suposiciones',
          titulo: 'Suposiciones',
          conceptos: [
            'Ideas que se dan por ciertas sin haber sido comprobadas explícitamente en el texto.'
          ]
        },
        {
          id: 'objetividad-subjetividad',
          titulo: 'Objetividad y subjetividad',
          conceptos: [
            'Objetivo: presenta la información sin influencia de sentimientos personales.',
            'Subjetivo: está influido por los juicios o la perspectiva personal del autor.'
          ]
        },
        {
          id: 'confiabilidad-informacion',
          titulo: 'Confiabilidad de la información',
          conceptos: [
            'Se evalúa revisando si el autor es experto en el tema y si los datos pueden verificarse en otras fuentes.'
          ]
        }
      ]
    },
    {
      id: 'argumentacion',
      titulo: 'Argumentación',
      subtemas: [
        {
          id: 'tesis',
          titulo: 'Tesis',
          conceptos: [
            'Es la idea central que el autor defiende o propone a lo largo de todo el texto.'
          ]
        },
        {
          id: 'argumentos',
          titulo: 'Argumentos',
          conceptos: [
            'Sustentan o defienden la tesis planteada por el autor con razones concretas.'
          ]
        },
        {
          id: 'contraargumentos',
          titulo: 'Contraargumentos',
          conceptos: [
            'Ideas que se oponen o cuestionan la tesis principal; un buen texto argumentativo suele anticiparlos.'
          ]
        },
        {
          id: 'evidencias',
          titulo: 'Evidencias',
          conceptos: [
            'Datos, ejemplos o pruebas concretas que respaldan un argumento.'
          ]
        },
        {
          id: 'conclusion-argumentativa',
          titulo: 'Conclusión',
          conceptos: [
            'Cierra el argumento reafirmando la tesis a partir de todo lo expuesto.'
          ]
        },
        {
          id: 'falacias-argumentativas',
          titulo: 'Falacias argumentativas básicas',
          conceptos: [
            'Razonamientos que parecen válidos pero contienen un error lógico.',
            'Ad hominem: atacar a la persona en vez de su argumento. Generalización apresurada: sacar una conclusión general a partir de muy pocos casos.'
          ]
        }
      ]
    }
  ]
}

export default lecturaEspanol
