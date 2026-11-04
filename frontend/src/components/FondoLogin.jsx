// FondoLogin.jsx
// Fondo de la parte de arriba del login y de "Nueva contraseña" (antes era
// una retícula de hexágonos). Dos auroras suaves con los colores de la
// marca (morado del botón principal y azul de la punta del lápiz del logo)
// y, encima, símbolos de matemáticas casi transparentes: dice "esto es para
// estudiar" sin competir con el formulario.
//
// - Solo decoración: aria-hidden y sin eventos de puntero.
// - Las auroras son radial-gradient (no filter: blur, que en celulares de
//   gama baja cuesta mucho al animarse) y solo se mueve su transform.
// - Los símbolos usan var(--text) con opacidad baja, así que se adaptan a
//   cualquier tema (claro u oscuro) sin colores fijos.
// - Con "reducir movimiento" todo se queda quieto (global.css).

// Todos en la mitad derecha o en la franja de arriba: el título, el campo
// y la marca van alineados a la izquierda y no deben quedar encima.
const SIMBOLOS = [
  { c: 'Σ', left: '56%', top: 14, size: 28, rot: 8 },
  { c: '√x', left: '74%', top: 58, size: 22, rot: -6 },
  { c: 'π', left: '44%', top: 50, size: 24, rot: -10 },
  { c: '∫', left: '62%', top: 96, size: 32, rot: 4 },
  { c: 'x²', left: '84%', top: 118, size: 22, rot: 6 },
  { c: 'Δ', left: '72%', top: 150, size: 20, rot: -12 },
]

export default function FondoLogin() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 240, overflow: 'hidden', pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black 30%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent)',
      }}
    >
      <span className="login-aurora login-aurora-morada" />
      <span className="login-aurora login-aurora-azul" />
      <div className="login-fondo" style={{ position: 'absolute', inset: 0 }}>
        {SIMBOLOS.map(({ c, left, top, size, rot }) => (
          <span
            key={c}
            style={{
              position: 'absolute', left, top, fontSize: size, lineHeight: 1,
              fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic',
              color: 'var(--text)', opacity: 0.08, transform: `rotate(${rot}deg)`,
              userSelect: 'none',
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
