// services/usuario.js
// Nombre de usuario público (perfiles.usuario), el que se ve en el ranking.
// Las reglas son las mismas que valida la base (migración
// 20260926170000_usuario_perfil.sql): 3–20 caracteres, a-z, 0-9, "_" y ".".
// Aquí solo se replican para avisar ANTES de enviar; la base tiene la última
// palabra (formato, unicidad).
import { supabase } from './supabaseClient'

export const USUARIO_REGEX = /^[a-z0-9_.]{3,20}$/

// Normaliza lo que se escribe: minúsculas y sin caracteres no permitidos.
export function limpiarUsuario(texto) {
  return (texto || '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20)
}

// Palabras para las sugerencias. MISMA lista que generar_usuario_base() en
// la base (migración 20260926180000_usuario_generico_seguro.sql): si se
// cambia una, cambiar la otra.
export const PALABRAS_USUARIO = [
  'cometa', 'lince', 'atomo', 'pixel', 'nova', 'orbita', 'quasar', 'fenix',
  'colibri', 'jaguar', 'ajolote', 'neutron', 'vector', 'prisma', 'delta',
  'sigma', 'galaxia', 'halcon', 'puma', 'nebula',
]

// Iniciales de la parte del correo antes de la @ ("mariana.lopez" → "ml",
// "juanperez2009" → "j"): lo único del correo que usan las sugerencias, para
// que se sientan del alumno sin dejar reconstruir su correo.
export function inicialesDeCorreo(email) {
  const local = (email || '').split('@')[0].toLowerCase()
  const partes = local.split(/[^a-z]+/).filter(Boolean)
  const ini = partes.map(p => p[0]).join('').slice(0, 2)
  return ini || 'a'
}

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)]
const numero = (min, max) => Math.floor(min + Math.random() * (max - min + 1))

// Sugerencias "seguras": iniciales + palabra (+ número), nunca la parte del
// correo completa ni un simple agregado a ella. Todas cumplen el formato
// (3–20, a-z 0-9 _ .); la disponibilidad se revisa aparte.
export function sugerenciasSeguras(email, cantidad = 4) {
  const ini = inicialesDeCorreo(email)
  const plantillas = [
    () => `${ini}.${azar(PALABRAS_USUARIO)}`,
    () => `${azar(PALABRAS_USUARIO)}_${ini}${numero(10, 99)}`,
    () => `${azar(PALABRAS_USUARIO)}${numero(100, 999)}`,
    () => `${ini}_${azar(PALABRAS_USUARIO)}${numero(1, 9)}`,
  ]
  const salida = new Set()
  for (let i = 0; salida.size < cantidad && i < cantidad * 6; i++) {
    salida.add(plantillas[i % plantillas.length]())
  }
  return [...salida]
}

// Variaciones de lo que el alumno YA escribió (su propia elección, no su
// correo): con palabra ("luna.nova", "cometa_luna") y con número
// ("luna_27", "luna482"). La base se recorta para que cada variación quepa
// en 20 caracteres.
export function variacionesDeUsuario(escrito, cantidad = 6) {
  const base = limpiarUsuario(escrito).replace(/[._]+$/, '')
  if (base.length < 3) return []
  const cabe = (sufijo) => base.slice(0, 20 - sufijo.length)
  const plantillas = [
    () => { const s = `.${azar(PALABRAS_USUARIO)}`; return cabe(s) + s },
    () => { const s = `_${numero(10, 99)}`; return cabe(s) + s },
    () => { const p = `${azar(PALABRAS_USUARIO)}_`; return p + base.slice(0, 20 - p.length) },
    () => { const s = `${numero(100, 999)}`; return cabe(s) + s },
    () => { const s = `_${azar(PALABRAS_USUARIO)}${numero(1, 9)}`; return cabe(s) + s },
  ]
  const salida = new Set()
  for (let i = 0; salida.size < cantidad && i < cantidad * 6; i++) {
    const v = plantillas[i % plantillas.length]()
    if (v !== base && USUARIO_REGEX.test(v)) salida.add(v)
  }
  return [...salida]
}

// Mensaje corto si el formato no es válido; null si está bien.
export function validarUsuario(usuario) {
  if (!usuario || usuario.length < 3) return 'Mínimo 3 caracteres.'
  if (!USUARIO_REGEX.test(usuario)) return 'Solo letras, números, "_" y ".".'
  return null
}

// 'invalido' | 'no_permitido' (lista de usuarios_prohibidos en la base) |
// 'ocupado' | 'libre'. La lista de palabras prohibidas solo la conoce la
// base, por eso este chequeo no se replica aquí.
export async function estadoUsuario(usuario) {
  const { data, error } = await supabase.rpc('estado_usuario', { p_usuario: usuario })
  if (error) throw error
  return data
}

// true solo si está libre Y permitido (la usan las sugerencias).
export async function usuarioDisponible(usuario) {
  const { data, error } = await supabase.rpc('usuario_disponible', { p_usuario: usuario })
  if (error) throw error
  return data === true
}

// Lanza Error con un mensaje listo para mostrar.
export async function cambiarMiUsuario(usuario) {
  const { data, error } = await supabase.rpc('cambiar_mi_usuario', { p_usuario: usuario })
  if (error) {
    if (error.message?.includes('usuario_ocupado')) throw new Error('Ese usuario ya está en uso.')
    if (error.message?.includes('usuario_invalido')) throw new Error('Usuario no válido.')
    if (error.message?.includes('usuario_no_permitido')) throw new Error('Ese usuario no está permitido.')
    throw new Error('No se pudo guardar. Intenta más tarde.')
  }
  return data
}
