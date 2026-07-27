const modulos = import.meta.glob('./lecciones/*.json', { eager: true, import: 'default' })

export const MATERIAS = Object.entries(modulos)
  .map(([ruta, datos]) => {
    const id = ruta.split('/').pop().replace(/\.json$/, '')

    return {
      id,
      nombre: datos?.nombre || datos?.titulo || id,
      icono: datos?.icono || 'FaBookOpen',
      color: datos?.color || '#7c5cbf',
      descripcion: datos?.descripcion || '',
      preguntas: Array.isArray(datos?.preguntas) ? datos.preguntas : [],
    }
  })
  .sort((a, b) => a.nombre.localeCompare(b.nombre))

export function getMateria(id) {
  return MATERIAS.find((m) => m.id === id) || null
}