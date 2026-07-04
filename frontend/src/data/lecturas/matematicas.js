const lecturaMatematicas = {
  id: 'matematicas', // debe coincidir exactamente con el id en MATERIAS
  temas: [
    {
    id: 'derivada-potencia',
    titulo: 'Regla de la potencia',
    contenido: `
    La derivada de una potencia se calcula mediante:
    $$
    \\frac{d}{dx}(x^n)=nx^{n-1}
    $$
    Ejemplo:
    $$
    \\frac{d}{dx}(x^3)=3x^2
    $$
    `
    },
    {
      id: 'funciones-trigonometricas',
      titulo: 'Trigonometría y Triángulos',
      contenido: `Se basa en las relaciones de los lados de un triángulo rectángulo respecto a sus ángulos: seno (co/hip), coseno (ca/hip) y tangente (co/ca). Para triángulos no rectángulos, se aplican las leyes de senos y cosenos.`
    },
    {
      id: 'geometria-analitica-recta',
      titulo: 'Geometría Analítica: La Recta',
      contenido: `Estudia las figuras geométricas mediante un sistema de coordenadas. La recta se define por su pendiente ($m$), que indica la inclinación, y su ecuación implícita o explícita ($y = mx + b$), donde $b$ es la intersección con el eje Y.`
    },
    {
      id: 'estadistica-descriptiva',
      titulo: 'Estadística y Probabilidad Básica',
      contenido: `La estadística descriptiva resume datos mediante medidas de tendencia central: media (promedio), mediana (dato central) y moda (dato más repetido). La probabilidad mide la certeza de un evento entre 0 y 1 (o 0% a 100%).`
    }
  ]
}

export default lecturaMatematicas