import { createElement, isValidElement } from 'react'
import { FaClipboardList, FaBriefcaseMedical, FaBoxOpen, FaBookOpen } from 'react-icons/fa'
import { PiMathOperationsFill } from 'react-icons/pi'

// Antes este archivo hacía `import * as XIcons from 'react-icons/X'` de 21
// paquetes distintos y armaba un iconSet gigante para buscar el ícono por
// nombre (string) en tiempo de ejecución. Como el lookup es dinámico,
// Rollup no puede saber cuáles íconos se usan y no podía eliminar el resto
// de cada paquete (~4,000 íconos por paquete en varios de ellos) — eso
// eran ~30MB del bundle final de producción para solo los 6 íconos que
// realmente se usan (rastreados en data/unidades.js vía
// leccionesGratis.js, los JSON de lecciones y storeItems.js).
//
// Si agregas una materia o producto con un ícono nuevo, impórtalo arriba
// (named import de react-icons) y agrégalo a iconSet — así Rollup solo
// empaqueta los íconos que de verdad usa la app.
const iconSet = {
  FaClipboardList,
  FaBriefcaseMedical,
  FaBoxOpen,
  FaBookOpen,
  PiMathOperationsFill,
}

export function renderIconoMateria(icono, props = {}) {
  if (!icono) return null

  if (isValidElement(icono)) return icono

  const iconName = typeof icono === 'string' ? icono : ''
  const Icono = iconSet[iconName]

  if (!Icono) return null

  return createElement(Icono, { size: 20, ...props })
}
