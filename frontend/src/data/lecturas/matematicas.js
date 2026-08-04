const lecturaMatematicas = {
  id: 'matematicas', // debe coincidir exactamente con el id en MATERIAS
  temas: [
    {
      id: 'conjuntos-numericos',
      titulo: 'Conjuntos Numéricos',
      subtemas: [
        {
          id: 'numeros-naturales',
          titulo: 'Números naturales',
          conceptos: [
            'Se usan para contar y ordenar: 0, 1, 2, 3... (ℕ).',
            'No incluyen negativos ni decimales.',
            'Son la base de toda la aritmética: sin ellos no hay conteo.'
          ]
        },
        {
          id: 'numeros-enteros',
          titulo: 'Números enteros',
          conceptos: [
            'Incluyen los naturales, sus negativos y el 0 (ℤ): ..., −2, −1, 0, 1, 2...',
            'Útiles para representar deudas, temperaturas bajo cero o niveles bajo el mar.',
            'No admiten fracciones ni decimales.'
          ]
        },
        {
          id: 'numeros-racionales',
          titulo: 'Números racionales',
          conceptos: [
            'Todo número que se puede escribir como fracción a/b, con b ≠ 0 (ℚ).',
            'Incluyen enteros (4 = 4/1), fracciones (3/4) y decimales exactos o periódicos (0.5, 0.333...).',
            'La clave para reconocerlos: su decimal termina o se repite en un patrón.'
          ]
        },
        {
          id: 'numeros-irracionales',
          titulo: 'Números irracionales',
          conceptos: [
            'No se pueden escribir como fracción exacta; su decimal es infinito y sin patrón.',
            'Ejemplos famosos: π (pi), √2, el número áureo.',
            'Aparecen constantemente en geometría (circunferencias, diagonales).'
          ]
        },
        {
          id: 'numeros-reales',
          titulo: 'Números reales',
          conceptos: [
            'La unión de todos los racionales e irracionales (ℝ): prácticamente "todos los números" que usas a diario.',
            'Se representan en la recta numérica sin dejar ningún hueco.',
            'Casi toda operación matemática que verás en este curso vive dentro de los reales.'
          ]
        }
      ]
    },
    {
      id: 'operaciones-fundamentales',
      titulo: 'Operaciones Fundamentales',
      subtemas: [
        {
          id: 'suma',
          titulo: 'Suma',
          conceptos: [
            'Combina dos o más cantidades en una sola.',
            'Con signos: sumar un negativo equivale a restar (5 + (−3) = 5 − 3).'
          ]
        },
        {
          id: 'resta',
          titulo: 'Resta',
          conceptos: [
            'Encuentra la diferencia entre dos cantidades.',
            'Restar un negativo equivale a sumar (5 − (−3) = 5 + 3 = 8).'
          ]
        },
        {
          id: 'multiplicacion',
          titulo: 'Multiplicación',
          conceptos: [
            'Es una suma repetida: 4 × 3 = 4 + 4 + 4.',
            'Regla de los signos: signos iguales dan positivo, signos distintos dan negativo.'
          ]
        },
        {
          id: 'division',
          titulo: 'División',
          conceptos: [
            'Reparte una cantidad en partes iguales; es la operación inversa de la multiplicación.',
            'La misma regla de signos de la multiplicación aplica aquí.'
          ]
        },
        {
          id: 'jerarquia-operaciones',
          titulo: 'Jerarquía de operaciones',
          conceptos: [
            'Orden a seguir: 1) paréntesis, 2) potencias y raíces, 3) multiplicación y división, 4) suma y resta.',
            'Entre operaciones del mismo nivel, se resuelve de izquierda a derecha.',
            'Un truco para recordarlo: PEMDAS (Paréntesis, Exponentes, Multiplicación/División, Adición/Sustracción).'
          ]
        },
        {
          id: 'valor-absoluto',
          titulo: 'Valor absoluto',
          conceptos: [
            'Es la distancia de un número al cero, siempre positiva: |−7| = 7 y |7| = 7.',
            'Se escribe entre barras verticales: |x|.',
            'Útil para medir diferencias sin importar la dirección (por ejemplo, distancias).'
          ]
        }
      ]
    },
    {
      id: 'divisibilidad',
      titulo: 'Divisibilidad',
      subtemas: [
        {
          id: 'primos-compuestos',
          titulo: 'Números primos y compuestos',
          conceptos: [
            'Un número primo solo es divisible entre 1 y sí mismo (2, 3, 5, 7, 11...).',
            'Un número compuesto tiene más de dos divisores (4, 6, 8, 9...).',
            'El 1 no es ni primo ni compuesto: es un caso especial.'
          ]
        },
        {
          id: 'criterios-divisibilidad',
          titulo: 'Criterios de divisibilidad',
          conceptos: [
            'Entre 2: termina en cifra par. Entre 5: termina en 0 o 5.',
            'Entre 3: la suma de sus dígitos es múltiplo de 3. Entre 9: la suma de sus dígitos es múltiplo de 9.',
            'Entre 10: termina en 0. Estos atajos evitan hacer la división completa.'
          ]
        },
        {
          id: 'factorizacion-prima',
          titulo: 'Factorización prima',
          conceptos: [
            'Consiste en expresar un número como producto de números primos: 60 = 2² × 3 × 5.',
            'Se obtiene dividiendo repetidamente entre los primos más pequeños posibles.',
            'Es la base para calcular MCD y MCM de forma rápida.'
          ]
        },
        {
          id: 'divisores-comunes',
          titulo: 'Divisores comunes',
          conceptos: [
            'Son los números que dividen exactamente a dos o más números a la vez.',
            'Se encuentran comparando las listas de divisores de cada número.'
          ]
        },
        {
          id: 'mcd',
          titulo: 'Máximo Común Divisor (MCD)',
          conceptos: [
            'Es el mayor número que divide exactamente a dos o más números.',
            'Se usa para simplificar fracciones a su mínima expresión.'
          ]
        },
        {
          id: 'mcm',
          titulo: 'Mínimo Común Múltiplo (MCM)',
          conceptos: [
            'Es el menor número que es múltiplo de dos o más números a la vez.',
            'Se usa para sumar o restar fracciones con distinto denominador.'
          ]
        }
      ]
    },
    {
      id: 'fracciones-decimales',
      titulo: 'Fracciones y Decimales',
      subtemas: [
        {
          id: 'operaciones-fracciones',
          titulo: 'Operaciones con fracciones',
          conceptos: [
            'Para sumar o restar, primero iguala los denominadores (usa el MCM).',
            'Para multiplicar, multiplica numerador por numerador y denominador por denominador.',
            'Para dividir, multiplica por el recíproco (invierte la segunda fracción).'
          ]
        },
        {
          id: 'conversion-fraccion-decimal',
          titulo: 'Conversión entre fracciones y decimales',
          conceptos: [
            'Para pasar de fracción a decimal, divide el numerador entre el denominador.',
            'Para pasar de decimal exacto a fracción, escribe el número sobre una potencia de 10 (0.75 = 75/100).',
            'Simplifica siempre el resultado a su mínima expresión.'
          ]
        },
        {
          id: 'fracciones-equivalentes',
          titulo: 'Fracciones equivalentes',
          conceptos: [
            'Representan la misma cantidad aunque se escriban distinto: 1/2 = 2/4 = 3/6.',
            'Se obtienen multiplicando o dividiendo numerador y denominador por el mismo número.',
            'Simplificar una fracción es buscar su versión equivalente más reducida.'
          ]
        },
        {
          id: 'comparacion-fracciones',
          titulo: 'Comparación de fracciones',
          conceptos: [
            'Con el mismo denominador, es mayor la que tiene el numerador más grande.',
            'Con denominadores distintos, iguálalos primero (o compara sus formas decimales).',
            'Un atajo rápido: multiplica en cruz y compara los resultados.'
          ]
        }
      ]
    },
    {
      id: 'potencias-radicales',
      titulo: 'Potencias y Radicales',
      subtemas: [
        {
          id: 'leyes-exponentes',
          titulo: 'Leyes de los exponentes',
          conceptos: [
            'Multiplicar misma base: se suman los exponentes (xᵃ × xᵇ = xᵃ⁺ᵇ).',
            'Dividir misma base: se restan los exponentes (xᵃ ÷ xᵇ = xᵃ⁻ᵇ).',
            'Potencia de potencia: se multiplican los exponentes ((xᵃ)ᵇ = xᵃᵇ).',
            'Todo número elevado a 0 es 1, y un exponente negativo indica el recíproco (x⁻ⁿ = 1/xⁿ).'
          ]
        },
        {
          id: 'raiz-cuadrada',
          titulo: 'Raíz cuadrada',
          conceptos: [
            'Es la operación inversa de elevar al cuadrado: √25 = 5 porque 5² = 25.',
            'Solo los cuadrados perfectos (1, 4, 9, 16, 25...) tienen raíz exacta.',
            'Memorizar los cuadrados del 1 al 15 acelera muchísimo los cálculos en el examen.'
          ]
        },
        {
          id: 'raiz-cubica',
          titulo: 'Raíz cúbica',
          conceptos: [
            'Es la inversa de elevar al cubo: ∛27 = 3 porque 3³ = 27.',
            'A diferencia de la raíz cuadrada, sí acepta números negativos (∛−8 = −2).'
          ]
        },
        {
          id: 'radicales',
          titulo: 'Radicales',
          conceptos: [
            'Un radical se simplifica buscando factores que sean cuadrados (o cubos) perfectos: √50 = √(25×2) = 5√2.',
            'Solo se pueden sumar o restar radicales "semejantes" (mismo índice y mismo radicando).'
          ]
        },
        {
          id: 'notacion-cientifica',
          titulo: 'Notación científica',
          conceptos: [
            'Expresa números muy grandes o muy pequeños como a × 10ⁿ, con 1 ≤ a < 10.',
            'Exponente positivo mueve el punto a la derecha (números grandes); negativo, a la izquierda (números pequeños).',
            'Muy usada en ciencias: la distancia Tierra-Sol o el tamaño de un átomo se escriben así.'
          ]
        }
      ]
    },
    {
      id: 'proporcionalidad',
      titulo: 'Proporcionalidad',
      subtemas: [
        {
          id: 'razones',
          titulo: 'Razones',
          conceptos: [
            'Una razón compara dos cantidades mediante una división (a/b).'
          ]
        },
        {
          id: 'proporciones',
          titulo: 'Proporciones',
          conceptos: [
            'Una proporción afirma que dos razones son iguales (a/b = c/d).',
            'En toda proporción, el producto de extremos es igual al producto de medios (multiplicación cruzada).'
          ]
        },
        {
          id: 'regla-de-tres-simple',
          titulo: 'Regla de tres simple',
          conceptos: [
            'Relaciona dos magnitudes para encontrar un valor desconocido.',
            'Antes de resolver, identifica si la relación es directa o inversa: cambia el planteamiento.'
          ]
        },
        {
          id: 'regla-de-tres-compuesta',
          titulo: 'Regla de tres compuesta',
          conceptos: [
            'Involucra tres o más magnitudes relacionadas al mismo tiempo.',
            'Se resuelve encadenando varias relaciones simples (directas o inversas) en una sola ecuación.'
          ]
        },
        {
          id: 'variacion-directa',
          titulo: 'Variación directa',
          conceptos: [
            'Si una magnitud aumenta, la otra aumenta en la misma proporción (a más horas trabajadas, más pago).'
          ]
        },
        {
          id: 'variacion-inversa',
          titulo: 'Variación inversa',
          conceptos: [
            'Si una magnitud aumenta, la otra disminuye en la misma proporción (a más obreros, menos días para terminar la obra).'
          ]
        },
        {
          id: 'porcentajes',
          titulo: 'Porcentajes',
          conceptos: [
            'Un porcentaje es una fracción con denominador 100: 25% = 25/100 = 0.25.',
            'Para calcular el X% de una cantidad, multiplica la cantidad por X/100.',
            'Muy útil para descuentos, aumentos de precio e interpretación de encuestas.'
          ]
        },
        {
          id: 'interes-simple',
          titulo: 'Interés simple',
          conceptos: [
            'Fórmula clave: Interés = Capital × Tasa × Tiempo (I = C × r × t).',
            'El interés simple siempre se calcula sobre el capital original, sin acumular sobre intereses previos.'
          ]
        }
      ]
    },
    {
      id: 'expresiones-algebraicas',
      titulo: 'Expresiones Algebraicas',
      subtemas: [
        {
          id: 'monomios',
          titulo: 'Monomios',
          conceptos: [
            'Es una expresión con un solo término: coeficiente y variable(s), como 5x²y.',
            'Solo se pueden sumar o restar monomios semejantes (misma parte literal).'
          ]
        },
        {
          id: 'polinomios',
          titulo: 'Polinomios',
          conceptos: [
            'Es la suma o resta de dos o más monomios: 3x² − 5x + 7.',
            'Según su número de términos se llaman binomio (2), trinomio (3) o polinomio (4 o más).',
            'Su grado es el mayor exponente que aparece en la expresión.'
          ]
        },
        {
          id: 'operaciones-algebraicas',
          titulo: 'Operaciones algebraicas',
          conceptos: [
            'Suma y resta: se combinan únicamente los términos semejantes.',
            'Multiplicación: se aplica la propiedad distributiva y se suman los exponentes de bases iguales.',
            'División: se resta el exponente del divisor al del dividendo en cada término.'
          ]
        },
        {
          id: 'simplificacion-expresiones',
          titulo: 'Simplificación de expresiones',
          conceptos: [
            'Agrupa y reduce los términos semejantes para dejar la expresión lo más corta posible.',
            'Simplificar antes de sustituir valores ahorra tiempo y evita errores de cálculo.'
          ]
        }
      ]
    },
    {
      id: 'productos-notables-factorizacion',
      titulo: 'Productos Notables y Factorización',
      subtemas: [
        {
          id: 'productos-notables',
          titulo: 'Productos notables',
          conceptos: [
            'Binomio al cuadrado: (a + b)² = a² + 2ab + b², y (a − b)² = a² − 2ab + b².',
            'Binomios conjugados: (a + b)(a − b) = a² − b² (diferencia de cuadrados).',
            'Memorizarlos evita multiplicar término por término cada vez.'
          ]
        },
        {
          id: 'factor-comun',
          titulo: 'Factor común',
          conceptos: [
            'Busca el mayor término que se repite en todas las partes de la expresión y sácalo fuera del paréntesis.',
            'Ejemplo: 6x² + 9x = 3x(2x + 3).'
          ]
        },
        {
          id: 'diferencia-cuadrados',
          titulo: 'Diferencia de cuadrados',
          conceptos: [
            'Se reconoce cuando hay dos términos al cuadrado separados por un signo menos: a² − b².',
            'Se factoriza como (a + b)(a − b), el proceso inverso de un producto notable.'
          ]
        },
        {
          id: 'trinomio-cuadrado-perfecto',
          titulo: 'Trinomio cuadrado perfecto',
          conceptos: [
            'Aparece cuando el primer y último término son cuadrados exactos y el del medio es el doble de sus raíces: x² + 6x + 9.',
            'Se factoriza como un binomio al cuadrado: (x + 3)².'
          ]
        },
        {
          id: 'factorizacion-polinomios',
          titulo: 'Factorización de polinomios',
          conceptos: [
            'Para un trinomio x² + bx + c, busca dos números que multiplicados den c y sumados den b.',
            'Siempre revisa primero si hay un factor común antes de aplicar otra técnica.'
          ]
        }
      ]
    },
    {
      id: 'fracciones-algebraicas',
      titulo: 'Fracciones Algebraicas',
      subtemas: [
        {
          id: 'simplificacion-fracciones-algebraicas',
          titulo: 'Simplificación',
          conceptos: [
            'Factoriza numerador y denominador y cancela los factores comunes.',
            'Ejemplo: (x² − 9)/(x − 3) se simplifica a (x + 3), cancelando (x − 3).'
          ]
        },
        {
          id: 'operaciones-fracciones-algebraicas',
          titulo: 'Operaciones',
          conceptos: [
            'Se suman y restan igual que las fracciones numéricas: se necesita un denominador común.',
            'Se multiplican y dividen igual que las numéricas, factorizando primero para simplificar.'
          ]
        },
        {
          id: 'fracciones-complejas',
          titulo: 'Fracciones complejas',
          conceptos: [
            'Son fracciones que contienen otra fracción dentro del numerador o del denominador.',
            'Se simplifican convirtiendo la expresión en una sola división de fracciones.'
          ]
        }
      ]
    },
    {
      id: 'ecuaciones',
      titulo: 'Ecuaciones',
      subtemas: [
        {
          id: 'ecuaciones-primer-grado',
          titulo: 'Ecuaciones de primer grado',
          conceptos: [
            'La incógnita aparece solo elevada a la potencia 1: ax + b = c.',
            'Se resuelven despejando la variable: lo que está sumando pasa restando y viceversa; lo que multiplica pasa dividiendo.'
          ]
        },
        {
          id: 'ecuaciones-segundo-grado',
          titulo: 'Ecuaciones de segundo grado',
          conceptos: [
            'Tienen la forma ax² + bx + c = 0 y pueden tener hasta dos soluciones.',
            'Se resuelven factorizando o con la fórmula general: x = (−b ± √(b² − 4ac)) / 2a.',
            'El discriminante (b² − 4ac) indica cuántas soluciones reales tiene la ecuación.'
          ]
        },
        {
          id: 'sistemas-ecuaciones',
          titulo: 'Sistemas de ecuaciones',
          conceptos: [
            'Dos o más ecuaciones con las mismas incógnitas que se resuelven en conjunto.',
            'Métodos comunes: sustitución, igualación y suma o resta (reducción).'
          ]
        },
        {
          id: 'inecuaciones',
          titulo: 'Inecuaciones',
          conceptos: [
            'Se resuelven igual que las ecuaciones, pero el resultado es un rango de valores, no un solo número.',
            'Regla clave: si multiplicas o divides ambos lados por un número negativo, el signo de la desigualdad se invierte.'
          ]
        },
        {
          id: 'resolucion-problemas-ecuaciones',
          titulo: 'Resolución de problemas mediante ecuaciones',
          conceptos: [
            'Identifica la incógnita y asígnale una letra antes de traducir el enunciado.',
            'Traduce frase por frase a símbolos matemáticos; luego resuelve como cualquier ecuación.'
          ]
        }
      ]
    },
    {
      id: 'modelacion-algebraica',
      titulo: 'Modelación Algebraica',
      subtemas: [
        {
          id: 'expresiones-de-enunciados',
          titulo: 'Expresiones algebraicas de enunciados verbales',
          conceptos: [
            '"El doble de un número" es 2x; "un número aumentado en 5" es x + 5.',
            'Palabras clave: "suma/más" → +, "diferencia/menos" → −, "producto/veces" → ×, "cociente/entre" → ÷.'
          ]
        },
        {
          id: 'planteamiento-ecuaciones',
          titulo: 'Planteamiento de ecuaciones',
          conceptos: [
            'Convierte el problema en una ecuación completa antes de intentar resolverlo mentalmente.',
            'Verifica que cada dato del enunciado esté representado en tu ecuación.'
          ]
        },
        {
          id: 'valores-variables',
          titulo: 'Valores de las variables',
          conceptos: [
            'Una vez resuelta la ecuación, siempre verifica sustituyendo el valor obtenido en el enunciado original.',
            'Descarta soluciones que no tengan sentido en el contexto (por ejemplo, edades o distancias negativas).'
          ]
        }
      ]
    },
    {
      id: 'funciones-conceptos-fundamentales',
      titulo: 'Conceptos Fundamentales de Funciones',
      subtemas: [
        {
          id: 'relacion',
          titulo: 'Relación',
          conceptos: [
            'Es cualquier conexión entre los elementos de dos conjuntos, representada como pares ordenados (x, y).',
            'Toda función es una relación, pero no toda relación es una función.'
          ]
        },
        {
          id: 'funcion',
          titulo: 'Función',
          conceptos: [
            'Es una relación especial donde cada valor de entrada (x) tiene una única salida (y).',
            'Prueba rápida: si un mismo x aparece con dos valores distintos de y, no es función.'
          ]
        },
        {
          id: 'dominio',
          titulo: 'Dominio',
          conceptos: [
            'Es el conjunto de todos los valores de entrada (x) para los que la función está definida.',
            'Cuidado con las divisiones entre cero o las raíces de números negativos: ahí el dominio se restringe.'
          ]
        },
        {
          id: 'rango',
          titulo: 'Rango',
          conceptos: [
            'Es el conjunto de todos los valores de salida (y) que realmente produce la función.',
            'Se obtiene analizando qué resultados son posibles según el dominio.'
          ]
        }
      ]
    },
    {
      id: 'evaluacion-funciones',
      titulo: 'Evaluación de Funciones',
      subtemas: [
        {
          id: 'sustitucion-valores',
          titulo: 'Sustitución de valores',
          conceptos: [
            'Evaluar f(x) en un punto significa reemplazar la x por ese número y calcular el resultado.',
            'Ejemplo: si f(x) = 2x + 3, entonces f(4) = 2(4) + 3 = 11.'
          ]
        },
        {
          id: 'interpretacion-resultados',
          titulo: 'Interpretación de resultados',
          conceptos: [
            'El resultado f(x) representa el valor de salida asociado a esa entrada específica.',
            'En problemas reales, interpreta qué significa ese número en el contexto (dinero, distancia, tiempo).'
          ]
        }
      ]
    },
    {
      id: 'tipos-de-funciones',
      titulo: 'Tipos de Funciones',
      subtemas: [
        {
          id: 'funcion-lineal',
          titulo: 'Función lineal',
          conceptos: [
            'Tiene la forma f(x) = mx + b y su gráfica es siempre una línea recta.',
            '"m" es la pendiente (inclinación) y "b" es el punto donde cruza el eje Y.'
          ]
        },
        {
          id: 'funcion-cuadratica',
          titulo: 'Función cuadrática',
          conceptos: [
            'Tiene la forma f(x) = ax² + bx + c y su gráfica es siempre una parábola.',
            'Aparece constantemente en física, por ejemplo al describir el lanzamiento de un objeto.'
          ]
        },
        {
          id: 'funcion-constante',
          titulo: 'Función constante',
          conceptos: [
            'Tiene la forma f(x) = k, donde el resultado nunca cambia sin importar el valor de x.',
            'Su gráfica es siempre una línea horizontal.'
          ]
        },
        {
          id: 'funcion-afin',
          titulo: 'Función afín',
          conceptos: [
            'Es una función lineal donde b ≠ 0, es decir, no pasa por el origen (0, 0).',
            'Se diferencia de la función lineal "pura" precisamente por ese desplazamiento vertical.'
          ]
        }
      ]
    },
    {
      id: 'representacion-grafica',
      titulo: 'Representación Gráfica',
      subtemas: [
        {
          id: 'interpretacion-graficas',
          titulo: 'Interpretación de gráficas',
          conceptos: [
            'El eje horizontal (X) representa la entrada; el eje vertical (Y), la salida.',
            'Donde la gráfica cruza el eje X están las raíces o soluciones de la función.'
          ]
        },
        {
          id: 'transformaciones-graficas',
          titulo: 'Transformaciones de gráficas',
          conceptos: [
            'Sumar una constante fuera de la función desplaza la gráfica verticalmente (y = x² + 3 sube 3 unidades).',
            'Sumar una constante dentro del paréntesis la desplaza horizontalmente en dirección contraria al signo.'
          ]
        }
      ]
    },
    {
      id: 'geometria-conceptos-basicos',
      titulo: 'Conceptos Básicos de Geometría',
      subtemas: [
        {
          id: 'punto',
          titulo: 'Punto',
          conceptos: [
            'No tiene dimensión: solo indica una posición exacta en el espacio.'
          ]
        },
        {
          id: 'recta',
          titulo: 'Recta',
          conceptos: [
            'Es una sucesión infinita de puntos en una sola dirección, sin principio ni fin.'
          ]
        },
        {
          id: 'plano',
          titulo: 'Plano',
          conceptos: [
            'Es una superficie que se extiende infinitamente en dos dimensiones.'
          ]
        },
        {
          id: 'segmento',
          titulo: 'Segmento',
          conceptos: [
            'Es la porción de una recta entre dos puntos definidos: tiene longitud medible.'
          ]
        },
        {
          id: 'semirrecta',
          titulo: 'Semirrecta',
          conceptos: [
            'Tiene un solo origen y se extiende infinitamente en una sola dirección.'
          ]
        }
      ]
    },
    {
      id: 'angulos',
      titulo: 'Ángulos',
      subtemas: [
        {
          id: 'clasificacion-angulos',
          titulo: 'Clasificación de ángulos',
          conceptos: [
            'Agudo: menos de 90°. Recto: exactamente 90°. Obtuso: entre 90° y 180°. Llano: exactamente 180°.',
            'Reconocerlos a simple vista es clave para resolver problemas de geometría rápidamente.'
          ]
        },
        {
          id: 'angulos-complementarios',
          titulo: 'Ángulos complementarios',
          conceptos: [
            'Dos ángulos son complementarios cuando su suma es exactamente 90°.'
          ]
        },
        {
          id: 'angulos-suplementarios',
          titulo: 'Ángulos suplementarios',
          conceptos: [
            'Dos ángulos son suplementarios cuando su suma es exactamente 180°.'
          ]
        },
        {
          id: 'angulos-opuestos-vertice',
          titulo: 'Ángulos opuestos por el vértice',
          conceptos: [
            'Se forman cuando dos rectas se cruzan; quedan "cara a cara" en lados opuestos.',
            'Siempre son iguales entre sí, sin excepción.'
          ]
        }
      ]
    },
    {
      id: 'poligonos',
      titulo: 'Polígonos',
      subtemas: [
        {
          id: 'triangulos',
          titulo: 'Triángulos',
          conceptos: [
            'Según sus lados: equilátero (los 3 iguales), isósceles (2 iguales) o escaleno (ninguno igual).',
            'Según sus ángulos: acutángulo, rectángulo u obtusángulo.',
            'La suma de sus tres ángulos internos siempre es 180°.'
          ]
        },
        {
          id: 'cuadrilateros',
          titulo: 'Cuadriláteros',
          conceptos: [
            'Figuras de 4 lados: cuadrado, rectángulo, rombo, romboide y trapecio, entre otros.',
            'La suma de sus ángulos internos siempre es 360°.'
          ]
        },
        {
          id: 'poligonos-regulares',
          titulo: 'Polígonos regulares',
          conceptos: [
            'Todos sus lados y todos sus ángulos son iguales entre sí (como un pentágono regular).'
          ]
        },
        {
          id: 'poligonos-irregulares',
          titulo: 'Polígonos irregulares',
          conceptos: [
            'Sus lados y/o ángulos tienen medidas distintas entre sí.'
          ]
        }
      ]
    },
    {
      id: 'circunferencia-circulo',
      titulo: 'Circunferencia y Círculo',
      subtemas: [
        {
          id: 'elementos-circunferencia',
          titulo: 'Elementos de la circunferencia',
          conceptos: [
            'Radio: distancia del centro a cualquier punto del borde. Diámetro: el doble del radio, cruza todo el círculo.',
            'Cuerda: segmento que une dos puntos cualquiera de la circunferencia.'
          ]
        },
        {
          id: 'longitud-circunferencia',
          titulo: 'Longitud de la circunferencia',
          conceptos: [
            'Se calcula con la fórmula perímetro = 2πr (o πd, usando el diámetro).',
            'π (pi) es aproximadamente 3.1416, la relación constante entre el perímetro y el diámetro de cualquier círculo.'
          ]
        },
        {
          id: 'area-circulo',
          titulo: 'Área del círculo',
          conceptos: [
            'Se calcula con la fórmula Área = πr².',
            'Recuerda usar el radio, no el diámetro; si te dan el diámetro, divídelo entre 2 primero.'
          ]
        }
      ]
    },
    {
      id: 'medicion',
      titulo: 'Medición',
      subtemas: [
        {
          id: 'perimetro',
          titulo: 'Perímetro',
          conceptos: [
            'Es la suma de todos los lados de una figura: la "distancia" de contornear su borde completo.',
            'Útil para calcular, por ejemplo, cuánta cerca se necesita para rodear un terreno.'
          ]
        },
        {
          id: 'area',
          titulo: 'Área',
          conceptos: [
            'Mide la superficie que ocupa una figura, en unidades cuadradas (cm², m²...).',
            'Cada figura tiene su propia fórmula: rectángulo (base × altura), triángulo (base × altura / 2), etc.'
          ]
        },
        {
          id: 'volumen',
          titulo: 'Volumen',
          conceptos: [
            'Mide el espacio que ocupa un cuerpo en tres dimensiones, en unidades cúbicas (cm³, m³...).',
            'Para un prisma rectangular: Volumen = largo × ancho × alto.'
          ]
        }
      ]
    },
    {
      id: 'teoremas-fundamentales',
      titulo: 'Teoremas Fundamentales',
      subtemas: [
        {
          id: 'teorema-pitagoras',
          titulo: 'Teorema de Pitágoras',
          conceptos: [
            'Solo aplica a triángulos rectángulos: a² + b² = c², donde c es la hipotenusa (el lado más largo, opuesto al ángulo recto).',
            'Con dos lados conocidos, siempre puedes encontrar el tercero despejando la fórmula.',
            'El clásico "3-4-5" es un triángulo rectángulo perfecto: 3² + 4² = 9 + 16 = 25 = 5².'
          ]
        }
      ]
    },
    {
      id: 'plano-cartesiano',
      titulo: 'Plano Cartesiano',
      subtemas: [
        {
          id: 'coordenadas',
          titulo: 'Coordenadas',
          conceptos: [
            'Cada punto se ubica con un par ordenado (x, y): x es la abscisa (horizontal), y es la ordenada (vertical).',
            'El punto (0, 0), donde se cruzan los ejes, se llama origen.'
          ]
        },
        {
          id: 'ubicacion-puntos',
          titulo: 'Ubicación de puntos',
          conceptos: [
            'El plano se divide en 4 cuadrantes: I (+,+), II (−,+), III (−,−) y IV (+,−).',
            'El signo de cada coordenada te dice de inmediato en qué cuadrante está el punto.'
          ]
        }
      ]
    },
    {
      id: 'recta-geometria-analitica',
      titulo: 'La Recta',
      subtemas: [
        {
          id: 'pendiente',
          titulo: 'Pendiente',
          conceptos: [
            'Mide la inclinación de una recta: m = (y₂ − y₁) / (x₂ − x₁).',
            'Pendiente positiva sube de izquierda a derecha; negativa, baja; cero, es horizontal.'
          ]
        },
        {
          id: 'ecuacion-de-la-recta',
          titulo: 'Ecuación de la recta',
          conceptos: [
            'Forma pendiente-ordenada al origen: y = mx + b, donde b es el punto donde cruza el eje Y.',
            'Rectas paralelas tienen la misma pendiente; rectas perpendiculares tienen pendientes recíprocas y de signo opuesto.'
          ]
        }
      ]
    },
    {
      id: 'distancias-relaciones',
      titulo: 'Distancias y Relaciones',
      subtemas: [
        {
          id: 'distancia-entre-puntos',
          titulo: 'Distancia entre dos puntos',
          conceptos: [
            'Se calcula con d = √((x₂−x₁)² + (y₂−y₁)²), una aplicación directa del teorema de Pitágoras.',
          ]
        },
        {
          id: 'punto-medio',
          titulo: 'Punto medio',
          conceptos: [
            'Es el punto exacto a la mitad de un segmento: se promedian las coordenadas de sus extremos.',
            'Fórmula: ((x₁+x₂)/2, (y₁+y₂)/2).'
          ]
        }
      ]
    },
    {
      id: 'organizacion-datos',
      titulo: 'Organización de Datos',
      subtemas: [
        {
          id: 'tablas',
          titulo: 'Tablas',
          conceptos: [
            'Organizan los datos en filas y columnas para facilitar su lectura y comparación.'
          ]
        },
        {
          id: 'frecuencias',
          titulo: 'Frecuencias',
          conceptos: [
            'La frecuencia absoluta indica cuántas veces se repite un dato.',
            'La frecuencia relativa es la frecuencia absoluta dividida entre el total de datos (útil para ver proporciones).'
          ]
        },
        {
          id: 'graficas-barras',
          titulo: 'Gráficas de barras',
          conceptos: [
            'Ideales para comparar cantidades entre distintas categorías de un vistazo.'
          ]
        },
        {
          id: 'graficas-circulares',
          titulo: 'Gráficas circulares',
          conceptos: [
            'Ideales para mostrar qué proporción representa cada parte de un total (gráficas "de pastel").'
          ]
        },
        {
          id: 'graficas-lineales',
          titulo: 'Gráficas lineales',
          conceptos: [
            'Muestran cómo cambia un dato a lo largo del tiempo, uniendo los puntos con una línea.',
            'Perfectas para detectar tendencias: crecimiento, caída o estabilidad.'
          ]
        }
      ]
    },
    {
      id: 'medidas-estadisticas',
      titulo: 'Medidas Estadísticas',
      subtemas: [
        {
          id: 'media',
          titulo: 'Media (promedio)',
          conceptos: [
            'Se calcula sumando todos los datos y dividiendo entre el número total de datos.',
            'Es muy sensible a valores extremos: uno solo muy alto o muy bajo puede desviarla bastante.'
          ]
        },
        {
          id: 'mediana',
          titulo: 'Mediana',
          conceptos: [
            'Es el valor central cuando los datos están ordenados de menor a mayor.',
            'Si hay un número par de datos, se promedian los dos valores centrales.'
          ]
        },
        {
          id: 'moda',
          titulo: 'Moda',
          conceptos: [
            'Es el valor que más se repite en el conjunto de datos.',
            'Un conjunto puede no tener moda, o tener varias (bimodal, multimodal).'
          ]
        },
        {
          id: 'rango-estadistico',
          titulo: 'Rango',
          conceptos: [
            'Se calcula restando el valor mínimo al valor máximo del conjunto de datos.',
            'Da una idea rápida de qué tan dispersos están los datos.'
          ]
        }
      ]
    },
    {
      id: 'interpretacion-datos',
      titulo: 'Interpretación de Datos',
      subtemas: [
        {
          id: 'analisis-tablas',
          titulo: 'Análisis de tablas',
          conceptos: [
            'Antes de leer los números, identifica qué representa cada fila y cada columna.',
            'Busca el valor máximo, el mínimo y la tendencia general antes de sacar conclusiones.'
          ]
        },
        {
          id: 'interpretacion-graficas-datos',
          titulo: 'Interpretación de gráficas',
          conceptos: [
            'Identifica primero qué representa cada eje antes de leer los valores.',
            'Fíjate en la tendencia general (sube, baja, se mantiene) más que en un solo punto aislado.'
          ]
        },
        {
          id: 'comparacion-datos',
          titulo: 'Comparación de datos',
          conceptos: [
            'Compara siempre en las mismas unidades y bajo el mismo criterio (por ejemplo, porcentajes contra porcentajes).',
            'Cuidado con las gráficas engañosas: revisa si la escala del eje empieza en cero.'
          ]
        }
      ]
    },
    {
      id: 'probabilidad-conceptos-basicos',
      titulo: 'Conceptos Básicos de Probabilidad',
      subtemas: [
        {
          id: 'espacio-muestral',
          titulo: 'Espacio muestral',
          conceptos: [
            'Es el conjunto de todos los resultados posibles de un experimento (al lanzar un dado: {1,2,3,4,5,6}).'
          ]
        },
        {
          id: 'eventos',
          titulo: 'Eventos',
          conceptos: [
            'Un evento es cualquier subconjunto del espacio muestral (por ejemplo, "sacar un número par").'
          ]
        },
        {
          id: 'sucesos',
          titulo: 'Sucesos',
          conceptos: [
            'Un suceso seguro ocurre siempre (probabilidad 1); un suceso imposible nunca ocurre (probabilidad 0).'
          ]
        }
      ]
    },
    {
      id: 'calculo-probabilidades',
      titulo: 'Cálculo de Probabilidades',
      subtemas: [
        {
          id: 'probabilidad-simple',
          titulo: 'Probabilidad simple',
          conceptos: [
            'Se calcula como: casos favorables ÷ casos posibles.',
            'Siempre da un valor entre 0 (imposible) y 1 (seguro), o entre 0% y 100%.'
          ]
        },
        {
          id: 'probabilidad-compuesta',
          titulo: 'Probabilidad compuesta',
          conceptos: [
            'Calcula la probabilidad de que ocurran dos o más eventos juntos.',
            'Si los eventos son independientes, se multiplican sus probabilidades individuales.'
          ]
        },
        {
          id: 'probabilidad-complementaria',
          titulo: 'Probabilidad complementaria',
          conceptos: [
            'Es la probabilidad de que un evento NO ocurra: P(no A) = 1 − P(A).',
            'Útil cuando calcular el complemento es más fácil que calcular el evento directamente.'
          ]
        }
      ]
    },
    {
      id: 'patrones-sucesiones',
      titulo: 'Patrones y Sucesiones',
      subtemas: [
        {
          id: 'secuencias-aritmeticas',
          titulo: 'Secuencias aritméticas',
          conceptos: [
            'Cada término se obtiene sumando siempre la misma cantidad al anterior (2, 5, 8, 11... suma 3 cada vez).',
            'Esa cantidad fija se llama razón o diferencia común.'
          ]
        },
        {
          id: 'secuencias-geometricas',
          titulo: 'Secuencias geométricas',
          conceptos: [
            'Cada término se obtiene multiplicando siempre por la misma cantidad (3, 6, 12, 24... multiplica por 2 cada vez).',
            'Esa cantidad fija se llama razón geométrica.'
          ]
        },
        {
          id: 'patrones-numericos',
          titulo: 'Patrones numéricos',
          conceptos: [
            'Antes de resolver, calcula las diferencias entre términos consecutivos: eso suele revelar el patrón oculto.'
          ]
        },
        {
          id: 'patrones-graficos',
          titulo: 'Patrones gráficos',
          conceptos: [
            'Siguen la misma lógica que los patrones numéricos, solo que aplicada a formas (color, cantidad, posición).'
          ]
        }
      ]
    },
    {
      id: 'razonamiento-logico',
      titulo: 'Razonamiento Lógico',
      subtemas: [
        {
          id: 'series-numericas',
          titulo: 'Series numéricas',
          conceptos: [
            'Busca siempre la operación que convierte un término en el siguiente: suma, resta, multiplicación o una combinación.'
          ]
        },
        {
          id: 'series-figurativas',
          titulo: 'Series figurativas',
          conceptos: [
            'Fíjate en cómo cambian forma, cantidad, color o posición entre una figura y la siguiente.'
          ]
        },
        {
          id: 'analogias-matematicas',
          titulo: 'Analogías matemáticas',
          conceptos: [
            'Identifica primero la relación entre el primer par de números (¿se suman?, ¿se multiplican?, ¿se elevan al cuadrado?).',
            'Aplica esa misma relación al segundo par para encontrar el valor faltante.'
          ]
        },
        {
          id: 'deduccion-logica',
          titulo: 'Deducción lógica',
          conceptos: [
            'Parte de datos conocidos y aplica reglas válidas para llegar a una conclusión certera.',
            'Organizar los datos en una tabla o lista suele hacer visibles las conexiones que a simple vista se esconden.'
          ]
        }
      ]
    },
    {
      id: 'interpretacion-matematica',
      titulo: 'Interpretación Matemática',
      subtemas: [
        {
          id: 'resolucion-problemas-verbales',
          titulo: 'Resolución de problemas verbales',
          conceptos: [
            'Lee el problema completo antes de empezar a calcular: identifica qué te preguntan exactamente.',
            'Subraya los datos numéricos y las relaciones entre ellos antes de plantear la operación.'
          ]
        },
        {
          id: 'interpretacion-informacion-cuantitativa',
          titulo: 'Interpretación de información cuantitativa',
          conceptos: [
            'Practica traducir tablas, gráficas y porcentajes a conclusiones en palabras simples.',
            'Verifica que las unidades sean consistentes antes de comparar dos cantidades.'
          ]
        },
        {
          id: 'modelacion-matematica',
          titulo: 'Modelación matemática',
          conceptos: [
            'Consiste en representar una situación real mediante números, expresiones o funciones.',
            'Es el puente entre un problema de la vida cotidiana y las herramientas matemáticas para resolverlo.'
          ]
        },
        {
          id: 'estimacion-resultados',
          titulo: 'Estimación de resultados',
          conceptos: [
            'Redondear los números antes de calcular te da una idea rápida de si tu respuesta final es razonable.',
            'Una estimación te ayuda a detectar errores obvios (por ejemplo, un resultado 10 veces más grande de lo esperado).'
          ]
        }
      ]
    },
    {
      id: 'conversion-unidades',
      titulo: 'Conversión de Unidades',
      subtemas: [
        {
          id: 'conversion-longitud',
          titulo: 'Longitud',
          conceptos: [
            '1 km = 1,000 m; 1 m = 100 cm; 1 cm = 10 mm.'
          ]
        },
        {
          id: 'conversion-area',
          titulo: 'Área',
          conceptos: [
            'Se mide en unidades al cuadrado (m², cm²).',
            'Al convertir, el factor de conversión también se eleva al cuadrado (1 m² = 10,000 cm²).'
          ]
        },
        {
          id: 'conversion-volumen',
          titulo: 'Volumen',
          conceptos: [
            'Se mide en unidades al cubo (m³, cm³).',
            'Al convertir, el factor de conversión se eleva al cubo (1 m³ = 1,000,000 cm³).'
          ]
        },
        {
          id: 'conversion-masa',
          titulo: 'Masa',
          conceptos: [
            '1 kg = 1,000 g; 1 tonelada = 1,000 kg.'
          ]
        },
        {
          id: 'conversion-tiempo',
          titulo: 'Tiempo',
          conceptos: [
            '1 hora = 60 minutos = 3,600 segundos.'
          ]
        }
      ]
    }
  ]
}

export default lecturaMatematicas
