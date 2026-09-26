// MarcaPrepaApp.jsx
// El nombre "PrepaApp" tal como aparece en Home: "Prepa" normal y "App" más
// delgado y translúcido, en el color de texto del tema (var(--text)). Se
// usa en Home, el login y los informes (formulario de área y examen) para
// que la marca se vea igual en todos lados.
//
// Al imprimir un informe, .informe-print (global.css) cambia --text a un
// tono oscuro, así que la marca se lee sobre el papel blanco sin ajustes.

export default function MarcaPrepaApp({ as: Etiqueta = 'p', size = '1.4rem', style }) {
  return (
    <Etiqueta
      style={{
        fontSize: size,
        fontWeight: 500,
        margin: 0,
        color: 'var(--text)',
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      Prepa<span style={{ fontWeight: 300, opacity: 0.6 }}>App</span>
    </Etiqueta>
  )
}
