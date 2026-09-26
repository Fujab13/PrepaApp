// avisoPrivacidad.js
// Contenido del Aviso de privacidad (pages/AvisoPrivacidad.jsx, ruta
// /privacidad). Describe lo que la app HACE HOY según el código — si cambia
// qué datos se piden, quién los ve o a qué proveedor se mandan, este texto
// debe cambiar también, y con él VERSION_AVISO (queda guardada junto a cada
// aceptación: metadata del usuario al registrarse y formularios_area).
//
// BORRADOR redactado sin asesoría legal: antes de publicarlo en serio debe
// revisarlo alguien con experiencia en protección de datos personales en
// México, y hay que llenar los datos de RESPONSABLE (hoy son marcadores
// entre corchetes, visibles a propósito para que no pase desapercibido).

export const VERSION_AVISO = '2026-09-26'

export const RESPONSABLE = {
  nombre: '[Nombre o razón social del responsable]',
  domicilio: '[Domicilio del responsable]',
  correo: '[Correo de contacto para privacidad]',
}

// Cada sección: { titulo, parrafos?: string[], lista?: string[] }
export const SECCIONES = [
  {
    titulo: 'Quién es responsable de tus datos',
    parrafos: [
      `${RESPONSABLE.nombre}, con domicilio en ${RESPONSABLE.domicilio}, es responsable del uso y protección de tus datos personales en PrepaApp. Para cualquier tema de privacidad escríbenos a ${RESPONSABLE.correo}.`,
    ],
  },
  {
    titulo: 'Qué datos recabamos',
    lista: [
      'Tu cuenta: correo, contraseña (guardada cifrada) y el nombre de usuario que elijas, o los datos que comparte Google si entras con Google (nombre, correo y foto).',
      'Tu avance: progreso en lecciones, resultados del examen simulador y puntos del ranking semanal.',
      'Formulario de área (si lo llenas): nombre, edad, teléfono, correo de contacto, grado, área y carrera de interés, autoevaluación, preferencias de estudio, y nombre y teléfono de tu tutor o responsable.',
      'Compras: qué compraste y cuándo. Los datos de tu tarjeta los procesa Stripe; nosotros no los vemos ni los guardamos.',
      'Tutorías (si compras un lugar en una clase): tu nombre, correo y el teléfono que registres para el grupo de WhatsApp de la clase.',
    ],
  },
  {
    titulo: 'Para qué los usamos',
    lista: [
      'Darte acceso a la app y guardar tu progreso.',
      'Generar tu informe de preparación y tus resultados del examen.',
      'Mostrar el ranking semanal.',
      'Procesar tus compras y darte acceso a lo que compraste.',
      'Organizar las tutorías que contrates.',
    ],
  },
  {
    titulo: 'Quién más puede ver tus datos',
    lista: [
      'En el ranking semanal se muestran tu nombre de usuario y tus puntos (nunca tu correo).',
      'Maestros verificados por PrepaApp pueden consultar tu informe (formulario de área, resultados del examen y progreso) buscándote por tu correo.',
      'El maestro de una tutoría que compres ve tu nombre, correo y teléfono para organizar la clase.',
      'El equipo administrador de PrepaApp, para dar soporte.',
      'Proveedores que nos ayudan a operar: Supabase (base de datos y cuentas), Stripe (pagos), el servicio de alojamiento de la app, Google (solo si entras con Google) y Gravatar (para mostrar la foto ligada a tu correo, si tienes una; solo se le envía una huella cifrada del correo, no el correo).',
    ],
    parrafos: ['No vendemos tus datos personales.'],
  },
  {
    titulo: 'Si eres menor de edad',
    parrafos: [
      'PrepaApp está pensada para estudiantes de preparatoria, muchos de ellos menores de 18 años. Si eres menor, necesitas que tu madre, padre o tutor autorice que uses la app y compartas tus datos. Ellos pueden pedirnos en cualquier momento ver, corregir o borrar tus datos.',
    ],
  },
  {
    titulo: 'Tus derechos',
    parrafos: [
      'Puedes acceder a tus datos, corregirlos, pedir que los borremos u oponerte a su uso (derechos ARCO), y retirar tu consentimiento.',
      `Desde la app: en Ajustes → Tus datos puedes borrar tus resultados del examen y tu formulario de área. Para cualquier otra solicitud escríbenos a ${RESPONSABLE.correo}.`,
    ],
  },
  {
    titulo: 'Cuánto tiempo los guardamos',
    parrafos: [
      'Mientras tengas tu cuenta, o hasta que los borres. Del examen simulador solo conservamos tu resultado más reciente.',
    ],
  },
  {
    titulo: 'Cambios a este aviso',
    parrafos: [
      'Si cambiamos este aviso lo publicaremos en esta misma página con su nueva fecha de actualización.',
    ],
  },
]
