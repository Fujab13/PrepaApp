// examen.js — Banco de preguntas del examen diagnóstico
// Formato de pregunta:
//   id: número único (define la sección por rango)
//   pregunta: string con el texto de la pregunta
//   enlace_svg: nombre del archivo SVG (null si no aplica)
//   respuestas: array de strings con las opciones
//   inciso_correcto: letra de la respuesta correcta ('A', 'B', 'C', 'D', ...)

// ─── CONFIGURACIÓN DE SECCIONES ────────────────────────────────────────────
// Definidas también en Examen.jsx via SECCIONES
export const SECCIONES = [
  { nombre: "Español",      id_inicio: 1,   id_fin: 15,  color: "#4f8ef7" },
  { nombre: "Matemáticas",  id_inicio: 16,  id_fin: 30,  color: "#f97316" },
  { nombre: "Inglés",       id_inicio: 31,  id_fin: 45,  color: "#22c55e" },
  { nombre: "BUAP",         id_inicio: 46,  id_fin: 60,  color: "#a855f7" },
];

// ─── BANCO DE PREGUNTAS ────────────────────────────────────────────────────
export const PREGUNTAS = [

  // ── ESPAÑOL (IDs 1–15) ──────────────────────────────────────────────────
  {
    id: 1,
    pregunta: "¿Cuál de las siguientes oraciones tiene un sujeto compuesto?",
    enlace_svg: null,
    respuestas: [
      "A. María estudia por las tardes.",
      "B. Juan y Ana llegaron tarde a la reunión.",
      "C. El perro ladró toda la noche.",
      "D. Ella cantó una canción hermosa.",
    ],
    inciso_correcto: "B",
  },
  {
    id: 2,
    pregunta: "En el siguiente párrafo identifica la idea principal:\n\n«El agua es un recurso vital para todos los seres vivos. Sin ella, la vida tal como la conocemos no sería posible. Desde las plantas hasta los animales, todos necesitan agua para sobrevivir.»",
    enlace_svg: null,
    respuestas: [
      "A. Los animales necesitan agua.",
      "B. El agua es un recurso vital para todos los seres vivos.",
      "C. Las plantas también necesitan agua.",
      "D. La vida no sería posible sin muchos recursos.",
    ],
    inciso_correcto: "B",
  },
  {
    id: 3,
    pregunta: "¿Cuál es el significado de la palabra «efímero»?",
    enlace_svg: null,
    respuestas: [
      "A. Que dura mucho tiempo.",
      "B. Que es eterno e inmutable.",
      "C. Que tiene corta duración.",
      "D. Que es de gran tamaño.",
    ],
    inciso_correcto: "C",
  },
  {
    id: 4,
    pregunta: "Selecciona la oración correctamente puntuada:",
    enlace_svg: null,
    respuestas: [
      "A. Compré: manzanas, peras y uvas.",
      "B. Compré manzanas, peras y uvas.",
      "C. Compré manzanas peras, y uvas.",
      "D. Compré, manzanas peras y uvas.",
    ],
    inciso_correcto: "B",
  },
  {
    id: 5,
    pregunta: "¿Qué recurso literario se emplea en la frase «el tiempo vuela»?",
    enlace_svg: null,
    respuestas: [
      "A. Símil",
      "B. Hipérbole",
      "C. Metáfora",
      "D. Anáfora",
    ],
    inciso_correcto: "C",
  },

  // ── MATEMÁTICAS (IDs 16–30) ─────────────────────────────────────────────
  {
    id: 16,
    pregunta: "Resuelve el siguiente sistema de ecuaciones lineales:\n\n  x − 2y + 6z = 6\n −2x + 3y + z = 0\n  2x +  y + z = 0",
    enlace_svg: null,
    respuestas: [
      "A.  5 − 2 = 3",
      "B.  6 + 3 = 6",
      "C.  5x − 3 = 9",
      "D.  11 − 3 = 12",
    ],
    inciso_correcto: "A",
  },
  {
    id: 17,
    pregunta: "¿Cuál es el resultado de simplificar la fracción algebraica?\n\n(x² − 9) / (x + 3)",
    enlace_svg: null,
    respuestas: [
      "A. x + 3",
      "B. x − 3",
      "C. x² − 3",
      "D. (x − 3)(x + 3)",
    ],
    inciso_correcto: "B",
  },
  {
    id: 18,
    pregunta: "Una recta pasa por los puntos (2, 5) y (4, 11). ¿Cuál es su pendiente?",
    enlace_svg: "prueba.svg",
    respuestas: [
      "A. m = 1",
      "B. m = 2",
      "C. m = 3",
      "D. m = 6",
    ],
    inciso_correcto: "C",
  },
  {
    id: 19,
    pregunta: "¿Cuánto es el 35% de 240?",
    enlace_svg: null,
    respuestas: [
      "A. 72",
      "B. 80",
      "C. 84",
      "D. 96",
    ],
    inciso_correcto: "C",
  },
  {
    id: 20,
    pregunta: "Si log₂(x) = 5, ¿cuál es el valor de x?",
    enlace_svg: null,
    respuestas: [
      "A. 10",
      "B. 16",
      "C. 25",
      "D. 32",
    ],
    inciso_correcto: "D",
  },

  // ── INGLÉS (IDs 31–45) ──────────────────────────────────────────────────
  {
    id: 31,
    pregunta: "Choose the correct option to complete the sentence:\n\n\"She ___ to the market every Saturday.\"",
    enlace_svg: null,
    respuestas: [
      "A. go",
      "B. goes",
      "C. going",
      "D. gone",
    ],
    inciso_correcto: "B",
  },
  {
    id: 32,
    pregunta: "What is the past tense of the verb «to write»?",
    enlace_svg: null,
    respuestas: [
      "A. writed",
      "B. wroted",
      "C. wrote",
      "D. written",
    ],
    inciso_correcto: "C",
  },
  {
    id: 33,
    pregunta: "Select the sentence written in passive voice:",
    enlace_svg: null,
    respuestas: [
      "A. The students finished the exam.",
      "B. The teacher explained the lesson.",
      "C. The letter was written by María.",
      "D. They built a new school.",
    ],
    inciso_correcto: "C",
  },
  {
    id: 34,
    pregunta: "Which word is a synonym of «enormous»?",
    enlace_svg: null,
    respuestas: [
      "A. tiny",
      "B. gigantic",
      "C. average",
      "D. narrow",
    ],
    inciso_correcto: "B",
  },
  {
    id: 35,
    pregunta: "Read the dialogue and choose the best response:\n\n— \"Have you ever been to Japan?\"\n— \"___\"",
    enlace_svg: null,
    respuestas: [
      "A. Yes, I have. I went last year.",
      "B. Yes, I did go there yesterday.",
      "C. No, I haven't never gone.",
      "D. No, I didn't been there.",
    ],
    inciso_correcto: "A",
  },

  // ── BUAP (IDs 46–60) ────────────────────────────────────────────────────
  {
    id: 46,
    pregunta: "¿En qué año fue fundada la Benemérita Universidad Autónoma de Puebla (BUAP)?",
    enlace_svg: null,
    respuestas: [
      "A. 1587",
      "B. 1820",
      "C. 1937",
      "D. 1956",
    ],
    inciso_correcto: "A",
  },
  {
    id: 47,
    pregunta: "¿Cuál es el lema oficial de la BUAP?",
    enlace_svg: null,
    respuestas: [
      "A. «Por la educación del pueblo»",
      "B. «Pensar bien para vivir mejor»",
      "C. «Ciencia, tecnología y humanismo»",
      "D. «Sabiduría y justicia»",
    ],
    inciso_correcto: "B",
  },
  {
    id: 48,
    pregunta: "¿Cuántos campus foráneos tiene actualmente la BUAP en el estado de Puebla?",
    enlace_svg: null,
    respuestas: [
      "A. 5",
      "B. 8",
      "C. 12",
      "D. 16",
    ],
    inciso_correcto: "C",
  },
  {
    id: 49,
    pregunta: "El Modelo Universitario Minerva de la BUAP se centra principalmente en:",
    enlace_svg: null,
    respuestas: [
      "A. La enseñanza exclusivamente tecnológica.",
      "B. El aprendizaje basado en competencias y formación integral.",
      "C. La educación a distancia como modalidad única.",
      "D. La especialización temprana desde el primer semestre.",
    ],
    inciso_correcto: "B",
  },
  {
    id: 50,
    pregunta: "¿En qué facultad se ubica la carrera de Ingeniería en Computación de la BUAP?",
    enlace_svg: null,
    respuestas: [
      "A. Facultad de Ciencias Físico-Matemáticas",
      "B. Facultad de Ingeniería",
      "C. Complejo Regional Norte",
      "D. Facultad de Ciencias de la Computación",
    ],
    inciso_correcto: "D",
  },
];