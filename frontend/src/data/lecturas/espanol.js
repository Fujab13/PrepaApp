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
            'Común: nombra de forma genérica cualquier elemento de una clase o categoría, sin distinguir uno en particular. Por ejemplo, en "el perro ladró en la ciudad", tanto "perro" como "ciudad" son sustantivos comunes porque podrían referirse a cualquier perro o cualquier ciudad.',
            'Propio: nombra un ser, lugar o cosa única, diferenciándola de los demás. Los sustantivos propios siempre van con mayúscula inicial. Por ejemplo, "México", "Ana" y "Océano Atlántico" son sustantivos propios porque se refieren a entidades específicas y únicas.',
            'Concreto: se refiere a seres u objetos que se pueden percibir mediante los sentidos (vista, tacto, oído, etc.). Son sustantivos que designan cosas materiales y tangibles. Por ejemplo, "mesa", "lluvia" y "perro" son concretos porque puedo verlos, tocarlos u oírlos.',
            'Abstracto: se refiere a cualidades, sentimientos, conceptos o ideas que no tienen existencia material ni se pueden percibir con los sentidos. Son sustantivos que designan cosas intangibles. Por ejemplo, "amor", "libertad" y "justicia" son sustantivos abstractos porque no los puedo ver ni tocar directamente.'
          ]
        },
        {
          id: 'pronombres',
          titulo: 'Funciones y tipos de pronombres',
          conceptos: [
            'Personales: sustituyen a sustantivos y cambian según la persona que habla, a quien se habla o de quien se habla. Se dividen en tres personas (primera, segunda, tercera) y dos números (singular, plural). Ejemplos: "yo" (1ª singular), "tú" (2ª singular), "él" (3ª singular), "nosotros" (1ª plural).',
            'Posesivos: indican pertenencia o relación de propiedad entre el referente y la persona que habla o escucha. Concuerdan en género y número con la cosa poseída. Por ejemplo, "mi casa", "tu amigo", "sus libros" muestran que algo pertenece a alguien.',
            'Demostrativos: indican la posición de algo en el espacio con respecto al hablante, usando una gradación de cercanía o lejanía. Se clasifican en tres grados de distancia: "este" (cercano), "ese" (medio) y "aquel" (lejano). Por ejemplo: "este libro aquí es mío; ese de allá es tuyo".',
            'Relativos: introducen una cláusula subordinada que modifica a un sustantivo anterior llamado antecedente. Funcionan como puente entre la oración principal y la subordinada. Por ejemplo, en "el niño que llegó ayer es mi hermano", "que" es un pronombre relativo que introduce información sobre "niño".'
          ]
        },
        {
          id: 'adjetivos',
          titulo: 'Funciones y tipos de adjetivos',
          conceptos: [
            'Calificativos: atribuyen una cualidad, propiedad o característica al sustantivo al que acompañan. Son los adjetivos más comunes y expresan cómo es, cómo se ve o cómo actúa el sustantivo. Por ejemplo, en "la casa grande" o "el cielo azul", "grande" y "azul" son adjetivos calificativos.',
            'Determinativos: limitan, precisan o determinan la extensión del sustantivo, indicando cantidad, posesión, demostración o interrogación. A diferencia de los calificativos, no describen cualidades sino que definen o señalan al sustantivo. Por ejemplo, "este libro", "varios libros", "mis libros" muestran este tipo de función.',
            'Concuerdan en género y número con el sustantivo: si el sustantivo es femenino, el adjetivo debe serlo también; si es plural, el adjetivo también debe ser plural. Por ejemplo, "la casa blanca", no "la casa blanco" (concordancia en género y número).'
          ]
        },
        {
          id: 'articulos',
          titulo: 'Funciones y tipos de artículos',
          conceptos: [
            'Determinados: se usan cuando el sustantivo designa algo conocido, específico o ya mencionado. Indican que tanto el hablante como el oyente conocen de qué se habla. Por ejemplo, "el libro" o "la casa" presuponen que ambos sabemos cuál libro o cuál casa.',
            'Indeterminados: se usan cuando el sustantivo designa algo desconocido o mencionado por primera vez. Indican que no se especifica exactamente cuál es la cosa de la que se habla. Por ejemplo, "un libro" o "una casa" pueden referirse a cualquier libro o cualquier casa.'
          ]
        },
        {
          id: 'adverbios',
          titulo: 'Funciones y tipos de adverbios',
          conceptos: [
            'De modo: modifican el verbo indicando cómo se realiza la acción, describiendo la manera en que sucede. Muchos terminan en "-mente" aunque no siempre. Por ejemplo, en "estudia rápidamente", "canta bien" o "habla mal", los adverbios de modo (rápidamente, bien, mal) describen cómo se hacen las acciones.',
            'De tiempo: modifican el verbo ubicando la acción en el tiempo, indicando cuándo ocurre el evento. Pueden referirse al momento específico, la frecuencia o la duración de la acción. Por ejemplo, "ayer estudiamos", "hoy descansas", "siempre llueve aquí" sitúan las acciones en diferentes momentos.',
            'De lugar: modifican el verbo indicando dónde se realiza la acción, situándola en el espacio físico. Pueden expresar proximidad, lejanía o dirección. Por ejemplo, "aquí estudiamos", "allá vive tu prima", "cerca hay una tienda" especifican la ubicación de las acciones.',
            'De cantidad: modifican el verbo (o un adjetivo) indicando en qué grado o cuánto se realiza la acción. Expresan medidas relativas de intensidad, abundancia o escasez. Por ejemplo, "trabajas mucho", "come poco", "llueve demasiado" expresan la cantidad o intensidad con que suceden las acciones.'
          ]
        },
        {
          id: 'preposiciones',
          titulo: 'Preposiciones',
          conceptos: [
            'Enlazan palabras dentro de la oración estableciendo relaciones gramaticales y semánticas entre ellas. Las preposiciones nunca van solas; siempre van seguidas de un sustantivo, pronombre o sintagma nominal. Por ejemplo, en "el libro de María", "en la casa" y "para ti", las preposiciones (de, en, para) crean la relación entre palabras.',
            'No tienen significado propio e inmediato; su significado depende completamente del contexto y de las palabras que acompañan. Una misma preposición puede expresar diferentes relaciones según la situación. Por ejemplo, "por la calle" (movimiento a través), "por favor" (ruego) y "por ello" (causa) muestran cómo "por" cambia de significado.'
          ]
        },
        {
          id: 'conjunciones',
          titulo: 'Conjunciones',
          conceptos: [
            'Coordinantes: unen palabras, sintagmas u oraciones del mismo nivel sintáctico sin que una dependa de la otra. Todas las partes coordinadas tienen la misma importancia gramatical. Por ejemplo, en "Ana y Pedro viajan", o "estudias pero no practicas", las conjunciones (y, pero) enlazan elementos equivalentes.',
            'Subordinantes: introducen una cláusula dependiente (llamada subordinada) que depende gramaticalmente de una oración principal. La cláusula subordinada completa o modifica el significado de la principal. Por ejemplo, en "estudié porque tenía examen", la conjunción "porque" introduce la cláusula subordinada "tenía examen".'
          ]
        },
        {
          id: 'interjecciones',
          titulo: 'Interjecciones',
          conceptos: [
            'Expresan emociones, sensaciones o reacciones de forma espontánea e inmediata, sin necesidad de formar parte de una oración completa. Suelen ir acompañadas de signos de exclamación. Por ejemplo, "¡ay!" expresa dolor, "¡oh!" expresa sorpresa y "¡vaya!" expresa asombro o decepción, cada una comunicando una emoción distinta con una sola palabra.',
            'No tienen función sintáctica dentro de la oración: no actúan como sujeto, predicado ni complemento de ningún otro elemento. Funcionan de manera independiente y autónoma, casi como una oración por sí solas. Por ejemplo, en "¡Eh! Ven aquí", la interjección "¡Eh!" no se relaciona gramaticalmente con el resto de la oración.'
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
            'Conjugar es cambiar la forma del verbo para expresar quién realiza la acción (persona), cuántos participan (número), cuándo ocurre (tiempo) y la actitud del hablante frente a ella (modo). Por ejemplo, el verbo "estudiar" cambia de "estudio" a "estudiaste" o "estudiarán" según se trate de una acción presente, pasada o futura, y según quién la realice.',
            'En español hay tres conjugaciones según la terminación del verbo en infinitivo. La primera termina en "-ar" (amar, cantar), la segunda en "-er" (temer, comer) y la tercera en "-ir" (partir, vivir). Esta clasificación es fundamental porque cada conjugación sigue patrones específicos de cambio en sus formas verbales.'
          ]
        },
        {
          id: 'persona-numero',
          titulo: 'Persona y número',
          conceptos: [
            'Persona: indica quién realiza la acción del verbo. Se divide en primera persona (yo/nosotros: quien habla), segunda persona (tú/ustedes: a quien se habla) y tercera persona (él/ella/ellos: de quien se habla). Por ejemplo, "yo canto", "tú cantas", "él canta" muestran la concordancia entre persona y verbo.',
            'Número: indica si el sujeto que realiza la acción es uno solo (singular) o más de uno (plural). El verbo debe cambiar su forma según el número del sujeto para mantener la concordancia gramatical. Por ejemplo, "yo canto" (singular) frente a "nosotros cantamos" (plural) muestran este cambio.',
            'El verbo debe coincidir siempre en persona y número con su sujeto para garantizar la corrección gramatical de la oración. Esta regla es fundamental en español y se llama concordancia verbal. Por ejemplo, "los niños juegan" (3ª plural) es correcto, mientras que "los niños juega" es un error de concordancia.'
          ]
        },
        {
          id: 'tiempos-verbales',
          titulo: 'Tiempos verbales',
          conceptos: [
            'Presente, pasado y futuro como ejes principales: estos tres ejes temporales organizan toda la conjugación verbal. El presente expresa acciones que ocurren ahora; el pasado, acciones ya ocurridas; el futuro, acciones que ocurrirán después. Cada uno se subdivide en varias formas según matices de duración, frecuencia o cercanía.',
            'Cada tiempo tiene formas simples (formadas solo por el verbo, como "como") y compuestas (formadas por un verbo auxiliar más el participio, como "he comido"). Las formas compuestas añaden información sobre la continuidad o terminación de la acción respecto al tiempo principal.',
            'El pretérito imperfecto narra acciones habituales, repetidas o continuas en el pasado, sin enfoque en su final. Contrasta con el pretérito perfecto que marca acciones completadas. Por ejemplo, "jugaba todos los días" sugiere una acción que se repetía regularmente, mientras que "jugué" sería una acción específica y terminada.'
          ]
        },
        {
          id: 'modos-verbales',
          titulo: 'Modos verbales',
          conceptos: [
            'Indicativo: expresa hechos, sucesos o estados que el hablante considera reales, objetivos o ciertos. Es el modo más común en la comunicación cotidiana y en la prosa científica o periodística. Por ejemplo, "llueve", "estudiaste", "viviremos" son indicativo porque presentan las acciones como hechos.',
            'Subjuntivo: expresa duda, deseo, posibilidad, hipótesis o situaciones que el hablante no presenta como ciertas ni objetivas, sino como imaginadas o deseadas. Aparece típicamente en oraciones subordinadas. Por ejemplo, "ojalá llueva", "espero que llegues", "si tuviera dinero" usan el subjuntivo para expresar lo incierto o deseado.',
            'Imperativo: expresa órdenes, mandatos, peticiones, invitaciones o ruegos directos al interlocutor. Solo se usa en segunda persona (tú, ustedes) e impone una acción a quien escucha. Por ejemplo, "¡cierra la puerta!", "ayúdame, por favor", "ven acá" son formas imperativas que ordenan o piden una acción inmediata.'
          ]
        },
        {
          id: 'voz-activa-pasiva',
          titulo: 'Voz activa y voz pasiva',
          conceptos: [
            'Activa: el sujeto realiza directamente la acción del verbo; es el agente activo de la oración. Estructura típica: sujeto + verbo + complemento. Por ejemplo, en "los niños comieron el pastel", el sujeto "los niños" realiza la acción de comer.',
            'Pasiva: el sujeto recibe la acción del verbo; es el objeto paciente de lo que ocurre. Se forma con el verbo "ser" + participio del verbo principal + "por" + el agente (quien realiza). Por ejemplo, en "el pastel fue comido por los niños", el sujeto "pastel" recibe la acción.'
          ]
        },
        {
          id: 'verbos-regulares-irregulares',
          titulo: 'Verbos regulares e irregulares',
          conceptos: [
            'Regulares: siguen el patrón normal de su conjugación sin cambiar su raíz ni su terminación en ninguna forma conjugada. Las terminaciones -ar, -er, -ir se conjugan siempre de la misma manera predecible. Por ejemplo, "cantar" → "canto, cantas, canta" sigue regularmente sus cambios de persona.',
            'Irregulares: cambian su raíz o terminación de forma especial, no siguiendo el patrón estándar de su conjugación. Estas variaciones pueden ocurrir en distintos tiempos y personas. Por ejemplo, "tener" → "tengo" (presente), "tuve" (pretérito), "tendré" (futuro) muestra múltiples irregularidades en la misma conjugación.'
          ]
        },
        {
          id: 'perifrasis-verbales',
          titulo: 'Perífrasis verbales',
          conceptos: [
            'Combinan un verbo auxiliar (ir, estar, tener, deber, poder) + verbo principal en infinitivo, gerundio o participio para matizar el significado original. Permiten expresar acciones con gradaciones de tiempo, posibilidad, obligación o progreso. Por ejemplo, "voy a estudiar", "estoy leyendo" combinan auxiliares con formas del verbo principal.',
            'De futuro próximo: "voy a estudiar" expresa una acción inminente. De acción en progreso: "estoy leyendo" indica que la acción ocurre en el momento de hablar. De obligación: "tengo que terminar" expresa necesidad o mandato. Cada perífrasis aporta un matiz específico a la acción del verbo principal.'
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
            'El sustantivo y sus modificadores (artículos, adjetivos) deben coincidir en género y número para garantizar la corrección gramatical de la frase nominal. Si el sustantivo es femenino y plural, todos sus modificadores deben serlo también. Por ejemplo, "las casas blancas" muestra concordancia: artículo femenino plural, sustantivo femenino plural, adjetivo femenino plural.',
            'Ejemplo correcto: "las casas blancas" mantiene concordancia de género y número en el artículo (femenino plural), sustantivo (femenino plural) y adjetivo (femenino plural). Ejemplo incorrecto: "las casa blanco" viola esta regla porque mezcla plurales (las) con singulares (casa, blanco) y géneros inconsistentes.'
          ]
        },
        {
          id: 'concordancia-verbal',
          titulo: 'Concordancia verbal (sujeto y verbo)',
          conceptos: [
            'El verbo debe concordar con el sujeto en persona y número para que la oración sea gramaticalmente correcta. Esta concordancia es obligatoria en español: si el sujeto es tercera persona singular, el verbo también debe estar en tercera persona singular. Por ejemplo, "el gato duerme" (3ª singular) es correcto; "el gato duermen" es incorrecto.',
            'Con sujetos compuestos unidos por "y" ("Juan y Pedro"), el verbo va siempre en plural porque suma dos o más sujetos formando una unidad pluralizada. Aunque los sujetos individuales sean singulares, su combinación exige verbo en plural. Por ejemplo, "Juan y Pedro corren" (no "Juan y Pedro corre") porque la acción la realizan dos personas.'
          ]
        },
        {
          id: 'sujeto',
          titulo: 'Sujeto',
          conceptos: [
            'Es quien realiza (o recibe, en voz pasiva) la acción del verbo; es el núcleo de la oración porque sin sujeto no hay acción a quien atribuirla. El sujeto determina la conjugación del verbo mediante la concordancia de persona y número. Por ejemplo, en "los estudiantes estudian", "los estudiantes" es el sujeto que realiza la acción.',
            'Puede ser tácito o elíptico: no aparece escrito explícitamente, pero se identifica fácilmente por la terminación y conjugación del verbo. En español, el pronombre personal frecuentemente se omite porque la forma verbal indica persona y número. Por ejemplo, en "llegamos tarde", la desinencia "-amos" del verbo revela que el sujeto es "nosotros" aunque no aparezca escrito.'
          ]
        },
        {
          id: 'predicado',
          titulo: 'Predicado',
          conceptos: [
            'Es todo lo que se dice del sujeto; siempre contiene un verbo conjugado como núcleo, acompañado de sus complementos. El predicado expresa lo que el sujeto hace, es, tiene o experimenta. Por ejemplo, en "el niño juega en el parque", "juega en el parque" es el predicado que describe qué hace el sujeto.',
            'Se identifica preguntando "¿qué hace o qué le pasa al sujeto?", es decir, la respuesta a esta pregunta es el predicado completo. Esta pregunta ayuda a separar el sujeto del predicado en un análisis sintáctico. Por ejemplo, si el sujeto es "la profesora", preguntar "¿qué hace?" da como respuesta "explica la lección", que es el predicado.'
          ]
        },
        {
          id: 'complemento-directo',
          titulo: 'Complemento directo',
          conceptos: [
            'Recibe directamente la acción del verbo transitivo; es la persona, animal o cosa sobre la cual recae la acción indicada por el verbo. Responde a la pregunta "¿qué?" o "¿a quién?". Por ejemplo, en "compré un libro", "un libro" es el complemento directo porque es lo que recibe directamente la acción de comprar.',
            'Se puede sustituir por los pronombres átonos de complemento directo: lo (singular masculino), la (singular femenino), los (plural masculino), las (plural femenino). Esta sustitución permite verificar si un elemento es complemento directo. Por ejemplo, "compré un libro" → "lo compré" confirma que "un libro" es complemento directo porque puede reemplazarse por "lo".'
          ]
        },
        {
          id: 'complemento-indirecto',
          titulo: 'Complemento indirecto',
          conceptos: [
            'Indica quién recibe el beneficio o daño derivado de la acción del verbo, de forma indirecta. Siempre va precedido de una preposición (generalmente "a") o puede ir sin ella si lo sustituye un pronombre. Por ejemplo, en "le regalé flores a mi madre", "a mi madre" es el complemento indirecto que recibe el beneficio (las flores).',
            'Se puede sustituir por los pronombres átonos de complemento indirecto: le (singular, para una persona) o les (plural, para varias personas). Esta sustitución permite verificar si un elemento es complemento indirecto. Por ejemplo, "le regalé flores a mi madre" confirma que "a mi madre" es complemento indirecto porque puede reemplazarse por "le".'
          ]
        },
        {
          id: 'complemento-circunstancial',
          titulo: 'Complemento circunstancial',
          conceptos: [
            'Añade información circunstancial al verbo (cómo, cuándo, dónde, por qué, para qué ocurre la acción) sin ser esencial para la estructura básica de la oración. Responde a preguntas como "¿cómo?", "¿cuándo?", "¿dónde?", "¿por qué?". Por ejemplo, en "viajamos a la playa en verano", "a la playa" (lugar) y "en verano" (tiempo) son complementos circunstanciales.',
            'Puede haber varios en una misma oración, cada uno respondiendo una pregunta distinta para enriquecer la información sobre cómo se realiza la acción. Una sola oración puede combinar complementos circunstanciales de tiempo, lugar, modo y causa sin problemas. Por ejemplo, en "ayer fui corriendo al parque por ejercicio", hay tres complementos circunstanciales: "ayer" (tiempo), "corriendo" (modo), "al parque" (lugar), "por ejercicio" (causa).'
          ]
        },
        {
          id: 'atributo',
          titulo: 'Atributo',
          conceptos: [
            'Acompaña a verbos copulativos (ser, estar, parecer, permanecer, resultar, semejar) que funcionan como enlace entre el sujeto y la cualidad que se le atribuye. El atributo completa el significado del verbo copulativo. Por ejemplo, en "el cielo está nublado", "nublado" es el atributo que describe la cualidad del sujeto "cielo" a través del verbo "estar".'
          ]
        },
        {
          id: 'predicativo',
          titulo: 'Predicativo',
          conceptos: [
            'Se parece al atributo, pero acompaña a verbos de acción (NO copulativos) describiendo una cualidad del sujeto que ocurre simultáneamente con la acción. El predicativo añade información cualitativa mientras el sujeto o el complemento realiza la acción. Por ejemplo, en "los niños llegaron cansados", "cansados" es predicativo que describe el estado del sujeto al mismo tiempo que realiza la acción de llegar.',
            'Describe al sujeto (o al complemento directo) al mismo tiempo que ocurre la acción, mostrando una cualidad simultánea con el proceso verbal. A diferencia del atributo, que solo existe en verbos copulativos, el predicativo enriquece la información de verbos de acción. Por ejemplo, en "vi al niño asustado", "asustado" es predicativo que describe el complemento directo "niño" mientras se realiza la acción de ver.'
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
            'Son aquellas que poseen un único verbo conjugado y por lo tanto una sola acción principal. No contienen proposiciones subordinadas ni están unidas a otras oraciones por conectores. Por ejemplo, en la oración "el niño juega en el parque", "juega" es el único verbo conjugado que expresa la acción del sujeto "el niño".'
          ]
        },
        {
          id: 'oraciones-compuestas',
          titulo: 'Oraciones compuestas',
          conceptos: [
            'Son las oraciones que contienen dos o más verbos conjugados conectados entre sí mediante un conector. Estos conectores pueden ser conjunciones coordinantes (y, o, pero) o subordinantes según cómo se relacionen las cláusulas. Por ejemplo, en "el niño juega y su hermana estudia", existen dos verbos conjugados ("juega" y "estudia") unidos por la conjunción "y".'
          ]
        },
        {
          id: 'coordinadas',
          titulo: 'Coordinadas',
          conceptos: [
            'Son proposiciones de igual importancia sintáctica unidas por conjunciones coordinantes, donde ninguna depende gramaticalmente de la otra. Las conjunciones coordinantes más comunes son la copulativa "y", la disyuntiva "o" y la adversativa "pero". Por ejemplo, en "estudia matemática y juega fútbol", ambas proposiciones tienen el mismo nivel de importancia dentro de la oración compuesta.'
          ]
        },
        {
          id: 'subordinadas',
          titulo: 'Subordinadas',
          conceptos: [
            'Están formadas por una oración principal y una o más oraciones subordinadas que dependen de ella. La oración subordinada no puede existir de manera independiente, pues completa o modifica el sentido de la principal. Por ejemplo, en "espero que estudies mucho", la proposición "que estudies mucho" es subordinada y depende de la principal "espero".'
          ]
        },
        {
          id: 'enunciativas',
          titulo: 'Enunciativas',
          conceptos: [
            'Son aquellas que declaran un hecho sin formular una pregunta ni expresar una emoción intensa. Se clasifican en afirmativas (que aseveran algo: "el gato es blanco") o negativas (que niegan algo: "el gato no es blanco"). Ambas tipos presentan el contenido de forma objetiva como un enunciado de la realidad.'
          ]
        },
        {
          id: 'interrogativas',
          titulo: 'Interrogativas',
          conceptos: [
            'Son oraciones que formalizan una pregunta para obtener información. Pueden ser directas, donde el hablante hace la pregunta directamente usando signos de interrogación: "¿vendrás mañana?". También pueden ser indirectas, donde la pregunta se subordina a otra oración: "no sé si vendrás", sin los signos de interrogación característicos.'
          ]
        },
        {
          id: 'exclamativas',
          titulo: 'Exclamativas',
          conceptos: [
            'Son oraciones que comunican una emoción o una reacción del hablante de forma enfática. Se utilizan para expresar sorpresa, alegría, admiración, miedo o cualquier sentimiento intenso hacia algo. Por ejemplo, "¡qué hermoso paisaje!" expresa admiración ante la belleza de algo, siempre con los signos de exclamación que marcan la entonación emotiva.'
          ]
        },
        {
          id: 'exhortativas',
          titulo: 'Exhortativas',
          conceptos: [
            'Son aquellas que pretenden influir en el comportamiento del interlocutor mediante una orden, un ruego, un consejo o una invitación. El verbo siempre aparece en modo imperativo dirigido a la segunda persona. Por ejemplo, "cierra la ventana, por favor" es una exhortación que pide al oyente que realice una acción específica.'
          ]
        },
        {
          id: 'dubitativas',
          titulo: 'Dubitativas',
          conceptos: [
            'Son oraciones que comunican incertidumbre, duda o falta de certeza sobre un hecho. El hablante no afirma algo como verdadero, sino como posible o probable. Suelen acompañarse de adverbios de duda como "quizás", "tal vez" o "probablemente". Por ejemplo, "quizás llueva mañana" expresa que la lluvia es una posibilidad, no una certeza.'
          ]
        },
        {
          id: 'desiderativas',
          titulo: 'Desiderativas',
          conceptos: [
            'Son aquellas que comunican el deseo o la aspiración del hablante de que ocurra algo. Generalmente utilizan verbos en modo subjuntivo y frecuentemente van precedidas por la palabra "ojalá". Por ejemplo, "ojalá apruebe el examen" expresa el deseo del hablante de que el examen sea aprobado, algo que el hablante desearía que sucediera.'
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
            'Es fundamental examinar que los elementos de una oración respeten las reglas de la lengua para evitar errores que afecten su sentido. Se debe verificar que el verbo concuerde en número y persona con el sujeto, que el tiempo verbal sea apropiado para la idea que se comunica, y que los pronombres estén correctamente utilizados. Por ejemplo, "el niño juegan en el parque" es incorrecto porque hay desacuerdo entre "el niño" (singular) y "juegan" (plural).'
          ]
        },
        {
          id: 'correccion-sintactica',
          titulo: 'Corrección de errores sintácticos',
          conceptos: [
            'Toda oración debe tener una estructura gramatical completa con un sujeto (quien realiza la acción) y un predicado (que dice qué hace o qué es el sujeto). No debe haber elementos redundantes que no cumplan una función, ni deben faltar partes esenciales. Por ejemplo, "el gato" es un fragmento incompleto porque le falta un predicado; la oración correcta sería "el gato duerme".'
          ]
        },
        {
          id: 'orden-logico-palabras',
          titulo: 'Orden lógico de palabras',
          conceptos: [
            'En español, la disposición habitual de los elementos de una oración sigue el patrón de sujeto primero, verbo en segundo lugar, y complementos al final. Este orden es natural porque refleja cómo se organiza el pensamiento. Si se altera sin un propósito estilístico deliberado, la oración puede volverse confusa o perder claridad. Por ejemplo, "Juan compró un libro" es claro y sigue el orden natural; "un libro compró Juan" es menos directo.'
          ]
        },
        {
          id: 'precision-lexica-redaccion',
          titulo: 'Precisión léxica',
          conceptos: [
            'La precisión en la elección de palabras es fundamental para comunicar ideas con claridad y efectividad. Debe evitarse el uso de términos genéricos o imprecisos como "cosa", "algo", "eso" o "muy", que no comunican la idea específica que se desea expresar. Por ejemplo, en lugar de decir "me duele algo en la cabeza", es más preciso decir "tengo un dolor agudo en la sien derecha".'
          ]
        },
        {
          id: 'seleccion-palabra-adecuada',
          titulo: 'Selección de la palabra adecuada',
          conceptos: [
            'La selección apropiada de una palabra depende de múltiples factores que rodean la comunicación. Debe considerarse el contexto en que se usa, el nivel de formalidad requerido (formal para un documento oficial, informal para una conversación amistosa), y a quién va dirigido el mensaje. Por ejemplo, en un correo formal se escribiría "agradezco su atención", pero en un mensaje informal se podría decir "gracias por tu ayuda".'
          ]
        },
        {
          id: 'reescritura-oraciones',
          titulo: 'Reescritura de oraciones',
          conceptos: [
            'Cuando se reescribe un texto con el objetivo de mejorar su claridad y legibilidad, la tarea consiste en encontrar formas alternativas de expresar las mismas ideas sin alterar el contenido esencial. La reescritura busca organizar mejor la información, simplificar estructuras complejas, o elegir palabras más precisas. Por ejemplo, "a pesar de que había lluvia, salimos" puede reescribirse como "aunque llovía, salimos", manteniendo exactamente el mismo significado.'
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
            'Son infracciones a las reglas gramaticales de construcción de oraciones que afectan la corrección de la lengua. Los solecismos distorsionan la estructura sintáctica esperada, creando construcciones que no siguen los patrones normales del español. Aunque el significado puede entenderse por contexto, la forma es incorrecta desde el punto de vista gramatical.',
            'Un ejemplo clásico de solecismo es el error de concordancia con el verbo "haber" impersonal. Cuando "haber" funciona como verbo impersonal (sin sujeto definido), debe permanecer siempre en singular. La expresión incorrecta "habían muchas personas" viola esta regla; la forma correcta es "había muchas personas", donde el verbo permanece en singular a pesar de que "personas" es plural.'
          ]
        },
        {
          id: 'pleonasmos',
          titulo: 'Pleonasmos',
          conceptos: [
            'Es la repetición innecesaria de una idea que ya está implícita en otra palabra de la misma expresión, sin aportar información nueva. Este vicio del lenguaje debe evitarse en la escritura cuidada porque demuestra falta de precisión. Por ejemplo, "subir para arriba" es redundante porque "subir" ya implica ir hacia arriba; de igual forma, "entrar para adentro" repite innecesariamente la idea; basta con decir "subir" o "entrar".'
          ]
        },
        {
          id: 'cacofonias',
          titulo: 'Cacofonías',
          conceptos: [
            'Es un vicio de lenguaje que surge por la repetición excesiva de los mismos sonidos en palabras consecutivas, generando una sensación de falta de armonía. Esta repetición afecta negativamente la musicalidad y la fluidez del texto al oído. Por ejemplo, en la frase "Ana anda con Ana a Ancón", la repetición del sonido "a" al inicio de palabras crea un efecto desagradable que entorpece la lectura fluida.'
          ]
        },
        {
          id: 'barbarismos',
          titulo: 'Barbarismos',
          conceptos: [
            'Son deformaciones de palabras correctas, resultado de errores de pronunciación, escritura o la introducción inadecuada de palabras extranjeras. Los barbarismos pueden surgir por ignorancia de la forma correcta o por influencia de otros idiomas sin necesidad real de usar extranjerismos. Por ejemplo, decir "haiga" en lugar de "haya", o "pa" en lugar de "para", son barbarismos que distorsionan la lengua española correcta.'
          ]
        },
        {
          id: 'dequeismo',
          titulo: 'Dequeísmo',
          conceptos: [
            'Es el error de añadir la preposición "de" antes de la conjunción "que" cuando la estructura sintáctica no lo requiere. Este vicio es muy común en el español coloquial, aunque es incorrecto en la lengua formal. Por ejemplo, la construcción incorrecta "pienso de que tienes razón" debe ser "pienso que tienes razón", porque el verbo "pensar" no exige preposición cuando va seguido de una proposición subordinada.'
          ]
        },
        {
          id: 'queismo',
          titulo: 'Queísmo',
          conceptos: [
            'Es el error opuesto al dequeísmo: omitir la preposición "de" cuando la estructura sintáctica del verbo la requiere necesariamente. Ciertos verbos como "acordarse", "olvidarse", "arrepentirse" exigen obligatoriamente la preposición "de". Por ejemplo, la forma incorrecta "me acuerdo que fuimos" debe ser "me acuerdo de que fuimos", porque el verbo "acordarse" siempre requiere la preposición "de" ante una proposición subordinada.'
          ]
        },
        {
          id: 'anfibologia',
          titulo: 'Anfibología',
          conceptos: [
            'Es la falta de claridad en una oración debido a su construcción gramatical ambigua, lo que permite dos o más interpretaciones diferentes. Esta ambigüedad surge cuando la estructura sintáctica no deja claro a cuál elemento se refiere un modificador. Por ejemplo, en "vi al hombre con el telescopio", no queda claro si fue yo quien veía con el telescopio o si el hombre tenía el telescopio; la ambigüedad debe resolverse reordenando: "vi al hombre que tenía el telescopio" o "vi con el telescopio al hombre".'
          ]
        },
        {
          id: 'muletillas',
          titulo: 'Muletillas',
          conceptos: [
            'Son expresiones que se repiten frecuentemente durante el discurso oral por hábito, sin contribuir con contenido semántico al mensaje. Estas palabras actúan como "rellenos" que interrumpen la fluidez natural del habla y suelen ser signos de falta de preparación o nerviosismo. Por ejemplo, decir "o sea", "este", "tú sabes", o "¿viste?" repetidamente en una conversación constituyen muletillas que afectan la claridad y la efectividad del mensaje.'
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
            'La sílaba es la unidad básica de pronunciación que contiene siempre una vocal, que puede estar acompañada por consonantes. Para dividir una palabra en sílabas, se agrupa la vocal con las consonantes que la rodean siguiendo reglas específicas. Por ejemplo, la palabra "casa" se divide en "ca-sa", donde cada sílaba contiene una vocal; "ordenar" se divide en "or-de-nar".',
            'Saber separar correctamente las sílabas de una palabra es fundamental para determinar dónde cae el acento de intensidad y, por consiguiente, para decidir si necesita tilde escrita. Sin esta habilidad básica es imposible aplicar las reglas de acentuación. Por ejemplo, para acentuar correctamente "cámaras", primero debe dividirse en "cá-ma-ras" y luego identificar que el acento cae en la antepenúltima sílaba.'
          ]
        },
        {
          id: 'diptongos',
          titulo: 'Diptongos',
          conceptos: [
            'Los diptongos son combinaciones de dos vocales que se pronuncian dentro de una misma sílaba. Pueden estar formados por una vocal fuerte (a, e, o) y una vocal débil (i, u), o por dos vocales débiles juntas. Ejemplos de diptongo fuerte-débil son "aire" (a-i en una sílaba) y "ciudad" (u-a en una sílaba); ejemplos de diptongo débil-débil son "viuda" (u-a) y "ruina" (u-i).'
          ]
        },
        {
          id: 'hiatos',
          titulo: 'Hiatos',
          conceptos: [
            'Los hiatos son el caso opuesto a los diptongos: dos vocales que aparecen juntas en una palabra pero se pronuncian en sílabas diferentes. Generalmente ocurren cuando tenemos dos vocales fuertes (a, e, o) juntas, o cuando una vocal débil lleva tilde (lo que rompe la posible agrupación). Por ejemplo, "po-e-ta" presenta un hiato donde "o" y "e" se pronuncian por separado; igualmente "ma-í-z" tiene un hiato porque la tilde en la "í" indica que se pronuncia separadamente de la "a".'
          ]
        },
        {
          id: 'triptongos',
          titulo: 'Triptongos',
          conceptos: [
            'Los triptongos son la combinación poco frecuente de tres vocales que forman una única sílaba. Típicamente siguen el patrón vocal débil-vocal fuerte-vocal débil, como en "buey" (u-e-y) o "estudiáis" (i-a-i). En estos casos, las tres vocales se pronuncian juntas en un solo golpe de voz, formando un solo sonido continuo dentro de la sílaba.'
          ]
        },
        {
          id: 'palabras-agudas',
          titulo: 'Palabras agudas',
          conceptos: [
            'Las palabras agudas llevan el acento de intensidad (la sílaba que se pronuncia con más fuerza) en la última sílaba de la palabra. Esto determina si necesitan o no tilde escrita según la regla de acentuación de palabras agudas. Por ejemplo, en "camión", "reloj" y "feliz", el golpe de voz cae en la última sílaba de cada palabra.',
            'La regla de acentuación especifica que las palabras agudas (con acento en la última sílaba) llevan tilde solamente cuando terminan en una de estas consonantes: N, S, o cuando terminan en vocal. Palabras como "canción" (termina en N), "compás" (termina en S) y "sofá" (termina en vocal) lo demuestran. Sin embargo, palabras agudas que terminan en otros consonantes como "reloj" (termina en j) no llevan tilde.'
          ]
        },
        {
          id: 'palabras-graves',
          titulo: 'Palabras graves',
          conceptos: [
            'Las palabras graves, también denominadas llanas, llevan el acento de intensidad en la penúltima sílaba de la palabra. Este es el patrón más frecuente en español, donde la mayoría de las palabras de dos sílabas son graves. Por ejemplo, en "mesa", "libro" y "gato", el golpe de voz cae en la penúltima sílaba respectivamente.',
            'La regla para acentuar palabras graves es exactamente opuesta a la de las agudas: llevan tilde cuando NO terminan en N, S o vocal. Palabras como "árbol" (termina en L), "fácil" (termina en L) y "azúcar" (termina en R) necesitan tilde porque terminan en consonantes distintas a N y S. En cambio, palabras graves terminadas en N, S o vocal como "joven", "lápis" o "mesa" no llevan tilde.'
          ]
        },
        {
          id: 'palabras-esdrujulas',
          titulo: 'Palabras esdrújulas',
          conceptos: [
            'Las palabras esdrújulas llevan el acento de intensidad en la antepenúltima sílaba. Este patrón es menos común en español que el de palabras agudas o graves, pero es muy característico en ciertos tipos de palabras. Por ejemplo, en "médico", "música" y "teléfono", el golpe de voz cae claramente en la antepenúltima sílaba de cada palabra.',
            'A diferencia de las palabras agudas y graves, toda palabra esdrújula lleva obligatoriamente tilde, sin excepción alguna, independientemente de su terminación. Esta regla absoluta simplifica el aprendizaje, pues no hay que memorizar qué terminaciones requieren tilde. Ejemplos: "médico", "música", "teléfono", "cómodo", "análisis" — todas son esdrújulas y todas llevan tilde.'
          ]
        },
        {
          id: 'palabras-sobresdrujulas',
          titulo: 'Palabras sobresdrújulas',
          conceptos: [
            'Las palabras sobresdrújulas tienen el acento de intensidad en una sílaba anterior a la antepenúltima, lo que las hace muy poco frecuentes en español. Surgen típicamente cuando se añaden pronombres enclíticos (al final) a un verbo en forma imperativa o gerundio. Por ejemplo, "cuéntaselo" (de "contar" + "te" + "lo") y "repítemelo" (de "repetir" + "me" + "lo") son palabras sobresdrújulas.',
            'Como con las palabras esdrújulas, toda palabra sobresdrújula lleva tilde obligatoriamente, sin excepción. Esta regla es absoluta y no presenta variaciones según la terminación de la palabra. Ejemplos de palabras sobresdrújulas acentuadas incluyen "cuéntaselo", "repítemelo", "explícamelo" y "devuélvemelo", todas las cuales llevan tilde de manera irrefutable.'
          ]
        },
        {
          id: 'acento-diacritico',
          titulo: 'Acento diacrítico',
          conceptos: [
            'El acento diacrítico es una tilde que no sigue las reglas normales de acentuación, sino que se utiliza exclusivamente para diferenciar dos palabras que se escriben de forma idéntica pero que tienen significados o funciones gramaticales distintas. Esta tilde cumple una función semántica y gramatical: permitir distinguir entre palabras homoformas. Sin el acento diacrítico sería imposible saber si se trata de una u otra palabra.',
            'Los casos más comunes de acento diacrítico son: "sé" (del verbo saber, primera persona singular) se diferencia de "se" (pronombre reflexivo); "más" (adverbio de cantidad, sinónimo de "mucho") se diferencia de "mas" (conjunción que significa "pero"); "él" (pronombre personal sujeto) se diferencia de "el" (artículo determinado masculino singular). En cada caso, la tilde permite saber cuál es la palabra intendida según el contexto.'
          ]
        },
        {
          id: 'acento-enfatico',
          titulo: 'Acento enfático',
          conceptos: [
            'El acento enfático o interrogativo se utiliza en palabras interrogativas y exclamativas como "qué", "cómo", "dónde", "cuándo", "cuál" y "cuánto" cuando estas palabras introducen una pregunta o exclamación. Esta tilde se coloca independientemente de que la pregunta o exclamación sea directa (¿Qué haces?) o indirecta (No sé qué haces), distinguiendo estos usos de los no interrogativos de las mismas palabras.',
            'Existen diferencias claras entre el uso enfático y el no enfático de estas palabras. En "no sé cómo llegar", tanto "cómo" lleva tilde porque es una pregunta indirecta (pregunta qué manera existe). En contraste, en "llegué como pude", la palabra "como" no lleva tilde porque funciona como conjunción comparativa, no como una palabra interrogativa. Esta distinción es crucial para escribir correctamente.'
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
            'La letra B se utiliza en posiciones específicas donde la pronunciación hace que sea la opción correcta. Se escribe obligatoriamente con B cuando viene inmediatamente después de la consonante M, como en "cambio" o "hombre". También se escribe con B cuando se encuentra antes de otra consonante (no considerando al mismo B), como en "absolver" o "obscuro". Estas reglas de posicionamiento ayudan a memorizar cuándo usar B en lugar de V.',
            'La letra V se escribe en contextos particulares que facilitan su memorización. Se escribe obligatoriamente con V cuando aparece inmediatamente después de la consonante N, como en "envío" o "invitación". También se escriben con V los adjetivos que terminan en las desinencias -ava, -ave, -avo, como "octava", "nueva", "suave", "concavo". Estos patrones forman un conjunto predecible de situaciones donde V es la opción correcta.'
          ]
        },
        {
          id: 'grafia-c-s-z',
          titulo: 'C, S y Z',
          conceptos: [
            'La pronunciación de C y Z depende de las vocales que las acompañan, causando confusión en la escritura. La C tiene sonido suave cuando va ante las vocales E e I, como en "cielo", "cien" o "cereza". La Z se utiliza típicamente ante las vocales A, O, U, como en "zapato", "zona" o "zumaque". Esta regla fonética explica por qué existen palabras como "gracias" (C suave antes de I) frente a "gracia" (cuando necesita A).',
            'En muchas regiones hispanohablantes existe el fenómeno del seseo, donde tanto C como Z se pronuncian del mismo modo, lo que genera confusión al escribir. Esta variante regional legitima hace que sea imposible aprender la diferencia solo por pronunciación en esas zonas. Ante dudas sobre si una palabra requiere C o Z, la mejor estrategia es recurrir al diccionario, que proporciona la forma estándar de cada palabra. Por ejemplo, "abrazo" se escribe con Z, no con C.'
          ]
        },
        {
          id: 'grafia-g-j',
          titulo: 'G y J',
          conceptos: [
            'La pronunciación de G varía según la vocal que la acompaña, generando frecuentes errores ortográficos. Cuando la G precede a las vocales E e I, produce un sonido gutural fuerte muy similar al sonido de J, como en "general", "gesto" o "gigante". Esta similitud sonora es la causa de que muchas personas confundan G y J al escribir palabras que contienen estas combinaciones. Sin embargo, la escritura correcta requiere usar G en estos casos específicos.',
            'A diferencia de la G, la letra J es mucho más consistente y predecible en su pronunciación. Independientemente de qué vocal la acompañe (a, e, i, o, u), la J siempre mantiene el mismo sonido gutural fuerte. Ejemplos como "jirafa" (con a), "jefe" (con e), "jirón" (con i), "joven" (con o) y "juego" (con u) demuestran esta consistencia. Esta regularidad hace que la J sea más fácil de memorizar que la G.'
          ]
        },
        {
          id: 'grafia-ll-y',
          titulo: 'LL y Y',
          conceptos: [
            'El fenómeno del yeísmo es muy generalizado en el mundo hispanohablante contemporáneo, donde la mayoría de los hablantes pronuncian LL y Y de manera idéntica. Esta coincidencia fonética hace que sea prácticamente imposible diferenciar estas letras por sonido al escribir, creando una de las mayores fuentes de errores ortográficos. Palabras como "lluvia" (LL) y "yuvia" (Y) se pronuncian igual en el habla yeísta, por lo que solo la memoria y el diccionario pueden resolver la duda.',
            'Para resolver la duda entre LL y Y, existen estrategias útiles como examinar la familia de palabras relacionadas, que frecuentemente revela la forma correcta. Por ejemplo, si dudas de "lluvia", puedes pensar en "llover" y "llovizna", donde la LL es evidente. Cuando esta estrategia no funciona, el diccionario es el recurso más confiable y definitivo para verificar la ortografía correcta. La forma correcta es "lluvia", nunca "yuvia".'
          ]
        },
        {
          id: 'grafia-h',
          titulo: 'H',
          conceptos: [
            'La H es única entre las letras consonantes del español porque es completamente muda: no produce sonido alguno en la pronunciación moderna, pero su presencia en la escritura es obligatoria en ciertos contextos. Esta característica hace que el uso de H sea una de las mayores dificultades ortográficas, ya que no puede aprenderse por sonido. Palabras como "hormiga", "hospital" y "historia" demuestran esta particularidad: se pronuncian sin la "h" que se escribe.'
          ]
        },
        {
          id: 'grafia-x',
          titulo: 'X',
          conceptos: [
            'La X tiene una pronunciación variable según su posición y contexto dentro de la palabra, aunque el sonido más común es similar a "cs" o "ks". En palabras como "examen" se pronuncia más cercano a "eksamen", y en "exacto" suena como "eksacto". Este sonido es el resultado de la evolución histórica de la X en español, que ha conservado esta pronunciación en la mayoría de contextos modernos.',
            'Existen excepciones importantes a la pronunciación típica de X, particularmente en palabras de origen indígena (principalmente náhuatl) donde la X tiene un sonido similar al de la J española. Ejemplos característicos incluyen "México", donde la X se pronuncia como "j", produciendo "Méjico" en la pronunciación, y "Oaxaca", cuya X también suena como J. Estas excepciones son resultado de la herencia prehispánica del español mexicano.'
          ]
        },
        {
          id: 'grafia-r-rr',
          titulo: 'R y RR',
          conceptos: [
            'La doble R (RR) se utiliza exclusivamente entre vocales para representar el sonido fuerte y vibrante de la R múltiple. En palabras como "carro", "perro" y "tierra", la RR produce ese sonido distintivo que diferencia estas palabras de sus contrapartes con R simple ("caro", "pero", "tiera"). Esta restricción de uso solo entre vocales es una regla ortográfica clara y sin excepciones.',
            'A pesar de escribirse como una sola R, la consonante produce el sonido fuerte característico en ciertos contextos específicos además de entre vocales. Esto ocurre al inicio de una palabra, donde "rosa" y "reloj" tienen ese sonido fuerte inicial. También sucede cuando la R viene inmediatamente después de las consonantes N, L o S, como en "enredo", "alrededor" y "Israel", donde a pesar de la R simple, el sonido es fuerte. Estos contextos permiten prescindir de la RR porque la posición garantiza el sonido fuerte.'
          ]
        },
        {
          id: 'grafia-m-antes-p-b',
          titulo: 'M antes de P y B',
          conceptos: [
            'Esta es una regla ortográfica absoluta sin excepciones: cuando una consonante nasal precede a las consonantes labiales P o B, debe usarse obligatoriamente la M, nunca la N. Palabras como "tambor" (m + b), "campo" (m + p) y "también" (m + b) demuestran esta regla. La razón fonética es que la M es la consonante nasal labial natural que precede a labiales, mientras que N es alveolar; el sonido correcto requiere la M en estos contextos.'
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
            'Las mayúsculas sirven para marcar el inicio de segmentos textuales importantes y delimitan límites sintácticos. Se utiliza mayúscula inicial en la primera palabra de un texto completo para señalar su comienzo. También se escribe con mayúscula la primera palabra que aparece después de un punto seguido o punto aparte, indicando que comienza una nueva oración o párrafo. Por ejemplo, "El gato duerme. La casa está vacía" muestra mayúscula tanto al inicio del texto como después del punto.'
          ]
        },
        {
          id: 'nombres-propios',
          titulo: 'Nombres propios',
          conceptos: [
            'Los nombres propios, que designan individuos, lugares o entidades específicas y únicas, llevan obligatoriamente mayúscula inicial en su primera letra. Esta regla se aplica sin excepciones, independientemente de la posición que ocupe el nombre en la oración, ya sea al inicio o en mitad del texto. Ejemplos como "Ana", "México" y "Amazonas" muestran cómo se escriben siempre con mayúscula inicial; lo correcto es "fui a México con Ana", nunca "fui a méxico con ana".'
          ]
        },
        {
          id: 'instituciones',
          titulo: 'Instituciones',
          conceptos: [
            'Las instituciones u organizaciones tienen nombres propios que requieren reglas especiales de mayúscula. En los nombres de instituciones, todas las palabras principales (generalmente sustantivos y adjetivos) se escriben con mayúscula inicial, mientras que las preposiciones y artículos van en minúscula. Por ejemplo, "Universidad Nacional Autónoma de México" muestra mayúscula en "Universidad", "Nacional", "Autónoma" y "México", pero minúscula en "de". Esta convención distingue visualmente los nombres institucionales en el texto.'
          ]
        },
        {
          id: 'titulos',
          titulo: 'Títulos',
          conceptos: [
            'Los títulos de obras literarias, películas, artículos y otras creaciones siguen una convención de capitalización distintiva. Solo la primera palabra del título debe escribirse con mayúscula inicial, así como cualquier nombre propio que aparezca en el título. Las palabras restantes se escriben en minúscula para crear una apariencia visual más limpia. Por ejemplo, en el título "Cien años de soledad", solo "Cien" y "soledad" (porque es parte del nombre específico) llevan mayúscula; "años" y "de" se escriben en minúscula.'
          ]
        },
        {
          id: 'abreviaturas',
          titulo: 'Abreviaturas',
          conceptos: [
            'Las abreviaturas que representan títulos de tratamiento o académicos siguen una convención específica de escritura. Deben escribirse siempre con mayúscula inicial, seguida del punto abreviativo al final de la abreviatura. Ejemplos como "Sr." (señor), "Dr." (doctor) y "Lic." (licenciado) ilustran esta convención que marca respeto y formalidad. La abreviatura se coloca antes del nombre de la persona: "el Dr. García" o "la Dra. López", donde la mayúscula y el punto son obligatorios.'
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
            'El punto es el signo que termina una oración o un párrafo, marcando una pausa fuerte que separa ideas. Existen dos tipos principales: el punto y seguido, que separa oraciones dentro del mismo párrafo (indicando que la idea continúa), y el punto y aparte, que termina un párrafo completo para marcar el inicio de una idea nueva en un párrafo diferente. Por ejemplo, en un texto sobre Historia, "El imperio romano duró varios siglos. Su influencia fue decisiva en Europa." usa punto y seguido, pero al cambiar de tema se usaría punto y aparte.'
          ]
        },
        {
          id: 'coma',
          titulo: 'La coma',
          conceptos: [
            'La coma separa elementos de una enumeración, es decir, cuando se listan palabras o grupos de palabras coordinadas del mismo tipo. Se coloca entre cada elemento, generalmente sin coma antes de la conjunción "y" (aunque en listas complejas se usa coma antes de "y" también). Por ejemplo, en "necesito comprar manzanas, peras, naranjas y uvas", la coma separa cada fruta de la siguiente.',
            'La coma también aísla aposiciones (palabras que aclaran o amplían el significado de un sustantivo anterior) y aclaraciones intercaladas dentro de la oración. Una aposición es un sustantivo o grupo nominal que va junto a otro sustantivo para precisarlo. Por ejemplo, en "Juan, mi vecino, llegó tarde", la frase "mi vecino" es una aposición que explica quién es Juan, y ambas comas la aíslan del resto de la oración.',
            'La coma aparece obligatoriamente delante de conectores lógicos o marcadores discursivos que enlazan oraciones o ideas, como "sin embargo", "por lo tanto", "además", "no obstante" y otros similares. Estos conectores introducen una relación lógica con la idea anterior y requieren una pausa. Por ejemplo, en "estudiaste mucho, sin embargo, no aprobaste", la coma antes de "sin embargo" marca la transición entre la primera acción y la consecuencia inesperada.'
          ]
        },
        {
          id: 'punto-y-coma',
          titulo: 'El punto y coma',
          conceptos: [
            'El punto y coma separa elementos de una enumeración o lista que ya poseen comas internas, evitando confusiones visuales. Cuando los elementos de una lista tienen sus propias divisiones mediante comas (por ejemplo, debido a aposiciones o aclaraciones), el punto y coma actúa como separador de mayor jerarquía. Por ejemplo, en "visité Madrid, la capital; Barcelona, la segunda ciudad; y Valencia, la ciudad del arte", cada punto y coma separa ciudades que ya contienen comas internas.',
            'El punto y coma también une dos oraciones independientes que están estrechamente relacionadas en contenido, sin necesidad de usar una conjunción explícita. Este uso expresa una relación lógica entre ambas oraciones, pero de forma más sutil que una conjunción. Por ejemplo, en "la temperatura descendió durante la noche; por la mañana había escarcha en el pasto", el punto y coma une dos hechos causalmente relacionados sin usar "por eso" o "por lo tanto".'
          ]
        },
        {
          id: 'dos-puntos',
          titulo: 'Los dos puntos',
          conceptos: [
            'Los dos puntos introducen información que amplía, ejemplifica o aclara lo expresado antes. Pueden preceder a una enumeración (lista de elementos), una cita textual de palabras ajenas, o una explicación que desarrolla la idea anterior. Por ejemplo, "necesitamos tres cosas: paciencia, dedicación y esfuerzo" introduce una enumeración; "como dijo Einstein: "La imaginación es más importante que el conocimiento"" introduce una cita; y "la reunión se suspendió: el director se enfermó" introduce una explicación.',
            'Los dos puntos se utilizan después del saludo o la fórmula de apertura en correspondencia formal (cartas, correos electrónicos, oficios) para marcar una pausa e introducir el cuerpo del mensaje. Este uso es una convención establecida en la redacción de correspondencia que distingue la comunicación formal de la informal. Por ejemplo, en "Estimado Sr. García:" o "Distinguida Directora:", los dos puntos cierren el saludo e introducen el contenido principal de la misiva.'
          ]
        },
        {
          id: 'puntos-suspensivos',
          titulo: 'Puntos suspensivos',
          conceptos: [
            'Los puntos suspensivos son tres puntos (...) que indican una pausa, una interrupción de pensamiento, duda, suspenso o que el enunciado queda incompleto de forma intencional. Crean un efecto de suspenso o de pensamiento interrumpido que invita al lector a reflexionar. Por ejemplo, en "No sé si venir al concierto o... mejor me quedo en casa", los puntos suspensivos sugieren indecisión; y en el diálogo "¿Me dijiste que...", "Sí, hace días", representan una oración interrumpida.'
          ]
        },
        {
          id: 'signos-interrogacion',
          titulo: 'Signos de interrogación',
          conceptos: [
            'Los signos de interrogación en español son simétricos: uno de apertura (¿) al inicio de la pregunta y uno de cierre (?) al final, lo que difiere del inglés que solo usa el signo de cierre. Esta característica del español permite identificar desde el inicio que se trata de una pregunta. Por ejemplo, en "¿Vendrás mañana?" o "¿Cuál es tu nombre?", los signos de apertura y cierre enmarcan la pregunta completa, permitiendo que el lector reconozca la intención interrogativa desde el primer signo.'
          ]
        },
        {
          id: 'signos-exclamacion',
          titulo: 'Signos de exclamación',
          conceptos: [
            'Los signos de exclamación también son simétricos en español: uno de apertura (¡) y uno de cierre (!), enmarcando el contenido exclamativo. Se utilizan para expresar emociones intensas como sorpresa, alegría, admiración, miedo o énfasis, marcando la entonación emotiva con la que debe leerse. Por ejemplo, en "¡Qué hermoso!" expresamos admiración, en "¡Cuidado!" expresamos advertencia urgente, y en "¡Lo logré!" expresamos alegría o triunfo.'
          ]
        },
        {
          id: 'parentesis',
          titulo: 'Paréntesis',
          conceptos: [
            'Los paréntesis se utilizan para insertar información aclaratoria, complementaria o digresiva que es relevante pero no esencial para la comprensión de la idea principal. Esta información, aunque entre paréntesis, enriquece el texto sin interrumpir su flujo lógico. Por ejemplo, en "La Revolución Francesa (1789-1799) transformó Europa" o "El director (que estudió en París) introdujo nuevas técnicas de enseñanza", la información entre paréntesis amplía el contexto pero se podría omitir sin que la oración pierda su sentido fundamental.'
          ]
        },
        {
          id: 'corchetes',
          titulo: 'Corchetes',
          conceptos: [
            'Los corchetes se utilizan en dos contextos principales: para insertar aclaraciones dentro de un texto que ya está entre paréntesis (evitando paréntesis anidados), y para indicar una omisión o supresión de texto en una cita (mediante [...], representando el texto omitido). En textos académicos y citas directas, los corchetes permiten diferenciar entre lo que el autor original escribió y lo que el transcriptor añadió o quitó. Por ejemplo, en una cita "El presidente dijo que [la educación] es fundamental" los corchetes señalan que "la educación" fue añadido por quien transcribió, no estaba en el original.'
          ]
        },
        {
          id: 'comillas',
          titulo: 'Comillas',
          conceptos: [
            'Las comillas se utilizan para reproducir textualmente las palabras de otra persona (citas directas) o para señalar que una palabra se usa de forma especial, irónica o no convencional. Cuando se cita directamente, las comillas enmarcan exactamente lo que la otra persona dijo o escribió sin cambios. Por ejemplo, en "El profesor dijo: "Mañana no habrá clase"" las comillas reproducen sus palabras exactas; en "El Presidente fue un auténtico "amigo" de la educación" las comillas indican que "amigo" es irónicamente usado.'
          ]
        },
        {
          id: 'guion',
          titulo: 'Guion',
          conceptos: [
            'El guión es un signo de puntuación corto (-) con dos funciones principales. En primer lugar, une palabras compuestas formando una unidad conceptual nueva (como "toma-y-daca" o "ciencia-ficción"), especialmente en obras literarias. En segundo lugar, divide una palabra al final de una línea cuando no cabe completa, permitiendo que continúe en el siguiente renglón. Por ejemplo, "treinta-cinco" une dos palabras numéricas, y en un párrafo apretado la palabra "imposibilidad" podría dividirse como "imposi-bilidad" al final de la línea.'
          ]
        },
        {
          id: 'raya',
          titulo: 'Raya',
          conceptos: [
            'La raya (también llamada guión largo o em-dash) es un signo más largo que el guión regular, que sirve para introducir un diálogo (indicando quién habla en una conversación) o para insertar un inciso aclaratorio dentro de una oración, cumpliendo una función similar a la de paréntesis pero con mayor énfasis. En diálogos, marca el cambio de interlocutor; en textos, separa la aclaración del resto de la frase. Por ejemplo, en el diálogo "—Dime la verdad —pidió Juan" la raya introduce las palabras de cada personaje; y en "Todos llegaron —menos Ana— al evento" la raya encierra una aclaración importante.'
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
            'Los sinónimos son palabras que tienen un significado muy parecido o equivalente, aunque casi nunca son 100% intercambiables en todos los contextos. Cada sinónimo puede tener matices semánticos o contextuales que los diferencian, haciendo que uno suene más natural que el otro según la situación. Por ejemplo, "feliz" y "contento" son sinónimos, pero "estoy feliz" expresa una emoción más intensa que "estoy contento", que sugiere una satisfacción más moderada.',
            'El contexto y el registro lingüístico determinan cuál sinónimo es más apropiado en cada situación. Cambiar un sinónimo por otro puede alterar sutilmente el significado, la emoción o la formalidad del texto. Por ejemplo, "coche" (español), "auto" (latinoamericano) y "máquina" (coloquial) son sinónimos, pero en un documento oficial se escribiría "vehículo" en lugar de cualquiera de estos; así, el sinónimo correcto depende de quién lee, dónde se escribe y qué efecto se desea causar.'
          ]
        },
        {
          id: 'antonimos',
          titulo: 'Antónimos',
          conceptos: [
            'Los antónimos son palabras que tienen un significado completamente opuesto o contrario entre sí. La oposición puede ser total (blanco-negro, verdadero-falso) o parcial (grande-pequeño, rico-pobre). Los antónimos ayudan a expresar contrastes y comparaciones en el discurso. Por ejemplo, "generoso" y "avaro" son antónimos porque expresan actitudes opuestas ante la distribución de bienes; así, "mientras algunos son generosos con su dinero, otros son avaros en sus gastos" muestra claramente el contraste.'
          ]
        },
        {
          id: 'homonimos',
          titulo: 'Homónimos',
          conceptos: [
            'Los homónimos son palabras que coinciden en pronunciación o escritura (o en ambas) pero que poseen significados completamente distintos. Esta coincidencia fonética u ortográfica es una fuente común de confusión y ambigüedad en el lenguaje. Por ejemplo, "vino" puede significar "bebida fermentada de uvas" o "llegó" (pasado del verbo venir), dependiendo del contexto y la entonación; esta ambigüedad potencial se resuelve únicamente mediante el contexto de la frase.',
            '"Homónimo" es el término general que engloba dos categorías específicas: los homófonos (igual pronunciación, distinta escritura) y los homógrafos (igual escritura, distinto significado). Este término superior permite clasificar todos los casos de coincidencia fonética u ortográfica sin confusión. Por ejemplo, los pares "hola/ola" (homófonos) y "vino/vino" (homógrafos) son ambos tipos de homónimos, pero en categorías diferentes según si coinciden en sonido, escritura o ambas.'
          ]
        },
        {
          id: 'homofonos',
          titulo: 'Homófonos',
          conceptos: [
            'Los homófonos son palabras que suenan exactamente igual cuando se pronuncian, pero se escriben de forma diferente y tienen significados completamente distintos. Esta coincidencia sonora es fuente de errores ortográficos porque el oído no permite diferenciarlos. Por ejemplo, "hola" (saludo) se pronuncia igual que "ola" (movimiento del agua), y "vaca" (animal) se pronuncia igual que "baca" (portaequipajes del coche), causando frecuentes confusiones al escribir.'
          ]
        },
        {
          id: 'homografos',
          titulo: 'Homógrafos',
          conceptos: [
            'Los homógrafos son palabras que se escriben de forma idéntica, pero tienen pronunciación y/o significado distintos. La similitud gráfica puede causar confusión al leer, pero el contexto permite resolverla. Por ejemplo, "vino" puede referirse a la bebida alcohólica derivada de la uva, o ser el verbo "venir" conjugado en pasado ("ayer vino mi hermano"); la entonación y el contexto revelan cuál se intenta comunicar en cada caso.'
          ]
        },
        {
          id: 'paronimos',
          titulo: 'Parónimos',
          conceptos: [
            'Los parónimos son palabras que se asemejan mucho en su forma escrita o sonora, pero que tienen significados completamente distintos. Esta similitud superficial causa frecuentes confusiones, especialmente en escritura. Por ejemplo, "actitud" (disposición o manera de actuar) se parece a "aptitud" (capacidad o habilidad), y "adoptar" (tomar algo como propio) se parece a "adaptar" (modificar algo para que se ajuste); cambiar uno por otro altera fundamentalmente el sentido de la frase.'
          ]
        },
        {
          id: 'polisemia',
          titulo: 'Polisemia',
          conceptos: [
            'La polisemia es la característica de una palabra que tiene múltiples significados relacionados entre sí por una conexión lógica o histórica. A diferencia de los homónimos (donde los significados son totalmente independientes), los significados polisémicos comparten una raíz semántica común. Por ejemplo, "banco" puede referirse a una institución financiera o a un asiento, ambos significados conectados por la idea de "lugar donde se almacena algo" (dinero en un caso, personas en el otro).'
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
            'El significado preciso de una palabra es frecuentemente dependiente del contexto lingüístico en el que aparece. Una palabra que parece ambigua o con múltiples significados se esclarece cuando se observa el conjunto de palabras que la rodean. Por ejemplo, la palabra "corbata" tiene un significado claro, pero "se apretó la corbata" (literal) vs "se apretó la corbata emocional" requieren contextos distintos para ser interpretados correctamente.',
            'Ante una palabra cuyo significado parece ambiguo o confuso, la estrategia correcta es examinar la oración completa en su totalidad antes de consultar un diccionario o proponer una definición. El contexto oracional resuelve prácticamente todas las ambigüedades léxicas. Por ejemplo, en "El banco se llena de gente todos los días", incluso sin ver más contexto es claro que "banco" significa "institución financiera", mientras que en "El pescador se sentó en el banco a esperar" es evidentemente un "asiento".'
          ]
        },
        {
          id: 'denotacion',
          titulo: 'Denotación',
          conceptos: [
            'La denotación es el significado literal, objetivo y explícito de una palabra, independiente de cualquier contexto emocional o cultural. Es la definición fundamental que se encuentra en el diccionario y que todos los hablantes de la lengua reconocen. Por ejemplo, la denotación de "rosa" es "flor de pétalos y espinas", sin considerar asociaciones románticas, símbolos culturales, o usos figurados que la palabra pueda tener en contextos específicos.'
          ]
        },
        {
          id: 'connotacion',
          titulo: 'Connotación',
          conceptos: [
            'La connotación es el significado subjetivo, simbólico o emocional que una palabra adquiere según el contexto cultural, personal o situacional, más allá de su definición literal. Mientras la denotación es objetiva y universal, la connotación varía según el individuo y la situación. Por ejemplo, "corazón" denota "órgano vital que bombea sangre", pero connota sentimientos, emociones y amor; así, "tiene un corazón de piedra" significa literalmente que es cruel o insensible, no que su órgano es mineral.'
          ]
        },
        {
          id: 'campos-semanticos',
          titulo: 'Campos semánticos',
          conceptos: [
            'Los campos semánticos son conjuntos de palabras que están relacionadas por compartir un mismo tema, campo temático o dominio conceptual. Las palabras del mismo campo semántico se agrupan naturalmente alrededor de una idea central. Por ejemplo, "sartén", "cuchara", "olla", "tenedor" y "cuchillo" pertenecen al campo semántico de la cocina, pues todas son utensilios culinarios; igualmente, "feliz", "alegre", "contento" y "jocundo" pertenecen al campo de las emociones positivas.'
          ]
        },
        {
          id: 'familias-lexicas',
          titulo: 'Familias léxicas',
          conceptos: [
            'Las familias léxicas son grupos de palabras que derivan de una misma raíz o morfema base, compartiendo así un significado fundamental común. Todas las palabras de una familia léxica están relacionadas etimológicamente y conservan la raíz original, aunque pueden cambiar mediante prefijos y sufijos. Por ejemplo, "tierra" es la raíz, y de ella derivan "terrenal" (que existe en la tierra), "aterrizaje" (acción de llegar a tierra), "entierro" (acción de poner algo bajo tierra) y "destierra" (enviar lejos de la tierra).'
          ]
        },
        {
          id: 'series-lexicas',
          titulo: 'Series léxicas',
          conceptos: [
            'Las series léxicas son conjuntos de palabras que se organizan según un criterio compartido, típicamente de intensidad, gradación o escala. Las palabras se pueden ordenar de menor a mayor intensidad (o viceversa) formando una progresión significativa. Por ejemplo, "tibio", "cálido", "caliente" y "ardiente" forman una serie léxica de temperaturas ordenadas de menor a mayor intensidad; igualmente, "triste", "afligido", "desconsolado" forman una serie de estados emocionales negativos en orden ascendente de intensidad.'
          ]
        },
        {
          id: 'neologismos',
          titulo: 'Neologismos',
          conceptos: [
            'Los neologismos son palabras de creación reciente que se incorporan al idioma y son aceptadas por los hablantes como parte del vocabulario común. Surgen frecuentemente para nombrar nuevos conceptos, especialmente en tecnología, redes sociales y campos científicos. Por ejemplo, "selfi" (autorretrato con cámara) y "tuitear" (publicar un tuit) son neologismos nacidos con las redes sociales; igualmente, "videoconferencia" y "ciberataque" son neologismos del mundo digital que ahora son de uso común.'
          ]
        },
        {
          id: 'arcaismos',
          titulo: 'Arcaísmos',
          conceptos: [
            'Los arcaísmos son palabras o expresiones que han dejado de usarse en el lenguaje cotidiano moderno, aunque pueden aparecer en textos antiguos, obras literarias o contextos muy formales. Su desaparición se debe a cambios lingüísticos naturales del idioma a lo largo del tiempo. Por ejemplo, "vusted" (forma antigua de "usted") y "facer" (infinitivo antiguo de "hacer") son arcaísmos que aparecen en textos medievales pero que ningún hablante moderno usaría; igualmente, "fermoso" (hermoso) es un arcaísmo que ha sido reemplazado por su forma actual.'
          ]
        },
        {
          id: 'tecnicismos',
          titulo: 'Tecnicismos',
          conceptos: [
            'Los tecnicismos son palabras especializadas que pertenecen a campos específicos del conocimiento y que frecuentemente no forman parte del vocabulario común. Cada disciplina (medicina, informática, derecho, etc.) posee su propio conjunto de términos técnicos. Por ejemplo, "cardiología" (rama de la medicina que estudia el corazón), "algoritmo" (procedimiento lógico en informática) y "hipoteca" (garantía legal en derecho) son tecnicismos que requieren conocimiento específico del área para ser plenamente comprendidos.'
          ]
        },
        {
          id: 'extranjerismos',
          titulo: 'Extranjerismos',
          conceptos: [
            'Los extranjerismos son palabras o expresiones que el español ha tomado de otros idiomas, usualmente inglés, manteniendo su forma original o adaptándolas a las reglas fonéticas y ortográficas del español. Se incorporan al uso común cuando expresan conceptos nuevos o para los que no existe palabra equivalente en español. Por ejemplo, "marketing" y "software" (del inglés) mantienen su forma original, mientras que "fútbol" (football adaptado) y "clicar" (click hispanizado) son extranjerismos adaptados que ahora son de uso común en español.'
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
            'La raíz es el morfema fundamental que contiene el significado principal y básico de una palabra. Es el elemento mínimo que no puede descomponerse sin perder completamente su sentido, y es común a toda su familia léxica. Por ejemplo, la raíz "tierra" aparece en "terrenal", "aterrizaje", "entierro" y "destierra", proporcionando el significado fundamental a todas estas palabras derivadas; la raíz siempre permanece, aunque se añadan prefijos o sufijos.'
          ]
        },
        {
          id: 'prefijos',
          titulo: 'Prefijos',
          conceptos: [
            'Los prefijos son morfemas que se colocan antes de la raíz de una palabra para modificar o precisar su significado original. A diferencia de la raíz, los prefijos no pueden funcionar como palabras independientes; siempre deben acompañar una raíz. Por ejemplo, el prefijo "re-" en "reconstruir" añade la idea de "volver a hacer", transformando "construir" (hacer por primera vez) en "reconstruir" (hacer de nuevo); igualmente, "deshacer" añade negación a través del prefijo "des-".'
          ]
        },
        {
          id: 'sufijos',
          titulo: 'Sufijos',
          conceptos: [
            'Los sufijos son morfemas que se colocan después de la raíz para modificar su significado o cambiar su categoría gramatical (un verbo puede convertirse en sustantivo, adjetivo, etc.). Como los prefijos, los sufijos no funcionan solos sino que siempre acompañan una raíz. Por ejemplo, el sufijo "-mente" en "lentamente" transforma el adjetivo "lento" en adverbio, indicando "de modo lento"; igualmente, "-ción" en "construcción" transforma el verbo "construir" en un sustantivo que designa la acción.'
          ]
        },
        {
          id: 'composicion',
          titulo: 'Composición',
          conceptos: [
            'La composición es el proceso de unir dos o más palabras completas e independientes para formar una nueva palabra con significado propio. A diferencia de la derivación que añade prefijos o sufijos, la composición utiliza palabras que podrían existir por sí solas. Por ejemplo, "para" (protección) + "aguas" (lluvia) = "paraguas" (objeto que protege de la lluvia); igualmente, "por" + "qué" = "porqué" (sustantivo), o "mesa" + "comedor" = "mesacomedor" (mueble que combina funciones).'
          ]
        },
        {
          id: 'derivacion',
          titulo: 'Derivación',
          conceptos: [
            'La derivación es el proceso de crear palabras nuevas añadiendo prefijos o sufijos a una raíz o palabra base, modificando su significado o categoría gramatical. La palabra base permanece reconocible dentro de la palabra derivada. Por ejemplo, la raíz "feliz" genera "infeliz" (añadiendo el prefijo "in-" que significa negación), "felicidad" (añadiendo el sufijo "-dad" que convierte adjetivo en sustantivo), y "infelicidad" (combinando ambas modificaciones); cada derivada conserva el significado fundamental de "feliz".'
          ]
        },
        {
          id: 'parasintesis',
          titulo: 'Parasíntesis',
          conceptos: [
            'La parasíntesis es un proceso de formación de palabras que combina simultáneamente dos procesos: composición (unir dos palabras) y derivación (agregar prefijos o sufijos). Estas dos operaciones ocurren en la misma palabra, creando un resultado que no podría obtenerse aplicando solo una de ellas. Por ejemplo, "picapedrero" (persona que pica piedra) combina "pica" (primera palabra raíz) + "piedra" (segunda palabra raíz) + el sufijo "-ero" (que indica profesión u oficio); otro ejemplo es "sacacorchos", que combina "saca" (verbo) + "corcho" (sustantivo) + "s" (pluralizador).'
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
            'El registro formal es el uso del lenguaje en contextos académicos, profesionales, institucionales o de solemnidad, donde se requiere una cierta distancia y respeto entre los interlocutores. Se caracteriza por vocabulario culto, estructuras gramaticales complejas y ausencia de coloquialismos. Por ejemplo, en una carta oficial se escribe "le informo que su solicitud fue aprobada", utilizando sujeto explícito, tiempo pasivo y léxico formal, en lugar del tono coloquial "te digo que ya aprobaron tu solicitud".'
          ]
        },
        {
          id: 'registro-informal',
          titulo: 'Registro informal',
          conceptos: [
            'El registro informal es el lenguaje coloquial, cercano y espontáneo que se usa entre personas de confianza, como amigos o familia. Se caracteriza por un tono relajado, omisión de sujetos, diminutivos, expresiones propias de cada región y falta de pretensión de corrección absoluta. Por ejemplo, entre amigos se dice "¿qué onda? ¿vamos por unos tacos?" en lugar de la versión formal "¿Cómo estás? ¿Quisiera ir a comer unos tacos?"; este registro es perfectamente correcto en su contexto, aunque sería inapropiado en un documento oficial.'
          ]
        },
        {
          id: 'adecuacion-vocabulario',
          titulo: 'Adecuación del vocabulario',
          conceptos: [
            'La adecuación del vocabulario es la habilidad de elegir palabras exactas según múltiples factores contextuales: el tipo de texto, el destinatario, el nivel de formalidad requerido y la intención comunicativa. Una palabra correcta en un contexto puede ser totalmente inapropiada en otro. Por ejemplo, en un informe académico se escribiría "Se observó una correlación significativa", pero en un mensaje a un amigo sería mejor "Notamos que las dos cosas estaban conectadas"; ambas expresiones son correctas, pero solo una es adecuada en cada contexto.'
          ]
        },
        {
          id: 'seleccion-terminos',
          titulo: 'Selección de términos',
          conceptos: [
            'La selección adecuada de términos exige preferir siempre la palabra más precisa y específica para expresar la idea, evitando palabras vagas, ambiguas o demasiado genéricas. Palabras como "cosa", "eso", "algo" o "muy" transmiten poca información y restan claridad al mensaje. Por ejemplo, en lugar de decir "me duele algo en la cabeza", es más preciso decir "tengo un dolor agudo en la sien izquierda"; la segunda versión comunica exactamente dónde y cómo es el dolor, permitiendo una comunicación clara y eficiente.'
          ]
        },
        {
          id: 'correccion-lexica',
          titulo: 'Corrección léxica',
          conceptos: [
            'La corrección léxica es el uso preciso de cada palabra según su significado real y establecido, evitando confusiones con parónimos o palabras de sonido similar. Los errores léxicos ocurren cuando se usa una palabra en lugar de otra, alterando el sentido de lo que se quiere expresar. Por ejemplo, confundir "actitud" (disposición o modo de actuar) con "aptitud" (capacidad o habilidad natural) cambiaría completamente el significado; así, "tiene buena actitud para aprender" es incorrecto si se quiere decir "tiene buena aptitud para aprender" (capacidad natural), y vice versa.'
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
            'Establecen relaciones entre dos pares de palabras que comparten el mismo tipo de vínculo semántico. En estas analogías, la primera pareja se relaciona por sinonimia (palabras con significado similar) o antonimia (palabras con significado opuesto). Por ejemplo, "feliz es a contento como triste es a apenado" muestra que ambas parejas se vinculan por sinonimia.'
          ]
        },
        {
          id: 'relaciones-funcion',
          titulo: 'Relaciones de función',
          conceptos: [
            'Relacionan un instrumento u objeto con la función específica que cumple o el propósito para el cual fue diseñado. El primer término designa el objeto y el segundo su utilidad principal. Por ejemplo, "llave es a abrir como cuchillo es a cortar" vincula cada herramienta con la acción característica que realiza.'
          ]
        },
        {
          id: 'relaciones-causa-efecto',
          titulo: 'Relaciones de causa-efecto',
          conceptos: [
            'Conectan dos pares de conceptos donde el primero es causa directa del segundo. El primer término genera o produce necesariamente el segundo como consecuencia natural. Por ejemplo, "fuego es a calor como hielo es a frío" muestra que ambas parejas mantienen una relación de causa-efecto donde una produce la otra inevitablemente.'
          ]
        },
        {
          id: 'relaciones-pertenencia',
          titulo: 'Relaciones de pertenencia',
          conceptos: [
            'Relacionan un componente o parte con el todo que lo contiene o al cual pertenece. El primer término es un elemento constitutivo y el segundo representa el conjunto del cual es parte. Por ejemplo, "rueda es a automóvil como hoja es a árbol" establece que cada elemento pertenece al conjunto mayor que lo define.'
          ]
        },
        {
          id: 'relaciones-oposicion',
          titulo: 'Relaciones de oposición',
          conceptos: [
            'Vinculan dos pares de conceptos donde cada pareja se opone entre sí de manera complementaria. Ambas parejas mantienen una relación de contraste o contraposición. Por ejemplo, "día es a noche como caliente es a frío" muestra que cada par representa opuestos que se excluyen mutuamente, estableciendo una relación paralela de oposición.'
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
            'La palabra o frase seleccionada debe guardar coherencia lógica y semántica con la idea central de la oración. No basta que la opción "suene bien" o se pronuncie correctamente; debe transmitir un significado que encaje con el sentido general del enunciado. Por ejemplo, en "el profesor _____ la lección", completar con "explicó" es lógico, mientras que "comió" no tiene sentido contextual.'
          ]
        },
        {
          id: 'coherencia-gramatical',
          titulo: 'Coherencia gramatical',
          conceptos: [
            'La opción debe mantener acuerdo gramatical completo: género y número con sustantivos y adjetivos, tiempo verbal coherente con el resto de la oración, y concordancia entre sujeto y verbo. Un error gramatical invalida la respuesta aunque tenga sentido semántico. Por ejemplo, "los niños _____ en el parque" requiere un verbo en plural como "jugaban", nunca "jugaba".'
          ]
        },
        {
          id: 'seleccion-contextual',
          titulo: 'Selección contextual',
          conceptos: [
            'Cuando hay múltiples opciones gramaticalmente correctas y semánticamente posibles, el análisis atento del contexto inmediato permite identificar la más precisa. Se debe considerar el tono, la intención y los detalles específicos de la oración. Por ejemplo, en "su respuesta fue _____ pero no ofensiva", "honesta" encaja mejor que "cierta", porque denota sinceridad junto con un contraste apropiado.'
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
            'Para ordenar oraciones de forma lógica, identifica primero la oración temática que introduce el tema principal. Después, sigue el hilo conductor que puede ser causal (causa antes de efecto), cronológico (lo que sucede primero antes de lo posterior) o una combinación de ambos. Por ejemplo, si una oración explica un problema y otra su solución, el problema debe presentarse primero.'
          ]
        },
        {
          id: 'reconstruccion-parrafos',
          titulo: 'Reconstrucción de párrafos',
          conceptos: [
            'Los conectores lógicos ("por eso", "además", "sin embargo", "luego", "entonces") son pistas cruciales que revelan la relación entre oraciones y su secuencia correcta. Estos palabras de enlace señalan si hay adición, contraste, consecuencia o causa entre las proposiciones. Por ejemplo, una oración que comienza con "por lo tanto" debe ir después de su causa, revelando automáticamente el orden correcto.'
          ]
        },
        {
          id: 'secuencia-logica-ideas',
          titulo: 'Secuencia lógica de ideas',
          conceptos: [
            'Un texto coherente respeta un patrón lógico consistente: puede ir de lo general (tema amplio) a lo particular (detalles específicos), o seguir un orden temporal (cronológico) o causal (causa antes de efecto). Esta estructura predecible facilita la comprensión. Por ejemplo, un párrafo que empieza con "existen varios factores" debe desarrollar cada factor ordenadamente antes de sacar conclusiones.'
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
            'La redundancia ocurre cuando una oración repite esencialmente lo que ya se ha dicho en otra parte del párrafo, sin añadir información adicional, ejemplos o aclaraciones. Esta repetición innecesaria debilita el párrafo y lo hace menos eficiente. Por ejemplo, si un párrafo dice "la educación es importante" en la primera oración, una oración posterior que diga "es fundamental que los estudiantes reciban educación" es redundante y debe eliminarse.'
          ]
        },
        {
          id: 'impertinencia',
          titulo: 'Impertinencia',
          conceptos: [
            'La impertinencia se presenta cuando una oración desviá la atención del tema central, abordando un asunto tangencial o completamente ajeno al propósito del párrafo. Aunque la oración sea gramaticalmente correcta e interesante por sí sola, no pertenece al párrafo si no contribuye a desarrollar su idea principal. Por ejemplo, en un párrafo sobre el cambio climático, una oración sobre gastronomía local sería impertinente y debe ser eliminada.'
          ]
        },
        {
          id: 'inconsistencia-tematica',
          titulo: 'Inconsistencia temática',
          conceptos: [
            'La inconsistencia temática surge cuando una oración contradice, cambia de perspectiva radicalmente o presenta información incompatible con el tema central del párrafo. Una oración puede estar perfectamente escrita y ser verdadera en sí misma, pero si cuestiona o se opone a la dirección del párrafo, rompe su coherencia y debe ser eliminada. Por ejemplo, si un párrafo argumenta a favor de una política, una oración que la critique sería temáticamente inconsistente.'
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
            'El texto narrativo relata una sucesión de hechos, generalmente en orden cronológico, protagonizados por personajes dentro de una trama con conflicto y resolución. Incluye un narrador que organiza los eventos y proporciona información sobre dónde y cuándo ocurren. Ejemplos típicos son cuentos como "Había una vez un campesino que encontró un tesoro escondido en su campo" y novelas que desarrollan historias completas con múltiples personajes.'
          ]
        },
        {
          id: 'descriptivo',
          titulo: 'Descriptivo',
          conceptos: [
            'El texto descriptivo pinta un cuadro detallado de las características físicas, sensoriales o emocionales de una persona, lugar, objeto o situación. Apela a los sentidos del lector mediante adjetivos precisos, figuras literarias y detalles visuales para crear una imagen mental vivida. Por ejemplo, "la montaña se alzaba majestuosa cubierta de nieve blanca, mientras el aire frío quemaba los pulmones" describe un paisaje mediante sensaciones visuales y táctiles.'
          ]
        },
        {
          id: 'expositivo',
          titulo: 'Expositivo',
          conceptos: [
            'El texto expositivo presenta información de forma clara y ordenada con la intención de informar o explicar un tema. Busca objetividad sin incluir opiniones personales, utilizando hechos, datos y ejemplos verificables. Frecuentemente emplea una estructura lógica que va de lo general a lo particular. Artículos enciclopédicos, libros de texto e informes técnicos son ejemplos típicos que exponen conocimiento de manera accesible.'
          ]
        },
        {
          id: 'argumentativo',
          titulo: 'Argumentativo',
          conceptos: [
            'El texto argumentativo propone una tesis u opinión y la defiende mediante razones lógicas, evidencias concretas y ejemplos que buscan persuadir al lector. Anticipa objeciones y las refuta, demostrando que la posición del autor es válida o superior. Ensayos, discursos políticos y reseñas críticas son ejemplos que recurren a la argumentación para cambiar o reforzar opiniones.'
          ]
        },
        {
          id: 'literario',
          titulo: 'Literario',
          conceptos: [
            'El texto literario tiene como propósito principal la belleza y el efecto estético, utilizando lenguaje artístico y recursos expresivos para evocar emociones e imágenes. Emplea figuras literarias como metáforas, símiles, personificación y otros artificios retóricos para enriquecer el significado. Poesía, literatura de ficción y dramaturgia son formas literarias que priorizan la forma y el estilo tanto como el contenido.'
          ]
        },
        {
          id: 'periodistico',
          titulo: 'Periodístico',
          conceptos: [
            'El texto periodístico comunica información sobre eventos contemporáneos con la intención de informar al público. Responde sistemáticamente las preguntas fundamentales: qué ocurrió, quién estuvo involucrado, cuándo sucedió, dónde tuvo lugar y por qué pasó. Prioriza la objetividad, la claridad y la actualidad. Noticias, reportajes y crónicas periodísticas son ejemplos que buscan mantener al lector informado sobre la realidad actual.'
          ]
        },
        {
          id: 'academico',
          titulo: 'Académico',
          conceptos: [
            'El texto académico se caracteriza por un lenguaje formal, riguroso y objetivo que se sustenta en fuentes confiables y metodologías de investigación. Busca contribuir al conocimiento de una disciplina mediante argumentación fundamentada y evidencia verificable. Ensayos, tesis, artículos científicos y monografías son formatos académicos que requieren citation de fuentes y cumplimiento de normas específicas de redacción.'
          ]
        },
        {
          id: 'administrativo',
          titulo: 'Administrativo',
          conceptos: [
            'El texto administrativo se rige por formatos y estructuras predefinidas establecidas por instituciones u organizaciones para gestionar trámites, comunicaciones oficiales y procedimientos formales. Prioriza la claridad, la precisión y el cumplimiento de requisitos legales o institucionales. Solicitudes, oficios, memorandos, contratos e informes administrativos son ejemplos que deben seguir convenciones específicas de formato y contenido.'
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
            'La idea principal es la afirmación central más importante que resume el mensaje del texto, alrededor de la cual se organizan todos los demás contenidos. Se expresa como una oración completa, no solo como un tema en pocas palabras. Los demás párrafos y detalles aportan evidencia, ejemplos y aclaraciones que sustentan esta idea. Por ejemplo, en un ensayo sobre reciclaje, la idea principal podría ser "el reciclaje reduce significativamente el impacto ambiental de los residuos".'
          ]
        },
        {
          id: 'ideas-secundarias',
          titulo: 'Ideas secundarias',
          conceptos: [
            'Las ideas secundarias son afirmaciones de menor importancia que sustentan, ejemplifican o desarrollan la idea principal. Proporcionan detalles, explicaciones, evidencias y argumentos que enriquecen y clarifican el mensaje central. Cada idea secundaria depende de la principal y contribuye a hacerla más comprensible y convincente. Por ejemplo, si la idea principal es sobre la importancia del ejercicio, las ideas secundarias podrían abordar sus beneficios cardiovasculares, efectos en la salud mental y regulación del peso.'
          ]
        },
        {
          id: 'tema-central',
          titulo: 'Tema central',
          conceptos: [
            'El tema central es el asunto o materia general que aborda el texto, expresable en pocas palabras o una frase nominal breve. A diferencia de la idea principal, que es una afirmación completa con verbo, el tema es simplemente la identificación del tópico. Por ejemplo, el tema podría ser "educación en tiempos de pandemia", mientras que la idea principal sería "la educación a distancia durante la pandemia mejoró el acceso educativo a zonas rurales".'
          ]
        },
        {
          id: 'titulo-adecuado',
          titulo: 'Título adecuado',
          conceptos: [
            'Un título adecuado encapsula el contenido esencial del texto en pocas palabras, siendo ni demasiado genérico (que podría aplicar a muchos textos) ni demasiado específico (que reduciría el alcance de comprensión). Debe atraer al lector mientras prepara exactamente lo que encontrará. Por ejemplo, un título como "La Importancia de la Lectura" es demasiado genérico, mientras que "Por qué leer novelas de ciencia ficción fortalece el pensamiento crítico" es más preciso y adecuado.'
          ]
        },
        {
          id: 'proposito-autor',
          titulo: 'Propósito del autor',
          conceptos: [
            'El propósito del autor es la intención o razón fundamental por la cual el escritor decide redactar el texto. Puede ser informar sobre un hecho, contar una historia, describir un lugar, persuadir al lector para adoptar una posición, o simplemente entretener. Identificar el propósito ayuda a comprender por qué el autor eligió cierta estructura, tono y contenido. Por ejemplo, un autor que desea persuadir empleará argumentos, mientras que quien busca entretener recurrirá a narrativas emocionantes o humor.'
          ]
        },
        {
          id: 'intencion-comunicativa',
          titulo: 'Intención comunicativa',
          conceptos: [
            'La intención comunicativa es el efecto específico que el autor desea producir en el lector más allá de simplemente informar. Busca convencer al lector de una posición, alertarlo sobre un peligro, conmover sus emociones, inspirarlo a la acción o provocar su reflexión crítica. Esta intención guía la selección de argumentos, ejemplos y tono del texto. Por ejemplo, un autor que escribe sobre la contaminación con intención de alertar usará datos alarmantes, mientras que si busca inspirar esperanza destacará soluciones exitosas.'
          ]
        },
        {
          id: 'tono-autor',
          titulo: 'Tono del autor',
          conceptos: [
            'El tono del autor es la actitud emocional o perspectiva que expresa hacia el tema mediante su elección de palabras, estructura y énfasis. Puede ser serio y formal en un ensayo académico, irónico y burlón en una crítica, humorístico en una columna de opinión, o crítico en un análisis. El tono refleja los sentimientos del autor y contagia una cierta atmósfera al lector. Por ejemplo, decir "el gobierno aprobó otra medida desastrosa" transmite un tono crítico, mientras que "el gobierno implementó una iniciativa innovadora" suena aprobatorio.'
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
            'Es la relación lógica entre oraciones cercanas dentro de un mismo párrafo, que asegura que las ideas fluyan de forma coherente. Las oraciones deben conectarse naturalmente entre sí, manteniendo una progresión clara del pensamiento. Por ejemplo, en "el estudiante llegó tarde a clase. Olvidó el despertador" hay coherencia local porque la segunda oración explica causalmente la primera.'
          ]
        },
        {
          id: 'coherencia-global',
          titulo: 'Coherencia global',
          conceptos: [
            'Es la relación lógica de todas las ideas a lo largo de todo el texto, de principio a fin, que asegura que el tema central se mantenga consistente. Todos los párrafos deben contribuir al propósito general del texto sin contradicciones internas. Por ejemplo, un ensayo sobre "los beneficios del ejercicio" mantiene coherencia global si cada párrafo aborda un aspecto diferente de este tema, sin desviación a ideas ajenas.'
          ]
        },
        {
          id: 'conectores-logicos-resumen',
          titulo: 'Conectores lógicos',
          conceptos: [
            'Son palabras que enlazan ideas entre oraciones y párrafos, mostrando cómo se relacionan lógicamente entre sí. Sin estos conectores, el texto sería una serie de ideas aisladas sin dirección clara. Por ejemplo, el conector "sin embargo" vincula dos ideas opuestas: "el equipo practicó mucho; sin embargo, perdió el partido", mostrando la relación de contraste.'
          ]
        },
        {
          id: 'marcadores-discursivos',
          titulo: 'Marcadores discursivos',
          conceptos: [
            'Son expresiones que organizan la estructura del texto y guían al lector a través del razonamiento del autor, marcando las etapas principales del discurso. Estos marcadores funcionan como señales que permiten al lector anticipar qué viene después. Por ejemplo, "en primer lugar" inicia una enumeración, "por otro lado" introduce un contraste, y "en conclusión" marca el cierre de las ideas desarrolladas.'
          ]
        },
        {
          id: 'referencias',
          titulo: 'Referencias',
          conceptos: [
            'Son palabras, especialmente pronombres, que remiten a elementos ya mencionados en el texto anterior, evitando la repetición innecesaria de sustantivos. Las referencias crean cohesión textual porque permiten que el lector sepa a qué se refieren sin que se repita constantemente el mismo término. Por ejemplo, en "Juan llegó a casa. Él estaba feliz", el pronombre "él" es una referencia que se remite a "Juan" mencionado en la oración anterior.'
          ]
        },
        {
          id: 'deicticos',
          titulo: 'Deícticos',
          conceptos: [
            'Son palabras cuyo significado no es fijo, sino que depende completamente del contexto en que se usan, especialmente de quién habla y desde dónde. Sin el contexto inmediato, estas palabras no tienen sentido claro. Por ejemplo, la palabra "aquí" significa algo diferente según quién la diga: "aquí" en la voz del autor es diferente a "aquí" en la voz del lector, porque depende de la ubicación específica de cada persona.'
          ]
        },
        {
          id: 'elipsis',
          titulo: 'Elipsis',
          conceptos: [
            'Es una técnica de cohesión que consiste en omitir propositivamente una palabra o frase que se sobreentiende fácilmente por el contexto, evitando la repetición tediosa. La elipsis permite que el texto sea más ágil y conciso sin perder claridad. Por ejemplo, en "Pedro compró manzanas y María, peras", se omite el verbo "compró" en la segunda parte porque está implícito que María también compró, manteniendo la comprensión perfecta.'
          ]
        },
        {
          id: 'sustitucion-lexica',
          titulo: 'Sustitución léxica',
          conceptos: [
            'Es un recurso de cohesión que consiste en reemplazar una palabra por un sinónimo o una expresión equivalente, evitando la repetición innecesaria del mismo término. Esta estrategia enriquece el texto y mantiene el interés del lector al variar el vocabulario. Por ejemplo, en "el perro corría felizmente. El animal parecía gozar de libertad", se sustituye "perro" por "animal" para evitar repetir la misma palabra dos veces seguidas.'
          ]
        },
        {
          id: 'repeticion-lexica',
          titulo: 'Repetición léxica',
          conceptos: [
            'Es un recurso estilístico que consiste en repetir intencionalmente una palabra clave en lugares estratégicos del texto para dar énfasis, claridad o refuerzo a una idea importante. A diferencia de la repetición accidental que empobrece el texto, esta repetición deliberada es una técnica literaria efectiva. Por ejemplo, "la paz, la paz es lo que necesitamos; la paz es el futuro" repite la palabra "paz" para enfatizar su importancia central en el mensaje.'
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
            'Los conectores de adición sirven para sumar o agregar una idea a otra que ya se mencionó, reforzando o ampliando el argumento sin contradecirlo. Se usan con frecuencia para enumerar razones o características adicionales dentro de un mismo párrafo. Por ejemplo, en "el ejercicio mejora la salud física; además, reduce el estrés y, asimismo, favorece el descanso", cada conector suma una razón nueva a favor de la misma idea.'
          ]
        },
        {
          id: 'conector-contraste',
          titulo: 'Contraste',
          conceptos: [
            'Los conectores de contraste muestran una oposición o antítesis entre dos ideas, presentando información que contradice o matiza lo que se dijo antes. Estos conectores preparan al lector para una giro inesperado en el razonamiento. Por ejemplo, en "fue un día soleado; sin embargo, no pude salir de casa" o "trabajó durante años; pero nunca obtuvo reconocimiento", el conector marca el contraste entre expectativa y realidad.'
          ]
        },
        {
          id: 'conector-causa',
          titulo: 'Causa',
          conceptos: [
            'Los conectores de causa explican el motivo, la razón o el origen de un hecho, introduciendo la proposición que justifica o fundamenta una afirmación anterior. Estos conectores son esenciales para argumentar lógicamente. Por ejemplo, en "no asistió a la reunión porque estaba enfermo" o "ya que no había tiempo, decidimos posponer la discusión", el conector introduce la causa que explica la consecuencia.'
          ]
        },
        {
          id: 'conector-consecuencia',
          titulo: 'Consecuencia',
          conceptos: [
            'Los conectores de consecuencia muestran el resultado, el efecto o la conclusión que se deriva de una premisa o causa previamente mencionada. Enlazan la causa con su resultado de manera directa y lógica. Por ejemplo, en "estudió toda la noche; por lo tanto, consiguió una excelente calificación" o "los ingresos disminuyeron; así que tuvieron que reducir gastos", el conector marca la relación causa-efecto.'
          ]
        },
        {
          id: 'conector-comparacion',
          titulo: 'Comparación',
          conceptos: [
            'Los conectores de comparación establecen una relación de semejanza o similitud entre dos elementos, situaciones o ideas, destacando características comunes. Estos conectores ayudan a clarificar mediante la comparación. Por ejemplo, en "del mismo modo que la madera es inflamable, el papel también lo es" o "así como el corazón bombea sangre, el cerebro procesa información", se establece una relación de analogía entre los elementos comparados.'
          ]
        },
        {
          id: 'conector-ejemplificacion',
          titulo: 'Ejemplificación',
          conceptos: [
            'Los conectores de ejemplificación introducen ejemplos concretos que ilustran, aclaran o demuestran una idea general previamente mencionada. Los ejemplos hacen que un concepto abstracto sea más tangible y comprensible. Por ejemplo, en "los reptiles tienen características únicas; por ejemplo, la capacidad de cambiar de piel" o "muchas profesiones requieren especialización, a saber, la medicina, la ingeniería y la abogacía", el conector introduce pruebas específicas.'
          ]
        },
        {
          id: 'conector-temporalidad',
          titulo: 'Temporalidad',
          conceptos: [
            'Los conectores de temporalidad ubican los hechos en el tiempo, estableciendo secuencias, simultaneidad o relaciones cronológicas entre eventos. Permiten al lector seguir el orden en que ocurren las acciones en el relato. Por ejemplo, en "mientras tanto, los soldados avanzaban hacia el frente" establece simultaneidad, mientras que "después de terminar el trabajo, salieron a celebrar" o "luego llegaron los refuerzos" marcan sucesión temporal.'
          ]
        },
        {
          id: 'conector-condicion',
          titulo: 'Condición',
          conceptos: [
            'Los conectores de condición plantean una condición necesaria o suficiente para que algo ocurra, introduciendo una hipótesis que determina la realización de una acción. Estos conectores enlazan premisas con sus consecuencias condicionales. Por ejemplo, en "si estudias regularmente, aprobarás el examen" o "en caso de que llueva, llevaré paraguas", el conector establece que algo sucederá solo si se cumple cierta condición.'
          ]
        },
        {
          id: 'conector-finalidad',
          titulo: 'Finalidad',
          conceptos: [
            'Los conectores de finalidad expresan el propósito, el objetivo o la intención que motiva una acción, respondiendo a la pregunta "¿para qué?". Enlazan acciones con sus metas o intenciones. Por ejemplo, en "trabajo duro para que mi familia tenga una mejor vida" o "estudié todo el semestre con el fin de obtener una beca", el conector marca la relación entre la acción y su propósito intencional.'
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
            'Es la información que aparece expresada de forma directa, clara y literal en el texto, sin necesidad de deducción alguna. El lector puede identificarla simplemente leyendo lo que el autor escribió. Por ejemplo, en el texto "el río Amazonas es el más largo de América del Sur", la información sobre cuál es el río más largo es explícita porque se dice directamente sin dejar lugar a interpretaciones.'
          ]
        },
        {
          id: 'informacion-implicita',
          titulo: 'Información implícita',
          conceptos: [
            'Es la información que no aparece expresada directamente en el texto, pero se puede deducir fácilmente a partir de las pistas, el contexto o lo que está escrito de forma explícita. El lector debe hacer una conexión lógica para descubrirla. Por ejemplo, en "Juan entró sin abrir la puerta", está implícito que pasó a través de la puerta abierta o que la puerta estaba ya abierta, aunque el texto no lo diga literalmente.'
          ]
        },
        {
          id: 'inferencias',
          titulo: 'Inferencias',
          conceptos: [
            'Son conclusiones o interpretaciones que el lector obtiene a partir de pistas, evidencias o indicios presentes en el texto, aunque la conclusión específica no esté dicha explícitamente. Las inferencias requieren razonamiento e interpretación activa. Por ejemplo, en "llegó temblando a casa con la ropa mojada", el lector infiere que estuvo expuesto a condiciones de frío o lluvia, aunque el texto no diga directamente "tuvo frío" o "llovió".'
          ]
        },
        {
          id: 'deducciones',
          titulo: 'Deducciones',
          conceptos: [
            'Son razonamientos lógicos que parten de información general o de premisas amplias del texto para llegar a conclusiones específicas y precisas. La deducción es un proceso que va de lo general a lo particular. Por ejemplo, si el texto dice "todos los mamíferos tienen glándulas mamarias" y "el perro es un mamífero", se deduce lógicamente que "el perro tiene glándulas mamarias", aplicando la información general al caso específico.'
          ]
        },
        {
          id: 'conclusiones',
          titulo: 'Conclusiones',
          conceptos: [
            'Son afirmaciones finales que cierran o resumen el razonamiento completo, basándose en toda la información y los argumentos expuestos anteriormente en el texto. Las conclusiones sintetizan lo que se ha demostrado o analizado. Por ejemplo, en un ensayo que ha presentado múltiples razones por las cuales leer es beneficioso, la conclusión podría ser "por todas estas razones, leer es fundamental para el desarrollo intelectual y personal".'
          ]
        },
        {
          id: 'comparacion-textos',
          titulo: 'Comparación de textos',
          conceptos: [
            'Es el análisis que examina dos textos relacionados para identificar tanto sus similitudes como sus diferencias, destacando cómo cada autor aborda el mismo tema desde perspectivas distintas. Esta comparación permite comprender múltiples puntos de vista. Por ejemplo, al comparar un artículo sobre energía renovable escrito por un ambientalista con otro escrito por un ingeniero industrial, se identificarían enfoques similares pero también prioridades y argumentos diferentes según sus perspectivas.'
          ]
        },
        {
          id: 'sintesis',
          titulo: 'Síntesis',
          conceptos: [
            'Es un resumen muy conciso que reduce un texto a sus ideas esenciales y principales, expresadas con palabras propias del lector, eliminando detalles secundarios. La síntesis es más breve que el resumen y captura solo lo fundamental. Por ejemplo, si un artículo extenso explica los efectos del cambio climático en diferentes aspectos (flora, fauna, agricultura), la síntesis podría ser: "el cambio climático afecta negativamente todos los ecosistemas del planeta".'
          ]
        },
        {
          id: 'parafrasis',
          titulo: 'Paráfrasis',
          conceptos: [
            'Es una técnica de reexpresión que comunica la misma idea o significado del texto original, pero utilizando palabras, estructuras y ejemplos diferentes. A diferencia de la cita, la paráfrasis reformula completamente el texto manteniendo el sentido. Por ejemplo, el texto "la esperanza es lo último que se pierde" podría parafrasearse como "incluso en las situaciones más desesperadas, el ser humano mantiene la capacidad de creer en un futuro mejor".'
          ]
        },
        {
          id: 'resumen',
          titulo: 'Resumen',
          conceptos: [
            'Es una reformulación breve de un texto que presenta las ideas más importantes y principales, preservando el sentido original sin añadir interpretaciones ajenas. El resumen reduce considerablemente la extensión, pero mantiene la esencia del contenido. Por ejemplo, un resumen de un artículo sobre historia de la Revolución Francesa podría sintetizar: "la Revolución Francesa (1789-1799) transformó la sociedad medieval, estableciendo principios de libertad, igualdad y soberanía popular".'
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
            'Son datos, informaciones o afirmaciones verificables y objetivas que pueden comprobarse mediante investigación, experimento o consulta a fuentes confiables. Los hechos son independientes de las creencias o preferencias personales. Por ejemplo, "el agua hierve a 100°C al nivel del mar" es un hecho científico que puede medirse y verificarse en cualquier laboratorio del mundo bajo las mismas condiciones.'
          ]
        },
        {
          id: 'opiniones',
          titulo: 'Opiniones',
          conceptos: [
            'Son puntos de vista subjetivos basados en creencias, gustos, experiencias y valores personales, que pueden variar significativamente de una persona a otra. Las opiniones no pueden verificarse como verdaderas o falsas porque dependen de la perspectiva individual. Por ejemplo, "esta es la mejor película del año" es una opinión porque distintos espectadores pueden preferir películas diferentes según sus gustos personales y criterios de evaluación.'
          ]
        },
        {
          id: 'juicios-valor',
          titulo: 'Juicios de valor',
          conceptos: [
            'Son evaluaciones o valoraciones subjetivas de algo, basadas explícitamente en las creencias morales, éticas, estéticas o preferencias personales de quien las emite. Los juicios de valor presuponen un criterio para evaluar algo como "bueno", "malo", "bello" o "feo". Por ejemplo, "el consumismo es malo para la sociedad" es un juicio de valor que refleja una evaluación moral específica, no una información verificable como un hecho.'
          ]
        },
        {
          id: 'suposiciones',
          titulo: 'Suposiciones',
          conceptos: [
            'Son ideas o afirmaciones que el autor o lector asume como ciertas sin haberlas comprobado o demostrado explícitamente en el texto. Las suposiciones son implícitas y se dan por sobreentendidas, pero no están justificadas. Por ejemplo, en un texto que afirma "los estudiantes exitosos duermen poco", hay una suposición no expresada de que "dormir poco es un indicador o causa del éxito académico", idea que no está probada en el texto.'
          ]
        },
        {
          id: 'objetividad-subjetividad',
          titulo: 'Objetividad y subjetividad',
          conceptos: [
            'La objetividad consiste en presentar la información de forma neutral, sin que influyan sentimientos, preferencias o perspectivas personales del autor. Un texto objetivo busca los hechos verificables y evita valoraciones. Por ejemplo, "el café contiene cafeína" es objetivo, mientras que "el café es la bebida más deliciosa" es subjetivo porque expresa una preferencia personal.',
            'La subjetividad, en cambio, implica que el texto está necesariamente influido por los juicios, creencias, perspectiva personal y experiencias del autor. Un texto subjetivo refleja un punto de vista particular. Por ejemplo, un crítico de arte puede escribir subjetivamente sobre una pintura enfatizando lo que le parece hermoso o significativo, lo que otro crítico podría evaluar completamente diferente según su propia perspectiva.'
          ]
        },
        {
          id: 'confiabilidad-informacion',
          titulo: 'Confiabilidad de la información',
          conceptos: [
            'Es el juicio sobre si la información presentada en un texto merece confianza y credibilidad, lo cual se evalúa considerando múltiples factores. Se examina si el autor es un experto reconocido en el tema, si tiene credibilidad académica o profesional, y especialmente si los datos y afirmaciones pueden verificarse de forma independiente en otras fuentes confiables. Por ejemplo, una investigación sobre medicina publicada en una revista científica revisada por pares es más confiable que una afirmación sobre el mismo tema en un blog sin referencias.'
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
            'La tesis es la idea central que el autor defiende, propone o sostiene a lo largo de todo el texto argumentativo, y suele aparecer explícita en la introducción o la conclusión. Todo el resto del texto gira en torno a sustentarla con razones y evidencias. Por ejemplo, en un ensayo sobre educación, la tesis podría ser "la educación a distancia es tan efectiva como la presencial cuando se cuenta con las herramientas adecuadas".'
          ]
        },
        {
          id: 'argumentos',
          titulo: 'Argumentos',
          conceptos: [
            'Los argumentos son razones, justificaciones o pruebas concretas que el autor utiliza para sustentar, defender o demostrar que su tesis es válida. Sin argumentos, la tesis queda insustentada y el texto pierde poder persuasivo. Por ejemplo, si la tesis es "el ejercicio físico mejora la salud mental", un argumento podría ser "el ejercicio libera endorfinas que reducen la depresión y la ansiedad", proporcionando una razón científica que apoya la tesis.'
          ]
        },
        {
          id: 'contraargumentos',
          titulo: 'Contraargumentos',
          conceptos: [
            'Son ideas, argumentos u objeciones que se oponen, cuestionan o refutan la tesis principal, representando perspectivas alternativas. Un texto argumentativo fuerte y sofisticado anticipa y responde a los contraargumentos posibles, demostrando que ha considerado las objeciones. Por ejemplo, si la tesis afirma "las redes sociales tienen beneficios para la comunicación", un contraargumento sería "las redes sociales crean adicción y aislamiento social", y el autor debe responder a esta objeción.'
          ]
        },
        {
          id: 'evidencias',
          titulo: 'Evidencias',
          conceptos: [
            'Son datos verificables, ejemplos específicos, estudios científicos, testimonios o pruebas concretas que respaldan y demuestran un argumento presentado por el autor. Las evidencias dan credibilidad y solidez al razonamiento. Por ejemplo, si el argumento es "el cambio climático está acelerado", la evidencia podría ser "según datos del IPCC, la temperatura global ha aumentado 1.1°C desde la era preindustrial", proporcionando un dato concreto que lo sustenta.'
          ]
        },
        {
          id: 'conclusion-argumentativa',
          titulo: 'Conclusión',
          conceptos: [
            'La conclusión argumentativa cierra el texto persuasivo reafirmando la tesis a partir de todo lo que se ha demostrado y argumentado anteriormente. La conclusión no introduce información nueva, sino que sintetiza y resuelve el razonamiento desarrollado. Por ejemplo, después de presentar múltiples argumentos y evidencias sobre por qué el reciclaje es importante, la conclusión podría ser "en conclusión, el reciclaje es esencial para preservar nuestro planeta para futuras generaciones".'
          ]
        },
        {
          id: 'falacias-argumentativas',
          titulo: 'Falacias argumentativas básicas',
          conceptos: [
            'Las falacias argumentativas son razonamientos que parecen válidos a primera vista, pero contienen un error lógico que los invalida. Aunque pueden parecer persuasivos, son técnicas de engaño intelectual que debilitan un argumento. Por ejemplo, apelar a la autoridad sin evidencia ("el presidente lo dijo, así que debe ser cierto") es una falacia porque la afirmación de alguien importante no prueba que algo sea verdadero.',
            'La falacia ad hominem consiste en atacar a la persona que presenta el argumento en lugar de refutar el argumento mismo, lo cual es un error lógico grave. Por ejemplo, decir "tu argumento sobre ecología no vale porque eres un hipócrita que maneja auto" es ad hominem. La generalización apresurada ocurre cuando se saca una conclusión general a partir de muy pocos casos particulares. Por ejemplo, "conocí a dos personas perezosas de esa región, entonces todos los de allí son perezosos" es una generalización apresurada basada en evidencia insuficiente.'
          ]
        }
      ]
    }
  ]
}

export default lecturaEspanol
