// PreguntasFrecuentes.jsx
// Centro de ayuda de la aplicacion. Las preguntas se mantienen en la propia
// pagina para que puedan abrirse sin esperar datos o autenticacion.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiOutlineClose } from 'react-icons/ai'
import { FiChevronDown } from 'react-icons/fi'

const PREGUNTAS = [
  {
    categoria: 'Cuenta y acceso',
    preguntas: [
      ['¿Como inicio sesion o creo mi cuenta?', 'Abre el menu y selecciona ( Iniciar sesion ). Si todavia no tienes cuenta, elige ( Crear cuenta ) dentro de ese mismo proceso; solo necesitaras seguir los pasos indicados.'],
      ['¿Olvide mi contraseña?', 'En la pantalla ( Iniciar sesion ), selecciona ( Olvidaste tu contraseña ) y escribe el correo asociado a tu cuenta. Te enviaremos un enlace seguro para elegir una contraseña nueva.'],
      ['¿Puedo cambiar mi nombre de usuario?', 'Si. En Ajustes, entra en ( Tu cuenta ) y pulsa ( Cambiar ). El nuevo nombre se guardara en tu perfil y podras verlo reflejado en funciones como el ranking.'],
    ],
  },
  {
    categoria: 'Estudio y examen',
    preguntas: [
      ['¿Como elijo el area que quiero estudiar?', 'Desde el menu abre ( Formulario Area ) y responde las opciones disponibles. Tus elecciones ayudan a personalizar las materias y puedes modificarlas mas adelante.'],
      ['¿Como inicio un examen simulador?', 'Abre ( Examen Simulador ), elige la prueba que deseas presentar y pulsa ( Empezar ). Al finalizar podras consultar tus respuestas y el resultado obtenido.'],
      ['¿Por que no aparece mi resultado?', 'Asegurate de haber terminado la prueba y de mantener una conexion estable. Si acabas de enviar el examen, espera unos segundos para que el resultado termine de sincronizarse.'],
      ['¿Las lecciones y lecturas afectan mi progreso?', 'Si. La actividad que completas se utiliza para medir tu avance, mantener tu racha y mostrarte las materias en las que conviene seguir practicando.'],
    ],
  },
  {
    categoria: 'Notificaciones y recordatorios',
    preguntas: [
      ['¿Como configuro mis recordatorios de estudio?', 'Ve a Ajustes y entra en Notificaciones. Activa los recordatorios y elige entre Diario, Cada 3 dias o Semanal, y despues selecciona la hora en que prefieras recibirlos.'],
      ['No recibo las notificaciones, ¿que puedo hacer?', 'Comprueba que los recordatorios esten activados en Ajustes y revisa los permisos del navegador o dispositivo. Si aparecen bloqueados, permitelos desde el icono del candado junto a la direccion.'],
      ['¿Mis preferencias se conservan en otros dispositivos?', 'Si inicias sesion con la misma cuenta, tus preferencias pueden sincronizarse. Aun asi, cada dispositivo necesita tener permitidas las notificaciones para recibirlas.'],
    ],
  },
  {
    categoria: 'Musica, mascota e inventario',
    preguntas: [
      ['¿Puedo desactivar la musica o cambiar el volumen?', 'Si. Desde Ajustes, entra en Musica para desactivar la musica enriquecida. En el apartado ( Volumen ) puedes ajustar por separado la musica de fondo, la musica enriquecida y la voz de lectura.'],
      ['¿Para que sirven las mascotas?', 'Las mascotas son compañeras de tu progreso y pueden personalizarse desde la seccion ( Mascotas ). Algunas apariencias especiales tambien pueden obtenerse en la tienda.'],
      ['¿Donde encuentro los objetos que he obtenido?', 'Todos los objetos que hayas comprado o desbloqueado estaran disponibles en ( Inventario ), donde podras revisarlos y utilizarlos segun corresponda.'],
    ],
  },
  {
    categoria: 'Datos y privacidad',
    preguntas: [
      ['¿Como puedo borrar mis datos?', 'En Ajustes, entra en Tus datos para encontrar una opcion por cada tipo de informacion. Pulsa la que quieres eliminar y confirma la accion; una vez borrados, estos datos no se pueden recuperar.'],
      ['¿Que informacion utiliza la aplicacion?', 'Puedes consultar el Aviso de privacidad al final de Ajustes. Describe que datos se recopilan, para que se utilizan y cuales son tus opciones para controlar o solicitar informacion sobre ellos.'],
      ['¿Cerrar sesion elimina mi progreso?', 'No. Al cerrar sesion solo terminas tu acceso en ese dispositivo; tu progreso y datos permanecen asociados a la cuenta. Podras recuperarlos al volver a iniciar sesion.'],
    ],
  },
]

export default function PreguntasFrecuentes() {
  const navigate = useNavigate()
  const [abierta, setAbierta] = useState('0-0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header className="page-topbar-compact" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg)' }}>
        <button onClick={() => navigate(-1)} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: '1rem' }}>Preguntas frecuentes</h2>
      </header>

      <main className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
        {PREGUNTAS.map((grupo, grupoIndex) => (
          <section key={grupo.categoria} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ margin: '4px 0 0 4px', fontSize: '0.72rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {grupo.categoria}
            </h3>
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              {grupo.preguntas.map(([pregunta, respuesta], preguntaIndex) => {
                const id = `${grupoIndex}-${preguntaIndex}`
                const abiertaActual = abierta === id
                return (
                  <div key={pregunta} style={{ borderTop: preguntaIndex > 0 ? '1px solid var(--border)' : 'none' }}>
                    <button
                      type="button"
                      aria-expanded={abiertaActual}
                      aria-controls={`respuesta-${id}`}
                      onClick={() => setAbierta(abiertaActual ? null : id)}
                      style={{ width: '100%', minHeight: 58, padding: '14px 16px', border: 0, background: 'transparent', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 700 }}
                    >
                      <span style={{ flex: 1 }}>{pregunta}</span>
                      <FiChevronDown aria-hidden="true" style={{ flexShrink: 0, fontSize: '1.15rem', color: 'var(--text-muted)', transform: abiertaActual ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />
                    </button>
                    {abiertaActual && (
                      <div id={`respuesta-${id}`} style={{ padding: '0 16px 16px', fontSize: '0.86rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                        {respuesta}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
