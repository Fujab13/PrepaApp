const lecturaIngenierias = {
  id: 'ingenierias', // debe coincidir exactamente con el id en MATERIAS
  temas: [
    {
      id: 'ley-de-ohm',
      titulo: 'Ley de Ohm y Circuitos',
      contenido: `Establece que la corriente (I) que fluye por un conductor es directamente proporcional al voltaje (V) e inversamente proporcional a la resistencia (R), expresado como V = I * R. Es la base para analizar circuitos en serie y paralelo.`
    },
    {
      id: 'estatica-y-equilibrio',
      titulo: 'Estática y Sistemas de Fuerzas',
      contenido: `Estudia los cuerpos en reposo. Para que un sistema esté en equilibrio mecánico, la suma vectorial de todas las fuerzas externas debe ser cero (equilibrio de traslación) y la suma de los torques o momentos de fuerza también debe ser cero (equilibrio de rotación).`
    },
    {
      id: 'logica-y-algoritmia',
      titulo: 'Lógica y Estructuras de Control',
      contenido: `Fundamento del pensamiento de ingeniería y software. Un algoritmo es una serie de pasos ordenados para resolver un problema. Se compone de estructuras secuenciales, condicionales (if/else) y cíclicas o bucles (for/while).`
    },
    {
      id: 'calculo-y-funciones',
      titulo: 'Cálculo y Modelado Matemático',
      contenido: `Las funciones matemáticas modelan el comportamiento de sistemas reales. El cálculo diferencial estudia la razón de cambio instantánea (la derivada como la pendiente de la recta tangente), mientras que el cálculo integral determina el área bajo la curva.`
    }
  ]
}

export default lecturaIngenierias