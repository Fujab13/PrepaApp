// examenCienciasExactas.js — Banco de preguntas del Examen de Exactas.
// Formato y nivel según referencia/requerimientos/preguntas_examen.txt: 60
// preguntas divididas en 4 zonas de 15, nivel preuniversitario/admisión, sin
// respuestas evidentes (distractores = errores de cálculo comunes, nunca
// opciones absurdas).

export const SECCIONES = [
  { nombre: "Física I: Mecánica", id_inicio: 1, id_fin: 15, color: "#0ea5e9" },
  { nombre: "Física II: Energía, Ondas y Electricidad", id_inicio: 16, id_fin: 30, color: "#0284c7" },
  { nombre: "Química General", id_inicio: 31, id_fin: 45, color: "#0369a1" },
  { nombre: "Lógica y Razonamiento Cuantitativo", id_inicio: 46, id_fin: 60, color: "#075985" },
];

export const PREGUNTAS = [
  // ── FÍSICA I: MECÁNICA (IDs 1–15) ────────────────────────────────────
  { id: 1, pregunta: "¿Cuál es la fórmula para calcular la velocidad media de un objeto?", enlace_svg: null, respuestas: ["A. v = d/t", "B. v = t/d", "C. v = d·t", "D. v = d²/t"], inciso_correcto: "A" },
  { id: 2, pregunta: "Un cuerpo en caída libre parte del reposo. ¿Cuál es su velocidad tras 3 segundos de caída? (g = 10 m/s²)", enlace_svg: null, respuestas: ["A. 10 m/s", "B. 30 m/s", "C. 3 m/s", "D. 90 m/s"], inciso_correcto: "B" },
  { id: 3, pregunta: "Según la segunda ley de Newton, la fuerza neta sobre un objeto es igual a:", enlace_svg: null, respuestas: ["A. Su velocidad entre el tiempo.", "B. Su peso entre la gravedad.", "C. El producto de su masa por su aceleración.", "D. El producto de su masa por su velocidad."], inciso_correcto: "C" },
  { id: 4, pregunta: "Un objeto de 10 kg se desliza sobre una superficie con una aceleración de 2 m/s². ¿Qué fuerza neta actúa sobre él?", enlace_svg: null, respuestas: ["A. 5 N", "B. 8 N", "C. 12 N", "D. 20 N"], inciso_correcto: "D" },
  { id: 5, pregunta: "¿Qué establece la tercera ley de Newton?", enlace_svg: null, respuestas: ["A. A toda acción corresponde una reacción de igual magnitud y sentido opuesto.", "B. Un cuerpo en reposo permanece en reposo salvo que actúe una fuerza externa.", "C. La fuerza es igual a masa por aceleración.", "D. La energía no se crea ni se destruye."], inciso_correcto: "A" },
  { id: 6, pregunta: "¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional?", enlace_svg: null, respuestas: ["A. El joule", "B. El newton", "C. El watt", "D. El pascal"], inciso_correcto: "B" },
  { id: 7, pregunta: "Un proyectil se lanza horizontalmente desde una altura. ¿Qué componente de su velocidad permanece constante durante el vuelo (despreciando la resistencia del aire)?", enlace_svg: null, respuestas: ["A. La componente vertical", "B. La velocidad total", "C. La componente horizontal", "D. Ninguna, ambas cambian igual"], inciso_correcto: "C" },
  { id: 8, pregunta: "Dos fuerzas de 6 N y 8 N actúan perpendicularmente sobre un mismo punto. ¿Cuál es la magnitud de la fuerza resultante?", enlace_svg: null, respuestas: ["A. 14 N", "B. 2 N", "C. 48 N", "D. 10 N"], inciso_correcto: "D" },
  { id: 9, pregunta: "¿Qué cantidad física describe la rapidez con la que cambia la velocidad de un objeto?", enlace_svg: null, respuestas: ["A. La aceleración", "B. La masa", "C. El momento lineal", "D. La fuerza"], inciso_correcto: "A" },
  { id: 10, pregunta: "Un carro recorre 150 km en 2 horas. ¿Cuál es su rapidez promedio?", enlace_svg: null, respuestas: ["A. 300 km/h", "B. 75 km/h", "C. 150 km/h", "D. 50 km/h"], inciso_correcto: "B" },
  { id: 11, pregunta: "¿Qué principio establece que, en ausencia de fuerzas externas, un objeto en movimiento continúa con velocidad constante?", enlace_svg: null, respuestas: ["A. Segunda ley de Newton", "B. Ley de la gravitación universal", "C. Primera ley de Newton (ley de la inercia)", "D. Tercera ley de Newton"], inciso_correcto: "C" },
  { id: 12, pregunta: "Un objeto de 5 kg se encuentra en reposo sobre una mesa horizontal. ¿Cuál es la magnitud de la fuerza normal que la mesa ejerce sobre el objeto? (g = 10 m/s²)", enlace_svg: null, respuestas: ["A. 5 N", "B. 0 N", "C. 10 N", "D. 50 N"], inciso_correcto: "D" },
  { id: 13, pregunta: "¿Qué tipo de movimiento describe un objeto que recorre distancias iguales en tiempos iguales, en línea recta?", enlace_svg: null, respuestas: ["A. Movimiento rectilíneo uniforme", "B. Movimiento circular uniforme", "C. Movimiento rectilíneo uniformemente acelerado", "D. Movimiento parabólico"], inciso_correcto: "A" },
  { id: 14, pregunta: "¿Qué cantidad vectorial se define como el producto de la masa de un objeto por su velocidad?", enlace_svg: null, respuestas: ["A. La fuerza", "B. El momento lineal (cantidad de movimiento)", "C. La energía cinética", "D. La aceleración"], inciso_correcto: "B" },
  { id: 15, pregunta: "Un resorte se estira 4 cm al aplicarle una fuerza de 20 N. Según la ley de Hooke, ¿cuál es su constante de elasticidad?", enlace_svg: null, respuestas: ["A. 5 N/m", "B. 80 N/m", "C. 500 N/m", "D. 0.2 N/m"], inciso_correcto: "C" },

  // ── FÍSICA II: ENERGÍA, ONDAS Y ELECTRICIDAD (IDs 16–30) ─────────────
  { id: 16, pregunta: "¿Cuál es la fórmula de la energía cinética de un objeto?", enlace_svg: null, respuestas: ["A. Ec = mgh", "B. Ec = ½mv²", "C. Ec = Fd", "D. Ec = mv"], inciso_correcto: "B" },
  { id: 17, pregunta: "Un objeto de 2 kg se eleva a una altura de 5 m. ¿Cuál es su energía potencial gravitatoria? (g = 10 m/s²)", enlace_svg: null, respuestas: ["A. 10 J", "B. 50 J", "C. 100 J", "D. 20 J"], inciso_correcto: "C" },
  { id: 18, pregunta: "¿Qué ley física establece que la energía no se crea ni se destruye, solo se transforma?", enlace_svg: null, respuestas: ["A. Ley de Newton", "B. Ley de Ohm", "C. Ley de Coulomb", "D. Ley de la conservación de la energía"], inciso_correcto: "D" },
  { id: 19, pregunta: "¿Cuál es la unidad de medida de la energía en el Sistema Internacional?", enlace_svg: null, respuestas: ["A. El joule", "B. El newton", "C. El watt", "D. El pascal"], inciso_correcto: "A" },
  { id: 20, pregunta: "¿Qué tipo de onda requiere un medio material para propagarse, a diferencia de la luz?", enlace_svg: null, respuestas: ["A. Las ondas electromagnéticas", "B. Las ondas mecánicas (como el sonido)", "C. Las ondas de radio", "D. Los rayos gamma"], inciso_correcto: "B" },
  { id: 21, pregunta: "¿Qué característica de una onda sonora determina su tono (agudo o grave)?", enlace_svg: null, respuestas: ["A. La amplitud", "B. La velocidad de propagación", "C. La frecuencia", "D. La forma de la onda"], inciso_correcto: "C" },
  { id: 22, pregunta: "Según la Ley de Ohm, ¿cuál es la relación entre voltaje (V), corriente (I) y resistencia (R)?", enlace_svg: null, respuestas: ["A. V = I/R", "B. V = R/I", "C. I = V·R", "D. V = I·R"], inciso_correcto: "D" },
  { id: 23, pregunta: "¿Qué partícula subatómica tiene carga eléctrica negativa?", enlace_svg: null, respuestas: ["A. El electrón", "B. El protón", "C. El neutrón", "D. El fotón"], inciso_correcto: "A" },
  { id: 24, pregunta: "Un circuito tiene un voltaje de 9 V y una resistencia de 3 Ω. ¿Cuál es la corriente que circula?", enlace_svg: null, respuestas: ["A. 27 A", "B. 3 A", "C. 6 A", "D. 0.33 A"], inciso_correcto: "B" },
  { id: 25, pregunta: "¿Qué ley establece que la fuerza eléctrica entre dos cargas es directamente proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia entre ellas?", enlace_svg: null, respuestas: ["A. Ley de Ohm", "B. Ley de Ampère", "C. Ley de Coulomb", "D. Ley de Faraday"], inciso_correcto: "C" },
  { id: 26, pregunta: "¿Qué fenómeno óptico ocurre cuando la luz cambia de dirección al pasar de un medio a otro con distinto índice de refracción?", enlace_svg: null, respuestas: ["A. La reflexión", "B. La difracción", "C. La interferencia", "D. La refracción"], inciso_correcto: "D" },
  { id: 27, pregunta: "¿Cuál es la potencia consumida por un aparato eléctrico que opera a 120 V y consume una corriente de 2 A?", enlace_svg: null, respuestas: ["A. 240 W", "B. 60 W", "C. 122 W", "D. 480 W"], inciso_correcto: "A" },
  { id: 28, pregunta: "¿Qué tipo de espejo produce siempre una imagen virtual, derecha y de menor tamaño que el objeto?", enlace_svg: null, respuestas: ["A. Espejo cóncavo", "B. Espejo convexo", "C. Espejo plano", "D. Espejo parabólico cóncavo"], inciso_correcto: "B" },
  { id: 29, pregunta: "¿Qué principio explica por qué un objeto sumergido en un fluido experimenta una fuerza hacia arriba (empuje)?", enlace_svg: null, respuestas: ["A. Principio de Pascal", "B. Principio de Bernoulli", "C. Principio de Arquímedes", "D. Principio de conservación del momento"], inciso_correcto: "C" },
  { id: 30, pregunta: "¿Qué magnitud física mide la rapidez con la que se realiza un trabajo o se transfiere energía?", enlace_svg: null, respuestas: ["A. La fuerza", "B. El trabajo", "C. La energía", "D. La potencia"], inciso_correcto: "D" },

  // ── QUÍMICA GENERAL (IDs 31–45) ──────────────────────────────────────
  { id: 31, pregunta: "¿Cuál es la fórmula química del ácido sulfúrico?", enlace_svg: null, respuestas: ["A. HCl", "B. HNO₃", "C. H₂SO₄", "D. H₃PO₄"], inciso_correcto: "C" },
  { id: 32, pregunta: "¿Cuántos átomos de hidrógeno hay en una molécula de glucosa (C₆H₁₂O₆)?", enlace_svg: null, respuestas: ["A. 6", "B. 8", "C. 10", "D. 12"], inciso_correcto: "D" },
  { id: 33, pregunta: "¿Qué tipo de solución tiene un pH menor a 7?", enlace_svg: null, respuestas: ["A. Ácida", "B. Básica", "C. Neutra", "D. Anfótera"], inciso_correcto: "A" },
  { id: 34, pregunta: "Si se tienen 2 moles de un gas ideal a temperatura y presión constantes, ¿qué ocurre con su volumen si se duplica el número de moles?", enlace_svg: null, respuestas: ["A. Se reduce a la mitad", "B. Se duplica", "C. Permanece igual", "D. Se cuadruplica"], inciso_correcto: "B" },
  { id: 35, pregunta: "¿Cómo se le llama a la cantidad de calor necesaria para elevar en un grado la temperatura de una unidad de masa de una sustancia?", enlace_svg: null, respuestas: ["A. Entalpía", "B. Entropía", "C. Calor específico", "D. Energía libre"], inciso_correcto: "C" },
  { id: 36, pregunta: "¿Qué gas es liberado en la reacción entre un metal como el zinc y un ácido como el HCl?", enlace_svg: null, respuestas: ["A. Oxígeno", "B. Dióxido de carbono", "C. Nitrógeno", "D. Hidrógeno"], inciso_correcto: "D" },
  { id: 37, pregunta: "Balancea la siguiente ecuación: __ H₂ + __ O₂ → __ H₂O. ¿Cuáles son los coeficientes correctos, en ese orden?", enlace_svg: null, respuestas: ["A. 2, 1, 2", "B. 1, 1, 1", "C. 1, 2, 2", "D. 2, 2, 1"], inciso_correcto: "A" },
  { id: 38, pregunta: "¿Qué tipo de enlace químico se forma por la transferencia completa de electrones de un átomo a otro?", enlace_svg: null, respuestas: ["A. Enlace covalente", "B. Enlace iónico", "C. Enlace metálico", "D. Puente de hidrógeno"], inciso_correcto: "B" },
  { id: 39, pregunta: "¿Cuál es la masa molar aproximada del CO₂? (C = 12, O = 16)", enlace_svg: null, respuestas: ["A. 28 g/mol", "B. 32 g/mol", "C. 44 g/mol", "D. 16 g/mol"], inciso_correcto: "C" },
  { id: 40, pregunta: "Según la teoría de Brønsted-Lowry, ¿qué nombre recibe una sustancia que ACEPTA protones (H⁺) en una reacción ácido-base?", enlace_svg: null, respuestas: ["A. Ácido", "B. Sal", "C. Óxido", "D. Base"], inciso_correcto: "D" },
  { id: 41, pregunta: "¿Cuántos moles de oxígeno (O₂) se necesitan para reaccionar completamente con 2 moles de hidrógeno (H₂), según 2H₂ + O₂ → 2H₂O?", enlace_svg: null, respuestas: ["A. 1 mol", "B. 2 moles", "C. 0.5 moles", "D. 4 moles"], inciso_correcto: "A" },
  { id: 42, pregunta: "¿Qué propiedad coligativa de las disoluciones describe la disminución del punto de congelación al añadir un soluto?", enlace_svg: null, respuestas: ["A. Presión osmótica", "B. Descenso crioscópico", "C. Aumento ebulloscópico", "D. Presión de vapor"], inciso_correcto: "B" },
  { id: 43, pregunta: "¿Qué tipo de mezcla resulta al combinar agua y aceite, que no se disuelven entre sí?", enlace_svg: null, respuestas: ["A. Disolución", "B. Mezcla homogénea", "C. Mezcla heterogénea", "D. Aleación"], inciso_correcto: "C" },
  { id: 44, pregunta: "¿Qué elemento tiene el símbolo químico \"Na\"?", enlace_svg: null, respuestas: ["A. Nitrógeno", "B. Níquel", "C. Neón", "D. Sodio"], inciso_correcto: "D" },
  { id: 45, pregunta: "Si la concentración de una disolución es de 0.5 mol/L y su volumen es de 2 L, ¿cuántos moles de soluto contiene?", enlace_svg: null, respuestas: ["A. 1 mol", "B. 2.5 moles", "C. 0.25 moles", "D. 4 moles"], inciso_correcto: "A" },

  // ── LÓGICA Y RAZONAMIENTO CUANTITATIVO (IDs 46–60) ───────────────────
  { id: 46, pregunta: "¿Cuál es el valor de la función f(x) = 2x + 3 cuando x = 5?", enlace_svg: null, respuestas: ["A. 10", "B. 8", "C. 5", "D. 13"], inciso_correcto: "D" },
  { id: 47, pregunta: "En lógica proposicional, ¿cuál es el valor de verdad de la proposición \"p ∧ q\" (p y q) si p es verdadero y q es falso?", enlace_svg: null, respuestas: ["A. Falso", "B. Verdadero", "C. Indeterminado", "D. Depende del contexto"], inciso_correcto: "A" },
  { id: 48, pregunta: "¿Cuál es la derivada de la función f(x) = x²?", enlace_svg: null, respuestas: ["A. x", "B. 2x", "C. x²", "D. 2x²"], inciso_correcto: "B" },
  { id: 49, pregunta: "Si todos los perros son mamíferos y Firulais es un perro, ¿qué se puede concluir válidamente mediante razonamiento deductivo?", enlace_svg: null, respuestas: ["A. Firulais no es un mamífero", "B. Todos los mamíferos son perros", "C. Firulais es un mamífero", "D. No se puede concluir nada"], inciso_correcto: "C" },
  { id: 50, pregunta: "¿Cuál es el siguiente número en la secuencia: 2, 6, 18, 54, ...?", enlace_svg: null, respuestas: ["A. 108", "B. 144", "C. 216", "D. 162"], inciso_correcto: "D" },
  { id: 51, pregunta: "En un experimento se lanza una moneda tres veces. ¿Cuántos resultados posibles distintos existen en total?", enlace_svg: null, respuestas: ["A. 8", "B. 6", "C. 3", "D. 9"], inciso_correcto: "A" },
  { id: 52, pregunta: "¿Qué conector lógico corresponde al símbolo \"→\" en lógica proposicional?", enlace_svg: null, respuestas: ["A. Conjunción", "B. Condicional (implicación)", "C. Disyunción", "D. Negación"], inciso_correcto: "B" },
  { id: 53, pregunta: "Si el 40% de una cantidad es 80, ¿cuál es la cantidad total?", enlace_svg: null, respuestas: ["A. 320", "B. 32", "C. 200", "D. 120"], inciso_correcto: "C" },
  { id: 54, pregunta: "¿Cuál es la razón (proporción), simplificada, entre 15 y 45?", enlace_svg: null, respuestas: ["A. 3:1", "B. 2:1", "C. 1:2", "D. 1:3"], inciso_correcto: "D" },
  { id: 55, pregunta: "¿Cuál es el valor de la expresión: 2 + 3 × (4 − 1)²?", enlace_svg: null, respuestas: ["A. 29", "B. 45", "C. 21", "D. 11"], inciso_correcto: "A" },
  { id: 56, pregunta: "En una proposición condicional \"Si p, entonces q\", ¿cómo se le llama a la proposición \"Si no q, entonces no p\"?", enlace_svg: null, respuestas: ["A. Recíproca", "B. Contrapositiva", "C. Inversa", "D. Negación simple"], inciso_correcto: "B" },
  { id: 57, pregunta: "Un tinaco se llena a razón de 5 litros por minuto. ¿Cuánto tiempo tarda en llenarse un tinaco de 300 litros?", enlace_svg: null, respuestas: ["A. 50 min", "B. 30 min", "C. 60 min", "D. 1500 min"], inciso_correcto: "C" },
  { id: 58, pregunta: "¿Cuál es el resultado de simplificar la expresión booleana: p ∨ (p ∧ q)?", enlace_svg: null, respuestas: ["A. q", "B. p ∧ q", "C. Verdadero siempre", "D. p"], inciso_correcto: "D" },
  { id: 59, pregunta: "Si un tren viaja a 80 km/h, ¿cuántos km recorre en 45 minutos?", enlace_svg: null, respuestas: ["A. 60 km", "B. 45 km", "C. 80 km", "D. 36 km"], inciso_correcto: "A" },
  { id: 60, pregunta: "¿Cuál es la probabilidad de obtener una suma de 7 al lanzar dos dados de 6 caras?", enlace_svg: null, respuestas: ["A. 1/12", "B. 1/6", "C. 1/4", "D. 1/9"], inciso_correcto: "B" },
];
