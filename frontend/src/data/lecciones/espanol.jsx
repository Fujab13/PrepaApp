import { FaBookOpen } from "react-icons/fa";

const espanol = {
  id: 'espanol',
  nombre: 'Español',
  icono: <FaBookOpen />,
  descripcion: 'Gramática, ortografía y comprensión',
  color: '#26d1e8',
  preguntas: [

    // ===== ORTOGRAFÍA: ACENTUACIÓN =====
    { id: 1, pregunta: "¿Cuál de las siguientes palabras es esdrújula?", opciones: ["Camion", "Telefono", "Facil"], correcta: 1 },
    { id: 2, pregunta: "¿Cuál palabra lleva tilde por ser una palabra aguda terminada en 'n'?", opciones: ["Jardin", "Casa", "Mesa"], correcta: 0 },
    { id: 3, pregunta: "Identifica la palabra grave (llana) que requiere tilde:", opciones: ["Arbol", "Camion", "Feliz"], correcta: 0 },
    { id: 4, pregunta: "¿Cuál de las siguientes opciones está correctamente acentuada?", opciones: ["Perú", "Peru", "Perù"], correcta: 0 },
    { id: 5, pregunta: "Selecciona la palabra sobresdrújula:", opciones: ["Dígamelo", "Rápido", "Cómodo"], correcta: 0 },
    { id: 6, pregunta: "¿Qué palabra necesita tilde diacrítica en la oración 'Yo se que vendrás'?", opciones: ["se → sé", "que → qué", "vendrás → vendras"], correcta: 0 },
    { id: 7, pregunta: "Elige la opción correctamente acentuada: '¿_____ hora es?'", opciones: ["Que", "Qué", "Qee"], correcta: 1 },

    // ===== ORTOGRAFÍA: USO DE LETRAS =====
    { id: 8, pregunta: "Completa correctamente: 'El ___ de agua estaba muy alto.'", opciones: ["nivel", "nibel", "nivell"], correcta: 0 },
    { id: 9, pregunta: "¿Cuál palabra está escrita correctamente?", opciones: ["Exelente", "Excelente", "Exhelente"], correcta: 1 },
    { id: 10, pregunta: "Elige la forma correcta:", opciones: ["Haber (verbo)", "Aber (verbo)", "Haver (verbo)"], correcta: 0 },
    { id: 11, pregunta: "¿Cuál oración usa correctamente 'haber' y 'a ver'?", opciones: ["Voy a haber qué pasa", "Voy a ver qué pasa", "Voy haber qué pasa"], correcta: 1 },
    { id: 12, pregunta: "Selecciona la palabra correctamente escrita con 'll':", opciones: ["Cabayo", "Caballo", "Cabaio"], correcta: 1 },
    { id: 13, pregunta: "¿Cuál es la ortografía correcta?", opciones: ["Vaca (animal)", "Baca (animal)", "Vacca (animal)"], correcta: 0 },
    { id: 14, pregunta: "Completa: 'Ese comportamiento es una ___ de respeto.'", opciones: ["falta", "falla", "faltta"], correcta: 0 },

    // ===== SIGNOS DE PUNTUACIÓN =====
    { id: 15, pregunta: "¿Qué signo de puntuación falta en: 'Cuando llegue el momento hablaremos'?", opciones: ["Una coma después de 'momento'", "Un punto y coma", "Dos puntos"], correcta: 0 },
    { id: 16, pregunta: "¿Cuál es el uso correcto de los dos puntos?", opciones: ["Antes de una enumeración", "Al final de cualquier oración", "Entre sujeto y verbo"], correcta: 0 },
    { id: 17, pregunta: "Elige la oración con puntuación correcta:", opciones: ["María, ven aquí por favor.", "María ven, aquí, por favor.", "María ven aquí, por favor"], correcta: 0 },
    { id: 18, pregunta: "¿Cuándo se utiliza el punto y coma?", opciones: ["Para separar elementos de una lista que ya contienen comas", "Para iniciar una carta", "Para separar sílabas"], correcta: 0 },

    // ===== CATEGORÍAS GRAMATICALES =====
    { id: 19, pregunta: "En la oración 'El perro corre rápido', la palabra 'rápido' es:", opciones: ["Adjetivo", "Adverbio", "Sustantivo"], correcta: 1 },
    { id: 20, pregunta: "Identifica el sustantivo en la oración 'La casa azul es hermosa':", opciones: ["Casa", "Azul", "Hermosa"], correcta: 0 },
    { id: 21, pregunta: "En 'Ella corre todos los días', la palabra 'corre' es un verbo en tiempo:", opciones: ["Pasado", "Presente", "Futuro"], correcta: 1 },
    { id: 22, pregunta: "¿Cuál palabra funciona como adjetivo en 'El cielo despejado se ve hermoso'?", opciones: ["Despejado", "Cielo", "Se"], correcta: 0 },
    { id: 23, pregunta: "Identifica el pronombre en la oración 'Ellos llegaron temprano':", opciones: ["Ellos", "Llegaron", "Temprano"], correcta: 0 },
    { id: 24, pregunta: "¿Qué tipo de palabra es 'sin embargo'?", opciones: ["Conjunción/conector adversativo", "Sustantivo compuesto", "Verbo auxiliar"], correcta: 0 },

    // ===== CONCORDANCIA GRAMATICAL =====
    { id: 25, pregunta: "Selecciona la oración con concordancia correcta:", opciones: ["Los niño juegan en el parque", "Los niños juegan en el parque", "Los niños juega en el parque"], correcta: 1 },
    { id: 26, pregunta: "¿Cuál oración presenta un error de concordancia?", opciones: ["Las flores son hermosas", "Las flores es hermosas", "Las flores están hermosas"], correcta: 1 },
    { id: 27, pregunta: "Elige la forma verbal correcta: 'Nosotros ___ al cine ayer.'", opciones: ["fue", "fuimos", "fueron"], correcta: 1 },

    // ===== SINÓNIMOS Y ANTÓNIMOS =====
    { id: 28, pregunta: "¿Cuál es un sinónimo de 'feliz'?", opciones: ["Triste", "Contento", "Enojado"], correcta: 1 },
    { id: 29, pregunta: "¿Cuál es el antónimo de 'generoso'?", opciones: ["Avaro", "Amable", "Solidario"], correcta: 0 },
    { id: 30, pregunta: "Selecciona el sinónimo de 'veloz':", opciones: ["Lento", "Rápido", "Pesado"], correcta: 1 },
    { id: 31, pregunta: "¿Cuál palabra es antónimo de 'construir'?", opciones: ["Edificar", "Destruir", "Levantar"], correcta: 1 },

    // ===== CONECTORES Y COHESIÓN TEXTUAL =====
    { id: 32, pregunta: "Elige el conector adecuado: 'No estudió, ___ aprobó el examen.'", opciones: ["por lo tanto", "sin embargo", "porque"], correcta: 1 },
    { id: 33, pregunta: "¿Qué conector expresa causa?", opciones: ["Aunque", "Porque", "Pero"], correcta: 1 },
    { id: 34, pregunta: "Selecciona el conector que indica consecuencia:", opciones: ["Por lo tanto", "Sin embargo", "Aunque"], correcta: 0 },

    // ===== TIPOS DE ORACIONES =====
    { id: 35, pregunta: "¿Cuál de las siguientes es una oración compuesta?", opciones: ["Juan come manzanas.", "Juan come manzanas y Pedro come peras.", "Juan come."], correcta: 1 },
    { id: 36, pregunta: "Identifica la oración simple:", opciones: ["El niño juega en el parque.", "El niño juega y su hermana estudia.", "Aunque llovía, el niño jugaba."], correcta: 0 },

    // ===== FIGURAS LITERARIAS =====
    { id: 37, pregunta: "'Sus ojos son como estrellas' es un ejemplo de:", opciones: ["Metáfora", "Símil", "Hipérbole"], correcta: 1 },
    { id: 38, pregunta: "'El tiempo es oro' es un ejemplo de:", opciones: ["Metáfora", "Símil", "Onomatopeya"], correcta: 0 },
    { id: 39, pregunta: "'Lloré un mar de lágrimas' es un ejemplo de:", opciones: ["Hipérbole", "Personificación", "Aliteración"], correcta: 0 },

    // ===== COMPRENSIÓN DE LECTURA =====
    { id: 40, pregunta: "Texto: 'La deforestación ha aumentado en los últimos años debido a la expansión agrícola, lo que ha provocado la pérdida de hábitats naturales.' ¿Cuál es la idea principal?", opciones: ["La agricultura ha disminuido", "La expansión agrícola provoca deforestación y pérdida de hábitats", "Los animales han migrado voluntariamente"], correcta: 1 },
    { id: 41, pregunta: "Texto: 'Aunque la tecnología facilita la comunicación, también puede generar aislamiento social si se usa en exceso.' ¿Qué idea contrasta el autor?", opciones: ["Facilidad de comunicación vs. aislamiento social", "Tecnología vs. educación", "Comunicación vs. escritura"], correcta: 0 },
    { id: 42, pregunta: "Texto: 'El reciclaje es una práctica esencial para reducir la contaminación y conservar los recursos naturales.' ¿Cuál es el propósito del texto?", opciones: ["Entretener al lector", "Informar sobre la importancia del reciclaje", "Narrar una historia personal"], correcta: 1 },

    // ===== TIPOS DE TEXTO =====
    { id: 43, pregunta: "Un texto que narra hechos ocurridos en orden cronológico se llama:", opciones: ["Narrativo", "Descriptivo", "Argumentativo"], correcta: 0 },
    { id: 44, pregunta: "Un texto cuyo propósito es defender una opinión con razones y evidencias es:", opciones: ["Descriptivo", "Argumentativo", "Narrativo"], correcta: 1 },
    { id: 45, pregunta: "Un texto que detalla las características de un lugar, persona u objeto es:", opciones: ["Narrativo", "Argumentativo", "Descriptivo"], correcta: 2 },

    // ===== VICIOS DEL LENGUAJE =====
    { id: 46, pregunta: "'Subir para arriba' es un ejemplo de:", opciones: ["Pleonasmo (redundancia)", "Metáfora", "Anáfora"], correcta: 0 },
    { id: 47, pregunta: "El uso incorrecto de palabras extranjeras sin necesidad se llama:", opciones: ["Barbarismo", "Sinonimia", "Polisemia"], correcta: 0 },

    { id: 48, pregunta: "¿Cuál oración está construida de forma correcta y sin ambigüedad?", opciones: ["Vi a un hombre con un telescopio", "El hombre que vi con un telescopio caminaba despacio", "A hombre vi con telescopio"], correcta: 1 }

  ]
}

export default espanol