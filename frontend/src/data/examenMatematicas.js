// examenMatematicas.js — Banco de preguntas del Examen de Matemáticas.
// Formato y nivel según referencia/requerimientos/preguntas_examen.txt: 60
// preguntas divididas en 4 zonas de 15, nivel preuniversitario/admisión, sin
// respuestas evidentes. Contenido tomado y adaptado de
// referencia/EXAMEN_MATEMATICAS_60_PREGUNTAS.json (banco ya verificado).

export const SECCIONES = [
  { nombre: "Álgebra", id_inicio: 1, id_fin: 15, color: "#4f8ef7" },
  { nombre: "Geometría y Trigonometría", id_inicio: 16, id_fin: 30, color: "#cf3b3b" },
  { nombre: "Geometría Analítica", id_inicio: 31, id_fin: 45, color: "#22c55e" },
  { nombre: "Razonamiento Matemático", id_inicio: 46, id_fin: 60, color: "#d8c468" },
];

export const PREGUNTAS = [
  // ── ÁLGEBRA (IDs 1–15) ────────────────────────────────────────────────
  { id: 1, pregunta: "Simplifica: (3x²y)(4xy³)", enlace_svg: null, respuestas: ["A. 12x³y⁴", "B. 12x²y³", "C. 7x³y⁴", "D. 12x³y³"], inciso_correcto: "A" },
  { id: 2, pregunta: "Factoriza completamente: x² − 5x − 14", enlace_svg: null, respuestas: ["A. (x − 14)(x + 1)", "B. (x − 7)(x + 2)", "C. (x − 2)(x + 7)", "D. (x − 7)(x − 2)"], inciso_correcto: "B" },
  { id: 3, pregunta: "Resuelve: 3(x − 2) − 4 = 2(x + 1)", enlace_svg: null, respuestas: ["A. x = 8", "B. x = −12", "C. x = 12", "D. x = 4"], inciso_correcto: "C" },
  { id: 4, pregunta: "Simplifica la expresión racional: (x² − 9) / (x² − x − 6)", enlace_svg: null, respuestas: ["A. (x − 3)/(x + 2)", "B. (x + 3)/(x − 2)", "C. (x − 3)/(x − 2)", "D. (x + 3)/(x + 2)"], inciso_correcto: "D" },
  { id: 5, pregunta: "Racionaliza el denominador: 5 / (√3 − 1)", enlace_svg: null, respuestas: ["A. (5√3 + 5)/2", "B. 5(√3 − 1)/2", "C. (5√3 − 5)/2", "D. 5√3 + 5"], inciso_correcto: "A" },
  { id: 6, pregunta: "Resuelve el sistema de ecuaciones:\n\nx + y = 7\nx − y = 1", enlace_svg: null, respuestas: ["A. x = 5, y = 2", "B. x = 4, y = 3", "C. x = 3, y = 4", "D. x = 1, y = 6"], inciso_correcto: "B" },
  { id: 7, pregunta: "¿Cuál es el conjunto solución de x² − 7x + 10 = 0?", enlace_svg: null, respuestas: ["A. {−2, −5}", "B. {2, −5}", "C. {2, 5}", "D. {1, 10}"], inciso_correcto: "C" },
  { id: 8, pregunta: "Aplica la fórmula general para resolver: 2x² + 3x − 2 = 0", enlace_svg: null, respuestas: ["A. x = −1/2 o x = 2", "B. x = 1 o x = −4", "C. x = 2 o x = −1", "D. x = 1/2 o x = −2"], inciso_correcto: "D" },
  { id: 9, pregunta: "Simplifica: (2⁻²)(2⁵) / 2³", enlace_svg: null, respuestas: ["A. 1", "B. 2", "C. 1/2", "D. 4"], inciso_correcto: "A" },
  { id: 10, pregunta: "¿Cuál es el dominio de f(x) = √(x − 4)?", enlace_svg: null, respuestas: ["A. (4, ∞)", "B. [4, ∞)", "C. (−∞, 4]", "D. ℝ"], inciso_correcto: "B" },
  { id: 11, pregunta: "Si f(x) = 2x² − 3x + 1, calcula f(−2)", enlace_svg: null, respuestas: ["A. 3", "B. 8", "C. 15", "D. −15"], inciso_correcto: "C" },
  { id: 12, pregunta: "El término general de una sucesión aritmética es aₙ = 3n − 2. ¿Cuál es a₁₀?", enlace_svg: null, respuestas: ["A. 25", "B. 30", "C. 32", "D. 28"], inciso_correcto: "D" },
  { id: 13, pregunta: "Calcula la suma de los primeros 10 términos de la sucesión aritmética: 2, 5, 8, 11, ...", enlace_svg: null, respuestas: ["A. 155", "B. 145", "C. 150", "D. 160"], inciso_correcto: "A" },
  { id: 14, pregunta: "Resuelve la inecuación: −2x + 5 ≤ 11", enlace_svg: null, respuestas: ["A. x ≤ −3", "B. x ≥ −3", "C. x ≥ 3", "D. x ≤ 8"], inciso_correcto: "B" },
  { id: 15, pregunta: "Simplifica: (a + b)² − (a − b)²", enlace_svg: null, respuestas: ["A. 0", "B. 2ab", "C. 4ab", "D. 2a² + 2b²"], inciso_correcto: "C" },

  // ── GEOMETRÍA Y TRIGONOMETRÍA (IDs 16–30) ────────────────────────────
  { id: 16, pregunta: "Un triángulo rectángulo tiene catetos de 9 cm y 12 cm. ¿Cuál es la longitud de su hipotenusa?", enlace_svg: null, respuestas: ["A. 15 cm", "B. 13 cm", "C. 21 cm", "D. 10.5 cm"], inciso_correcto: "A" },
  { id: 17, pregunta: "Calcula el área de un círculo de radio 6 cm (usa π ≈ 3.14)", enlace_svg: null, respuestas: ["A. 37.68 cm²", "B. 113.04 cm²", "C. 56.52 cm²", "D. 226.08 cm²"], inciso_correcto: "B" },
  { id: 18, pregunta: "¿Cuánto mide la suma de los ángulos internos de un hexágono regular?", enlace_svg: null, respuestas: ["A. 360°", "B. 540°", "C. 720°", "D. 600°"], inciso_correcto: "C" },
  { id: 19, pregunta: "Calcula el área de un triángulo equilátero de 8 cm de lado (usa √3 ≈ 1.73)", enlace_svg: null, respuestas: ["A. 16 cm²", "B. 24 cm²", "C. 32 cm²", "D. 16√3 cm² (≈27.7 cm²)"], inciso_correcto: "D" },
  { id: 20, pregunta: "Convierte 135° a radianes", enlace_svg: null, respuestas: ["A. 3π/4", "B. π/4", "C. 2π/3", "D. 5π/6"], inciso_correcto: "A" },
  { id: 21, pregunta: "Si sen(θ) = 3/5 y θ está en el primer cuadrante, ¿cuál es el valor de cos(θ)?", enlace_svg: null, respuestas: ["A. 3/4", "B. 4/5", "C. 4/3", "D. 5/4"], inciso_correcto: "B" },
  { id: 22, pregunta: "Calcula el valor de tan(60°)", enlace_svg: null, respuestas: ["A. √3/3", "B. 1/2", "C. √3", "D. √2"], inciso_correcto: "C" },
  { id: 23, pregunta: "Un poste proyecta una sombra de 12 m cuando el ángulo de elevación del sol es de 30°. ¿Cuál es la altura del poste? (usa tan 30° ≈ 0.577)", enlace_svg: null, respuestas: ["A. 6 m", "B. 10.4 m", "C. 20.8 m", "D. 6.9 m"], inciso_correcto: "D" },
  { id: 24, pregunta: "En un triángulo dos lados miden 7 cm y 10 cm, y el ángulo entre ellos es de 60°. Usa la ley de cosenos para calcular el tercer lado (cos 60° = 0.5)", enlace_svg: null, respuestas: ["A. ≈8.9 cm", "B. ≈9.3 cm", "C. ≈14.8 cm", "D. 17 cm"], inciso_correcto: "A" },
  { id: 25, pregunta: "Calcula el perímetro de un sector circular de radio 5 cm y ángulo central de 72° (usa π ≈ 3.14)", enlace_svg: null, respuestas: ["A. 6.28 cm", "B. 16.28 cm", "C. 20 cm", "D. 31.4 cm"], inciso_correcto: "B" },
  { id: 26, pregunta: "Calcula el volumen de un cilindro con radio 4 cm y altura 10 cm (usa π ≈ 3.14)", enlace_svg: null, respuestas: ["A. 125.6 cm³", "B. 167.47 cm³", "C. 502.4 cm³", "D. 251.2 cm³"], inciso_correcto: "C" },
  { id: 27, pregunta: "Dos triángulos son semejantes con razón de semejanza 3:5. Si el área del triángulo menor es 18 cm², ¿cuál es el área del triángulo mayor?", enlace_svg: null, respuestas: ["A. 30 cm²", "B. 45 cm²", "C. 60 cm²", "D. 50 cm²"], inciso_correcto: "D" },
  { id: 28, pregunta: "¿Cuál es el valor de csc(45°)?", enlace_svg: null, respuestas: ["A. √2", "B. √2/2", "C. 1", "D. 2"], inciso_correcto: "A" },
  { id: 29, pregunta: "Un rombo tiene diagonales de 12 cm y 16 cm. ¿Cuál es su área?", enlace_svg: null, respuestas: ["A. 28 cm²", "B. 96 cm²", "C. 48 cm²", "D. 192 cm²"], inciso_correcto: "B" },
  { id: 30, pregunta: "En un triángulo rectángulo, el ángulo agudo mide 37° y el cateto opuesto mide 6 cm. Usa sen(37°) ≈ 0.6 para calcular la hipotenusa", enlace_svg: null, respuestas: ["A. 3.6 cm", "B. 8 cm", "C. 10 cm", "D. 16 cm"], inciso_correcto: "C" },

  // ── GEOMETRÍA ANALÍTICA (IDs 31–45) ──────────────────────────────────
  { id: 31, pregunta: "Calcula la distancia entre los puntos A(−3, 4) y B(5, −2)", enlace_svg: null, respuestas: ["A. 10", "B. 8", "C. ≈11.66", "D. 14"], inciso_correcto: "A" },
  { id: 32, pregunta: "Encuentra el punto medio del segmento con extremos P(2, −6) y Q(−4, 8)", enlace_svg: null, respuestas: ["A. (−3, 7)", "B. (−1, 1)", "C. (1, −1)", "D. (3, 1)"], inciso_correcto: "B" },
  { id: 33, pregunta: "¿Cuál es la pendiente de la recta que pasa por los puntos (1, 2) y (4, 11)?", enlace_svg: null, respuestas: ["A. −3", "B. 1/3", "C. 3", "D. 9"], inciso_correcto: "C" },
  { id: 34, pregunta: "Determina la ecuación de la recta que pasa por (2, −1) con pendiente 3", enlace_svg: null, respuestas: ["A. y = 3x − 5", "B. y = 3x + 5", "C. y = 3x + 7", "D. y = 3x − 7"], inciso_correcto: "D" },
  { id: 35, pregunta: "¿Cuál es el centro y el radio de la circunferencia x² + y² − 6x + 4y − 12 = 0?", enlace_svg: null, respuestas: ["A. Centro (3, −2), radio 5", "B. Centro (−3, 2), radio 5", "C. Centro (3, −2), radio 25", "D. Centro (6, −4), radio 5"], inciso_correcto: "A" },
  { id: 36, pregunta: "¿Cuál es la ecuación de la parábola con vértice en el origen y foco en (0, 3)?", enlace_svg: null, respuestas: ["A. y² = 12x", "B. x² = 12y", "C. x² = −12y", "D. y² = −12x"], inciso_correcto: "B" },
  { id: 37, pregunta: "Encuentra la longitud del eje mayor de la elipse x²/25 + y²/9 = 1", enlace_svg: null, respuestas: ["A. 5", "B. 6", "C. 10", "D. 9"], inciso_correcto: "C" },
  { id: 38, pregunta: "¿Cuál es la excentricidad de la elipse x²/16 + y²/25 = 1?", enlace_svg: null, respuestas: ["A. 3/4", "B. 4/5", "C. 5/3", "D. 3/5"], inciso_correcto: "D" },
  { id: 39, pregunta: "Encuentra las asíntotas de la hipérbola x²/9 − y²/16 = 1", enlace_svg: null, respuestas: ["A. y = ±(4/3)x", "B. y = ±(3/4)x", "C. y = ±(9/16)x", "D. y = ±(16/9)x"], inciso_correcto: "A" },
  { id: 40, pregunta: "¿Cuál es la distancia del punto (4, −3) al origen?", enlace_svg: null, respuestas: ["A. 1", "B. 5", "C. 7", "D. 25"], inciso_correcto: "B" },
  { id: 41, pregunta: "Determina el valor de k para que la recta 2x + ky = 8 sea paralela a la recta 4x + 6y = 12", enlace_svg: null, respuestas: ["A. k = −3", "B. k = 1.5", "C. k = 3", "D. k = 6"], inciso_correcto: "C" },
  { id: 42, pregunta: "¿Cuál es la ecuación de la recta perpendicular a y = (1/2)x + 4 que pasa por el punto (2, 5)?", enlace_svg: null, respuestas: ["A. y = (1/2)x + 4", "B. y = −2x + 1", "C. y = 2x + 1", "D. y = −2x + 9"], inciso_correcto: "D" },
  { id: 43, pregunta: "Clasifica la cónica representada por la ecuación: 4x² + 9y² − 16x + 18y − 11 = 0", enlace_svg: null, respuestas: ["A. Elipse", "B. Circunferencia", "C. Hipérbola", "D. Parábola"], inciso_correcto: "A" },
  { id: 44, pregunta: "Calcula el área del triángulo con vértices A(0,0), B(6,0) y C(3,5)", enlace_svg: null, respuestas: ["A. 9", "B. 15", "C. 18", "D. 30"], inciso_correcto: "B" },
  { id: 45, pregunta: "¿Cuál es la ecuación de la circunferencia con centro en (0,0) que pasa por el punto (3,4)?", enlace_svg: null, respuestas: ["A. x² + y² = 5", "B. x² + y² = 7", "C. x² + y² = 25", "D. x² + y² = 49"], inciso_correcto: "C" },

  // ── RAZONAMIENTO MATEMÁTICO (IDs 46–60) ──────────────────────────────
  { id: 46, pregunta: "Un artículo cuesta $850 y tiene un descuento del 20%. ¿Cuál es el precio final?", enlace_svg: null, respuestas: ["A. $680", "B. $830", "C. $750", "D. $700"], inciso_correcto: "A" },
  { id: 47, pregunta: "En un mapa, 2 cm representan 50 km reales. Si dos ciudades están a 7 cm de distancia en el mapa, ¿cuál es la distancia real entre ellas?", enlace_svg: null, respuestas: ["A. 150 km", "B. 175 km", "C. 200 km", "D. 100 km"], inciso_correcto: "B" },
  { id: 48, pregunta: "Un grifo llena un tanque en 6 horas y otro grifo lo llena en 3 horas. Si ambos grifos se abren juntos, ¿en cuánto tiempo llenarán el tanque?", enlace_svg: null, respuestas: ["A. 4.5 horas", "B. 3 horas", "C. 2 horas", "D. 1.5 horas"], inciso_correcto: "C" },
  { id: 49, pregunta: "Un automóvil recorre 240 km en 3 horas manteniendo rapidez constante. ¿Cuánto tiempo tardará en recorrer 400 km a esa misma rapidez?", enlace_svg: null, respuestas: ["A. 4 horas", "B. 6 horas", "C. 4.5 horas", "D. 5 horas"], inciso_correcto: "D" },
  { id: 50, pregunta: "¿Qué número sigue en la sucesión: 3, 7, 15, 31, 63, ...?", enlace_svg: null, respuestas: ["A. 127", "B. 125", "C. 120", "D. 131"], inciso_correcto: "A" },
  { id: 51, pregunta: "Se mezclan 4 litros de una solución al 10% de sal con 6 litros de una solución al 20% de sal. ¿Cuál es la concentración de la mezcla resultante?", enlace_svg: null, respuestas: ["A. 15%", "B. 16%", "C. 18%", "D. 14%"], inciso_correcto: "B" },
  { id: 52, pregunta: "El precio de un producto aumentó de $400 a $460. ¿Cuál fue el porcentaje de incremento?", enlace_svg: null, respuestas: ["A. 12%", "B. 60%", "C. 15%", "D. 10%"], inciso_correcto: "C" },
  { id: 53, pregunta: "La suma de dos números consecutivos es 47. ¿Cuál es el número mayor?", enlace_svg: null, respuestas: ["A. 23", "B. 25", "C. 22", "D. 24"], inciso_correcto: "D" },
  { id: 54, pregunta: "Se invierten $5,000 a una tasa de interés simple anual del 6%. ¿Cuánto interés se genera después de 2 años?", enlace_svg: null, respuestas: ["A. $600", "B. $300", "C. $660", "D. $500"], inciso_correcto: "A" },
  { id: 55, pregunta: "Si 3 obreros construyen un muro en 12 días trabajando al mismo ritmo, ¿cuántos días tardarán 6 obreros en construir el mismo muro?", enlace_svg: null, respuestas: ["A. 24 días", "B. 6 días", "C. 3 días", "D. 9 días"], inciso_correcto: "B" },
  { id: 56, pregunta: "Se lanza un dado justo de 6 caras. ¿Cuál es la probabilidad de obtener un número mayor que 4?", enlace_svg: null, respuestas: ["A. 1/6", "B. 1/2", "C. 1/3", "D. 2/3"], inciso_correcto: "C" },
  { id: 57, pregunta: "¿De cuántas formas diferentes se pueden ordenar las letras de la palabra AMOR?", enlace_svg: null, respuestas: ["A. 4", "B. 12", "C. 16", "D. 24"], inciso_correcto: "D" },
  { id: 58, pregunta: "En una urna hay 5 canicas rojas y 3 azules. Si se extrae una canica al azar, ¿cuál es la probabilidad de que sea azul?", enlace_svg: null, respuestas: ["A. 3/8", "B. 1/3", "C. 3/5", "D. 5/8"], inciso_correcto: "A" },
  { id: 59, pregunta: "Calcula la media de los siguientes datos: 4, 8, 6, 10, 12, 8", enlace_svg: null, respuestas: ["A. 7", "B. 8", "C. 9", "D. 48"], inciso_correcto: "B" },
  { id: 60, pregunta: "¿De cuántas formas se pueden elegir 3 personas de un grupo de 7 para formar un comité (el orden no importa)?", enlace_svg: null, respuestas: ["A. 21", "B. 42", "C. 35", "D. 210"], inciso_correcto: "C" },
];
