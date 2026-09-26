// examenesDisponibles.js — Registro de exámenes propios (no premium) que se
// muestran en la pantalla de selección (SeleccionExamen.jsx) y que
// Examen.jsx resuelve por `id` (ver BANCOS_EXAMEN ahí). Los exámenes premium
// comprados en la Tienda NO pasan por aquí: siguen su propio flujo
// (Inventario.jsx → /examen/premium-<id>, ver services/examenesPremium.js).
import {
  FaGraduationCap, FaSquareRootAlt, FaUsers, FaLeaf, FaAtom, FaCogs,
  FaChartLine, FaBriefcase, FaBalanceScale,
} from 'react-icons/fa';
import { MdHistoryEdu } from 'react-icons/md';
import { PREGUNTAS as PREGUNTAS_GENERAL, SECCIONES as SECCIONES_GENERAL } from './examen.js';
import { PREGUNTAS as PREGUNTAS_HISTORIA, SECCIONES as SECCIONES_HISTORIA } from './examenHistoria.js';
import { PREGUNTAS as PREGUNTAS_MATEMATICAS, SECCIONES as SECCIONES_MATEMATICAS } from './examenMatematicas.js';
import { PREGUNTAS as PREGUNTAS_CIENCIAS_SOCIALES, SECCIONES as SECCIONES_CIENCIAS_SOCIALES } from './examenCienciasSociales.js';
import { PREGUNTAS as PREGUNTAS_CIENCIAS_NATURALES, SECCIONES as SECCIONES_CIENCIAS_NATURALES } from './examenCienciasNaturales.js';
import { PREGUNTAS as PREGUNTAS_CIENCIAS_EXACTAS, SECCIONES as SECCIONES_CIENCIAS_EXACTAS } from './examenCienciasExactas.js';
import { PREGUNTAS as PREGUNTAS_INGENIERIAS, SECCIONES as SECCIONES_INGENIERIAS } from './examenIngenierias.js';
import { PREGUNTAS as PREGUNTAS_ECONOMIA, SECCIONES as SECCIONES_ECONOMIA } from './examenEconomia.js';
import { PREGUNTAS as PREGUNTAS_ADMINISTRACION, SECCIONES as SECCIONES_ADMINISTRACION } from './examenAdministracion.js';
import { PREGUNTAS as PREGUNTAS_DERECHO, SECCIONES as SECCIONES_DERECHO } from './examenDerecho.js';

export const EXAMENES_DISPONIBLES = [
  {
    id: 'general',
    nombre: 'Examen General',
    color: '#f59e0b',
    Icono: FaGraduationCap,
    preguntas: PREGUNTAS_GENERAL,
    secciones: SECCIONES_GENERAL,
  },
  {
    id: 'historia',
    nombre: 'Examen de Historia',
    color: '#d8c468',
    Icono: MdHistoryEdu,
    preguntas: PREGUNTAS_HISTORIA,
    secciones: SECCIONES_HISTORIA,
  },
  {
    id: 'matematicas',
    nombre: 'Examen de Matemáticas',
    color: '#cf3b3b',
    Icono: FaSquareRootAlt,
    preguntas: PREGUNTAS_MATEMATICAS,
    secciones: SECCIONES_MATEMATICAS,
  },
  {
    id: 'ciencias-sociales',
    nombre: 'Examen de Sociales',
    color: '#a855f7',
    Icono: FaUsers,
    preguntas: PREGUNTAS_CIENCIAS_SOCIALES,
    secciones: SECCIONES_CIENCIAS_SOCIALES,
  },
  {
    id: 'ciencias-naturales',
    nombre: 'Examen de Naturales',
    color: '#22c55e',
    Icono: FaLeaf,
    preguntas: PREGUNTAS_CIENCIAS_NATURALES,
    secciones: SECCIONES_CIENCIAS_NATURALES,
  },
  {
    id: 'ciencias-exactas',
    nombre: 'Examen de Exactas',
    color: '#0ea5e9',
    Icono: FaAtom,
    preguntas: PREGUNTAS_CIENCIAS_EXACTAS,
    secciones: SECCIONES_CIENCIAS_EXACTAS,
  },
  {
    id: 'ingenierias',
    nombre: 'Examen de Ingenierías',
    color: '#f97316',
    Icono: FaCogs,
    preguntas: PREGUNTAS_INGENIERIAS,
    secciones: SECCIONES_INGENIERIAS,
  },
  {
    id: 'economia',
    nombre: 'Examen de Economía',
    color: '#14b8a6',
    Icono: FaChartLine,
    preguntas: PREGUNTAS_ECONOMIA,
    secciones: SECCIONES_ECONOMIA,
  },
  {
    id: 'administracion',
    nombre: 'Examen de Administración',
    color: '#ec4899',
    Icono: FaBriefcase,
    preguntas: PREGUNTAS_ADMINISTRACION,
    secciones: SECCIONES_ADMINISTRACION,
  },
  {
    id: 'derecho',
    nombre: 'Examen de Derecho',
    color: '#6366f1',
    Icono: FaBalanceScale,
    preguntas: PREGUNTAS_DERECHO,
    secciones: SECCIONES_DERECHO,
  },
];

export function obtenerExamenPropio(examenId) {
  return EXAMENES_DISPONIBLES.find((e) => e.id === examenId) ?? EXAMENES_DISPONIBLES[0];
}
