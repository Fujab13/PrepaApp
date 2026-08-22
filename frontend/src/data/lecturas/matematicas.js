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
            'Los números naturales se usan para contar objetos y ordenar elementos, y forman el conjunto más básico de la aritmética: 0, 1, 2, 3, 4... (representado como ℕ). No incluyen números negativos, fracciones ni decimales, por lo que responden preguntas como "¿cuántas manzanas hay?" pero no "¿cuánto debo?" o "¿qué fracción queda?".',
            'Los números naturales excluyen completamente los números negativos, las fracciones y los decimales, manteniéndose siempre como entidades completas y positivas. Por ejemplo, puedes contar 5 monedas, pero no puedes contar "−3 monedas" o "2.5 monedas" en el sentido literal de un natural. Esta restricción es precisamente lo que los hace ideales para contar cosas del mundo real.',
            'Los números naturales son el fundamento sobre el cual se construye toda la matemática, pues constituyen el sistema más elemental de la aritmética. Sin la capacidad de contar mediante los naturales, sería imposible desarrollar cualquier operación matemática más compleja, y toda la edificación de la matemática moderna descansa en este primer conjunto.'
          ]
        },
        {
          id: 'numeros-enteros',
          titulo: 'Números enteros',
          conceptos: [
            'Los números enteros incluyen los naturales, sus negativos y el 0 (representado como ℤ): ..., −2, −1, 0, 1, 2, 3... Sin restricciones de signo, forman un conjunto más amplio que permite representar cantidades en ambas direcciones de la recta numérica. Por ejemplo, −5 está tan "válido" como 5, simplemente en la dirección opuesta.',
            'Los números enteros son herramientas perfectas para representar deudas (números negativos), temperaturas bajo cero (como −15°C en invierno), o niveles por debajo de un referente (como −200 metros bajo el nivel del mar en oceanografía). En estos contextos reales, los negativos tienen significado concreto.',
            'A pesar de su riqueza, los números enteros no admiten fracciones ni decimales; siempre conservan su "entidad" completa: no puedes escribir 2.5 o 1/3 como un entero puro. Esta característica los distingue de los racionales, que sí permiten esas formas.'
          ]
        },
        {
          id: 'numeros-racionales',
          titulo: 'Números racionales',
          conceptos: [
            'Un número racional es cualquiera que se puede escribir como fracción a/b, donde a y b son enteros y b ≠ 0 (representado como ℚ). Esta definición es la piedra angular: si un número puede expresarse como cociente de dos enteros, entonces es racional, sin importar cómo se vea cuando lo escribes de otras formas.',
            'Los números racionales incluyen muchas formas distintas de números: todos los enteros (4 = 4/1), fracciones simples (3/4), decimales exactos (0.5 = 1/2), y decimales periódicos (0.333... = 1/3). Por ejemplo, 0.75 es racional porque 0.75 = 3/4, así como 0.1666... es racional porque 0.1666... = 1/6.',
            'La clave para reconocer un racional en forma decimal es observar su comportamiento: su expansión decimal termina en algún momento (como 0.75), o entra en un patrón repetitivo que se repite indefinidamente (como 0.333... o 0.142857142857...). Si el decimal ni termina ni se repite de forma regular, entonces no es racional.'
          ]
        },
        {
          id: 'numeros-irracionales',
          titulo: 'Números irracionales',
          conceptos: [
            'A diferencia de los racionales, los números irracionales NO pueden escribirse como una fracción exacta a/b de enteros. Su característica distintiva es que su expansión decimal es infinita y nunca entra en un patrón repetitivo, lo que significa que continuará con cifras nuevas y "sin régimen" para siempre.',
            'Los ejemplos más famosos de números irracionales incluyen π (pi, aproximadamente 3.14159..., usado en círculos), √2 (la raíz cuadrada de 2, aproximadamente 1.41421..., que surge de la diagonal de un cuadrado), e (la base de logaritmos naturales, aproximadamente 2.71828...), y el número áureo φ (aproximadamente 1.61803..., frecuente en naturaleza y arte).',
            'Los números irracionales aparecen constantemente en problemas reales de geometría: la circunferencia de un círculo siempre involucra π, la diagonal de un cuadrado de lado 1 es √2, y muchas construcciones geométricas clásicas producen números irracionales. No son "rarezas teóricas"; son tan reales y útiles como los racionales.'
          ]
        },
        {
          id: 'numeros-reales',
          titulo: 'Números reales',
          conceptos: [
            'Los números reales son la unión completa de todos los racionales e irracionales (representados como ℝ), abarcando prácticamente "todos los números" que necesitas para describir cantidades en la vida diaria. Un número es real si se puede ubicar en algún punto de la recta numérica: desde enteros como −5 y 3, hasta fracciones como 1/2, hasta irracionales como √3 y π.',
            'La característica más importante de los reales es que se pueden representar en la recta numérica de manera perfecta y continua, sin dejar ningún hueco o "salto" entre ellos. Si imaginas la recta numérica, cada punto en esa línea corresponde a exactamente un número real, y viceversa; esto significa que los reales "llenan" completamente la línea.',
            'Casi todas las operaciones matemáticas que encontrarás en bachillerato, desde ecuaciones y funciones hasta geometría y estadística, trabajan dentro del conjunto de los números reales. Los complejos (números con raíces de negativos) existen, pero son materia avanzada; en este curso, los reales son tu universo de trabajo.'
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
            'La suma es la operación que combina dos o más cantidades en una sola cantidad total, reuniendo todos sus valores. Por ejemplo, si tienes 7 pesos y ganas 8 pesos más, la suma 7 + 8 = 15 te da el total que posees. Es la operación más elemental de la aritmética.',
            'Cuando trabajas con signos, la suma de un número negativo es equivalente a una resta: 5 + (−3) es lo mismo que 5 − 3 = 2. Intuitivamente, "sumar una deuda de 3" es lo mismo que "restar 3" de lo que tienes; el resultado neto es el mismo: 5 − 3 = 2. Esta equivalencia simplifica muchos cálculos con negativos.'
          ]
        },
        {
          id: 'resta',
          titulo: 'Resta',
          conceptos: [
            'La resta es la operación que encuentra la diferencia entre dos cantidades, determinando cuánto "le falta" a una para llegar a la otra. Por ejemplo, si tienes 12 pesos y gastas 5, la resta 12 − 5 = 7 te dice cuánto te queda. Es la operación inversa de la suma.',
            'Cuando restas un número negativo, la regla es: restar un negativo equivale a sumar su valor positivo. Por ejemplo, 5 − (−3) = 5 + 3 = 8. Intuitivamente, "quitar una deuda de 3" es lo mismo que "ganar 3"; si debes 3 y te perdonan la deuda, tu situación mejora como si hubieras ganado 3. Esta regla del "signo doble negativo" es crucial.'
          ]
        },
        {
          id: 'multiplicacion',
          titulo: 'Multiplicación',
          conceptos: [
            'La multiplicación es una forma abreviada de realizar sumas repetidas del mismo número: 4 × 3 significa "sumar 4 tres veces", es decir, 4 + 4 + 4 = 12. Así, multiplicar es una operación eficiente cuando necesitas repetir muchas veces una cantidad; por ejemplo, si compras 5 docenas de huevos (60 por docena), calcular 5 × 60 es mucho más rápido que sumar 60 cincuenta veces.',
            'La regla de los signos en multiplicación es fundamental: cuando multiplicas dos números con signos iguales (ambos positivos o ambos negativos), el resultado es positivo; cuando tienen signos distintos, el resultado es negativo. Por ejemplo: (+3) × (+4) = +12, (−3) × (−4) = +12, pero (+3) × (−4) = −12. Esta regla asegura consistencia en todos los cálculos con números enteros.'
          ]
        },
        {
          id: 'division',
          titulo: 'División',
          conceptos: [
            'La división es la operación que reparte una cantidad en partes iguales, siendo la inversa exacta de la multiplicación. Por ejemplo, 24 ÷ 6 = 4 pregunta "¿cuántas veces cabe 6 en 24?", y la respuesta es 4 porque 4 × 6 = 24. En un contexto práctico: si repartes 24 dulces entre 6 niños en partes iguales, cada niño recibe 4 dulces.',
            'La regla de los signos en división es idéntica a la de la multiplicación: si dividendo y divisor tienen signos iguales, el cociente es positivo; si tienen signos distintos, es negativo. Por ejemplo, (+20) ÷ (+4) = +5, (−20) ÷ (−4) = +5, pero (+20) ÷ (−4) = −5. Esta consistencia de reglas simplifica el trabajo con números negativos en ambas operaciones.'
          ]
        },
        {
          id: 'jerarquia-operaciones',
          titulo: 'Jerarquía de operaciones',
          conceptos: [
            'La jerarquía de operaciones establece un orden obligatorio que debes seguir al resolver expresiones matemáticas con múltiples operaciones: 1) paréntesis (y otros símbolos de agrupación como corchetes), 2) potencias y raíces, 3) multiplicación y división, 4) suma y resta. Por ejemplo, en 2 + 3 × 4, primero haces 3 × 4 = 12 y luego 2 + 12 = 14; hacer 2 + 3 = 5 primero sería incorrecto.',
            'Cuando una expresión tiene dos o más operaciones del mismo nivel jerárquico (por ejemplo, dos multiplicaciones seguidas, o una suma y una resta), debes resolverlas en el orden en que aparecen, de izquierda a derecha. Por ejemplo, en 12 ÷ 3 × 2, primero divides (12 ÷ 3 = 4) y luego multiplicas (4 × 2 = 8); si multiplicas primero obtendrías un resultado incorrecto.',
            'Un truco mnemotécnico para recordar el orden es la palabra PEMDAS (en inglés: Paréntesis, Exponentes, Multiplicación/División, Adición/Sustracción), o en español: PAPOMUDAS (Paréntesis, Potencias, Multiplicación/División, Adición/Sustracción). Memorizar esta secuencia te protege contra errores de cálculo comunes.'
          ]
        },
        {
          id: 'valor-absoluto',
          titulo: 'Valor absoluto',
          conceptos: [
            'El valor absoluto de un número es la distancia de ese número al cero en la recta numérica, siempre expresada como un valor positivo o cero. Por ejemplo, |−7| = 7 porque −7 está 7 unidades distante del cero, e igualmente |7| = 7 porque 7 está 7 unidades del cero en la dirección opuesta. El valor absoluto "ignora" el signo y solo conserva la magnitud.',
            'El valor absoluto se escribe entre dos barras verticales alrededor del número o expresión: |x| representa el valor absoluto de x. Por ejemplo, |−3.5| = 3.5, |15| = 15, e incluso |−(−8)| = |8| = 8. Esta notación es estándar en toda la matemática.',
            'El valor absoluto es particularmente útil cuando necesitas medir diferencias o distancias sin que el signo importe, como en cálculo de errores, distancias físicas, o comparaciones de magnitudes. Por ejemplo, la distancia entre los puntos −5 y 3 en la recta es |−5 − 3| = |−8| = 8, independientemente de la dirección.'
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
            'Un número primo es un número natural mayor que 1 que solo es divisible exactamente entre 1 y sí mismo, sin otros divisores. Por ejemplo, 7 es primo porque solo se divide exactamente entre 1 y 7, sin residuo. Los primeros números primos son 2, 3, 5, 7, 11, 13, 17, 19...; observa que 2 es el único primo par. Todo número primo es como un "bloque de construcción" indivisible de la aritmética.',
            'Un número compuesto es un número natural que tiene más de dos divisores (al menos un divisor además del 1 y de sí mismo), lo que significa que puede factorizarse en números más pequeños. Por ejemplo, 4 es compuesto porque es divisible entre 1, 2 y 4; también 6 es compuesto (1, 2, 3, 6), y 8 es compuesto (1, 2, 4, 8). Los números compuestos pueden siempre descomponerse en factores primos.',
            'El número 1 es un caso especial que no es ni primo ni compuesto: aunque en teoría solo tiene como divisores al 1 y a sí mismo (que es el mismo número), se excluye por convención matemática para mantener propiedades útiles en teoría de números. Esta exclusión hace que cada número mayor que 1 tenga una descomposición única en factores primos.'
          ]
        },
        {
          id: 'criterios-divisibilidad',
          titulo: 'Criterios de divisibilidad',
          conceptos: [
            'Los criterios de divisibilidad son "atajos" que te permiten saber si un número es divisible por otro sin hacer la división completa. Para divisibilidad entre 2: un número es divisible entre 2 si y solo si termina en una cifra par (0, 2, 4, 6, 8). Para divisibilidad entre 5: un número es divisible entre 5 si termina en 0 o en 5. Estos dos criterios son los más rápidos de verificar.',
            'Para divisibilidad entre 3 y entre 9 existe un criterio especial basado en la suma de dígitos: un número es divisible entre 3 si la suma de todos sus dígitos es un múltiplo de 3 (ejemplo: 243 tiene suma 2+4+3=9, que es múltiplo de 3, así que 243 es divisible entre 3). Para divisibilidad entre 9: usa el mismo criterio, pero verifica que la suma sea múltiplo de 9. Por ejemplo, 369 tiene suma 3+6+9=18, múltiplo de 9, así que 369 es divisible entre 9.',
            'Para divisibilidad entre 10 el criterio es inmediato: un número es divisible entre 10 si y solo si termina en 0 (porque 10 = 2 × 5). Todos estos atajos evitan realizar la división completa y aceleran muchísimo los cálculos, especialmente útiles al buscar factores o simplificar fracciones grandes.'
          ]
        },
        {
          id: 'factorizacion-prima',
          titulo: 'Factorización prima',
          conceptos: [
            'La factorización prima (o descomposición en factores primos) es el proceso de expresar un número como un producto de números primos únicamente, elevados a potencias necesarias. Por ejemplo, 60 = 2² × 3 × 5 es la factorización prima de 60, porque está compuesto por los primos 2 (dos veces), 3 (una vez) y 5 (una vez). Esta representación es única para cada número mayor que 1.',
            'El proceso para factorizar un número es sistemático: divide el número entre el menor primo que lo divida exactamente (generalmente empezando con 2), luego divide el cociente entre el menor primo que lo divida, y continúa hasta que llegues a 1. Por ejemplo, para 60: 60÷2=30, 30÷2=15, 15÷3=5, 5÷5=1, dando 2²×3×5. Este método es llamado "división por prueba".',
            'La factorización prima es la base fundamental para calcular el Máximo Común Divisor (MCD) y el Mínimo Común Múltiplo (MCM) de dos o más números de forma rápida y segura. También es útil para simplificar fracciones, entender estructuras divisorias, y en criptografía; aunque parezca un proceso básico, es una herramienta poderosa en matemáticas.'
          ]
        },
        {
          id: 'divisores-comunes',
          titulo: 'Divisores comunes',
          conceptos: [
            'Los divisores comunes de dos o más números son aquellos números que dividen exactamente a todos ellos sin dejar residuo. Por ejemplo, los divisores de 12 son {1, 2, 3, 4, 6, 12}, y los divisores de 18 son {1, 2, 3, 6, 9, 18}; los divisores comunes son {1, 2, 3, 6}, porque todos ellos dividen a 12 y a 18 simultáneamente.',
            'Para encontrar los divisores comunes, la metodología más directa es hacer listas completas de divisores para cada número y luego comparar esas listas, identificando cuáles números aparecen en todas. Con números grandes esto puede volverse tedioso, pero el concepto es claro: buscar los números que caben exactamente en todos los números del conjunto. Estos divisores comunes incluyen siempre al 1, y el mayor de ellos es lo que se conoce como el Máximo Común Divisor (MCD).'
          ]
        },
        {
          id: 'mcd',
          titulo: 'Máximo Común Divisor (MCD)',
          conceptos: [
            'El Máximo Común Divisor (MCD) de dos o más números es el mayor número que divide exactamente a todos ellos sin dejar residuo. Por ejemplo, el MCD de 12 y 18 es 6, porque 6 es el número más grande que divide exactamente a ambos (12÷6=2, 18÷6=3), y aunque otros números como 1, 2 y 3 también dividen a ambos, 6 es el mayor. Para encontrarlo, puedes usar factorización prima o el algoritmo de Euclides.',
            'El MCD es especialmente valioso para simplificar fracciones a su mínima expresión (forma más reducida). Por ejemplo, 18/24 tiene MCD(18, 24) = 6, así que 18/24 = (18÷6)/(24÷6) = 3/4. Sin el MCD, no sabrías cuáles factores puedes cancelar de forma segura, y la fracción no quedaría en su forma más simple.'
          ]
        },
        {
          id: 'mcm',
          titulo: 'Mínimo Común Múltiplo (MCM)',
          conceptos: [
            'El Mínimo Común Múltiplo (MCM) de dos o más números es el menor número positivo que es múltiplo de todos ellos simultáneamente. Por ejemplo, el MCM de 4 y 6 es 12, porque 12 es divisible entre 4 (12÷4=3) y entre 6 (12÷6=2), y aunque otros números como 24, 36, etc., también son múltiplos comunes, 12 es el menor. Puedes encontrarlo usando factorización prima o listando múltiplos hasta encontrar el primero en común.',
            'El MCM es esencial para sumar o restar fracciones que tienen denominadores distintos: necesitas un denominador común, y el MCM de los denominadores originales es exactamente eso. Por ejemplo, para sumar 1/4 + 1/6, necesitas un denominador común; MCM(4, 6) = 12, así que 1/4 = 3/12 y 1/6 = 2/12, permitiéndote hacer 3/12 + 2/12 = 5/12. Sin el MCM, no sabría qué múltiplo usar para equivaler las fracciones.'
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
            'Para sumar o restar fracciones, el paso obligatorio es que ambas tengan el mismo denominador (denominador común). Para encontrarlo, calcula el MCM de los denominadores y convierte cada fracción a su equivalente con ese denominador común. Por ejemplo, 1/3 + 1/4: MCM(3,4)=12, así que 1/3=4/12 y 1/4=3/12, dando 4/12+3/12=7/12. Sin un denominador común, no puedes sumar los numeradores de forma válida.',
            'Para multiplicar fracciones, el proceso es directo: multiplica numerador por numerador y denominador por denominador (3/4 × 2/5 = (3×2)/(4×5) = 6/20). Nota que no necesitas un denominador común. Luego, simplifica el resultado si es posible dividiendo numerador y denominador por su MCD.',
            'Para dividir fracciones, usa la regla del recíproco: divide por una fracción multiplicando por su inversa (con numerador y denominador invertidos). Por ejemplo, 3/4 ÷ 2/5 = 3/4 × 5/2 = (3×5)/(4×2) = 15/8. Esta inversión transforma la división en una multiplicación, que ya sabes hacer.'
          ]
        },
        {
          id: 'conversion-fraccion-decimal',
          titulo: 'Conversión entre fracciones y decimales',
          conceptos: [
            'Para convertir una fracción a su forma decimal, simplemente divide el numerador entre el denominador usando la división. Por ejemplo, 3/4 se convierte dividiendo 3÷4=0.75, y 5/8 se convierte dividiendo 5÷8=0.625. Algunos resultados son decimales exactos (que terminan), como estos, mientras que otros son periódicos (repiten un patrón), como 1/3=0.333...',
            'Para convertir un decimal exacto de vuelta a fracción, escribe el número como una fracción con una potencia de 10 como denominador, según cuántos dígitos decimales haya. Por ejemplo, 0.75 tiene 2 decimales, así que es 75/100; o 0.625 tiene 3 decimales, así que es 625/1000. Luego simplifica dividiendo numerador y denominador por su MCD.',
            'Después de cualquier conversión, especialmente al convertir decimales a fracciones, siempre debes simplificar el resultado a su mínima expresión dividiendo por el MCD. Por ejemplo, 75/100 se simplifica a 3/4 (dividiendo ambos entre 25), y 625/1000 se simplifica a 5/8. Una fracción en mínima expresión es más clara y más fácil de usar en cálculos posteriores.'
          ]
        },
        {
          id: 'fracciones-equivalentes',
          titulo: 'Fracciones equivalentes',
          conceptos: [
            'Las fracciones equivalentes representan exactamente la misma cantidad o proporción, aunque se escriban con diferentes numeradores y denominadores. Por ejemplo, 1/2, 2/4, 3/6 y 5/10 son todas equivalentes porque todas representan "la mitad"; si divides un pastel en 2 partes y tomas 1 (1/2), obtienes la misma cantidad que si lo divides en 4 partes y tomas 2 (2/4).',
            'Para crear fracciones equivalentes, multiplica (o divide) tanto el numerador como el denominador por el mismo número, y la fracción mantendrá su valor. Por ejemplo, 3/5 × 2/2 = 6/10, o 12/18 ÷ 3/3 = 4/6. La clave es que cualquier número dividido entre sí mismo es 1, así que estás multiplicando la fracción original por 1 disfrazado, lo que no cambia su valor.',
            'Simplificar una fracción es el proceso inverso: buscar su versión equivalente más reducida dividiéndola repetidamente por factores comunes, hasta que numerador y denominador no tengan más factores en común (aparte del 1). Por ejemplo, 12/18 se simplifica dividiendo ambos entre 6 para obtener 2/3, que es la forma más reducida. Una fracción en forma simplificada es única y es la representación más clara.'
          ]
        },
        {
          id: 'comparacion-fracciones',
          titulo: 'Comparación de fracciones',
          conceptos: [
            'Cuando dos fracciones tienen el mismo denominador, la comparación es inmediata: es mayor la que tiene el numerador más grande. Por ejemplo, 5/8 > 3/8 porque ambas tienen denominador 8, pero 5 > 3. El denominador común significa que estás "dividiendo el mismo todo en partes iguales", así que solo importa quién tiene más partes.',
            'Cuando los denominadores son distintos, tienes varias opciones: primero, puedes igualar los denominadores encontrando un denominador común (idealmente el MCM) y luego comparar; por ejemplo, para 2/3 versus 3/5, el MCM es 15, así que 2/3=10/15 y 3/5=9/15, dando 2/3 > 3/5. Alternativamente, convierte ambas a decimales (2/3≈0.667, 3/5=0.6) y compara los decimales, que suele ser más rápido.',
            'Un atajo elegante para comparar dos fracciones es la multiplicación cruzada: para a/b versus c/d, multiplica a×d y compáralo con b×c. Si a×d > b×c, entonces a/b > c/d. Por ejemplo, para 2/3 versus 3/5: 2×5=10 versus 3×3=9; como 10 > 9, entonces 2/3 > 3/5. Este método evita encontrar denominadores comunes y funciona incluso con números grandes.'
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
            'Al multiplicar dos potencias que tienen la misma base, el resultado es esa misma base elevada a la suma de los exponentes (xᵃ × xᵇ = xᵃ⁺ᵇ). Esta regla es fundamental porque transforma una operación compleja en una suma simple. Por ejemplo, 2³ × 2⁴ = 2⁷ = 128, mucho más rápido que calcular 2³ = 8 y 2⁴ = 16 por separado y luego multiplicarlos.',
            'Al dividir dos potencias que tienen la misma base, el resultado es esa misma base elevada a la resta de los exponentes (xᵃ ÷ xᵇ = xᵃ⁻ᵇ). Esta regla simplifica la división de potencias de forma elegante. Por ejemplo, 3⁵ ÷ 3² = 3³ = 27, en lugar de calcular 3⁵ = 243 y 3² = 9 por separado y luego hacer la división larga.',
            'Cuando elevas una potencia a otra potencia, multiplicas los exponentes: (xᵃ)ᵇ = xᵃᵇ. Esta regla es sorprendentemente poderosa en cálculos complejos. Por ejemplo, (2³)² = 2⁶ = 64, que es mucho más simple que calcular 2³ = 8 primero, y luego 8² = 64; el resultado es idéntico pero el atajo es velocidad pura.',
            'Cualquier número elevado a la potencia 0 siempre da 1, sin importar cuál sea el número: x⁰ = 1. Un exponente negativo invierte la base, transformándola en su recíproco: x⁻ⁿ = 1/xⁿ. Por ejemplo, 5⁻² = 1/(5²) = 1/25 = 0.04, una forma compacta de expresar fracciones pequeñas muy utilizadas en ciencias.'
          ]
        },
        {
          id: 'raiz-cuadrada',
          titulo: 'Raíz cuadrada',
          conceptos: [
            'La raíz cuadrada es la operación inversa de elevar un número al cuadrado. Si buscas el número que, elevado al cuadrado, da tu número original, estás calculando su raíz cuadrada. Por ejemplo, √25 = 5 porque 5² = 5 × 5 = 25; igualmente, √100 = 10 porque 10² = 100.',
            'Los cuadrados perfectos son números que resultan de multiplicar un entero por sí mismo, y son los únicos que tienen raíces cuadradas exactas (sin decimales). Por ejemplo, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 son todos cuadrados perfectos. Un número como 10 no es cuadrado perfecto, así que √10 ≈ 3.162... (irracional, sin raíz exacta).',
            'Memorizar los cuadrados de 1 al 15 (1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225) es una inversión que se paga solita en el examen. Con estos datos a mano, calcularás raíces cuadradas de cuadrados perfectos al instante, sin necesidad de verificar con multiplicación. Por ejemplo, si ves √196 en el examen, dirás 14 inmediatamente sin perder tiempo.'
          ]
        },
        {
          id: 'raiz-cubica',
          titulo: 'Raíz cúbica',
          conceptos: [
            'La raíz cúbica es la operación inversa de elevar un número al cubo (a la potencia 3). Busca el número que, elevado al cubo, produce tu número original. Por ejemplo, ∛27 = 3 porque 3³ = 3 × 3 × 3 = 27; igualmente, ∛64 = 4 porque 4³ = 64.',
            'Una diferencia crítica frente a la raíz cuadrada es que la raíz cúbica sí acepta radicandos negativos y produce resultados negativos. Por ejemplo, ∛−8 = −2 porque (−2)³ = −2 × −2 × −2 = −8, mientras que √−8 no existe en los reales. Esta flexibilidad hace las raíces cúbicas más versátiles en problemas científicos y de ingeniería.'
          ]
        },
        {
          id: 'radicales',
          titulo: 'Radicales',
          conceptos: [
            'Simplificar un radical significa extraer de su interior todos los factores que son cuadrados (o cubos) perfectos, dejando bajo el radical solo lo que no es perfectamente simplificable. Por ejemplo, √50 = √(25 × 2) = √25 × √2 = 5√2, porque 25 es un cuadrado perfecto y sale como 5. Otro ejemplo: √72 = √(36 × 2) = 6√2, igual de directo.',
            'Dos radicales son semejantes cuando tienen exactamente el mismo índice (cuadrada, cúbica, etc.) y el mismo radicando (el número dentro del radical). Solo los radicales semejantes pueden sumarse o restarse: por ejemplo, 3√5 + 2√5 = 5√5, pero √5 + √3 no puede simplificarse porque sus radicandos son distintos. Es similar a sumar términos con la misma variable en álgebra.'
          ]
        },
        {
          id: 'notacion-cientifica',
          titulo: 'Notación científica',
          conceptos: [
            'La notación científica es una forma estándar y compacta de escribir números muy grandes o muy pequeños usando una potencia de 10. El formato es a × 10ⁿ, donde a es un número entre 1 y 10 (incluyendo 1 pero excluyendo 10) y n es un entero que puede ser positivo o negativo. Por ejemplo, 3,000,000 se escribe como 3 × 10⁶, y 0.00025 se escribe como 2.5 × 10⁻⁴.',
            'El exponente n indica hacia dónde y cuántas posiciones desplazar el punto decimal: un exponente positivo desplaza hacia la derecha (generando números grandes), mientras que un exponente negativo desplaza hacia la izquierda (generando números pequeños menores que 1). Por ejemplo, 4.2 × 10³ = 4,200 (punto se mueve 3 lugares a la derecha), y 4.2 × 10⁻² = 0.042 (punto se mueve 2 lugares a la izquierda).',
            'La notación científica es indispensable en ciencias y tecnología para manejar magnitudes extremas de forma legible y computable. Por ejemplo, la distancia media Tierra-Sol es aproximadamente 1.496 × 10¹¹ metros (150 millones de km), y el diámetro de un átomo de hidrógeno es cerca de 1 × 10⁻¹⁰ metros, números imposibles de escribir en forma decimal normal sin confundirse con los ceros.'
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
            'Una razón es la comparación de dos cantidades mediante una división, escrita como a/b o expresada verbalmente como "a es a b". Expresa cuántas veces cabe una cantidad en la otra, o la relación proporcional entre ambas. Por ejemplo, si en un salón hay 12 mujeres y 8 hombres, la razón de mujeres a hombres es 12/8, que se simplifica a 3/2, significando "por cada 3 mujeres hay 2 hombres".'
          ]
        },
        {
          id: 'proporciones',
          titulo: 'Proporciones',
          conceptos: [
            'Una proporción es la igualdad de dos razones distintas: a/b = c/d, afirmando que la relación entre a y b es exactamente la misma que entre c y d. Por ejemplo, 2/3 = 4/6 es una proporción porque ambas razones representan la misma relación (dos tercios). Las proporciones modelan situaciones reales donde una relación se mantiene constante a diferentes escalas.',
            'En la proporción a/b = c/d, los extremos (a y d) y los medios (b y c) cumplen una propiedad fundamental: el producto de extremos iguala el producto de medios (a × d = b × c). Esta regla, llamada multiplicación cruzada, permite despejar valores desconocidos de forma algebraica. Por ejemplo, en 3/5 = x/20, multiplicas cruzado: 3 × 20 = 5 × x, obteniendo 60 = 5x, así x = 12.'
          ]
        },
        {
          id: 'regla-de-tres-simple',
          titulo: 'Regla de tres simple',
          conceptos: [
            'La regla de tres simple establece una relación entre dos magnitudes (dos cantidades) para descubrir un valor desconocido usando la proporción que existe. Si conoces tres de los cuatro valores en la relación a/b = c/x, la regla de tres te permite calcular x aplicando multiplicación cruzada. Por ejemplo, si 5 libros cuestan $150, ¿cuánto cuestan 8 libros? Planteas 5/150 = 8/x y resuelves.',
            'El paso crítico antes de plantear la ecuación es identificar el tipo de relación: directa (ambas cantidades aumentan o disminuyen juntas) o inversa (cuando una aumenta, la otra disminuye). En relación directa: 4 obreros hacen 12 m² de trabajo, ¿cuánto hacen 6 obreros? (más obreros, más trabajo). En inversa: 4 obreros terminan en 6 días, ¿en cuántos días terminan 12 obreros? (más obreros, menos días). El cambio de relación altera completamente el planteamiento de la ecuación.'
          ]
        },
        {
          id: 'regla-de-tres-compuesta',
          titulo: 'Regla de tres compuesta',
          conceptos: [
            'La regla de tres compuesta extiende la idea a tres o más magnitudes que se relacionan simultáneamente, generalmente en problemas complejos del mundo real. Por ejemplo: "10 obreros en 8 horas construyen 40 metros de pared. ¿Cuántos metros construirán 15 obreros en 6 horas?" Aquí intervienen 4 magnitudes: número de obreros, horas de trabajo, metros construidos, y potencialmente velocidad de trabajo. Cada magnitud puede tener una relación directa o inversa con el resultado.',
            'La estrategia para resolver una regla de tres compuesta es reducir el problema a varias reglas de tres simples encadenadas, resolviendo una relación a la vez mientras mantienes las otras magnitudes constantes mentalmente. Alternativamente, puedes plantear una ecuación única que integre todas las relaciones con sus correspondientes proporciones y cocientes. Por ejemplo, si A aumenta y B también aumenta (directa), pero C y B son inversas, todo eso se refleja en la estructura de la ecuación final.'
          ]
        },
        {
          id: 'variacion-directa',
          titulo: 'Variación directa',
          conceptos: [
            'En una relación de variación directa, cuando una magnitud aumenta, la otra también aumenta en la misma proporción, y viceversa. La relación matemática es y = kx, donde k es la constante de proporcionalidad. Por ejemplo, si trabajas más horas ganas más dinero: si ganas $150 por 8 horas, entonces k = 150/8 = 18.75 $/hora, y si trabajas 12 horas ganarías 12 × 18.75 = $225. La razón entre y y x siempre permanece constante.'
          ]
        },
        {
          id: 'variacion-inversa',
          titulo: 'Variación inversa',
          conceptos: [
            'En variación inversa, cuando una magnitud aumenta, la otra disminuye en la misma proporción, y su producto permanece constante. La relación es y = k/x, donde k es la constante de proporcionalidad inversa. Por ejemplo, para pintar una casa: 4 obreros toman 12 días (k = 4 × 12 = 48). Si contratas 8 obreros, tomarán 48/8 = 6 días. Si añades 12 obreros, tomarán 48/12 = 4 días. Más trabajadores significan menos días, exactamente inversamente proporcional.'
          ]
        },
        {
          id: 'porcentajes',
          titulo: 'Porcentajes',
          conceptos: [
            'Un porcentaje es una razón expresada como una fracción de 100, útil para estandarizar comparaciones. Por ejemplo, 25% significa 25/100, que simplificado es 1/4 y en decimal es 0.25. Todo porcentaje puede convertirse fácilmente a fracción (divide el número entre 100) o a decimal (divide entre 100 y traslada el punto decimal dos lugares a la izquierda). Por ejemplo, 30% = 30/100 = 0.30.',
            'Para encontrar el X% de una cantidad Q, multiplicas Q por X/100 (o equivalentemente, por el decimal correspondiente). Por ejemplo, el 20% de 500 es 500 × 20/100 = 500 × 0.20 = 100. Otro caso: el 15% de 800 es 800 × 0.15 = 120. Este cálculo es fundamental en finanzas personales, descuentos y aumentos de precio.',
            'Los porcentajes son herramientas indispensables en la vida cotidiana: en descuentos (un artículo con 30% de descuento cuesta el 70% del original), en aumentos de precio (un producto sube 15% de su precio base), en análisis de encuestas (el 45% de los encuestados prefiere...), y en finanzas (tasas de interés expresadas como porcentajes anuales). Dominar porcentajes te permite tomar decisiones informadas al comprar, invertir y analizar datos.'
          ]
        },
        {
          id: 'interes-simple',
          titulo: 'Interés simple',
          conceptos: [
            'El interés simple se calcula usando la fórmula fundamental I = C × r × t, donde I es el interés ganado (o adeudado), C es el capital inicial, r es la tasa de interés (como decimal o porcentaje), y t es el tiempo en años. Por ejemplo, si inviertes $1,000 a una tasa del 5% anual durante 3 años, el interés será I = 1,000 × 0.05 × 3 = $150, y el monto total será $1,000 + $150 = $1,150.',
            'La característica definida del interés simple es que el interés se calcula únicamente sobre el capital original, nunca sobre los intereses acumulados previamente. Esto contrasta con el interés compuesto (materia avanzada), donde cada período suma los intereses nuevos al total y el siguiente período incluye esos intereses en el cálculo. Con interés simple, el crecimiento es lineal y predecible: cada año o período agrega exactamente la misma cantidad de interés.'
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
            'Un monomio es una expresión algebraica que consta de exactamente un término, formado por un coeficiente (número) multiplicado por una o más variables elevadas a potencias enteras no negativas. Ejemplos: 7x, −3y², 5x²y, o incluso solo 8 (una constante). La parte de las variables y sus exponentes se llama parte literal, y el número al frente es el coeficiente.',
            'Dos monomios son semejantes cuando tienen exactamente la misma parte literal (las mismas variables elevadas a los mismos exponentes), aunque sus coeficientes sean distintos. Solo los monomios semejantes pueden sumarse o restarse mediante la combinación de sus coeficientes. Por ejemplo, 3x² + 5x² = 8x² (sí son semejantes), pero 3x² + 5x no pueden simplificarse porque tienen partes literales distintas (x² vs x).'
          ]
        },
        {
          id: 'polinomios',
          titulo: 'Polinomios',
          conceptos: [
            'Un polinomio es la suma o resta de dos o más monomios distintos. Cada término del polinomio puede tener coeficientes diferentes y grados distintos. Por ejemplo, 3x² − 5x + 7 es un polinomio con tres términos: el monomio 3x² (grado 2), el monomio −5x (grado 1), y la constante 7 (grado 0). Los polinomios son estructuras algebraicas fundamentales en ecuaciones, funciones y muchas áreas de la matemática.',
            'Los polinomios se clasifican por la cantidad de términos que contienen. Un binomio tiene exactamente 2 términos (por ejemplo, x² + 3x o 2y − 5), un trinomio tiene exactamente 3 términos (como x² − 4x + 3), y un polinomio general tiene 4 o más términos. Aunque técnicamente "polinomio" es el nombre general para todas estas formas, en conversación coloquial "polinomio" a veces se reserva para las expresiones de 4 términos o más.',
            'El grado de un polinomio es el exponente más alto de cualquiera de sus términos. Por ejemplo, el polinomio 3x² − 5x + 7 tiene grado 2 porque el término 3x² contiene el exponente más alto (2). Si el polinomio fuera 4x³ + 2x² − x + 5, su grado sería 3. El grado determina propiedades importantes del polinomio, como cuántas raíces puede tener.'
          ]
        },
        {
          id: 'operaciones-algebraicas',
          titulo: 'Operaciones algebraicas',
          conceptos: [
            'Para sumar o restar polinomios, primero identifica todos los términos semejantes (misma parte literal) en ambas expresiones, luego combina sus coeficientes mientras preservas la parte literal. Por ejemplo, (3x² + 2x − 5) + (x² − 4x + 3) = (3x² + x²) + (2x − 4x) + (−5 + 3) = 4x² − 2x − 2. Los términos que no tienen pareja en la otra expresión se copian tal cual.',
            'Al multiplicar polinomios, cada término del primero se multiplica por cada término del segundo, aplicando la propiedad distributiva. Cuando multiplicas potencias de la misma base, sumas los exponentes: xᵃ × xᵇ = xᵃ⁺ᵇ. Por ejemplo, (2x)(3x²) = 6x³ (porque x × x² = x³), y (x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6 (multiplicando cada término del primer binomio por cada uno del segundo).',
            'En la división de polinomios, cada término del dividendo se divide entre cada término del divisor (cuando la división es simple) o se realiza una división larga si el divisor es un polinomio. Cuando divides potencias de la misma base, restas los exponentes: xᵃ ÷ xᵇ = xᵃ⁻ᵇ. Por ejemplo, 6x³ ÷ 2x = 3x² (porque 6 ÷ 2 = 3 y x³ ÷ x = x²). Con polinomios más complejos, la división larga es necesaria.'
          ]
        },
        {
          id: 'simplificacion-expresiones',
          titulo: 'Simplificación de expresiones',
          conceptos: [
            'Simplificar una expresión significa identificar todos los términos semejantes (misma parte literal) y combinarlos sumando o restando sus coeficientes. Por ejemplo, 7x² + 3x − 2x² + 5x = (7x² − 2x²) + (3x + 5x) = 5x² + 8x. La expresión se reduce a su forma más compacta sin cambiar su valor o significado; es una herramienta estética y práctica.',
            'Una buena práctica es simplificar la expresión algebraica completamente antes de sustituir valores numéricos en las variables. Esto reduce la cantidad de operaciones aritméticas que debes realizar y minimiza las posibilidades de cometer errores. Por ejemplo, en lugar de calcular 7x² − 2x² + 3x + 5x con x = 2, primero simplifica a 5x² + 8x y luego sustituye: 5(2)² + 8(2) = 20 + 16 = 36. Menos pasos, menos errores.'
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
            'Los binomios al cuadrado son patrones algebraicos que aparecen constantemente. (a + b)² = a² + 2ab + b² significa: el cuadrado del primer término, más el doble del producto de ambos términos, más el cuadrado del segundo término. Igualmente, (a − b)² = a² − 2ab + b² sigue el mismo patrón pero con resta. Por ejemplo, (3x + 2)² = 9x² + 12x + 4 (donde a = 3x, b = 2), y (5 − x)² = 25 − 10x + x².',
            'Los binomios conjugados son dos binomios que tienen los mismos términos pero con signos opuestos: (a + b) y (a − b). Su producto sigue un patrón hermoso: (a + b)(a − b) = a² − b², es decir, la diferencia de los cuadrados individuales. Este patrón es poderoso porque elimina el término medio. Por ejemplo, (3x + 5)(3x − 5) = 9x² − 25, sin necesidad de multiplicar término por término.',
            'Memorizar estos patrones de productos notables es crucial para eficiencia en el examen, porque permite que saltees la multiplicación completa término-por-término y obtengas el resultado directo. Bajo presión de tiempo, esos atajos son oro puro. Además, estos mismos patrones reconocidos "al revés" son la clave para factorización rápida: si ves x² + 6x + 9, reconoces que es (x + 3)² sin necesidad de búsqueda laborioso.'
          ]
        },
        {
          id: 'factor-comun',
          titulo: 'Factor común',
          conceptos: [
            'Factorizar por factor común significa identificar el término más grande que divide a todos los términos de la expresión, sacarlo fuera del paréntesis, y escribir lo que queda dentro. El factor común puede ser un número, una variable, o una combinación. Por ejemplo, en 12x³ + 8x² − 4x, el mayor factor común es 4x, así que escribes 4x(3x² + 2x − 1). Esto simplifica expresiones y es el primer paso de cualquier factorización.',
            'Ejemplo concreto: en 6x² + 9x, el MCD de los coeficientes 6 y 9 es 3, y ambos términos comparten al menos x¹, así que el factor común es 3x. Sacando 3x, obtienes 6x² + 9x = 3x(2x + 3). Verificación: 3x × 2x = 6x² y 3x × 3 = 9x, suma 6x² + 9x, correcto. Este proceso de verificación es tu seguro de calidad.'
          ]
        },
        {
          id: 'diferencia-cuadrados',
          titulo: 'Diferencia de cuadrados',
          conceptos: [
            'Una diferencia de cuadrados es una expresión de la forma a² − b², donde dos términos están ambos elevados al cuadrado y separados por un signo de resta (no suma). Es fácil de reconocer: busca exactamente dos términos, ambos con exponente par que permita extraer una raíz cuadrada exacta, y que estén restándose. Por ejemplo, x² − 9, 4y² − 25, o 36 − w² son todas diferencias de cuadrados.',
            'La factorización de una diferencia de cuadrados es directa: a² − b² = (a + b)(a − b). Esta es exactamente la fórmula de binomios conjugados al revés. Por ejemplo, x² − 16 = (x + 4)(x − 4), o 9y² − 25 = (3y + 5)(3y − 5). El patrón es tan consistente que casi nunca falla: si reconoces una diferencia de cuadrados, ya sabes su factorización al instante.'
          ]
        },
        {
          id: 'trinomio-cuadrado-perfecto',
          titulo: 'Trinomio cuadrado perfecto',
          conceptos: [
            'Un trinomio cuadrado perfecto es una expresión con tres términos que encaja exactamente en el patrón (a + b)² = a² + 2ab + b², o su variante (a − b)² = a² − 2ab + b². Para reconocerlo: verifica que el primer término sea un cuadrado perfecto (como x²), el último término sea un cuadrado perfecto (como 9 = 3²), y el término medio sea exactamente el doble del producto de las raíces (como 6x = 2 × x × 3). Por ejemplo, x² + 6x + 9 cumple todos: 1x², 2(x)(3) = 6x, y 3².',
            'La factorización es elegante: simplemente toma las raíces cuadradas del primer y último término, y escribe su binomio al cuadrado. Para x² + 6x + 9: la raíz de x² es x, la raíz de 9 es 3, y como el término medio es positivo, escribes (x + 3)². Si fuera x² − 6x + 9, sería (x − 3)². Verificación rápida: (x + 3)² = x² + 6x + 9, exacto.'
          ]
        },
        {
          id: 'factorizacion-polinomios',
          titulo: 'Factorización de polinomios',
          conceptos: [
            'Para factorizar un trinomio de la forma x² + bx + c, necesitas encontrar dos números que cumplan dos condiciones simultáneamente: multiplicados dan c, y sumados dan b. Esos dos números son los que escribirás dentro de los factores. Por ejemplo, en x² + 5x + 6, buscas dos números que multiplicados den 6 y sumados den 5: esos son 2 y 3 (porque 2 × 3 = 6 y 2 + 3 = 5), así que x² + 5x + 6 = (x + 2)(x + 3).',
            'La estrategia más eficiente para factorizar cualquier polinomio es comenzar por extraer el factor común (si existe) antes de intentar cualquier otra técnica. Esto simplifica el polinomio y reduce la complejidad de los cálculos subsecuentes. Por ejemplo, en 2x² + 10x + 12, extraes 2 primero para obtener 2(x² + 5x + 6), y luego factorizas el trinomio resultante como 2(x + 2)(x + 3). Sin este paso inicial, te perderías en aritmética innecesaria.'
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
            'Simplificar una fracción algebraica requiere factorizar completamente tanto el numerador como el denominador, identificar los factores que aparecen en ambos, y cancelarlos. Solo puedes cancelar factores completos, nunca términos individuales. Por ejemplo, en (x² − 9)/(x − 3), factorizas el numerador como (x + 3)(x − 3), así que tienes [(x + 3)(x − 3)]/(x − 3), y cancelando (x − 3) queda simplemente (x + 3).',
            'Ejemplo detallado: simplifica (x² − 9)/(x − 3). Paso 1: reconoce x² − 9 como diferencia de cuadrados, factoriza a (x + 3)(x − 3). Paso 2: escribe [(x + 3)(x − 3)]/(x − 3). Paso 3: cancela (x − 3) del numerador y denominador. Resultado: (x + 3). Nota: la fracción original no está definida en x = 3 (división entre cero), pero la forma simplificada sí lo está en x = 3; técnicamente, la simplificación remueve esa singularidad removible.'
          ]
        },
        {
          id: 'operaciones-fracciones-algebraicas',
          titulo: 'Operaciones',
          conceptos: [
            'Las reglas para sumar y restar fracciones algebraicas son idénticas a las de fracciones numéricas: necesitas un denominador común antes de poder combinar los numeradores. Identifica el MCM de los denominadores, convierte cada fracción a su equivalente con ese denominador común, luego suma o resta los numeradores. Por ejemplo, 1/x + 1/(x + 1) = (x + 1)/[x(x + 1)] + x/[x(x + 1)] = [(x + 1) + x]/[x(x + 1)] = (2x + 1)/[x(x + 1)].',
            'Multiplicar fracciones algebraicas es simple: multiplica numerador por numerador y denominador por denominador, pero siempre factoriza primero y cancela factores comunes antes de hacer la multiplicación. Dividir fracciones algebraicas significa invertir la segunda fracción y multiplicar. Por ejemplo, (x² − 1)/(x + 2) × (x + 2)/(x − 1) = [(x + 1)(x − 1)(x + 2)]/[(x + 2)(x − 1)] = (x + 1) después de cancelar (x + 2) y (x − 1). Factorizar primero evita trabajar con expresiones enormes.'
          ]
        },
        {
          id: 'fracciones-complejas',
          titulo: 'Fracciones complejas',
          conceptos: [
            'Una fracción compleja (o fracción compuesta) es una fracción cuyo numerador o denominador (o ambos) contiene a su vez una fracción u otra operación algebraica. Por ejemplo, (1/x)/(x + 1) es una fracción compleja donde el numerador es 1/x y el denominador es x + 1. Otro ejemplo: [(x² + 1)/x]/[2x/3] donde el numerador es (x² + 1)/x y el denominador es 2x/3. Estas expresiones parecen complicadas pero tienen métodos de simplificación estándar.',
            'El método estándar para simplificar fracciones complejas es interpretarlas como una única división de fracciones y aplicar la regla del recíproco. Por ejemplo, (1/x)/(x + 1) se reescribe como (1/x) ÷ (x + 1), que es (1/x) × [1/(x + 1)] = 1/[x(x + 1)]. Un método alternativo es encontrar el MCM de todos los denominadores en la fracción compleja, multiplicar numerador y denominador por ese MCM, y simplificar el resultado. Ambos métodos llegan a la misma respuesta; elige el que te sea más cómodo.'
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
            'Una ecuación de primer grado es aquella donde la incógnita aparece únicamente elevada a la potencia 1, sin exponentes mayores, con la forma general ax + b = c. Para resolverla se despeja la variable moviendo los términos restantes al otro lado de la igualdad. Por ejemplo, en 3x + 5 = 20, se resta 5 en ambos lados obteniendo 3x = 15, y luego se divide entre 3, resultando x = 5.',
            'El procedimiento fundamental para resolver ecuaciones de primer grado es aislar la variable mediante operaciones inversas. Si un término está sumando, lo restas; si está multiplicando, lo divides. Por ejemplo, en 2x − 8 = 4, sumas 8 para obtener 2x = 12, y luego divides entre 2 para hallar x = 6. Este método funciona siempre que la ecuación sea lineal.'
          ]
        },
        {
          id: 'ecuaciones-segundo-grado',
          titulo: 'Ecuaciones de segundo grado',
          conceptos: [
            'Una ecuación de segundo grado o cuadrática tiene la forma ax² + bx + c = 0, donde a ≠ 0 para garantizar que el exponente mayor sea 2. Este tipo de ecuaciones puede tener hasta dos soluciones reales, y cada solución representa un punto donde la parábola correspondiente cruza el eje X. Por ejemplo, x² − 5x + 6 = 0 tiene dos soluciones: x = 2 y x = 3 (verificación: 2² − 5(2) + 6 = 0 ✓).',
            'Para resolver ecuaciones cuadráticas, puedes factorizar si es posible (buscar dos números que multiplicados den c y sumados den b), o usar la fórmula general: x = (−b ± √(b² − 4ac)) / 2a. Por ejemplo, en x² − 5x + 6 = 0, factorizas como (x − 2)(x − 3) = 0 para obtener x = 2 o x = 3. Alternativamente, con la fórmula general: x = (5 ± √(25 − 24)) / 2 = (5 ± 1) / 2, dando x = 3 o x = 2.',
            'El discriminante Δ = b² − 4ac es un indicador crucial que te dice cuántas soluciones reales tiene la ecuación: si Δ > 0, hay dos soluciones reales distintas; si Δ = 0, hay exactamente una solución (llamada raíz doble); si Δ < 0, no hay soluciones reales (aparecen números complejos). Por ejemplo, en x² − 2x + 1 = 0, el discriminante es (−2)² − 4(1)(1) = 0, así que tiene una raíz doble: x = 1.'
          ]
        },
        {
          id: 'sistemas-ecuaciones',
          titulo: 'Sistemas de ecuaciones',
          conceptos: [
            'Un sistema de ecuaciones es un conjunto de dos o más ecuaciones que comparten las mismas incógnitas y deben cumplirse simultáneamente. El objetivo es encontrar valores de las variables que satisfagan todas las ecuaciones al mismo tiempo. Por ejemplo, el sistema x + y = 5 y x − y = 1 tiene como solución x = 3, y = 2 (verificación: 3 + 2 = 5 ✓ y 3 − 2 = 1 ✓).',
            'Existen tres métodos principales para resolver sistemas de ecuaciones. El método de sustitución despeja una variable en una ecuación y la sustituye en la otra; el método de igualación despeja la misma variable en ambas ecuaciones y las iguala; el método de suma o resta (reducción) multiplica las ecuaciones para eliminar una variable al sumarlas o restarlas. Por ejemplo, en x + y = 5 y x − y = 1, sumando directamente obtienes 2x = 6, así x = 3, y luego y = 2.'
          ]
        },
        {
          id: 'inecuaciones',
          titulo: 'Inecuaciones',
          conceptos: [
            'Una inecuación es una desigualdad algebraica que usa símbolos como <, >, ≤ o ≥ en lugar del signo de igualdad. Se resuelve con los mismos pasos que las ecuaciones (moviendo términos, aislando la variable), pero la solución es un rango o intervalo de valores, no un único número. Por ejemplo, 2x + 3 < 9 se resuelve restando 3 para obtener 2x < 6, dividiendo entre 2 para obtener x < 3, lo que significa cualquier número menor a 3.',
            'La regla más importante en inecuaciones es que cuando multiplicas o divides ambos lados por un número negativo, el símbolo de la desigualdad se invierte automáticamente. Por ejemplo, si −2x > 8, divides entre −2 (un número negativo) y obtienes x < −4 (el símbolo > se convierte en <). Sin invertir el símbolo, tu respuesta estaría completamente equivocada. Este comportamiento diferencia las inecuaciones de las ecuaciones ordinarias.'
          ]
        },
        {
          id: 'resolucion-problemas-ecuaciones',
          titulo: 'Resolución de problemas mediante ecuaciones',
          conceptos: [
            'El primer paso al resolver un problema verbal mediante ecuaciones es identificar claramente qué cantidad desconocida se busca y asignarle una letra (comúnmente x). Antes de escribir un símbolo matemático, lee el problema completo para entender la situación real. Por ejemplo, en "el doble de un número más 5 es 15", identificas que el número desconocido es x y la situación es 2x + 5 = 15, que luego resuelves obteniendo x = 5.',
            'Después de elegir la variable, traduce el enunciado palabra por palabra a expresiones algebraicas. Palabras clave como "suma", "diferencia", "producto" o "cociente" tienen símbolos matemáticos correspondientes (+, −, ×, ÷). Organiza la información en una ecuación completa respetando el orden del enunciado. Por ejemplo, en "5 menos que tres veces un número es 10", escribes 3x − 5 = 10 (y no 5 − 3x = 10). Una vez planteada la ecuación correctamente, resuélvela como cualquier ecuación estándar y verifica que tu respuesta tenga sentido en el contexto original.'
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
            'Convertir frases verbales a expresiones algebraicas requiere reconocer palabras que indican operaciones matemáticas. "El doble de un número" significa multiplicar por 2, así que es 2x. "Un número aumentado en 5" significa sumar 5, así que es x + 5. "El triple de un número menos 4" es 3x − 4. La práctica de estas conversiones es fundamental porque todos los problemas verbales comienzan aquí.',
            'Memoriza estas palabras clave que convierten lenguaje verbal a símbolos matemáticos: "suma", "más", "aumentado" → +; "diferencia", "menos", "disminuido", "restado" → −; "producto", "veces", "multiplicado" → ×; "cociente", "dividido", "entre" → ÷. Por ejemplo, "4 veces un número más 7" es 4x + 7, "un número dividido entre 3 menos 2" es x/3 − 2. Estas equivalencias son la puerta de entrada al álgebra aplicada.'
          ]
        },
        {
          id: 'planteamiento-ecuaciones',
          titulo: 'Planteamiento de ecuaciones',
          conceptos: [
            'Plantear una ecuación significa traducir un problema verbal a una igualdad matemática que lo representa fielmente. El paso crítico es escribir la ecuación en papel antes de resolver mentalmente, porque esto evita errores de comprensión del enunciado. Por ejemplo, en "si un número se suma a 3, el resultado es 12", planteas x + 3 = 12, no 3x = 12 ni otra variante; la ecuación captura exactamente la relación descrita.',
            'Un control de calidad es verificar que cada dato numérico y cada relación mencionada en el enunciado original aparezca en tu ecuación. Si el problema dice "Juan tiene 5 años más que María", tu ecuación debe incluir ese "+5", no ignorarlo. Por ejemplo, en "el precio de dos camisas más $8 de impuesto suma $42", planteas 2p + 8 = 42 (donde p es el precio de una camisa). Si algún dato del enunciado no está representado, tu ecuación es incorrecta y la solución también lo será.'
          ]
        },
        {
          id: 'valores-variables',
          titulo: 'Valores de las variables',
          conceptos: [
            'Después de resolver la ecuación y obtener un valor para la variable, el paso obligatorio es verificar que ese valor sea correcto sustituyéndolo en el enunciado original o en la ecuación. Por ejemplo, si resolviste x + 3 = 12 y obtuviste x = 9, verifica: 9 + 3 = 12 ✓. Si el enunciado original decía "un número más 3 es 12", comprueba nuevamente: "9 más 3 es 12" ✓. Esta verificación te protege contra errores algebraicos que pueden pasar desapercibidos.',
            'Más importante aún, evalúa si la solución tiene sentido lógico en el contexto real del problema. Si resolviste un problema sobre "la edad de Juan" y obtuviste x = −5 años, descarta esa respuesta porque las edades negativas no existen en la realidad. Similarmente, distancias negativas, cantidades de personas no enteras, o velocidades contrarias al movimiento real deben cuestionarse. Una solución matemáticamente correcta puede ser inadmisible en el mundo real, así que siempre aplica el sentido común.'
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
            'Una relación es cualquier conexión o vínculo entre elementos de dos conjuntos diferentes, representada generalmente como un conjunto de pares ordenados (x, y). Por ejemplo, si el conjunto A = {1, 2, 3} y el conjunto B = {a, b}, una relación podría ser {(1, a), (2, b), (1, b)}, indicando que 1 se relaciona con a, que 2 se relaciona con b, y que 1 también se relaciona con b. Las relaciones pueden ser visualizadas en gráficos de dispersión o en diagramas de flechas.',
            'La característica definida de una relación es que un valor del primer conjunto puede conectarse con múltiples valores del segundo conjunto sin restricción. Por ejemplo, en {(1, a), (1, b), (2, a)}, el número 1 se relaciona con tanto a como b, lo cual es completamente válido en una relación general. Esta libertad es precisamente lo que distingue a las relaciones de las funciones, que tienen restricciones más estrictas en sus conexiones.'
          ]
        },
        {
          id: 'funcion',
          titulo: 'Función',
          conceptos: [
            'Una función es un tipo especial de relación donde cada valor de entrada (x) del primer conjunto produce exactamente una única salida (y) en el segundo conjunto, sin ambigüedad ni excepción. Esta es la diferencia clave entre una función y una relación cualquiera. Por ejemplo, en {(1, a), (2, b), (3, a)}, es función porque cada x (1, 2, 3) aparece una sola vez; pero en {(1, a), (1, b), (2, c)}, no es función porque x = 1 da dos salidas distintas (a y b).',
            'Una prueba rápida para verificar si una relación es función es el criterio de la línea vertical: si dibujas una línea vertical en la gráfica, debe cruzarla en exactamente un punto (no en dos o más). Si un mismo valor de x aparece con dos valores distintos de y en los pares ordenados, entonces definitivamente no es una función. Por ejemplo, {(2, 3), (2, 5)} no es función porque x = 2 produce dos salidas diferentes, violando la regla fundamental de las funciones.'
          ]
        },
        {
          id: 'dominio',
          titulo: 'Dominio',
          conceptos: [
            'El dominio de una función es el conjunto completo de todos los valores de entrada (x) para los que la función está matemáticamente definida y produce un resultado válido. Por ejemplo, en f(x) = x + 2, el dominio es todos los números reales porque puedes sumar 2 a cualquier número. Sin embargo, en f(x) = 1/x, el dominio excluye x = 0 porque la división entre cero no está definida en matemáticas.',
            'Existen restricciones comunes que limitan el dominio de una función. Cuando hay una división (como 1/x), el denominador nunca puede ser cero, así que excluyes esos valores de x. Cuando hay una raíz cuadrada (como √x), el radicando debe ser ≥ 0, así que solo permites x ≥ 0. Por ejemplo, f(x) = √(x − 3) tiene dominio x ≥ 3, porque x − 3 debe ser no negativo. Identificar y comunicar correctamente el dominio es esencial para evitar intentar evaluar la función fuera de su región válida.'
          ]
        },
        {
          id: 'rango',
          titulo: 'Rango',
          conceptos: [
            'El rango (o imagen) de una función es el conjunto de todos los valores de salida (y) que la función realmente produce cuando evalúas cada x en el dominio. No incluye valores de y que "podrían" producirse teóricamente, sino solo aquellos que efectivamente resultan. Por ejemplo, en f(x) = x², si el dominio son todos los reales, el rango es y ≥ 0, porque x² nunca produce números negativos, solo cero y positivos.',
            'Para encontrar el rango, analizas el comportamiento de la función a lo largo de todo su dominio: qué valores mínimos y máximos alcanza, si tiene restricciones naturales, y qué forma tiene su gráfica. Por ejemplo, en f(x) = |x|, el rango es y ≥ 0 (nunca negativo); en f(x) = sin(x), el rango es −1 ≤ y ≤ 1 (acotado entre esos valores). El rango no es lo mismo que el contradominio (el conjunto de valores que podrían asignarse): el rango es más específico, incluye solo los valores realmente obtenidos.'
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
            'Evaluar una función f(x) en un punto específico significa reemplazar cada instancia de la variable x con el número dado y realizar todas las operaciones indicadas para obtener el resultado final. Es un proceso mecánico pero crítico para entender cómo la función convierte entradas en salidas. Por ejemplo, si f(x) = 2x + 3, para evaluar en x = 4, reemplazas: f(4) = 2(4) + 3 = 8 + 3 = 11, indicando que la entrada 4 produce la salida 11.',
            'Cuando evalúas funciones más complejas, sigue el orden de operaciones (PEMDAS) cuidadosamente. Por ejemplo, si f(x) = x² − 3x + 5, entonces f(2) = (2)² − 3(2) + 5 = 4 − 6 + 5 = 3. Un error común es olvidar respetar los paréntesis o los exponentes: si f(x) = 2x², entonces f(3) = 2(3)² = 2(9) = 18, no 6² = 36. La evaluación precisa es fundamental para verificar si un punto está en la gráfica de la función.'
          ]
        },
        {
          id: 'interpretacion-resultados',
          titulo: 'Interpretación de resultados',
          conceptos: [
            'El resultado que obtienes al evaluar f(x) es el valor de salida correspondiente a esa entrada específica x, representando la relación funcional entre ambas cantidades. Numéricamente, f(4) = 11 significa que cuando x vale 4, y vale 11, ubicando el punto (4, 11) en la gráfica de la función. Este resultado no es solo un número aislado, sino la respuesta a "¿qué produce esta función cuando le entro 4?".',
            'En aplicaciones reales, debes interpretar qué representa ese valor en el contexto del problema específico. Si f(x) = 1.5x representa el costo en pesos de comprar x kilogramos de frutas, entonces f(3) = 4.5 significa que 3 kg cuestan 4.5 pesos. Si f(t) = −4.9t² + 20t representa la altura de un objeto lanzado hacia arriba (donde t es tiempo en segundos), entonces f(2) = −4.9(4) + 40 = 20.4 significa que a los 2 segundos el objeto está a 20.4 metros de altura. Sin interpretación contextual, el número es solo un dato desconectado.'
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
            'Una función lineal es cualquier función de la forma f(x) = mx + b, donde m y b son constantes (números reales). La característica que la define es que su gráfica es siempre una línea recta, sin curvas ni cambios en la dirección. Por ejemplo, f(x) = 2x + 3 es lineal, f(x) = −x + 5 es lineal, incluso f(x) = x (donde m = 1, b = 0) es lineal. Las funciones lineales son fundamentales en modelación porque describen relaciones proporcionales constantes.',
            'En la expresión f(x) = mx + b, el parámetro m se llama pendiente e indica la inclinación de la recta: mide cuántas unidades suben (o bajan) la salida por cada unidad que aumenta la entrada. Si m = 2, por cada aumento de 1 en x, y aumenta 2. Si m = −3, por cada aumento de 1 en x, y disminuye 3. El parámetro b se llama intersección con el eje Y (u ordenada al origen) e indica exactamente dónde cruza la recta el eje Y: en el punto (0, b). Por ejemplo, en f(x) = 2x + 3, la pendiente es 2 y la recta cruza el eje Y en (0, 3).'
          ]
        },
        {
          id: 'funcion-cuadratica',
          titulo: 'Función cuadrática',
          conceptos: [
            'Una función cuadrática es cualquier función de la forma f(x) = ax² + bx + c, donde a, b, c son constantes y a ≠ 0 (de lo contrario no sería cuadrática, sino lineal). Su gráfica es siempre una parábola, una curva simétrica con forma de U o de arco invertido (⌢ o ⌣). Por ejemplo, f(x) = x² es cuadrática (a = 1, b = 0, c = 0), f(x) = −x² + 4x − 1 es cuadrática, y su gráfica tiene esa forma característica de parábola.',
            'Las funciones cuadráticas modelan situaciones reales donde la salida es proporcional al cuadrado de la entrada. En física, cuando lanzas un objeto hacia arriba, su altura en función del tiempo sigue f(t) = −4.9t² + v₀t + h₀ (donde v₀ es la velocidad inicial y h₀ es la altura inicial). En negocios, la ganancia a menudo es cuadrática: si aumentas demasiado el precio, pierdes ventas, así que hay un precio óptimo que maximiza la ganancia. Entender parábolas es clave para interpretar estos fenómenos complejos.'
          ]
        },
        {
          id: 'funcion-constante',
          titulo: 'Función constante',
          conceptos: [
            'Una función constante es aquella de la forma f(x) = k, donde k es un número fijo (una constante), y el resultado nunca cambia sin importar qué valor de x introduzcas. Por ejemplo, f(x) = 5 siempre devuelve 5, ya sea para x = 0, x = 100, o x = −3.7. Similarmente, f(x) = −2 siempre devuelve −2. El dominio es todos los números reales, pero el rango es solo ese único valor k, haciendo que la función sea trivialmente predecible.',
            'La gráfica de una función constante es siempre una línea horizontal paralela al eje X, ubicada exactamente en la altura y = k. Por ejemplo, f(x) = 3 se grafica como una línea horizontal que pasa por (0, 3), (1, 3), (−5, 3), etc. Esta forma extremadamente simple es útil para modelar situaciones donde una cantidad no depende de otra: por ejemplo, si el precio de un producto es constantemente $10 sin importar la cantidad comprada, ese precio es una función constante. Aunque parezca trivial, reconocer funciones constantes ayuda a identificar rápidamente situaciones de no-dependencia entre variables.'
          ]
        },
        {
          id: 'funcion-afin',
          titulo: 'Función afín',
          conceptos: [
            'Una función afín es un caso especial de función lineal de la forma f(x) = mx + b, donde b ≠ 0. La característica que la distingue es que su gráfica (una línea recta) NO pasa por el origen de coordenadas (0, 0), sino que intersecta el eje Y en algún otro punto (0, b). Por ejemplo, f(x) = 2x + 3 es afín porque b = 3 ≠ 0, y su gráfica cruza el eje Y en (0, 3), no en el origen. Esta es la diferencia clave con las funciones lineales "puras".',
            'Es importante notar que la terminología varía según el país: en algunos lugares, "función lineal" incluye ambos casos (con y sin desplazamiento), mientras que en otros, "función lineal pura" (o función de proporcionalidad directa) es aquella donde b = 0, y "función afín" es donde b ≠ 0. Para este curso, entiende que una función afín es una línea recta con pendiente m que no pasa por el origen. En contextos de proporcionalidad, esto significa que no hay relación directa pura entre variables: siempre hay un término independiente que desplaza el resultado.'
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
            'En una gráfica de función, el eje horizontal (X) representa la variable de entrada (el dominio), y el eje vertical (Y) representa la variable de salida (el rango). Cada punto (x, y) en la gráfica significa que cuando la entrada es x, la salida es y. Por ejemplo, si el punto (3, 7) está en la gráfica, significa f(3) = 7. Leer correctamente los ejes es fundamental para interpretar cualquier gráfica matemática: primero identifica qué representa cada eje (tiempo, dinero, distancia, etc.) y sus unidades, luego ubica los puntos.',
            'Los puntos donde la gráfica cruza el eje X (donde y = 0) son especialmente importantes: se llaman intersecciones con el eje X, raíces, o ceros de la función. Son las soluciones de la ecuación f(x) = 0. Por ejemplo, si una parábola cruza el eje X en x = 2 y x = 5, eso significa que f(2) = 0 y f(5) = 0, siendo 2 y 5 las raíces de esa función cuadrática. En aplicaciones reales, las raíces frecuentemente representan momentos críticos: en una función de altura vs. tiempo, las raíces son cuando el objeto toca el suelo.'
          ]
        },
        {
          id: 'transformaciones-graficas',
          titulo: 'Transformaciones de gráficas',
          conceptos: [
            'Las transformaciones de gráficas permiten visualizar cómo cambios en la fórmula de una función afectan su gráfica en el plano. Cuando sumas una constante directamente a la función (afuera de la operación principal), la gráfica se desplaza verticalmente: f(x) + k desplaza k unidades hacia arriba si k > 0, o |k| unidades hacia abajo si k < 0. Por ejemplo, si la gráfica de y = x² es una parábola con vértice en (0, 0), entonces y = x² + 3 desplaza esa misma parábola 3 unidades hacia arriba, con vértice en (0, 3). La forma no cambia, solo su posición vertical.',
            'Cuando la constante va dentro del paréntesis (afectando directamente a x), la gráfica se desplaza horizontalmente, pero en dirección contraria al signo: f(x − h) desplaza h unidades a la derecha, y f(x + h) desplaza h unidades a la izquierda (nota la inversión). Por ejemplo, y = (x − 2)² desplaza la parábola y = x² dos unidades a la derecha (vértice en (2, 0)), mientras que y = (x + 2)² la desplaza dos unidades a la izquierda (vértice en (−2, 0)). Combinando desplazamientos verticales y horizontales, como y = (x − 2)² + 3, puedes mover la gráfica en ambas direcciones simultáneamente.'
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
            'Un punto es el elemento geométrico más básico: no tiene largo, ancho ni profundidad, solo indica una posición exacta en el espacio. Se representa con un pequeño punto y se nombra con una letra mayúscula, como el punto A. Aunque parezca demasiado simple para tener utilidad, todos los demás objetos geométricos (rectas, planos, figuras) se construyen a partir de puntos.'
          ]
        },
        {
          id: 'recta',
          titulo: 'Recta',
          conceptos: [
            'Una recta es una sucesión infinita de puntos que siguen una sola dirección, extendiendo se infinitamente hacia ambos lados sin jamás terminar. No tiene principio ni fin, solo dirección única. Se nombra con dos puntos cualesquiera que estén en ella (como la "recta AB"), o a veces con una letra minúscula (como la "recta m"). Las rectas son ideales geométricos; en la realidad nunca vemos una recta perfecta infinita, pero el concepto es fundamental para la geometría.'
          ]
        },
        {
          id: 'plano',
          titulo: 'Plano',
          conceptos: [
            'Un plano es una superficie que se extiende infinitamente en dos direcciones distintas, sin espesor (altura nula). Contiene infinitas rectas e infinitos puntos, todos perfectamente planos y coplanares. Se nombra generalmente con una letra mayúscula griega (como el "plano π") o con tres puntos no colineales que lo definen. Una página de un cuaderno o la superficie de una mesa son aproximaciones finitas de la idea de un plano infinito.'
          ]
        },
        {
          id: 'segmento',
          titulo: 'Segmento',
          conceptos: [
            'Un segmento es la porción de una recta comprendida exactamente entre dos puntos finales distintos, llamados extremos del segmento. A diferencia de una recta infinita, el segmento tiene longitud medible y finita. Se representa como "segmento AB" (donde A y B son los extremos) o simplemente AB con una barra encima. Por ejemplo, un lado de un triángulo, un lado de un cuadrado, o la distancia recta entre dos ciudades son todos segmentos con longitud definida.'
          ]
        },
        {
          id: 'semirrecta',
          titulo: 'Semirrecta',
          conceptos: [
            'Una semirrecta (o rayo) es una línea que tiene un punto de origen bien definido, pero se extiende infinitamente en una sola dirección, sin fin ni límite hacia un lado. Se nombra indicando primero el punto de origen, luego otro punto por el cual pasa (como "semirrecta AB", donde A es el origen y B está en la dirección del infinito). Visualmente, si imaginas que partes un punto en dos con una recta, una de las dos mitades es una semirrecta, con el punto de corte como su origen.'
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
            'Los ángulos se clasifican por su medida: un ángulo agudo es cualquiera que mida menos de 90° (como 30°, 45° o 89°), típicamente "puntiagudo"; un ángulo recto mide exactamente 90°, formado por dos rectas perpendiculares (como en la esquina de una habitación); un ángulo obtuso está entre 90° y 180° (como 120° o 170°), más "abierto" que un recto; un ángulo llano mide exactamente 180°, formando una línea recta completa donde los dos lados están en direcciones opuestas.',
            'Reconocer instantáneamente estos tipos de ángulos a simple vista es una habilidad clave para resolver problemas geométricos rápidamente, especialmente en exámenes bajo presión. Cuando ves una figura, identifica qué tipo de ángulos contiene: los ángulos rectos suelen estar marcados con un pequeño cuadrado en la esquina, los ángulos agudos son claramente "puntiagudos", y los obtusos son "abiertos". Esta capacidad de clasificación visual agiliza tu análisis de polígonos, figuras complejas y problemas de aplicación.'
          ]
        },
        {
          id: 'angulos-complementarios',
          titulo: 'Ángulos complementarios',
          conceptos: [
            'Dos ángulos son complementarios cuando la suma de sus medidas es exactamente 90°, sin importar si están juntos en la figura o separados. Por ejemplo, un ángulo de 30° y otro de 60° son complementarios porque 30° + 60° = 90°. Este concepto es clave en triángulos rectángulos, donde los dos ángulos agudos (distintos del ángulo recto de 90°) siempre son complementarios entre sí, pues sus tres ángulos suman 180° y uno ya ocupa los 90°.'
          ]
        },
        {
          id: 'angulos-suplementarios',
          titulo: 'Ángulos suplementarios',
          conceptos: [
            'Dos ángulos son suplementarios cuando la suma de sus medidas es exactamente 180°, formando en conjunto una línea recta completa (ángulo llano). Por ejemplo, un ángulo de 70° y otro de 110° son suplementarios porque 70° + 110° = 180°. Los ángulos suplementarios suelen aparecer cuando una recta intersecta otra, formando ángulos adyacentes: cada par de ángulos adyacentes que comparten un lado en una intersección son suplementarios, una relación que simplifica muchísimos problemas geométricos.'
          ]
        },
        {
          id: 'angulos-opuestos-vertice',
          titulo: 'Ángulos opuestos por el vértice',
          conceptos: [
            'Los ángulos opuestos por el vértice se forman cuando dos rectas distintas se cruzan exactamente en un punto (el vértice común). Este cruce produce cuatro ángulos alrededor del punto de intersección, y los pares que quedan "cara a cara" en lados totalmente opuestos se llaman opuestos por el vértice. Si imaginas una X, los dos ángulos "arriba-abajo" y los dos ángulos "izquierda-derecha" son las dos parejas de ángulos opuestos por el vértice.',
            'Una propiedad fundamental e inquebrantable de los ángulos opuestos por el vértice es que siempre son congruentes (exactamente iguales en medida), sin jamás tener excepciones. Si un ángulo mide 35°, su opuesto por el vértice mide 35° sin falta; si otro mide 145°, su opuesto también es 145°. Esta igualdad no depende de cómo se cruzan las rectas ni de si está en un examen o en un problema real: es una verdad geométrica absoluta que puedes usar sin dudar para resolver incógnitas.'
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
            'Los triángulos se clasifican por sus lados en tres tipos: el triángulo equilátero tiene los 3 lados exactamente iguales en longitud (y también sus 3 ángulos interiores iguales, cada uno midiendo 60°); el triángulo isósceles tiene exactamente 2 lados iguales y uno distinto (y los ángulos opuestos a los lados iguales también son iguales); el triángulo escaleno tiene los 3 lados de medidas distintas (y sus 3 ángulos también son todos diferentes). Por ejemplo, un triángulo con lados 3 cm, 4 cm y 5 cm es escaleno.',
            'Alternativamente, los triángulos se clasifican por sus ángulos en tres tipos mutuamente excluyentes: un triángulo acutángulo tiene todos sus ángulos agudos (cada uno menor que 90°), por lo que la forma luce "puntiaguda"; un triángulo rectángulo tiene exactamente un ángulo recto (90°), siendo el más importante porque permite usar el teorema de Pitágoras; un triángulo obtusángulo tiene exactamente un ángulo obtuso (entre 90° y 180°), haciendo la forma "aplastada" en esa dirección. Observa que cada triángulo encaja en una sola clasificación de este tipo.',
            'Una propiedad fundamental e invariante de todos los triángulos, sin importar su forma o clasificación, es que la suma de sus tres ángulos internos siempre es exactamente 180°. Por ejemplo, si un triángulo tiene ángulos de 50°, 60° y 70°, su suma es 50 + 60 + 70 = 180° ✓. Esta regla permite calcular un ángulo desconocido si conoces los otros dos: si tienes ángulos de 40° y 80°, el tercero debe ser 180 − 40 − 80 = 60°. Esta propiedad es tan confiable que puedes usarla como verificación: si la suma de ángulos no es 180°, hay un error de cálculo.'
          ]
        },
        {
          id: 'cuadrilateros',
          titulo: 'Cuadriláteros',
          conceptos: [
            'Los cuadriláteros son polígonos de 4 lados que se clasifican en familias según sus propiedades de lados y ángulos. El cuadrado tiene 4 lados iguales y 4 ángulos rectos (90° cada uno); el rectángulo tiene lados opuestos iguales y 4 ángulos rectos; el rombo tiene 4 lados iguales pero ángulos opuestos iguales (no todos 90°); el romboide combina características del rectángulo y el rombo; el trapecio tiene solo un par de lados paralelos (llamados bases). Existen muchas variaciones más, pero estas son las más comunes y útiles.',
            'Una regla invariante para todos los cuadriláteros, sin excepción de su tipo, es que la suma de sus cuatro ángulos internos siempre es exactamente 360°. Por ejemplo, en un rectángulo con cuatro ángulos de 90° cada uno: 90 + 90 + 90 + 90 = 360°. En un cuadrilátero irregular con ángulos de 80°, 100°, 95° y 85°: 80 + 100 + 95 + 85 = 360°. Esta propiedad te permite hallar un ángulo desconocido en un cuadrilátero si conoces los otros tres: si los ángulos conocidos suman 280°, el cuarto debe medir 360 − 280 = 80°. Es una herramienta confiable para resolver problemas.'
          ]
        },
        {
          id: 'poligonos-regulares',
          titulo: 'Polígonos regulares',
          conceptos: [
            'Un polígono regular es aquél en el que todos sus lados tienen la misma medida y todos sus ángulos interiores tienen la misma medida, otorgándole una simetría y belleza visual perfectas. Ejemplos incluyen el triángulo equilátero (3 lados iguales), el cuadrado (4 lados iguales, 4 ángulos de 90°), el pentágono regular (5 lados iguales), y el hexágono regular (6 lados iguales, ángulos de 120° cada uno). Los polígonos regulares aparecen constantemente en la naturaleza (colmenas de abejas, flores) y en arquitectura debido a su elegancia inherente y sus propiedades predecibles.'
          ]
        },
        {
          id: 'poligonos-irregulares',
          titulo: 'Polígonos irregulares',
          conceptos: [
            'Un polígono irregular es aquél en el cual no todos los lados tienen la misma medida y/o no todos los ángulos interiores tienen la misma medida, es decir, carece de la simetría perfecta de los polígonos regulares. Por ejemplo, un triángulo escaleno (3 lados de distintas longitudes), un rectángulo (4 lados, pero solo los opuestos son iguales, no todos), o un trapecio son polígonos irregulares. La mayoría de figuras que encontrarás en problemas reales son irregulares, aunque seguir siendo más complejas de analizar, sus propiedades fundamentales (como la suma de ángulos) siguen siendo válidas.'
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
            'El radio de una circunferencia es la distancia constante desde el centro del círculo hasta cualquier punto situado en el borde (la circunferencia misma), generalmente denotado como r. El diámetro es un segmento que cruza completamente el círculo, pasando por su centro, conectando dos puntos opuestos de la circunferencia; siempre mide exactamente el doble del radio (d = 2r). Por ejemplo, si un círculo tiene radio r = 5 cm, su diámetro es d = 10 cm. Todos los radios de un mismo círculo son iguales, y el diámetro es el segmento más largo que puedes dibujar dentro del círculo.',
            'Una cuerda es un segmento recto que conecta dos puntos distintos ubicados en la circunferencia (el borde del círculo), sin necesidad de pasar por el centro. Cada círculo contiene infinitas cuerdas: desde cuerdas muy pequeñas (cuando los dos puntos están cercanos) hasta la cuerda más larga posible, que es precisamente el diámetro (la cuerda que pasa por el centro). Por ejemplo, si tienes un círculo y marcas dos puntos en su borde, el segmento que los une es una cuerda. Las cuerdas aparecen naturalmente al analizar secciones de circunferencias y son importantes en problemas de geometría analítica.'
          ]
        },
        {
          id: 'longitud-circunferencia',
          titulo: 'Longitud de la circunferencia',
          conceptos: [
            'La longitud (o perímetro) de una circunferencia es la distancia total alrededor de su borde, calculada con una de estas fórmulas equivalentes: perímetro = 2πr (usando el radio r) o perímetro = πd (usando el diámetro d). Por ejemplo, si un círculo tiene radio 3 cm, su perímetro es 2π(3) = 6π ≈ 18.85 cm. Si otro círculo tiene diámetro 10 cm, su perímetro es π(10) = 10π ≈ 31.42 cm. La elección de fórmula depende de qué dato te proporciona el problema; ambas producen el mismo resultado porque d = 2r.',
            'La constante π (pi) es un número irracional (sus decimales nunca terminan ni repiten patrón) que aproximadamente vale 3.1416 o 3.14 para cálculos rápidos. Representa la relación matemática fundamental entre el perímetro de cualquier círculo y su diámetro: perímetro / diámetro = π para cada círculo, sin excepción. Esta constante aparece en todas las fórmulas de círculos y circunferencias porque es la "firma" geométrica que relaciona la longitud del borde con el tamaño del círculo. En exámenes, a menos que se pida una respuesta exacta, usarás π ≈ 3.14 o simplemente dejarás π sin desarrollar (como "6π cm") para evitar aproximaciones innecesarias.'
          ]
        },
        {
          id: 'area-circulo',
          titulo: 'Área del círculo',
          conceptos: [
            'El área de un círculo es la medida de la superficie que cubre su interior, calculada con la fórmula fundamental Área = πr², donde r es el radio. Por ejemplo, un círculo con radio 4 cm tiene área = π(4)² = 16π ≈ 50.27 cm². Esta fórmula es crucial en problemas sobre espacios, regiones sombreadas, y aplicaciones reales (pintar un círculo, calcular el área de una mesa redonda, etc.). El hecho de que tenga r² (no r) significa que cuando duplicas el radio, el área no se duplica, sino que aumenta cuatro veces: es una relación no lineal que causa confusión si no la recuerdas bien.',
            'Un error muy común en problemas de área de círculos es usar el diámetro directamente en la fórmula, cuando la fórmula específicamente requiere el radio. Si un problema dice "un círculo tiene diámetro 10 cm", no calcules πd²; primero extrae el radio: r = d/2 = 10/2 = 5 cm, y luego aplica Área = π(5)² = 25π ≈ 78.54 cm². Si hubieras usado 10 directamente: π(10)² = 100π ≈ 314.16 cm², cuatro veces más grande (incorrecto). Memoriza: "Área usa radio, perímetro usa radio o diámetro"—esto te protege contra este error fatal en exámenes.'
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
            'El perímetro de una figura geométrica es la suma de las longitudes de todos sus lados, representando la "distancia total" que necesitarías recorrer si caminases alrededor de su borde completo sin desviaciones. Para un rectángulo de 5 cm de largo y 3 cm de ancho: perímetro = 5 + 3 + 5 + 3 = 16 cm (o fórmula abreviada: 2(5 + 3) = 16 cm). Para un triángulo con lados 3, 4 y 5 cm: perímetro = 3 + 4 + 5 = 12 cm. Es una medida fundamental en geometría, diferente del área (superficie interior).',
            'El perímetro es directamente útil en aplicaciones prácticas del mundo real donde necesitas saber la cantidad de material para rodear una figura. Por ejemplo, si quieres cercar un terreno rectangular de 20 m × 15 m, el perímetro es 2(20 + 15) = 70 m, así que necesitarás 70 m de cerca. Otro ejemplo: calcular la longitud de cinta necesaria para decorar el borde de una mesa redonda (perímetro de la circunferencia), o determinar cuánta madera necesitas para hacer un marco cuadrado. Estos problemas cotidianos dependen completamente del concepto de perímetro.'
          ]
        },
        {
          id: 'area',
          titulo: 'Área',
          conceptos: [
            'El área de una figura es la medida cuantitativa de la superficie que ocupa su interior, expresada siempre en unidades cuadradas (cm², m², km², hectáreas, etc.). A diferencia del perímetro (que mide el borde), el área mide todo lo "dentro" de la figura. Por ejemplo, una hoja de papel tiene área cuando mides cuántos centímetros cuadrados ocupa su superficie plana. Una piscina tiene área cuando calculas cuántos metros cuadrados cubre su superficie de agua (útil para saber cuánta pintura necesitas o cuánto material de limpieza).',
            'Cada tipo de figura posee su propia fórmula específica para calcular el área: un rectángulo usa Área = base × altura (por ejemplo, 6 cm × 4 cm = 24 cm²); un triángulo usa Área = (base × altura) / 2 (por ejemplo, (6 cm × 4 cm) / 2 = 12 cm²); un círculo usa Área = πr² (por ejemplo, π × 3² = 9π ≈ 28.27 cm²); un trapecio usa Área = ((base₁ + base₂) / 2) × altura. La diversidad de fórmulas refleja las diferentes geometrías de cada figura. Memorizar estas fórmulas es esencial; sin ellas, no puedes calcular áreas ni resolver problemas que las requieran.'
          ]
        },
        {
          id: 'volumen',
          titulo: 'Volumen',
          conceptos: [
            'El volumen es la medida del espacio tridimensional que ocupa un cuerpo sólido (un objeto con profundidad, ancho y alto), expresado siempre en unidades cúbicas (cm³, m³, litros, etc.). Mientras que el área mide superficies 2D (como la hoja de papel), el volumen mide contenido 3D (como cuánto líquido cabe en una botella, cuánto aire hay dentro de un cuarto). Un cubo de lado 5 cm tiene volumen 5³ = 125 cm³, lo que significa que podrías llenar ese cubo con 125 cubitos de 1 cm³ cada uno.',
            'Para un prisma rectangular (también llamado caja o paralelepípedo rectangular), el volumen se calcula multiplicando las tres dimensiones: Volumen = largo × ancho × alto. Por ejemplo, una caja con largo 10 cm, ancho 6 cm y alto 5 cm tiene volumen = 10 × 6 × 5 = 300 cm³. Esta fórmula es intuitiva: estás apilando capas rectangulares una sobre otra hasta alcanzar la altura total. Otros sólidos (cilindros, esferas, conos) tienen sus propias fórmulas, pero la del prisma rectangular es la más común y práctica en problemas escolares.'
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
            'El teorema de Pitágoras es uno de los teoremas más poderosos e importantes de la geometría, pero **solo se aplica a triángulos rectángulos** (aquellos con un ángulo de 90°). Establece que en cualquier triángulo rectángulo, la suma de los cuadrados de los dos lados más cortos (llamados catetos, a y b) es igual al cuadrado del lado más largo (la hipotenusa, c): a² + b² = c². La hipotenusa es siempre el lado opuesto al ángulo recto y es invariablemente el lado más largo del triángulo.',
            'La utilidad práctica del teorema es que si conoces dos lados cualesquiera de un triángulo rectángulo, puedes encontrar el tercero desconocido despejando la fórmula. Si conoces a = 3 y b = 4, hallables c: c² = 3² + 4² = 9 + 16 = 25, así c = √25 = 5. Si conoces a = 5 y c = 13 (donde c es la hipotenusa), hallas b: 5² + b² = 13², entonces 25 + b² = 169, luego b² = 144, finalmente b = 12. Esta flexibilidad hace del teorema de Pitágoras una herramienta universal para resolver cualquier triángulo rectángulo.',
            'El "triplete pitagórico" más famoso es (3, 4, 5): un triángulo rectángulo con catetos de 3 y 4 unidades tiene hipotenusa de 5 unidades, verificando que 3² + 4² = 9 + 16 = 25 = 5². Este triplete aparece constantemente en problemas y es tan útil que memorizar algunos tripletes comunes (3-4-5, 5-12-13, 8-15-17, 7-24-25) te ahorra tiempo en exámenes: si ves un triángulo con lados 3 y 4, sabes inmediatamente que la hipotenusa es 5 sin necesidad de calcular. Estos números también forman escalas: (6, 8, 10), (9, 12, 15), etc., simplemente multiplicando todos los términos del triplete base por una constante.'
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
            'En el plano cartesiano, cada punto se ubica única y inequívocamente mediante un par ordenado (x, y), donde x es la coordenada horizontal (abscisa) y y es la coordenada vertical (ordenada). El orden es crítico: (3, 5) es completamente diferente de (5, 3). El primer número siempre indica cuántas unidades te mueves hacia la derecha (si es positivo) o izquierda (si es negativo) desde el origen; el segundo número indica cuántas unidades hacia arriba (positivo) o abajo (negativo). Por ejemplo, el punto (3, 5) está 3 unidades a la derecha y 5 unidades arriba del origen.',
            'El punto especial (0, 0), donde se cruzan el eje horizontal (eje X) y el eje vertical (eje Y), se llama el origen del plano cartesiano. Es el punto de referencia fundamental: todas las distancias se miden desde aquí. Cualquier punto en el plano se describe indicando cuántas unidades está de cada eje. El origen mismo tiene coordenadas (0, 0) porque no está desplazado en ninguna dirección: 0 unidades horizontales y 0 unidades verticales. Cuando veas un punto con ambas coordenadas 0, sabes inmediatamente que está en el origen, el "centro" del plano cartesiano.'
          ]
        },
        {
          id: 'ubicacion-puntos',
          titulo: 'Ubicación de puntos',
          conceptos: [
            'El plano cartesiano se divide en exactamente 4 regiones llamadas cuadrantes, numerados tradicionalmente con números romanos. El cuadrante I está arriba y a la derecha del origen, donde x > 0 e y > 0 (ambas positivas); el cuadrante II está arriba y a la izquierda, donde x < 0 e y > 0; el cuadrante III está abajo y a la izquierda, donde x < 0 e y < 0; el cuadrante IV está abajo y a la derecha, donde x > 0 e y < 0. Los puntos exactamente sobre los ejes (donde x = 0 o y = 0) no pertenecen a ningún cuadrante específico; están en el eje X o eje Y.',
            'Sin necesidad de graficar, los signos de las coordenadas (x, y) te revelan instantáneamente en cuál cuadrante se ubica el punto. Si x > 0 e y > 0, está en el cuadrante I; si x < 0 e y > 0, está en el II; si x < 0 e y < 0, está en el III; si x > 0 e y < 0, está en el IV. Por ejemplo, el punto (−3, 7) tiene x negativa e y positiva, así que está en el cuadrante II, sin necesidad de dibujar nada. Este atajo acelera enormemente la resolución de problemas: la combinación de signos es una "firma" del cuadrante.'
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
            'La pendiente de una recta es una medida numérica que describe qué tan inclinada está la recta, comparando el cambio vertical con el cambio horizontal. Se calcula usando la fórmula m = (y₂ − y₁) / (x₂ − x₁), donde (x₁, y₁) y (x₂, y₂) son dos puntos distintos en la recta. Por ejemplo, si la recta pasa por (1, 2) y (3, 6), la pendiente es m = (6 − 2) / (3 − 1) = 4/2 = 2, significando que por cada unidad que avanzas horizontalmente, subes 2 unidades verticalmente. La pendiente es constante en toda la recta: cualquier par de puntos produce el mismo valor.',
            'El signo y la magnitud de la pendiente revelan la dirección e inclinación visual de la recta. Una pendiente positiva (m > 0) significa que la recta sube conforme te mueves de izquierda a derecha, como una escalera ascendente (por ejemplo, m = 2 o m = 1/3). Una pendiente negativa (m < 0) significa que la recta baja conforme te mueves de izquierda a derecha, como una rampa descendente (por ejemplo, m = −2). Una pendiente de cero (m = 0) significa que la recta es completamente horizontal, sin inclinación. Cuanto mayor sea el valor absoluto de la pendiente, más inclinada está la recta: |m| = 10 es casi vertical, mientras que |m| = 0.1 es casi horizontal.'
          ]
        },
        {
          id: 'ecuacion-de-la-recta',
          titulo: 'Ecuación de la recta',
          conceptos: [
            'La ecuación de una recta en su forma más útil es y = mx + b, llamada forma pendiente-ordenada al origen (o forma punto-pendiente). Aquí, m es la pendiente (la inclinación) y b es la ordenada al origen (el valor de y cuando x = 0), representando exactamente dónde cruza la recta el eje Y. Por ejemplo, la recta y = 2x + 3 tiene pendiente m = 2 (sube 2 por cada unidad horizontal) y cruza el eje Y en el punto (0, 3). Si tienes dos puntos y necesitas hallar la ecuación, primero calculas la pendiente, luego usas uno de los puntos para encontrar b: es un proceso mecánico y confiable.',
            'Las relaciones entre rectas se revelan mediante sus pendientes: dos rectas son paralelas (nunca se cruzan) si y solo si tienen exactamente la misma pendiente (m₁ = m₂). Por ejemplo, y = 2x + 3 e y = 2x − 5 son paralelas porque ambas tienen m = 2. Dos rectas son perpendiculares (forman un ángulo de 90°) si y solo si el producto de sus pendientes es −1, es decir, m₁ × m₂ = −1, o equivalentemente, m₂ = −1/m₁. Por ejemplo, si una recta tiene pendiente m = 2, una recta perpendicular a ella tiene pendiente −1/2. Estas relaciones de pendientes son herramientas poderosas para análisis geométrico y resolución de problemas sin necesidad de gráficos.'
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
            'La distancia entre dos puntos (x₁, y₁) y (x₂, y₂) en el plano cartesiano se calcula con la fórmula de distancia: d = √((x₂−x₁)² + (y₂−y₁)²), que es una aplicación directa del teorema de Pitágoras. Geométricamente, formas un triángulo rectángulo imaginario donde los catetos son el cambio horizontal (x₂−x₁) y el cambio vertical (y₂−y₁), y la hipotenusa es la distancia que buscas. Por ejemplo, la distancia entre (1, 2) y (4, 6) es d = √((4−1)² + (6−2)²) = √(9 + 16) = √25 = 5 unidades. Esta fórmula funciona siempre, generando distancias positivas sin importar el orden de los puntos.',
          ]
        },
        {
          id: 'punto-medio',
          titulo: 'Punto medio',
          conceptos: [
            'El punto medio de un segmento es el punto que se ubica exactamente a la mitad de la distancia entre los dos extremos del segmento, dividiéndolo en dos partes iguales. Se calcula promediando las coordenadas de los puntos extremos: si los extremos son (x₁, y₁) y (x₂, y₂), el punto medio es M = ((x₁+x₂)/2, (y₁+y₂)/2). Por ejemplo, el punto medio entre (2, 4) y (8, 10) es M = ((2+8)/2, (4+10)/2) = (5, 7). Este concepto es útil en geometría (encontrar centros de figuras), en análisis de datos (hallar promedios posicionales), y en bisección de segmentos.',
            'La fórmula del punto medio es M = ((x₁+x₂)/2, (y₁+y₂)/2), donde simplemente promedias cada coordenada independientemente. La coordenada x del punto medio es el promedio de las x de los extremos; la coordenada y es el promedio de las y. Por ejemplo, entre (−3, 5) y (7, 1), el punto medio es M = ((−3+7)/2, (5+1)/2) = (2, 3). Esta fórmula es rápida, confiable, y fundamental: la usarás constantemente en geometría analítica, y es tan simple que cometería un error al calcularla solo por distracción, no por falta de comprensión.'
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
            'Las tablas organizan datos en filas y columnas para facilitar su lectura, comparación y análisis rápido. Por ejemplo, una tabla de precios de frutas por kg podría mostrar "Manzana: $25, Plátano: $15, Naranja: $30" en filas y columnas claramente diferenciadas. Estructurar así los datos permite identificar patrones y patrones visuales sin hacer cálculos complejos.'
          ]
        },
        {
          id: 'frecuencias',
          titulo: 'Frecuencias',
          conceptos: [
            'La frecuencia absoluta indica cuántas veces aparece un valor específico en un conjunto de datos. Por ejemplo, si preguntamos a 20 estudiantes su color favorito y 8 dicen azul, entonces la frecuencia absoluta del color azul es 8. Esta medida es el primer paso para entender la distribución bruta de los datos.',
            'La frecuencia relativa es la frecuencia absoluta dividida entre el número total de datos, expresando la proporción como fracción, decimal o porcentaje. Por ejemplo, si 8 de 20 estudiantes eligen azul, la frecuencia relativa es 8/20 = 0.4 o 40%. Esta medida permite comparar frecuencias en muestras de tamaños distintos.'
          ]
        },
        {
          id: 'graficas-barras',
          titulo: 'Gráficas de barras',
          conceptos: [
            'Las gráficas de barras representan datos mediante barras horizontales o verticales cuya altura o longitud es proporcional a la cantidad que representan, permitiendo comparar visualmente entre categorías distintas. Por ejemplo, una gráfica mostrando "Ventas por trimestre: Q1=100, Q2=150, Q3=120, Q4=180" permite ver al instante que Q4 tuvo mayores ventas. La altura relativa de las barras hace evidente la comparación sin necesidad de leer números específicos.'
          ]
        },
        {
          id: 'graficas-circulares',
          titulo: 'Gráficas circulares',
          conceptos: [
            'Las gráficas circulares (o "de pastel") dividen un círculo en sectores cuya área es proporcional a la cantidad que cada categoría representa del total, mostrando partes de un todo. Por ejemplo, en una encuesta donde 40% prefiere cine, 35% prefiere música y 25% prefiere deportes, cada sector ocupa el 40%, 35% y 25% del círculo respectivamente. Este formato es excelente para visualizar composiciones porcentuales de un conjunto completo.'
          ]
        },
        {
          id: 'graficas-lineales',
          titulo: 'Gráficas lineales',
          conceptos: [
            'Las gráficas lineales representan la evolución de un valor a lo largo del tiempo conectando puntos sucesivos mediante líneas rectas, permitiendo visualizar cambios continuos. Por ejemplo, una gráfica de temperatura diaria durante una semana (Lun=20°C, Mar=22°C, Mié=21°C, Jue=25°C) muestra visualmente cómo subió después del miércoles. La línea conecta cada punto y revela la trayectoria del cambio de forma inmediata.',
            'Las gráficas lineales son particularmente efectivas para detectar tendencias (patrones generales de crecimiento, decrecimiento o estabilidad) sobre períodos largos. Por ejemplo, los gráficos de temperatura mensual de un año permiten identificar si el clima está calentándose o enfriándose en el largo plazo, algo que una tabla de números haría mucho más difícil de ver. Las líneas ascendentes o descendentes comunican la tendencia visual y claramente.'
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
            'La media se calcula sumando todos los datos de un conjunto y dividiendo el total entre la cantidad de datos. Por ejemplo, si las calificaciones de un estudiante en 4 exámenes son 7, 8, 9 y 10, la media es (7+8+9+10)/4 = 34/4 = 8.5. La media representa el valor "central" promedio y es la medida de tendencia central más común en estadística.',
            'La media es muy sensible a valores extremos: un solo dato anormalmente alto o bajo puede desviarla significativamente. Por ejemplo, en el conjunto {2, 3, 4, 5, 100}, la media es 22.8 (muy por encima de la mayoría de datos), mientras que sin el 100 sería 3.5. En estos casos, la mediana o la moda pueden ser medidas más representativas del conjunto.'
          ]
        },
        {
          id: 'mediana',
          titulo: 'Mediana',
          conceptos: [
            'La mediana es el valor que se ubica exactamente en el centro cuando todos los datos se ordenan de menor a mayor, dividiendo el conjunto en dos mitades iguales. Por ejemplo, en el conjunto {3, 7, 9, 15, 20} ordenado, la mediana es 9 (tiene 2 datos menores y 2 mayores). La mediana no se afecta por valores extremos, lo que la hace más robusta que la media en datos con outliers.',
            'Cuando el número total de datos es par, no existe un valor central único; en este caso se promedian los dos valores centrales. Por ejemplo, en {1, 4, 6, 8}, los dos valores centrales son 4 y 6, así que la mediana es (4+6)/2 = 5. Este ajuste mantiene la propiedad de dividir el conjunto en dos mitades iguales.'
          ]
        },
        {
          id: 'moda',
          titulo: 'Moda',
          conceptos: [
            'La moda es el valor que aparece con mayor frecuencia en un conjunto de datos, es decir, el que más se repite. Por ejemplo, en {1, 2, 2, 3, 3, 3, 4, 4, 4, 4}, la moda es 4 porque aparece 4 veces, más que cualquier otro valor. La moda es especialmente útil en datos cualitativos (colores, marcas, sabores) donde la media no tiene sentido.',
            'Un conjunto puede tener ninguna moda (cuando todos los valores aparecen igual número de veces), una moda (unimodal), dos modas (bimodal) o más de dos modas (multimodal). Por ejemplo, en {1, 1, 2, 2, 3} hay dos modas (1 y 2 aparecen dos veces cada uno), mientras que en {1, 2, 3, 4} no hay moda. Reconocer si hay una, varias o ninguna moda es crucial para interpretar correctamente la distribución.'
          ]
        },
        {
          id: 'rango-estadistico',
          titulo: 'Rango',
          conceptos: [
            'El rango se calcula restando el valor mínimo al valor máximo de un conjunto de datos: Rango = máximo − mínimo. Por ejemplo, en las edades {15, 18, 22, 45, 50}, el máximo es 50 y el mínimo es 15, así que el rango es 50−15 = 35. El rango es la medida más simple de dispersión y ofrece una perspectiva rápida sobre la amplitud total de los datos.',
            'El rango proporciona una idea inicial de qué tan dispersos o concentrados están los datos, pero tiene limitaciones: un solo valor extremo puede aumentarlo dramáticamente sin que el resto de datos cambien. Por ejemplo, {1, 2, 3, 4, 1000} tiene rango 999 aunque la mayoría de datos está entre 1 y 4. A pesar de esto, es útil como medida rápida de variabilidad.'
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
            'Antes de leer números específicos, identifica qué representa cada fila y cada columna: encabezados de filas indican categorías (ciudades, marcas, semanas) y encabezados de columnas indican variables medidas (ventas, temperatura, cantidad). Por ejemplo, una tabla de "Ventas por producto-mes" tiene productos en filas y meses en columnas; entender esta estructura es fundamental antes de extraer datos. Sin esta claridad estructural, los números pierden contexto.',
            'Busca patrones clave: el valor máximo (¿dónde está la cantidad más grande?), el mínimo (¿dónde está la más pequeña?), y la tendencia general (¿aumentan o disminuyen los valores en general?). Por ejemplo, si en una tabla de ingresos trimestrales ves que Q1=100, Q2=105, Q3=110, Q4=115, la tendencia es crecimiento constante. Identificar estos patrones antes de sacar conclusiones evita interpretaciones incorrectas.'
          ]
        },
        {
          id: 'interpretacion-graficas-datos',
          titulo: 'Interpretación de gráficas',
          conceptos: [
            'Antes de leer cualquier valor específico, identifica qué representa cada eje: el eje X (horizontal) usualmente muestra categorías o tiempo, y el eje Y (vertical) muestra la magnitud medida. Por ejemplo, en una gráfica de "Temperatura vs. Mes del año", X=meses (Ene, Feb, Mar...) e Y=grados Celsius. Sin esta claridad en los ejes, cualquier número que leas queda sin significado y las conclusiones serán erróneas.',
            'Enfócate en la tendencia general (patrón global de suba, baja o estabilidad) más que en fluctuaciones pequeñas de un solo punto. Por ejemplo, si una gráfica de ventas tiene puntos de 100, 102, 98, 105, 101, la tendencia es horizontal/estable (promedio cercano a 101), aunque hay pequeñas variaciones punto a punto. Distinguir ruido (variación pequeña) de tendencia (cambio significativo) es crucial para evitar conclusiones apresuradas.'
          ]
        },
        {
          id: 'comparacion-datos',
          titulo: 'Comparación de datos',
          conceptos: [
            'Al comparar dos conjuntos de datos, siempre usa las mismas unidades y bajo el mismo criterio para que la comparación sea válida y justa. Por ejemplo, comparar "40% de estudiantes aprueban" con "35% de trabajadores ahorran" es válido (ambos son porcentajes), pero comparar "10 kg de manzanas" con "5 litros de agua" no tiene sentido directo (unidades distintas). Asegurar equivalencia en unidades y contexto previene conclusiones equivocadas.',
            'Ten cuidado con gráficas engañosas que distorsionan la percepción visual mediante escalas manipuladas, especialmente cuando el eje comienza en un valor distinto a cero en lugar del cero. Por ejemplo, una gráfica de ventas 100, 101, 102, 103 puede parecer un crecimiento explosivo si el eje Y comienza en 99 en lugar de 0. Revisa siempre dónde empieza y termina cada eje; una escala honesta comienza en cero para variables que lo permiten.'
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
            'El espacio muestral es el conjunto completo de todos los resultados posibles que pueden ocurrir en un experimento aleatorio. Por ejemplo, al lanzar un dado de 6 caras, el espacio muestral es S={1, 2, 3, 4, 5, 6}, y al lanzar una moneda, es S={cara, sello}. El espacio muestral es el punto de partida obligatorio para cualquier cálculo de probabilidad; sin definirlo claramente, no puedes cuantificar la probabilidad de ningún evento.'
          ]
        },
        {
          id: 'eventos',
          titulo: 'Eventos',
          conceptos: [
            'Un evento es cualquier subconjunto posible del espacio muestral, es decir, un resultado o grupo de resultados de interés en un experimento. Por ejemplo, al lanzar un dado, el evento "sacar un número par" es E={2, 4, 6}. Otro evento podría ser "sacar un número mayor que 3" que es E={4, 5, 6}. Los eventos pueden contener un solo resultado (evento simple) o múltiples resultados (evento compuesto), y son los "sucesos" cuya probabilidad queremos calcular.'
          ]
        },
        {
          id: 'sucesos',
          titulo: 'Sucesos',
          conceptos: [
            'Un suceso seguro es un evento que ocurre con certeza absoluta en cualquier realización del experimento, con probabilidad igual a 1. Por ejemplo, al lanzar un dado, el suceso "obtener un número entre 1 y 6" es seguro, porque cualquier resultado posible lo cumple. Un suceso imposible es lo opuesto: un evento que nunca puede ocurrir, con probabilidad 0, como "obtener un 7 en un dado de 6 caras". Estos dos casos extremos definen los límites de la escala de probabilidad (0 a 1).'
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
            'La probabilidad simple de un evento se calcula dividiendo el número de casos favorables entre el número total de casos posibles: P(evento) = casos favorables ÷ casos posibles. Por ejemplo, al lanzar un dado, la probabilidad de obtener un 4 es 1/6 ≈ 0.167 o 16.7%, porque hay 1 caso favorable (el 4) y 6 casos posibles (1, 2, 3, 4, 5, 6). Esta es la definición clásica de probabilidad.',
            'El resultado de una probabilidad simple siempre está entre 0 y 1 (inclusive), o equivalentemente entre 0% y 100%, siendo imposible una probabilidad negativa o mayor que 1. Un valor de 0 significa imposible (nunca ocurre), 0.5 significa igualmente probable, y 1 significa seguro (siempre ocurre). Expresar probabilidades como decimales (0.25), fracciones (1/4) o porcentajes (25%) son formas equivalentes y válidas.'
          ]
        },
        {
          id: 'probabilidad-compuesta',
          titulo: 'Probabilidad compuesta',
          conceptos: [
            'La probabilidad compuesta calcula la probabilidad de que ocurran dos o más eventos de forma simultánea o secuencial. Por ejemplo, la probabilidad de obtener un 4 en la primera tirada de un dado Y un 5 en la segunda tirada es una probabilidad compuesta. Este tipo de problemas es más complejo que los simples porque deben considerarse múltiples eventos y sus relaciones.',
            'Cuando los eventos son independientes (el resultado de uno no afecta al otro), la probabilidad compuesta se calcula multiplicando las probabilidades individuales: P(A y B) = P(A) × P(B). Por ejemplo, lanzar dos monedas tiene P(cara y cara) = (1/2) × (1/2) = 1/4. Si los eventos son dependientes (el resultado del primero afecta el segundo), la fórmula incluye probabilidades condicionales y es más compleja.'
          ]
        },
        {
          id: 'probabilidad-complementaria',
          titulo: 'Probabilidad complementaria',
          conceptos: [
            'La probabilidad complementaria de un evento A es la probabilidad de que A NO ocurra, calculada como P(no A) = 1 − P(A). Por ejemplo, si la probabilidad de lluvia es 0.3 (30%), entonces la probabilidad de no lluvia es 1 − 0.3 = 0.7 (70%). El complemento es útil porque cualquier evento y su complemento agotan todas las posibilidades: siempre ocurre uno u otro, sin terceras opciones.',
            'La probabilidad complementaria es especialmente útil como estrategia cuando calcular el complemento es más sencillo que calcular el evento original directamente. Por ejemplo, "al menos un 6 en 3 lanzamientos de dado" es complicado de calcular directo, pero su complemento "ningún 6 en 3 lanzamientos" es simple: (5/6)³ ≈ 0.579, así que P(al menos un 6) = 1 − 0.579 ≈ 0.421. Esta inversión de perspectiva simplifica muchos problemas.'
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
            'Una secuencia aritmética es una sucesión donde cada término se obtiene sumando (o restando) una misma cantidad constante al término anterior. Por ejemplo, la secuencia 2, 5, 8, 11, 14 es aritmética: cada término suma 3 al anterior (2+3=5, 5+3=8, 8+3=11, etc.). El patrón es lineal y predecible, lo que facilita hallar cualquier término sin calcular los anteriores.',
            'La cantidad fija que se suma a cada término se llama razón común o diferencia común (notada como d). En el ejemplo anterior, d=3. Si d es positivo, la secuencia crece; si es negativo, decrece. Por ejemplo, 20, 17, 14, 11... tiene d=−3 (resta 3 cada vez). La fórmula general es aₙ = a₁ + (n−1)d, donde a₁ es el primer término, n es la posición, y aₙ es el término en la posición n.'
          ]
        },
        {
          id: 'secuencias-geometricas',
          titulo: 'Secuencias geométricas',
          conceptos: [
            'Una secuencia geométrica es una sucesión donde cada término se obtiene multiplicando el término anterior por una misma cantidad constante. Por ejemplo, la secuencia 3, 6, 12, 24, 48 es geométrica: cada término es el anterior multiplicado por 2 (3×2=6, 6×2=12, 12×2=24, etc.). El crecimiento es exponencial (rápido), no lineal como en las aritméticas.',
            'La cantidad fija por la que se multiplica cada término se llama razón geométrica (notada como r). En el ejemplo, r=2. Si r>1, la secuencia crece exponencialmente; si 0<r<1, decrece (ej: 100, 50, 25, 12.5... tiene r=0.5). La fórmula general es aₙ = a₁ × r^(n-1), donde a₁ es el primer término, n es la posición, y aₙ es el término en la posición n. Las secuencias geométricas modelan crecimientos (poblaciones, inversiones) y decrecimientos (desintegración radiactiva).'
          ]
        },
        {
          id: 'patrones-numericos',
          titulo: 'Patrones numéricos',
          conceptos: [
            'Para identificar un patrón numérico en una secuencia, calcula las diferencias entre términos consecutivos: si las diferencias son constantes, es aritmética (d fijo); si las proporciones son constantes, es geométrica (r fijo); si las diferencias de las diferencias son constantes, es cuadrática. Por ejemplo, en 1, 4, 9, 16 (diferencias: 3, 5, 7; segundas diferencias: 2, 2), la segunda diferencia constante revela un patrón cuadrático (son cuadrados: 1², 2², 3², 4²). Este enfoque sistemático descodifica la mayoría de patrones de examen.'
          ]
        },
        {
          id: 'patrones-graficos',
          titulo: 'Patrones gráficos',
          conceptos: [
            'Los patrones gráficos siguen la misma lógica que los patrones numéricos, pero aplicada a atributos visuales como forma, color, cantidad o posición en lugar de números. Por ejemplo, una secuencia de figuras podría mostrar: triángulo rojo (1), cuadrado azul (2), pentágono verde (3), donde cada figura suma un lado y cambia de color en orden. Identifica qué atributo cambia (cantidad de lados, color, tamaño, orientación) de una figura a la siguiente y aplica ese patrón para predecir la siguiente figura. El análisis es visual pero su estructura lógica es idéntica a los patrones numéricos.'
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
            'En una serie numérica, identifica la operación o regla que transforma un término en el siguiente. Puede ser suma (1, 3, 5, 7: suma 2), resta (20, 17, 14, 11: resta 3), multiplicación (2, 6, 18, 54: multiplica por 3), división, o combinaciones más complejas (1, 2, 4, 7, 11: suma 1, 2, 3, 4... incrementalmente). Una vez descubiertas la regla, puedes predecir cualquier término futuro sin calcular todos los anteriores. El truco es probar varias operaciones hasta encontrar la consistente.'
          ]
        },
        {
          id: 'series-figurativas',
          titulo: 'Series figurativas',
          conceptos: [
            'En una serie figurativa, analiza sistemáticamente cómo cambian los atributos visuales entre figuras consecutivas: forma (número de lados, tipo), cantidad (de objetos), color (secuencia de colores), posición (rotación, traslación), o tamaño (crecimiento). Por ejemplo, un patrón podría mostrar triángulos → cuadrados → pentágonos (forma), o rojo → azul → verde (color). Una sola figura puede mostrar múltiples cambios simultáneamente; identifica cada atributo independientemente para descodificar el patrón completo y predecir la siguiente figura.'
          ]
        },
        {
          id: 'analogias-matematicas',
          titulo: 'Analogías matemáticas',
          conceptos: [
            'Una analogía matemática presenta dos pares de números con la estructura "A es a B como C es a ?" y requiere hallar el valor faltante. El primer paso es identificar la relación matemática entre A y B (¿suma?, ¿multiplicación?, ¿potencia?, ¿raíz?). Por ejemplo, si A=2, B=8, la relación podría ser B = A³ (2³=8). Una vez identificada, aplica la misma relación al segundo par: si C=3, entonces ?=3³=27.',
            'La clave es ser sistemático: prueba las operaciones básicas (suma, resta, multiplicación, división, potencias, raíces) entre A y B hasta encontrar la que da B. Luego aplica exactamente esa operación a C para hallar el resultado. Algunos problemas tienen relaciones más complejas (ej: B = 2A+3, o B = A² + A), así que si las operaciones básicas no funcionan, intenta combinaciones hasta encontrar el patrón correcto.'
          ]
        },
        {
          id: 'deduccion-logica',
          titulo: 'Deducción lógica',
          conceptos: [
            'La deducción lógica parte de un conjunto de datos o premisas conocidas como verdaderas y aplica reglas lógicas válidas para llegar a una conclusión que debe ser certera. Por ejemplo: "Todos los matemáticos entienden lógica. Juan es matemático. Entonces Juan entiende lógica." Esta conclusión es deducción pura. En exámenes, los problemas deductivos presentan hechos y piden encontrar qué conclusión es necesariamente verdadera.',
            'Para resolver problemas de deducción con múltiples datos, organiza la información en una tabla, diagrama o lista clara: esto hace visibles las conexiones lógicas que de otro modo se esconden entre líneas. Por ejemplo, si tienes 3 personas, 3 ciudades, 3 profesiones y restricciones sobre quién vive dónde y qué hace, una tabla donde marcas sí/no por cada combinación te permite descartar posibilidades sistemáticamente hasta encontrar la única solución lógica válida.'
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
            'Antes de escribir una sola operación, lee el problema completo de principio a fin para entender el contexto completo y qué exactamente te preguntan. Muchos errores ocurren porque los estudiantes empiezan a calcular a mitad de la lectura sin saber qué es lo que buscan. Por ejemplo, si un problema dice "Juan tiene 5 manzanas, compra 3 más, regala 2", pero pregunta "¿cuánto dinero gasta si cada manzana cuesta $1?", la respuesta no es solo 6 manzanas (5+3−2), sino 6×$1=$6. Identificar la pregunta exacta antes de calcular es crucial.',
            'Una vez identificada la pregunta, subraya todos los datos numéricos y las relaciones clave (quién hace qué, en qué orden, qué se compara). Por ejemplo, en "una tienda descuenta 20% a productos de más de $100", subraya "20%" (el descuento), "$100" (el umbral), y "descuenta si precio > $100" (la relación). Luego plantea la operación basado en estos datos organizados. Este enfoque sistemático previene confusiones y errores de cálculo.'
          ]
        },
        {
          id: 'interpretacion-informacion-cuantitativa',
          titulo: 'Interpretación de información cuantitativa',
          conceptos: [
            'Interpretar información cuantitativa significa convertir números, tablas y gráficas en conclusiones comprensibles en lenguaje simple. Por ejemplo, si una tabla muestra "2018: 100 usuarios, 2019: 150 usuarios, 2020: 225 usuarios", interpretar significa decir "El número de usuarios crece cada año: aumentó 50% de 2018 a 2019 y 50% de 2019 a 2020, sugiriendo crecimiento acelerado." Practicar esta traducción te entrena a encontrar el significado detrás de los números.',
            'Antes de comparar dos cantidades cuantitativas, verifica siempre que las unidades sean idénticas y que representen lo mismo. Por ejemplo, no puedes comparar "5 metros de tela" con "5 segundos de video" directamente porque tienen unidades incomparables (distancia vs tiempo). En exámenes, revisa que si comparan "% de aumento" con "cantidad de aumento" estén midiendo lo mismo, o si hay conversiones necesarias (ej: kg vs gramos).'
          ]
        },
        {
          id: 'modelacion-matematica',
          titulo: 'Modelación matemática',
          conceptos: [
            'La modelación matemática consiste en traducir una situación real (un problema de la vida cotidiana) en un modelo matemático: números, ecuaciones, funciones o gráficas que lo representan de forma simplificada. Por ejemplo, "Una empresa gana $1000 fijo mensual más $5 por cada producto vendido" se modela como G(x) = 1000 + 5x, donde x es la cantidad de productos. El modelo captura la esencia del problema en forma matemática, permitiendo cálculos, predicciones y análisis.',
            'El modelado matemático es el puente que une lo concreto (situaciones reales) con lo abstracto (herramientas matemáticas). Sin este puente, los números de un examen carecen de sentido. Con un buen modelo, el problema real se convierte en manipulaciones matemáticas manejables. Por ejemplo, modelar "crecimiento de bacterias" como función exponencial permite predecir cuándo la población será excesiva. Dominar esta habilidad es crucial no solo en exámenes sino en carreras científicas y de ingeniería.'
          ]
        },
        {
          id: 'estimacion-resultados',
          titulo: 'Estimación de resultados',
          conceptos: [
            'La estimación es una técnica donde redondeas números a valores más simples, realizas el cálculo aproximado, y obtienes una idea rápida de si tu respuesta final debería estar en ese rango. Por ejemplo, para 23.7 × 48.2, redondea a 24 × 48 ≈ 1200 (mental: 24 × 50 − 24 × 2 = 1200 − 48 ≈ 1152). El resultado exacto es 1142.34, que está muy cercano a la estimación. Si hubiera salido 114 o 11423, la estimación habría alertado el error.',
            'Una estimación es una herramienta de verificación poderosa que detecta errores obvios sin necesidad de recalcular completamente. Por ejemplo, si un problema pide "¿Cuánto cuesta 100 artículos a $12 cada uno?" y tu calculadora da $1200, una estimación mental (100 × 12 ≈ 1200) confirma que es correcto. Si hubiera dado $120 o $12000, la estimación revelado el error de inmediato. En exámenes de selección múltiple, las estimaciones eliminan opciones claramente incorrectas en segundos.'
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
            'Las conversiones de longitud siguen una escala de potencias de 10 en el sistema métrico decimal: 1 km = 1,000 m; 1 m = 100 cm; 1 cm = 10 mm. Esta estructura permite conversión rápida: para pasar de km a m multiplica por 1,000; de m a cm multiplica por 100; de cm a mm multiplica por 10. Inversamente, para pasar de mm a cm divide entre 10. Por ejemplo, 2.5 km = 2.5 × 1,000 = 2,500 m, o 500 cm = 500 ÷ 100 = 5 m. Memorizar estas equivalencias es imprescindible para cualquier conversión de longitud.'
          ]
        },
        {
          id: 'conversion-area',
          titulo: 'Área',
          conceptos: [
            'El área siempre se mide en unidades cuadradas (m², cm², km²), que representan multiplicación de dos dimensiones de longitud. Por ejemplo, un cuadrado de 1 m × 1 m tiene área 1 m². Las medidas de área son: 1 km² = 1,000,000 m² (porque 1 km² = (1,000 m)² = 1,000,000 m²), y 1 m² = 10,000 cm² (porque 1 m² = (100 cm)² = 10,000 cm²). Estas conversiones cuadradas son muy distintas a las lineales de longitud.',
            'Al convertir unidades de área, el factor de conversión se eleva al cuadrado porque el área involucra dos dimensiones, no una. Por ejemplo, si 1 m = 100 cm (factor lineal = 100), entonces 1 m² = (100)² = 10,000 cm² (factor de área = 10,000). Este cuadrado es frecuente fuente de errores: los estudiantes olvidan elevar al cuadrado y escriben 1 m² = 100 cm², lo cual es incorrecto. Recuerda siempre: unidades lineales se convierten linealmente, unidades de área se convierten elevando al cuadrado.'
          ]
        },
        {
          id: 'conversion-volumen',
          titulo: 'Volumen',
          conceptos: [
            'El volumen se mide en unidades cúbicas (m³, cm³, km³), que representan multiplicación de tres dimensiones de longitud. Por ejemplo, un cubo de 1 m × 1 m × 1 m tiene volumen 1 m³. Las conversiones cúbicas son: 1 km³ = 1,000,000,000 m³ (porque 1 km³ = (1,000 m)³), y 1 m³ = 1,000,000 cm³ (porque 1 m³ = (100 cm)³ = 1,000,000 cm³). Estas conversiones cúbicas son radicalmente distintas a las lineales (longitud) y cuadradas (área).',
            'Al convertir unidades de volumen, el factor de conversión se eleva al cubo porque el volumen involucra tres dimensiones. Por ejemplo, si 1 m = 100 cm (factor lineal = 100), entonces 1 m³ = (100)³ = 1,000,000 cm³ (factor de volumen = 1,000,000). Este cubo es un error común: confundir 1 m³ = 100 cm³ (incorrecto) o 1 m³ = 10,000 cm³ (también incorrecto). Recuerda la regla: longitud se convierte linealmente (potencia 1), área se convierte al cuadrado (potencia 2), volumen se convierte al cubo (potencia 3).'
          ]
        },
        {
          id: 'conversion-masa',
          titulo: 'Masa',
          conceptos: [
            'Las conversiones de masa (peso) en el sistema métrico siguen potencias de 1,000: 1 kg = 1,000 g (kilogramo a gramo) y 1 tonelada = 1,000 kg (tonelada a kilogramo). Por ejemplo, 2.5 kg = 2.5 × 1,000 = 2,500 g, o 3 toneladas = 3 × 1,000 = 3,000 kg. A diferencia de la longitud (que usa potencias de 10, 100, 1,000), la masa salta directamente de g a kg (× 1,000) sin intermedios como hg o dag (aunque existen, rara vez se usan). Para examen, memoriza los dos saltos clave: 1 kg = 1,000 g y 1 tonelada = 1,000 kg.'
          ]
        },
        {
          id: 'conversion-tiempo',
          titulo: 'Tiempo',
          conceptos: [
            'Las conversiones de tiempo se basan en: 1 hora = 60 minutos y 1 minuto = 60 segundos, lo que da 1 hora = 3,600 segundos. Por ejemplo, 2.5 horas = 2.5 × 60 = 150 minutos, o 180 segundos = 180 ÷ 60 = 3 minutos. A diferencia del sistema métrico decimal (longitud, masa), el tiempo usa base 60 (sexagesimal), una herencia de la astronomía babilónica. Esta base no decimal complica cálculos: no puedes simplemente multiplicar o dividir por potencias de 10. Memoriza las conversiones clave: 1 hora = 60 min, 1 min = 60 s, y 1 hora = 3,600 s.'
          ]
        }
      ]
    }
  ]
}

export default lecturaMatematicas
